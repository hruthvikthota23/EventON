import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  PlayCircle,
  Search,
  Ticket,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import BookingStatus from "../../components/bookings/BookingStatus";

import {
  BOOKINGS_UPDATED_EVENT,
  getStoredBookings,
} from "../../utils/bookingStorage";

import {
  EVENTS_UPDATED_EVENT,
  getStoredEvents,
  getStoredEventsByOrganizer,
} from "../../utils/eventStorage";

/* =========================================================
   CONSTANTS
========================================================= */

const ACCOUNTS_STORAGE_KEY =
  "eventon_accounts";

/* =========================================================
   BOOKING ID
========================================================= */

function getBookingId(booking) {
  return (
    booking?.bookingId ||
    booking?.id ||
    "—"
  );
}

/* =========================================================
   TICKET COUNT
========================================================= */

function getTicketCount(booking) {
  const value = Number(
    booking?.quantity ??
      booking?.tickets ??
      booking?.ticketCount ??
      booking?.numberOfTickets ??
      1
  );

  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

  return value;
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   CANCELLED CHECK
========================================================= */

function isBookingCancelled(booking) {
  const status = String(
    booking?.status || ""
  )
    .trim()
    .toLowerCase();

  return (
    status === "cancelled" ||
    status === "canceled"
  );
}

/* =========================================================
   DATE + TIME PARSER
========================================================= */

function parseDateTime(
  dateValue,
  timeValue
) {
  if (!dateValue) {
    return null;
  }

  /*
   * Support values such as:
   * 2026-10-01
   * 2026-10-01T17:30:00
   */

  if (
    typeof dateValue === "string" &&
    dateValue.includes("T") &&
    !timeValue
  ) {
    const parsed = new Date(dateValue);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const dateString =
    String(dateValue).trim();

  const match = dateString.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  let year;
  let month;
  let day;

  if (match) {
    year = Number(match[1]);
    month = Number(match[2]) - 1;
    day = Number(match[3]);
  } else {
    const parsed = new Date(
      dateString
    );

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    year = parsed.getFullYear();
    month = parsed.getMonth();
    day = parsed.getDate();
  }

  let hours = 0;
  let minutes = 0;

  if (timeValue) {
    const timeString = String(
      timeValue
    )
      .trim()
      .toUpperCase();

    /*
     * Supports:
     * 17:30
     * 05:30 PM
     * 5:30 PM
     * 05:30AM
     */

    const timeMatch = timeString.match(
      /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i
    );

    if (timeMatch) {
      hours = Number(timeMatch[1]);
      minutes = Number(timeMatch[2]);

      const meridiem =
        timeMatch[3]?.toUpperCase();

      if (
        meridiem === "PM" &&
        hours < 12
      ) {
        hours += 12;
      }

      if (
        meridiem === "AM" &&
        hours === 12
      ) {
        hours = 0;
      }
    }
  }

  return new Date(
    year,
    month,
    day,
    hours,
    minutes,
    0,
    0
  );
}

/* =========================================================
   EVENT START
========================================================= */

function getEventStart(event) {
  if (!event) {
    return null;
  }

  const date =
    event?.date ||
    event?.eventDate ||
    event?.startDate ||
    null;

  const time =
    event?.startTime ||
    event?.time ||
    event?.eventTime ||
    null;

  return parseDateTime(
    date,
    time
  );
}

/* =========================================================
   EVENT END
========================================================= */

function getEventEnd(event) {
  if (!event) {
    return null;
  }

  /*
   * EventON uses one event date.
   * End date is intentionally not used.
   */

  const date =
    event?.date ||
    event?.eventDate ||
    event?.startDate ||
    null;

  const time =
    event?.endTime ||
    event?.finishTime ||
    null;

  /*
   * Old events without endTime:
   * Treat the end as the end of that event date.
   */

  if (!time) {
    const start =
      getEventStart(event);

    if (!start) {
      return null;
    }

    const endOfDay =
      new Date(start);

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    return endOfDay;
  }

  return parseDateTime(
    date,
    time
  );
}

/* =========================================================
   BOOKING STATUS
========================================================= */

function getBookingStatus(
  booking,
  event
) {
  /*
   * Cancelled booking always remains
   * cancelled even if the event date has passed.
   */

  if (
    isBookingCancelled(booking)
  ) {
    return "cancelled";
  }

  const start =
    getEventStart(event);

  const end =
    getEventEnd(event);

  /*
   * If event information is unavailable,
   * keep the booking as upcoming.
   */

  if (!start) {
    return "upcoming";
  }

  const now = new Date();

  /*
   * End time has priority.
   * At the exact end time, event is completed.
   */

  if (
    end &&
    now >= end
  ) {
    return "completed";
  }

  /*
   * After start and before end = ongoing.
   */

  if (now >= start) {
    return "ongoing";
  }

  return "upcoming";
}

/* =========================================================
   BOOKING CREATED DATE
   NEWEST → OLDEST
========================================================= */

function getBookingCreatedTime(
  booking
) {
  const value =
    booking?.createdAt ??
    booking?.bookedAt ??
    booking?.bookingDate ??
    booking?.createdDate ??
    booking?.dateCreated ??
    null;

  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(value).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
}

/* =========================================================
   ATTENDEE RESOLVER
========================================================= */

function getAttendee(
  booking,
  accounts
) {
  const attendee =
    booking?.attendee || {};

  const bookingUserId =
    booking?.userId ||
    booking?.attendeeId ||
    booking?.user?.id ||
    attendee?.id;

  const bookingEmail =
    booking?.attendeeEmail ||
    booking?.userEmail ||
    booking?.email ||
    attendee?.email;

  let account = null;

  /*
   * First try user ID.
   */

  if (bookingUserId) {
    account =
      accounts.find(
        (item) =>
          String(item?.id) ===
          String(bookingUserId)
      ) || null;
  }

  /*
   * Then try email.
   */

  if (
    !account &&
    bookingEmail
  ) {
    account =
      accounts.find(
        (item) =>
          String(
            item?.email || ""
          )
            .trim()
            .toLowerCase() ===
          String(
            bookingEmail
          )
            .trim()
            .toLowerCase()
      ) || null;
  }

  return {
    name:
      attendee?.name ||
      booking?.attendeeName ||
      booking?.userName ||
      booking?.name ||
      account?.name ||
      "Attendee",

    email:
      attendee?.email ||
      bookingEmail ||
      account?.email ||
      "No email",

    phone:
      attendee?.phone ||
      booking?.phone ||
      account?.phone ||
      "No phone",

    accountId:
      account?.id ||
      bookingUserId ||
      null,
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function ManagementBookings() {
  const { user } = useAuth();

  const navigate =
    useNavigate();

  const normalizedRole =
    String(user?.role || "")
      .trim()
      .toLowerCase();

  const isAdmin =
    normalizedRole === "admin";

  const isOrganizer =
    normalizedRole ===
    "organizer";

  const [
    bookings,
    setBookings,
  ] = useState([]);

  const [
    events,
    setEvents,
  ] = useState([]);

  const [
    accounts,
    setAccounts,
  ] = useState([]);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =======================================================
     LOAD REAL DATA
  ======================================================= */

  const loadData =
    useCallback(() => {
      try {
        const storedBookings =
          getStoredBookings();

        let storedEvents = [];

        /*
         * Admin:
         * Load every event.
         */

        if (isAdmin) {
          storedEvents =
            getStoredEvents();
        }

        /*
         * Organizer:
         * Load only their events.
         */

        if (
          isOrganizer &&
          user?.id
        ) {
          storedEvents =
            getStoredEventsByOrganizer(
              user.id
            );
        }

        /* =================================================
           ACCOUNTS
        ================================================= */

        let storedAccounts = [];

        try {
          const rawAccounts =
            localStorage.getItem(
              ACCOUNTS_STORAGE_KEY
            );

          if (rawAccounts) {
            const parsedAccounts =
              JSON.parse(
                rawAccounts
              );

            if (
              Array.isArray(
                parsedAccounts
              )
            ) {
              storedAccounts =
                parsedAccounts;
            }
          }
        } catch (error) {
          console.error(
            "Unable to load EventON accounts:",
            error
          );
        }

        /* =================================================
           ORGANIZER BOOKING FILTER
        ================================================= */

        if (
          isOrganizer &&
          user?.id
        ) {
          const organizerEventIds =
            new Set(
              storedEvents.map(
                (event) =>
                  String(event.id)
              )
            );

          const organizerBookings =
            Array.isArray(
              storedBookings
            )
              ? storedBookings.filter(
                  (booking) => {
                    const bookingEventId =
                      booking?.eventId ??
                      booking?.event?.id;

                    return organizerEventIds.has(
                      String(
                        bookingEventId
                      )
                    );
                  }
                )
              : [];

          setBookings(
            organizerBookings
          );
        } else {
          /*
           * Admin receives all bookings.
           */

          setBookings(
            Array.isArray(
              storedBookings
            )
              ? storedBookings
              : []
          );
        }

        setEvents(
          Array.isArray(
            storedEvents
          )
            ? storedEvents
            : []
        );

        setAccounts(
          Array.isArray(
            storedAccounts
          )
            ? storedAccounts
            : []
        );
      } catch (error) {
        console.error(
          "Unable to load EventON booking data:",
          error
        );

        setBookings([]);
        setEvents([]);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    }, [
      isAdmin,
      isOrganizer,
      user?.id,
    ]);

  /* =======================================================
     LIVE UPDATES
  ======================================================= */

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    const handleStorage = (
      event
    ) => {
      if (
        event.key ===
          "eventon_bookings" ||
        event.key ===
          "eventon_events" ||
        event.key ===
          "eventon_accounts"
      ) {
        loadData();
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      BOOKINGS_UPDATED_EVENT,
      handleUpdate
    );

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      handleUpdate
    );

    window.addEventListener(
      "eventon:auth-updated",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        BOOKINGS_UPDATED_EVENT,
        handleUpdate
      );

      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        handleUpdate
      );

      window.removeEventListener(
        "eventon:auth-updated",
        handleUpdate
      );
    };
  }, [loadData]);

  /* =======================================================
     EVENT MAP
  ======================================================= */

  const eventMap = useMemo(() => {
    return new Map(
      events.map((event) => [
        String(event?.id),
        event,
      ])
    );
  }, [events]);

  /* =======================================================
     ENRICH BOOKINGS
  ======================================================= */

  const enrichedBookings =
    useMemo(() => {
      return bookings.map(
        (booking) => {
          const eventId =
            booking?.eventId ??
            booking?.event?.id;

          const event =
            eventMap.get(
              String(eventId)
            ) ||
            booking?.event ||
            null;

          const attendee =
            getAttendee(
              booking,
              accounts
            );

          const status =
            getBookingStatus(
              booking,
              event
            );

          return {
            ...booking,

            resolvedEvent:
              event,

            resolvedAttendee:
              attendee,

            resolvedStatus:
              status,

            resolvedTicketCount:
              getTicketCount(
                booking
              ),
          };
        }
      );
    }, [
      bookings,
      eventMap,
      accounts,
    ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics =
    useMemo(() => {
      let upcoming = 0;
      let ongoing = 0;
      let completed = 0;
      let cancelled = 0;
      let tickets = 0;

      enrichedBookings.forEach(
        (booking) => {
          const status =
            booking.resolvedStatus;

          if (
            status === "upcoming"
          ) {
            upcoming += 1;
          }

          if (
            status === "ongoing"
          ) {
            ongoing += 1;
          }

          if (
            status === "completed"
          ) {
            completed += 1;
          }

          if (
            status === "cancelled"
          ) {
            cancelled += 1;
          }

          /*
           * Cancelled bookings do not count
           * towards tickets sold.
           */

          if (
            status !== "cancelled"
          ) {
            tickets += Number(
              booking.resolvedTicketCount ||
                0
            );
          }
        }
      );

      return {
        total:
          enrichedBookings.length,

        upcoming,

        ongoing,

        completed,

        cancelled,

        tickets,
      };
    }, [enrichedBookings]);

  /* =======================================================
     FILTER + SORT
     NEWEST BOOKING → OLDEST BOOKING
  ======================================================= */

  const filteredBookings =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return [
        ...enrichedBookings,
      ]
        .filter((booking) => {
          const attendeeName =
            String(
              booking
                .resolvedAttendee
                ?.name || ""
            ).toLowerCase();

          const attendeeEmail =
            String(
              booking
                .resolvedAttendee
                ?.email || ""
            ).toLowerCase();

          const eventTitle =
            String(
              booking
                .resolvedEvent
                ?.title || ""
            ).toLowerCase();

          const eventLocation =
            String(
              booking
                .resolvedEvent
                ?.location || ""
            ).toLowerCase();

          const eventCity =
            String(
              booking
                .resolvedEvent
                ?.city || ""
            ).toLowerCase();

          const eventCategory =
            String(
              booking
                .resolvedEvent
                ?.category || ""
            ).toLowerCase();

          const bookingId =
            String(
              getBookingId(
                booking
              )
            ).toLowerCase();

          const matchesSearch =
            !query ||
            attendeeName.includes(
              query
            ) ||
            attendeeEmail.includes(
              query
            ) ||
            eventTitle.includes(
              query
            ) ||
            eventLocation.includes(
              query
            ) ||
            eventCity.includes(
              query
            ) ||
            eventCategory.includes(
              query
            ) ||
            bookingId.includes(
              query
            );

          const matchesStatus =
            statusFilter ===
              "all" ||
            booking.resolvedStatus ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        })
        .sort((a, b) => {
          const first =
            getBookingCreatedTime(
              a
            );

          const second =
            getBookingCreatedTime(
              b
            );

          /*
           * Newest → oldest.
           */

          return (
            second - first
          );
        });
    }, [
      enrichedBookings,
      searchQuery,
      statusFilter,
    ]);

  /* =======================================================
     DETAIL ROUTE
  ======================================================= */

  const getDetailsPath =
    (bookingId) => {
      if (isAdmin) {
        return `/admin/bookings/${bookingId}`;
      }

      return `/organizer/bookings/${bookingId}`;
    };

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  /* =======================================================
     LOGIN
  ======================================================= */

  if (!user) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Login required
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please log in to view bookings.
          </p>
        </div>
      </section>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="min-h-full bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl bg-slate-200"
                />
              )
            )}
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <section className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div>
          <p className="text-sm font-semibold text-orange-500">
            {isAdmin
              ? "Administration"
              : "Organizer Management"}
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Bookings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {isAdmin
              ? "Manage and review all bookings made across EventON."
              : "Manage attendees, tickets, and booking status across your events."}
          </p>
        </div>

        {/* =================================================
            BOOKING STATS
        ================================================= */}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <BookingStatCard
            title="Total Bookings"
            value={
              statistics.total
            }
            icon={Ticket}
            iconClass="bg-violet-50 text-violet-600"
          />

          <BookingStatCard
            title="Tickets Sold"
            value={
              statistics.tickets
            }
            icon={Users}
            iconClass="bg-orange-50 text-orange-600"
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <BookingStatCard
            title="Upcoming"
            value={
              statistics.upcoming
            }
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />

          <BookingStatCard
            title="Ongoing"
            value={
              statistics.ongoing
            }
            icon={PlayCircle}
            iconClass="bg-blue-50 text-blue-600"
          />

          <BookingStatCard
            title="Completed"
            value={
              statistics.completed
            }
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <BookingStatCard
            title="Cancelled"
            value={
              statistics.cancelled
            }
            icon={XCircle}
            iconClass="bg-red-50 text-red-600"
          />
        </div>

        {/* =================================================
            BOOKING DIRECTORY
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* =================================================
              SEARCH + STATUS
          ================================================= */}

          <div className="border-b border-slate-200 p-3 sm:p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

              {/* SEARCH */}

              <div className="relative min-w-0 flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={
                    searchQuery
                  }
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search by name, email, event, category or booking ID..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* STATUS BUTTONS */}

              <div className="flex flex-wrap gap-2">
                <StatusFilterButton
                  label="Upcoming"
                  count={
                    statistics.upcoming
                  }
                  icon={Clock3}
                  active={
                    statusFilter ===
                    "upcoming"
                  }
                  onClick={() =>
                    setStatusFilter(
                      statusFilter ===
                        "upcoming"
                        ? "all"
                        : "upcoming"
                    )
                  }
                  type="upcoming"
                />

                <StatusFilterButton
                  label="Ongoing"
                  count={
                    statistics.ongoing
                  }
                  icon={PlayCircle}
                  active={
                    statusFilter ===
                    "ongoing"
                  }
                  onClick={() =>
                    setStatusFilter(
                      statusFilter ===
                        "ongoing"
                        ? "all"
                        : "ongoing"
                    )
                  }
                  type="ongoing"
                />

                <StatusFilterButton
                  label="Completed"
                  count={
                    statistics.completed
                  }
                  icon={CheckCircle2}
                  active={
                    statusFilter ===
                    "completed"
                  }
                  onClick={() =>
                    setStatusFilter(
                      statusFilter ===
                        "completed"
                        ? "all"
                        : "completed"
                    )
                  }
                  type="completed"
                />

                <StatusFilterButton
                  label="Cancelled"
                  count={
                    statistics.cancelled
                  }
                  icon={XCircle}
                  active={
                    statusFilter ===
                    "cancelled"
                  }
                  onClick={() =>
                    setStatusFilter(
                      statusFilter ===
                        "cancelled"
                        ? "all"
                        : "cancelled"
                    )
                  }
                  type="cancelled"
                />
              </div>
            </div>
          </div>

          {/* =================================================
              DIRECTORY HEADER
          ================================================= */}

          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Booking Directory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Showing{" "}
                {filteredBookings.length.toLocaleString(
                  "en-IN"
                )}{" "}
                of{" "}
                {bookings.length.toLocaleString(
                  "en-IN"
                )}{" "}
                bookings
              </p>
            </div>

            {(searchQuery ||
              statusFilter !==
                "all") && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-50 sm:self-auto"
              >
                Clear filters
                <X size={14} />
              </button>
            )}
          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          {filteredBookings.length ===
          0 ? (
            <EmptyBookingsState
              hasFilters={
                Boolean(
                  searchQuery
                ) ||
                statusFilter !==
                  "all"
              }
              onClear={
                clearFilters
              }
            />
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Attendee
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Event
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Booking ID
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Date
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="w-14 px-4 py-4" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map(
                      (booking) => {
                        const bookingId =
                          getBookingId(
                            booking
                          );

                        const attendee =
                          booking.resolvedAttendee;

                        const event =
                          booking.resolvedEvent;

                        const status =
                          booking.resolvedStatus;

                        const date =
                          event?.date ||
                          booking?.bookingDate ||
                          booking?.createdAt;

                        const detailsPath =
                          getDetailsPath(
                            bookingId
                          );

                        return (
                          <tr
                            key={bookingId}
                            tabIndex={0}
                            role="link"
                            aria-label={`Open booking ${bookingId}`}
                            onClick={() =>
                              navigate(
                                detailsPath
                              )
                            }
                            onKeyDown={(
                              eventKey
                            ) => {
                              if (
                                eventKey.key ===
                                  "Enter" ||
                                eventKey.key ===
                                  " "
                              ) {
                                eventKey.preventDefault();

                                navigate(
                                  detailsPath
                                );
                              }
                            }}
                            className="group cursor-pointer transition hover:bg-orange-50/40 focus:bg-orange-50/40 focus:outline-none"
                          >
                            {/* ATTENDEE */}

                            <td className="px-6 py-5">
                              <div className="flex min-w-[190px] items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                                  {attendee?.name
                                    ? attendee.name
                                        .charAt(
                                          0
                                        )
                                        .toUpperCase()
                                    : "A"}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {attendee?.name ||
                                      "Attendee"}
                                  </p>

                                  <p className="mt-0.5 max-w-[190px] truncate text-xs text-slate-500">
                                    {attendee?.email ||
                                      "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* EVENT */}

                            <td className="px-6 py-5">
                              <div className="flex min-w-[220px] items-center gap-3">
                                <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                  {event?.image ? (
                                    <img
                                      src={
                                        event.image
                                      }
                                      alt={
                                        event.title ||
                                        "Event"
                                      }
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                                      <CalendarDays
                                        size={18}
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {event?.title ||
                                      "Event unavailable"}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-slate-500">
                                    {[
                                      event?.location,
                                      event?.city,
                                    ]
                                      .filter(
                                        Boolean
                                      )
                                      .join(
                                        ", "
                                      ) ||
                                      "Location unavailable"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* BOOKING ID */}

                            <td className="px-6 py-5">
                              <p className="font-mono text-xs font-semibold text-slate-600">
                                {bookingId}
                              </p>
                            </td>

                            {/* DATE */}

                            <td className="px-6 py-5">
                              <p className="text-xs font-medium text-slate-700">
                                {formatDate(
                                  date
                                )}
                              </p>
                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5">
                              <BookingStatus
                                status={
                                  status
                                }
                              />
                            </td>

                            {/* ARROW */}

                            <td className="px-4 py-5">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition group-hover:bg-orange-100 group-hover:text-orange-600">
                                <ArrowRight
                                  size={17}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE
              ================================================= */}

              <div className="divide-y divide-slate-100 lg:hidden">
                {filteredBookings.map(
                  (booking) => {
                    const bookingId =
                      getBookingId(
                        booking
                      );

                    const attendee =
                      booking.resolvedAttendee;

                    const event =
                      booking.resolvedEvent;

                    const status =
                      booking.resolvedStatus;

                    const detailsPath =
                      getDetailsPath(
                        bookingId
                      );

                    const date =
                      event?.date ||
                      booking?.bookingDate ||
                      booking?.createdAt;

                    return (
                      <div
                        key={bookingId}
                        role="link"
                        tabIndex={0}
                        onClick={() =>
                          navigate(
                            detailsPath
                          )
                        }
                        onKeyDown={(
                          eventKey
                        ) => {
                          if (
                            eventKey.key ===
                              "Enter" ||
                            eventKey.key ===
                              " "
                          ) {
                            eventKey.preventDefault();

                            navigate(
                              detailsPath
                            );
                          }
                        }}
                        className="group block cursor-pointer p-5 transition hover:bg-orange-50/40 focus:bg-orange-50/40 focus:outline-none sm:p-6"
                      >
                        {/* TOP */}

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 gap-3">
                            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              {event?.image ? (
                                <img
                                  src={
                                    event.image
                                  }
                                  alt={
                                    event.title ||
                                    "Event"
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                  <CalendarDays
                                    size={20}
                                  />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {event?.title ||
                                  "Event unavailable"}
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-500">
                                {[
                                  event?.location,
                                  event?.city,
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    ", "
                                  ) ||
                                  "Location unavailable"}
                              </p>

                              <p className="mt-2 truncate text-xs font-medium text-slate-700">
                                {attendee?.name ||
                                  "Attendee"}
                              </p>
                            </div>
                          </div>

                          <BookingStatus
                            status={
                              status
                            }
                          />
                        </div>

                        {/* DETAILS */}

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <MobileDetail
                            label="Booking ID"
                            value={
                              bookingId
                            }
                          />

                          <MobileDetail
                            label="Date"
                            value={formatDate(
                              date
                            )}
                          />
                        </div>

                        {/* ARROW */}

                        <div className="mt-5 flex items-center justify-end">
                          <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition group-hover:text-orange-600">
                            Open booking

                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 transition group-hover:bg-orange-100">
                              <ArrowRight
                                size={15}
                              />
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  );
}

/* =========================================================
   STATUS FILTER BUTTON
========================================================= */

function StatusFilterButton({
  label,
  count,
  icon: Icon,
  active,
  onClick,
  type,
}) {
  const styles = {
    upcoming: {
      active:
        "border-amber-300 bg-amber-50 text-amber-700",

      inactive:
        "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700",

      count:
        "bg-amber-100 text-amber-700",
    },

    ongoing: {
      active:
        "border-blue-300 bg-blue-50 text-blue-700",

      inactive:
        "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",

      count:
        "bg-blue-100 text-blue-700",
    },

    completed: {
      active:
        "border-emerald-300 bg-emerald-50 text-emerald-700",

      inactive:
        "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",

      count:
        "bg-emerald-100 text-emerald-700",
    },

    cancelled: {
      active:
        "border-red-300 bg-red-50 text-red-700",

      inactive:
        "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700",

      count:
        "bg-red-100 text-red-700",
    },
  };

  const style =
    styles[type] ||
    styles.upcoming;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-12 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition ${
        active
          ? style.active
          : style.inactive
      }`}
    >
      <Icon
        size={15}
        strokeWidth={2.5}
      />

      <span>{label}</span>

      <span
        className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
          active
            ? "bg-white/80"
            : style.count
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function BookingStatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {Number(
              value || 0
            ).toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE DETAIL
========================================================= */

function MobileDetail({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyBookingsState({
  hasFilters,
  onClear,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Ticket size={25} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {hasFilters
          ? "No bookings found"
          : "No bookings yet"}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {hasFilters
          ? "Try changing your search or status filter."
          : "Bookings created through EventON will appear here."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-orange-600"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default ManagementBookings;