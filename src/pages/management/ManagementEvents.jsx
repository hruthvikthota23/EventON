import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MapPin,
  Search,
  Ticket,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  EVENTS_UPDATED_EVENT,
  getStoredEvents,
  getStoredEventsByOrganizer,
} from "../../utils/eventStorage";

import {
  BOOKINGS_UPDATED_EVENT,
  getStoredBookings,
} from "../../utils/bookingStorage";

/* =========================================================
   CONSTANTS
========================================================= */

const EVENTS_STORAGE_KEY = "eventon_events";
const BOOKINGS_STORAGE_KEY = "eventon_bookings";

/* =========================================================
   BOOKING HELPERS
========================================================= */

function getBookingQuantity(booking) {
  const quantity = Number(
    booking?.quantity ??
      booking?.tickets ??
      booking?.ticketCount ??
      booking?.numberOfTickets ??
      1
  );

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 1;
  }

  return quantity;
}

function getBookingStatus(booking) {
  const status = String(
    booking?.status || "confirmed"
  )
    .trim()
    .toLowerCase();

  if (
    status === "cancelled" ||
    status === "canceled"
  ) {
    return "cancelled";
  }

  if (
    status === "completed" ||
    status === "attended"
  ) {
    return "completed";
  }

  return "confirmed";
}

function isActiveBooking(booking) {
  return getBookingStatus(booking) !== "cancelled";
}

/* =========================================================
   DATE + TIME HELPERS
========================================================= */

/**
 * Converts event date + time into a local Date object.
 *
 * Supported date formats:
 * - YYYY-MM-DD
 * - DD-MM-YYYY
 * - DD/MM/YYYY
 * - browser-compatible date strings
 *
 * Supported time formats:
 * - 10:00
 * - 10:00 AM
 * - 10:00 PM
 * - 10:00:00
 * - 10:00:00 PM
 */
function parseEventDateTime(dateValue, timeValue) {
  if (!dateValue) {
    return null;
  }

  const dateString = String(dateValue).trim();

  let year;
  let month;
  let day;

  /* -------------------------------------------------------
     YYYY-MM-DD
  ------------------------------------------------------- */

  const isoDateMatch = dateString.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (isoDateMatch) {
    year = Number(isoDateMatch[1]);
    month = Number(isoDateMatch[2]) - 1;
    day = Number(isoDateMatch[3]);
  } else {
    /* -----------------------------------------------------
       DD-MM-YYYY / DD/MM/YYYY
    ----------------------------------------------------- */

    const indianDateMatch = dateString.match(
      /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/
    );

    if (indianDateMatch) {
      day = Number(indianDateMatch[1]);
      month = Number(indianDateMatch[2]) - 1;
      year = Number(indianDateMatch[3]);
    } else {
      /* ---------------------------------------------------
         Fallback
      --------------------------------------------------- */

      const parsedDate = new Date(dateString);

      if (Number.isNaN(parsedDate.getTime())) {
        return null;
      }

      year = parsedDate.getFullYear();
      month = parsedDate.getMonth();
      day = parsedDate.getDate();
    }
  }

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  /* -------------------------------------------------------
     TIME
  ------------------------------------------------------- */

  if (timeValue) {
    const timeString = String(timeValue)
      .trim()
      .toUpperCase();

    /*
     * IMPORTANT:
     *
     * Correct:
     * \s*
     *
     * NOT:
     * \s\*
     */

    const timeMatch = timeString.match(
      /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
    );

    if (!timeMatch) {
      return null;
    }

    hours = Number(timeMatch[1]);
    minutes = Number(timeMatch[2]);
    seconds = Number(timeMatch[3] || 0);

    const meridiem = timeMatch[4]?.toUpperCase();

    /* -----------------------------------------------------
       12-HOUR FORMAT
    ----------------------------------------------------- */

    if (meridiem) {
      if (hours < 1 || hours > 12) {
        return null;
      }

      if (meridiem === "PM" && hours < 12) {
        hours += 12;
      }

      if (meridiem === "AM" && hours === 12) {
        hours = 0;
      }
    }

    /* -----------------------------------------------------
       24-HOUR FORMAT VALIDATION
    ----------------------------------------------------- */

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return null;
    }
  }

  const result = new Date(
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    0
  );

  if (Number.isNaN(result.getTime())) {
    return null;
  }

  return result;
}

/* =========================================================
   EVENT STATUS
========================================================= */

function getEventLifecycleStatus(
  event,
  nowValue = Date.now()
) {
  const storedStatus = String(
    event?.status || "published"
  )
    .trim()
    .toLowerCase();

  /* -------------------------------------------------------
     CANCELLED ALWAYS WINS
  ------------------------------------------------------- */

  if (
    storedStatus === "cancelled" ||
    storedStatus === "canceled"
  ) {
    return "cancelled";
  }

  const now = new Date(nowValue);

  const start = parseEventDateTime(
    event?.date,
    event?.time || event?.startTime
  );

  const end = parseEventDateTime(
    event?.date,
    event?.endTime || event?.finishTime
  );

  /* -------------------------------------------------------
     INVALID START
  ------------------------------------------------------- */

  if (!start) {
    return "published";
  }

  /* -------------------------------------------------------
     END TIME
     
     If end time is earlier than start time, the event
     crosses midnight.
     
     Example:
     11:00 PM -> 01:00 AM
     
     The end belongs to the next day.
  ------------------------------------------------------- */

  if (end && end.getTime() < start.getTime()) {
    end.setDate(end.getDate() + 1);
  }

  /* -------------------------------------------------------
     COMPLETED
  ------------------------------------------------------- */

  if (end && now >= end) {
    return "completed";
  }

  /* -------------------------------------------------------
     ONGOING
  ------------------------------------------------------- */

  if (now >= start) {
    return "ongoing";
  }

  /* -------------------------------------------------------
     UPCOMING
     
     Internally "published" is used for upcoming events.
  ------------------------------------------------------- */

  return "published";
}

function getEventStatus(
  event,
  actualBookedSeats,
  nowValue = Date.now()
) {
  const lifecycleStatus =
    getEventLifecycleStatus(
      event,
      nowValue
    );

  /* -------------------------------------------------------
     LIFECYCLE STATUS TAKES PRIORITY
  ------------------------------------------------------- */

  if (
    lifecycleStatus === "cancelled" ||
    lifecycleStatus === "ongoing" ||
    lifecycleStatus === "completed"
  ) {
    return lifecycleStatus;
  }

  /* -------------------------------------------------------
     SOLD OUT
     
     Sold out is an availability state, not a lifecycle
     state.
  ------------------------------------------------------- */

  const capacity = Number(
    event?.capacity || 0
  );

  if (
    capacity > 0 &&
    actualBookedSeats >= capacity
  ) {
    return "sold-out";
  }

  return "published";
}

/* =========================================================
   FORMATTERS
========================================================= */

function formatDate(dateValue) {
  if (!dateValue) {
    return "Date unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return amount > 0
    ? `₹${amount.toLocaleString("en-IN")}`
    : "Free";
}

/* =========================================================
   ORGANIZER
========================================================= */

function getOrganizerDisplayName(event) {
  const organizerId =
    event?.organizerId;

  if (organizerId) {
    try {
      const accounts = JSON.parse(
        localStorage.getItem(
          "eventon_accounts"
        ) || "[]"
      );

      if (Array.isArray(accounts)) {
        const organizer =
          accounts.find(
            (account) =>
              String(account?.id) ===
                String(organizerId) &&
              String(
                account?.role || ""
              )
                .trim()
                .toLowerCase() ===
                "organizer"
          );

        if (organizer) {
          return (
            organizer.name ||
            organizer.email ||
            organizer.mobile ||
            "EventON Organizer"
          );
        }
      }
    } catch (error) {
      console.error(
        "Unable to resolve organizer:",
        error
      );
    }
  }

  return (
    event?.organizer ||
    "EventON Organizer"
  );
}

/* =========================================================
   STATUS HELPERS
========================================================= */

function getStatusLabel(status) {
  const labels = {
    published: "Upcoming",
    ongoing: "Ongoing",
    completed: "Completed",
    cancelled: "Cancelled",
    "sold-out": "Sold Out",
  };

  return (
    labels[status] ||
    "Upcoming"
  );
}

function getStatusClasses(status) {
  switch (status) {
    case "published":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "ongoing":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "completed":
      return "border-slate-200 bg-slate-100 text-slate-700";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    case "sold-out":
      return "border-orange-200 bg-orange-50 text-orange-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "published":
      return CheckCircle2;

    case "ongoing":
      return Clock3;

    case "completed":
      return CalendarDays;

    case "cancelled":
      return XCircle;

    case "sold-out":
      return Ticket;

    default:
      return CheckCircle2;
  }
}

/* =========================================================
   MAIN PAGE
========================================================= */

function ManagementEvents() {
  const { user } = useAuth();

  const normalizedRole = String(
    user?.role || ""
  )
    .trim()
    .toLowerCase();

  const isAdmin =
    normalizedRole === "admin";

  const isOrganizer =
    normalizedRole === "organizer";

  const [events, setEvents] =
    useState([]);

  const [bookings, setBookings] =
    useState([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [openDropdown, setOpenDropdown] =
    useState(null);

  const [currentTime, setCurrentTime] =
    useState(() => Date.now());

  const filterRef = useRef(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = useCallback(() => {
    try {
      let storedEvents = [];

      if (
        isOrganizer &&
        user?.id
      ) {
        storedEvents =
          getStoredEventsByOrganizer(
            user.id
          );
      } else if (isAdmin) {
        storedEvents =
          getStoredEvents();
      }

      const storedBookings =
        getStoredBookings();

      setEvents(
        Array.isArray(storedEvents)
          ? storedEvents
          : []
      );

      setBookings(
        Array.isArray(
          storedBookings
        )
          ? storedBookings
          : []
      );
    } catch (error) {
      console.error(
        "Unable to load management events:",
        error
      );

      setEvents([]);
      setBookings([]);
    }
  }, [
    isAdmin,
    isOrganizer,
    user?.id,
  ]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setBookings([]);
      return;
    }

    loadData();
  }, [
    user,
    loadData,
  ]);

  /* =======================================================
     LIVE UPDATES
  ======================================================= */

  useEffect(() => {
    const handleUpdate = () => {
      loadData();
    };

    const handleStorage = (
      event
    ) => {
      if (
        event.key ===
          EVENTS_STORAGE_KEY ||
        event.key ===
          BOOKINGS_STORAGE_KEY
      ) {
        loadData();
      }
    };

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      handleUpdate
    );

    window.addEventListener(
      BOOKINGS_UPDATED_EVENT,
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        handleUpdate
      );

      window.removeEventListener(
        BOOKINGS_UPDATED_EVENT,
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [loadData]);

  /* =======================================================
     REFRESH TIME
     
     Recalculates event status every minute.
  ======================================================= */

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(Date.now());
    };

    updateClock();

    const intervalId =
      window.setInterval(
        updateClock,
        60 * 1000
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, []);

  /* =======================================================
     CLOSE DROPDOWNS
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(
          event.target
        )
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =======================================================
     BOOKINGS BY EVENT
  ======================================================= */

  const bookingsByEvent =
    useMemo(() => {
      const map = new Map();

      bookings.forEach(
        (booking) => {
          if (
            !isActiveBooking(
              booking
            )
          ) {
            return;
          }

          const eventId =
            booking?.eventId ??
            booking?.event?.id;

          if (
            eventId === undefined ||
            eventId === null ||
            eventId === ""
          ) {
            return;
          }

          const key =
            String(eventId);

          const current =
            map.get(key) || 0;

          map.set(
            key,
            current +
              getBookingQuantity(
                booking
              )
          );
        }
      );

      return map;
    }, [bookings]);

  /* =======================================================
     ACTUAL BOOKED SEATS
  ======================================================= */

  const getActualBookedSeats =
    useCallback(
      (event) => {
        if (!event?.id) {
          return 0;
        }

        return (
          bookingsByEvent.get(
            String(event.id)
          ) || 0
        );
      },
      [bookingsByEvent]
    );

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories =
    useMemo(() => {
      const values = events
        .map((event) =>
          String(
            event?.category || ""
          ).trim()
        )
        .filter(Boolean);

      return [
        ...new Set(values),
      ].sort((a, b) =>
        a.localeCompare(b)
      );
    }, [events]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics =
    useMemo(() => {
      const statuses = events.map(
        (event) => ({
          event,
          status:
            getEventStatus(
              event,
              getActualBookedSeats(
                event
              ),
              currentTime
            ),
        })
      );

      return {
        total: events.length,

        upcoming:
          statuses.filter(
            ({ status }) =>
              status ===
              "published"
          ).length,

        ongoing:
          statuses.filter(
            ({ status }) =>
              status ===
              "ongoing"
          ).length,

        completed:
          statuses.filter(
            ({ status }) =>
              status ===
              "completed"
          ).length,

        cancelled:
          statuses.filter(
            ({ status }) =>
              status ===
              "cancelled"
          ).length,

        soldOut:
          statuses.filter(
            ({ status }) =>
              status ===
              "sold-out"
          ).length,
      };
    }, [
      events,
      getActualBookedSeats,
      currentTime,
    ]);

  /* =======================================================
     STATUS FILTER OPTIONS
  ======================================================= */

  const statusOptions = [
    {
      value: "all",
      label: "All statuses",
    },
    {
      value: "published",
      label: "Upcoming",
    },
    {
      value: "ongoing",
      label: "Ongoing",
    },
    {
      value: "completed",
      label: "Completed",
    },
    {
      value: "cancelled",
      label: "Cancelled",
    },
    {
      value: "sold-out",
      label: "Sold Out",
    },
  ];

  /* =======================================================
     CATEGORY FILTER OPTIONS
  ======================================================= */

  const categoryOptions = [
    {
      value: "all",
      label: "All categories",
    },
    ...categories.map(
      (category) => ({
        value: category,
        label: category,
      })
    ),
  ];

  /* =======================================================
     FILTERED EVENTS
  ======================================================= */

  const filteredEvents =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return events.filter(
        (event) => {
          const title =
            String(
              event?.title || ""
            ).toLowerCase();

          const location =
            String(
              event?.location || ""
            ).toLowerCase();

          const city =
            String(
              event?.city || ""
            ).toLowerCase();

          const category =
            String(
              event?.category || ""
            )
              .trim()
              .toLowerCase();

          const organizer =
            getOrganizerDisplayName(
              event
            ).toLowerCase();

          const actualBookedSeats =
            getActualBookedSeats(
              event
            );

          const status =
            getEventStatus(
              event,
              actualBookedSeats,
              currentTime
            );

          const matchesSearch =
            !query ||
            title.includes(query) ||
            location.includes(query) ||
            city.includes(query) ||
            category.includes(query) ||
            organizer.includes(query);

          const matchesStatus =
            statusFilter === "all" ||
            status === statusFilter;

          const matchesCategory =
            categoryFilter === "all" ||
            category ===
              categoryFilter
                .trim()
                .toLowerCase();

          return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
          );
        }
      );
    }, [
      events,
      getActualBookedSeats,
      searchQuery,
      statusFilter,
      categoryFilter,
      currentTime,
    ]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setOpenDropdown(null);
  };

  const selectedStatusLabel =
    statusOptions.find(
      (option) =>
        option.value ===
        statusFilter
    )?.label ||
    "All statuses";

  const selectedCategoryLabel =
    categoryOptions.find(
      (option) =>
        option.value ===
        categoryFilter
    )?.label ||
    "All categories";

  /* =======================================================
     EMPTY USER
  ======================================================= */

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <Users
            size={42}
            className="mx-auto text-slate-300"
          />

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Account required
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please log in to manage
            events.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-6 lg:px-8">

          <p className="text-sm font-medium text-orange-500">
            {isAdmin
              ? "Administration"
              : "Organizer Management"}
          </p>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Events
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {isAdmin
                  ? "Manage and monitor all events across EventON."
                  : "Create, manage, and track all events created by you."}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-6 lg:px-8">

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="space-y-4">

          {/* ROW 1 */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <EventStatCard
              title="Total Events"
              value={
                statistics.total
              }
              icon={CalendarDays}
              iconClass="bg-blue-50 text-blue-600"
            />

            <EventStatCard
              title="Sold Out"
              value={
                statistics.soldOut
              }
              icon={Ticket}
              iconClass="bg-orange-50 text-orange-600"
            />

          </div>

          {/* ROW 2 */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <EventStatCard
              title="Upcoming"
              value={
                statistics.upcoming
              }
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <EventStatCard
              title="Ongoing"
              value={
                statistics.ongoing
              }
              icon={Clock3}
              iconClass="bg-blue-50 text-blue-600"
            />

            <EventStatCard
              title="Completed"
              value={
                statistics.completed
              }
              icon={CalendarDays}
              iconClass="bg-slate-100 text-slate-600"
            />

            <EventStatCard
              title="Cancelled"
              value={
                statistics.cancelled
              }
              icon={XCircle}
              iconClass="bg-red-50 text-red-600"
            />

          </div>

        </section>

        {/* =================================================
            EVENTS CARD
        ================================================= */}

        <section className="mt-6 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* =================================================
              SEARCH + FILTER
          ================================================= */}

          <div
            ref={filterRef}
            className="relative z-20 border-b border-slate-200 p-3 sm:p-4"
          >

            <div className="flex flex-col gap-2 lg:flex-row">

              {/* SEARCH */}

              <div className="relative min-w-0 flex-1">

                <Search
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder={
                    isAdmin
                      ? "Search events, organizers, locations..."
                      : "Search your events..."
                  }
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

              {/* STATUS */}

              <CustomDropdown
                label={
                  selectedStatusLabel
                }
                options={
                  statusOptions
                }
                value={
                  statusFilter
                }
                open={
                  openDropdown ===
                  "status"
                }
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown ===
                      "status"
                      ? null
                      : "status"
                  )
                }
                onChange={(value) => {
                  setStatusFilter(
                    value
                  );
                  setOpenDropdown(
                    null
                  );
                }}
                widthClass="lg:w-44"
              />

              {/* CATEGORY */}

              <CustomDropdown
                label={
                  selectedCategoryLabel
                }
                options={
                  categoryOptions
                }
                value={
                  categoryFilter
                }
                open={
                  openDropdown ===
                  "category"
                }
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown ===
                      "category"
                      ? null
                      : "category"
                  )
                }
                onChange={(value) => {
                  setCategoryFilter(
                    value
                  );
                  setOpenDropdown(
                    null
                  );
                }}
                widthClass="lg:w-48"
                scrollable
              />

            </div>

          </div>

          {/* =================================================
              DIRECTORY HEADER
          ================================================= */}

          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Event Directory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Showing{" "}
                {filteredEvents.length.toLocaleString(
                  "en-IN"
                )}{" "}
                of{" "}
                {events.length.toLocaleString(
                  "en-IN"
                )}{" "}
                events
              </p>
            </div>

            {(searchQuery ||
              statusFilter !==
                "all" ||
              categoryFilter !==
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
              EVENT CARDS
          ================================================= */}

          {filteredEvents.length ===
          0 ? (
            <EmptyEventsState
              hasFilters={
                Boolean(
                  searchQuery
                ) ||
                statusFilter !==
                  "all" ||
                categoryFilter !==
                  "all"
              }
              onClear={
                clearFilters
              }
              isOrganizer={
                isOrganizer
              }
            />
          ) : (
            <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">

              {filteredEvents.map(
                (event) => (
                  <ManagementEventCard
                    key={event.id}
                    event={event}
                    bookedSeats={
                      getActualBookedSeats(
                        event
                      )
                    }
                    currentTime={
                      currentTime
                    }
                    isAdmin={
                      isAdmin
                    }
                  />
                )
              )}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

/* =========================================================
   EVENT CARD
========================================================= */

function ManagementEventCard({
  event,
  bookedSeats,
  currentTime,
  isAdmin,
}) {
  const navigate =
    useNavigate();

  const capacity = Number(
    event?.capacity || 0
  );

  const safeBookedSeats =
    Math.max(
      0,
      Number(bookedSeats || 0)
    );

  const availableSeats =
    Math.max(
      capacity -
        safeBookedSeats,
      0
    );

  const occupancy =
    capacity > 0
      ? Math.min(
          (safeBookedSeats /
            capacity) *
            100,
          100
        )
      : 0;

  const status =
    getEventStatus(
      event,
      safeBookedSeats,
      currentTime
    );

  const StatusIcon =
    getStatusIcon(status);

  const isSoldOut =
    status === "sold-out";

  const eventDetailsPath =
    isAdmin
      ? `/admin/events/${event.id}`
      : `/organizer/events/${event.id}`;

  const openEvent = () => {
    navigate(
      eventDetailsPath
    );
  };

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Open ${
        event?.title ||
        "event"
      }`}
      onClick={openEvent}
      onKeyDown={(
        keyboardEvent
      ) => {
        if (
          keyboardEvent.key ===
            "Enter" ||
          keyboardEvent.key ===
            " "
        ) {
          keyboardEvent.preventDefault();
          openEvent();
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
    >

      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="relative h-48 bg-slate-100">

        {event?.image ? (
          <img
            src={event.image}
            alt={
              event.title ||
              "Event"
            }
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <CalendarDays
              size={42}
            />
          </div>
        )}

        {/* STATUS */}

        <span
          className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm ${getStatusClasses(
            status
          )}`}
        >
          <StatusIcon
            size={13}
          />

          {getStatusLabel(
            status
          )}
        </span>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-5">

        {/* TITLE + PRICE */}

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">

            <h2 className="line-clamp-2 text-lg font-bold text-slate-900">
              {event?.title ||
                "Untitled Event"}
            </h2>

            <p className="mt-1 text-sm font-medium text-orange-500">
              {event?.category ||
                "General Event"}
            </p>

          </div>

          <span className="shrink-0 text-sm font-bold text-slate-900">
            {formatCurrency(
              event?.price
            )}
          </span>

        </div>

        {/* =================================================
            EVENT INFORMATION
        ================================================= */}

        <div className="mt-5 space-y-2.5">

          {/* DATE + TIME */}

          <div className="flex items-center gap-2 text-sm text-slate-600">

            <CalendarDays
              size={16}
              className="shrink-0 text-orange-500"
            />

            <span>
              {formatDate(
                event?.date
              )}
            </span>

            {event?.time && (
              <>
                <span className="text-slate-300">
                  •
                </span>

                <Clock3
                  size={15}
                  className="text-orange-500"
                />

                <span>
                  {event.time}
                </span>
              </>
            )}

          </div>

          {/* LOCATION */}

          <div className="flex items-start gap-2 text-sm text-slate-600">

            <MapPin
              size={16}
              className="mt-0.5 shrink-0 text-orange-500"
            />

            <span className="line-clamp-1">
              {[
                event?.location,
                event?.city,
              ]
                .filter(Boolean)
                .join(", ") ||
                "Location unavailable"}
            </span>

          </div>

          {/* ORGANIZER */}

          {isAdmin && (
            <div className="flex items-center gap-2 text-sm text-slate-600">

              <Users
                size={16}
                className="shrink-0 text-orange-500"
              />

              <span className="truncate">
                {getOrganizerDisplayName(
                  event
                )}
              </span>

            </div>
          )}

        </div>

        {/* =================================================
            TICKET CAPACITY
        ================================================= */}

        <div
          className={`mt-5 rounded-xl p-4 ${
            isSoldOut
              ? "bg-orange-50"
              : "bg-slate-50"
          }`}
        >

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-2">

              <Ticket
                size={16}
                className={
                  isSoldOut
                    ? "text-orange-600"
                    : "text-slate-500"
                }
              />

              <span className="text-sm font-medium text-slate-700">
                Ticket capacity
              </span>

            </div>

            <span className="text-sm font-semibold text-slate-900">
              {safeBookedSeats} /{" "}
              {capacity}
            </span>

          </div>

          {/* PROGRESS */}

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{
                width: `${occupancy}%`,
              }}
            />

          </div>

          <div className="mt-2 flex items-center justify-between text-xs">

            <span
              className={
                isSoldOut
                  ? "font-semibold text-orange-600"
                  : "text-slate-500"
              }
            >
              {isSoldOut
                ? "Sold out"
                : `${availableSeats} seats available`}
            </span>

            <span className="font-medium text-slate-600">
              {Math.round(
                occupancy
              )}
              % booked
            </span>

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mt-5 flex items-center justify-between gap-3">

          <span
            className={`text-xs font-medium ${
              status ===
              "published"
                ? "text-emerald-600"
                : status ===
                    "ongoing"
                  ? "text-blue-600"
                  : status ===
                      "sold-out"
                    ? "text-orange-600"
                    : "text-slate-500"
            }`}
          >
            {status ===
            "published"
              ? "Upcoming event"
              : status ===
                  "ongoing"
                ? "Event is ongoing"
                : status ===
                    "completed"
                  ? "Completed event"
                  : status ===
                      "cancelled"
                    ? "Cancelled event"
                    : "All tickets sold"}
          </span>

          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 transition group-hover:text-orange-600">
            View details →
          </span>

        </div>

      </div>

    </article>
  );
}

/* =========================================================
   CUSTOM DROPDOWN
========================================================= */

function CustomDropdown({
  label,
  options,
  value,
  open,
  onToggle,
  onChange,
  widthClass,
  scrollable = false,
}) {
  return (
    <div
      className={`relative w-full ${
        widthClass || ""
      }`}
    >

      <button
        type="button"
        onClick={onToggle}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 text-left text-sm font-medium outline-none transition ${
          value !== "all"
            ? "border-orange-400 text-slate-900 shadow-sm"
            : "border-slate-200 text-slate-600 hover:border-slate-300"
        } ${
          open
            ? "border-orange-400 ring-4 ring-orange-50"
            : ""
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >

        <span className="truncate">
          {label}
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 text-slate-500 transition-transform duration-200 ${
            open
              ? "rotate-180"
              : ""
          }`}
        />

      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-900/5 ${
            scrollable
              ? "max-h-56"
              : ""
          }`}
          role="listbox"
        >

          <div
            className="overflow-y-auto"
            style={{
              maxHeight:
                "14rem",
              scrollbarWidth:
                "thin",
            }}
          >

            {options.map(
              (option) => {
                const isSelected =
                  option.value ===
                  value;

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    onClick={() =>
                      onChange(
                        option.value
                      )
                    }
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                      isSelected
                        ? "bg-orange-50 font-semibold text-orange-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    role="option"
                    aria-selected={
                      isSelected
                    }
                  >

                    <span className="truncate">
                      {
                        option.label
                      }
                    </span>

                    {isSelected && (
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-orange-500"
                      />
                    )}

                  </button>
                );
              }
            )}

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function EventStatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
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
   EMPTY STATE
========================================================= */

function EmptyEventsState({
  hasFilters,
  onClear,
  isOrganizer,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <CalendarDays
          size={25}
        />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {hasFilters
          ? "No events found"
          : isOrganizer
            ? "No events yet"
            : "No events available"}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {hasFilters
          ? "Try changing your search or filter options."
          : isOrganizer
            ? "Create your first event and it will appear here."
            : "Events created in EventON will appear here."}
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

export default ManagementEvents;