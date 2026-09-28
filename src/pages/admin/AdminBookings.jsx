import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  Search,
  Ticket,
  Users,
  X,
  XCircle,
} from "lucide-react";

import {
  getStoredEvents,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

import {
  getStoredBookings,
  BOOKINGS_UPDATED_EVENT,
} from "../../utils/bookingStorage";

/* =========================================================
   CONSTANTS
========================================================= */

const ACCOUNTS_STORAGE_KEY =
  "eventon_accounts";

/* =========================================================
   HELPERS
========================================================= */

function getBookingId(booking) {
  return (
    booking?.bookingId ||
    booking?.id ||
    "—"
  );
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

  if (status === "pending") {
    return "pending";
  }

  return "confirmed";
}

function getStatusLabel(status) {
  switch (status) {
    case "cancelled":
      return "Cancelled";

    case "completed":
      return "Completed";

    case "pending":
      return "Pending";

    default:
      return "Confirmed";
  }
}

function getStatusClasses(status) {
  switch (status) {
    case "cancelled":
      return "bg-red-50 text-red-600";

    case "completed":
      return "bg-blue-50 text-blue-600";

    case "pending":
      return "bg-amber-50 text-amber-600";

    default:
      return "bg-emerald-50 text-emerald-600";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "cancelled":
      return XCircle;

    case "completed":
      return CheckCircle2;

    case "pending":
      return Clock3;

    default:
      return CheckCircle2;
  }
}

function getTicketCount(booking) {
  const value = Number(
    booking?.quantity ??
      booking?.tickets ??
      booking?.ticketCount ??
      1
  );

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return 1;
  }

  return value;
}

function getBookingAmount(booking) {
  const value = Number(
    booking?.totalAmount ??
      booking?.totalPrice ??
      booking?.amount ??
      booking?.price ??
      0
  );

  if (!Number.isFinite(value)) {
    return 0;
  }

  return value;
}

function formatCurrency(value) {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getBookingDate(booking) {
  return (
    booking?.createdAt ||
    booking?.bookingDate ||
    booking?.date ||
    booking?.createdOn ||
    booking?.timestamp ||
    null
  );
}

/* =========================================================
   ATTENDEE RESOLVER
========================================================= */

function getAttendee(booking, accounts) {
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

  /*
   * First try to find the registered account.
   */

  let account = null;

  if (bookingUserId) {
    account =
      accounts.find(
        (item) =>
          String(item?.id) ===
          String(bookingUserId)
      ) || null;
  }

  if (!account && bookingEmail) {
    account =
      accounts.find(
        (item) =>
          String(item?.email || "")
            .trim()
            .toLowerCase() ===
          String(bookingEmail)
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
   COMPONENT
========================================================= */

function AdminBookings() {
  /* =======================================================
     STATE
  ======================================================= */

  const [bookings, setBookings] =
    useState([]);

  const [events, setEvents] =
    useState([]);

  const [accounts, setAccounts] =
    useState([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [openDropdown, setOpenDropdown] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const filterRef = useRef(null);

  /* =======================================================
     LOAD ACTUAL DATA
  ======================================================= */

  const loadData = () => {
    try {
      const storedBookings =
        getStoredBookings();

      const storedEvents =
        getStoredEvents();

      let storedAccounts = [];

      try {
        const rawAccounts =
          localStorage.getItem(
            ACCOUNTS_STORAGE_KEY
          );

        if (rawAccounts) {
          const parsedAccounts =
            JSON.parse(rawAccounts);

          if (
            Array.isArray(
              parsedAccounts
            )
          ) {
            storedAccounts =
              parsedAccounts;
          }
        }
      } catch (accountError) {
        console.error(
          "Unable to load EventON accounts:",
          accountError
        );
      }

      setBookings(
        Array.isArray(storedBookings)
          ? storedBookings
          : []
      );

      setEvents(
        Array.isArray(storedEvents)
          ? storedEvents
          : []
      );

      setAccounts(
        Array.isArray(storedAccounts)
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
  };

  /* =======================================================
     INITIAL LOAD + LIVE UPDATES
  ======================================================= */

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener(
      "storage",
      handleUpdate
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
        handleUpdate
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
  }, []);

  /* =======================================================
     CLOSE DROPDOWN
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
              booking
            );

          const bookingDate =
            getBookingDate(
              booking
            );

          return {
            ...booking,

            resolvedEvent:
              event,

            resolvedAttendee:
              attendee,

            resolvedStatus:
              status,

            resolvedBookingDate:
              bookingDate,

            resolvedTicketCount:
              getTicketCount(
                booking
              ),

            resolvedAmount:
              getBookingAmount(
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
      const confirmed =
        enrichedBookings.filter(
          (booking) =>
            booking.resolvedStatus ===
            "confirmed"
        );

      const pending =
        enrichedBookings.filter(
          (booking) =>
            booking.resolvedStatus ===
            "pending"
        );

      const cancelled =
        enrichedBookings.filter(
          (booking) =>
            booking.resolvedStatus ===
            "cancelled"
        );

      const activeBookings =
        enrichedBookings.filter(
          (booking) =>
            booking.resolvedStatus !==
              "cancelled"
        );

      const revenue =
        activeBookings.reduce(
          (total, booking) =>
            total +
            Number(
              booking.resolvedAmount ||
                0
            ),
          0
        );

      const tickets =
        activeBookings.reduce(
          (total, booking) =>
            total +
            Number(
              booking.resolvedTicketCount ||
                0
            ),
          0
        );

      return {
        total: enrichedBookings.length,
        confirmed: confirmed.length,
        pending: pending.length,
        cancelled: cancelled.length,
        tickets,
        revenue,
      };
    }, [enrichedBookings]);

  /* =======================================================
     FILTER BOOKINGS
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
            bookingId.includes(
              query
            );

          const matchesStatus =
            statusFilter === "all" ||
            booking.resolvedStatus ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        })
        .sort((a, b) => {
          const first =
            new Date(
              a.resolvedBookingDate ||
                0
            ).getTime();

          const second =
            new Date(
              b.resolvedBookingDate ||
                0
            ).getTime();

          return second - first;
        });
    }, [
      enrichedBookings,
      searchQuery,
      statusFilter,
    ]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setOpenDropdown(null);
  };

  /* =======================================================
     STATUS OPTIONS
  ======================================================= */

  const statusOptions = [
    {
      value: "all",
      label: "All statuses",
    },
    {
      value: "confirmed",
      label: "Confirmed",
    },
    {
      value: "pending",
      label: "Pending",
    },
    {
      value: "completed",
      label: "Completed",
    },
    {
      value: "cancelled",
      label: "Cancelled",
    },
  ];

  const selectedStatusLabel =
    statusOptions.find(
      (option) =>
        option.value ===
        statusFilter
    )?.label ||
    "All statuses";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="bg-slate-50">

        <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-6 lg:px-8">

          <p className="text-sm font-medium text-orange-500">
            Administration
          </p>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Bookings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage and review all
                bookings made across
                EventON.
              </p>

            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <Ticket size={17} />

              <span>
                {statistics.total.toLocaleString(
                  "en-IN"
                )}{" "}
                total bookings
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-6 lg:px-8">

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <BookingStatCard
            title="Total Bookings"
            value={
              statistics.total
            }
            icon={Ticket}
            iconClass="bg-blue-50 text-blue-600"
          />

          <BookingStatCard
            title="Confirmed"
            value={
              statistics.confirmed
            }
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <BookingStatCard
            title="Pending"
            value={
              statistics.pending
            }
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />

          <BookingStatCard
            title="Cancelled"
            value={
              statistics.cancelled
            }
            icon={XCircle}
            iconClass="bg-red-50 text-red-600"
          />

        </section>

        {/* =================================================
            EXTRA SUMMARY
        ================================================= */}

        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Users size={21} />
              </div>

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Tickets Sold
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {statistics.tickets.toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Ticket size={21} />
              </div>

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Booking Revenue
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatCurrency(
                    statistics.revenue
                  )}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            BOOKING DIRECTORY
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
                  placeholder="Search bookings, attendees or events..."
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
                widthClass="lg:w-48"
              />

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
              LOADING
          ================================================= */}

          {loading ? (
            <BookingLoading />
          ) : filteredBookings.length ===
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

                <table className="w-full min-w-[1000px]">

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
                        Tickets
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        View
                      </th>

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

                        const StatusIcon =
                          getStatusIcon(
                            status
                          );

                        return (
                          <tr
                            key={
                              bookingId
                            }
                            className="group transition hover:bg-slate-50"
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

                                  <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-500">
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
                                        size={
                                          18
                                        }
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
                                    {event?.date ||
                                      "Date unavailable"}
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
                                  booking.resolvedBookingDate
                                )}
                              </p>

                            </td>

                            {/* TICKETS */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">

                                <Ticket
                                  size={
                                    15
                                  }
                                  className="text-slate-400"
                                />

                                {
                                  booking.resolvedTicketCount
                                }

                              </div>

                            </td>

                            {/* AMOUNT */}

                            <td className="px-6 py-5">

                              <p className="text-sm font-bold text-slate-900">
                                {formatCurrency(
                                  booking.resolvedAmount
                                )}
                              </p>

                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5">

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                                  status
                                )}`}
                              >

                                <StatusIcon
                                  size={
                                    13
                                  }
                                />

                                {getStatusLabel(
                                  status
                                )}

                              </span>

                            </td>

                            {/* VIEW */}

                            <td className="px-6 py-5 text-right">

                              <Link
                                to={`/admin/bookings/${bookingId}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                              >

                                <Eye
                                  size={
                                    14
                                  }
                                />

                                View

                                <ArrowRight
                                  size={
                                    13
                                  }
                                />

                              </Link>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  MOBILE CARDS
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

                    const StatusIcon =
                      getStatusIcon(
                        status
                      );

                    return (
                      <div
                        key={
                          bookingId
                        }
                        className="p-5 sm:p-6"
                      >

                        {/* EVENT */}

                        <div className="flex gap-3">

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
                                  size={
                                    20
                                  }
                                />
                              </div>
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">

                                <p className="truncate text-sm font-bold text-slate-900">
                                  {event?.title ||
                                    "Event unavailable"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {event?.date ||
                                    "Date unavailable"}
                                </p>

                              </div>

                              <span
                                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                                  status
                                )}`}
                              >

                                <StatusIcon
                                  size={
                                    11
                                  }
                                />

                                {getStatusLabel(
                                  status
                                )}

                              </span>

                            </div>

                          </div>

                        </div>

                        {/* ATTENDEE */}

                        <div className="mt-5 rounded-xl bg-slate-50 p-4">

                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Attendee
                          </p>

                          <div className="mt-3 flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
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

                              <p className="truncate text-xs text-slate-500">
                                {attendee?.email ||
                                  "No email"}
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* BOOKING META */}

                        <div className="mt-4 grid grid-cols-2 gap-3">

                          <MobileDetail
                            label="Booking ID"
                            value={
                              bookingId
                            }
                          />

                          <MobileDetail
                            label="Booked On"
                            value={formatDate(
                              booking.resolvedBookingDate
                            )}
                          />

                          <MobileDetail
                            label="Tickets"
                            value={
                              booking.resolvedTicketCount
                            }
                          />

                          <MobileDetail
                            label="Amount"
                            value={formatCurrency(
                              booking.resolvedAmount
                            )}
                          />

                        </div>

                        {/* VIEW */}

                        <Link
                          to={`/admin/bookings/${bookingId}`}
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                        >

                          <Eye size={16} />

                          View Booking Details

                          <ArrowRight
                            size={15}
                          />

                        </Link>

                      </div>
                    );
                  }
                )}

              </div>
            </>
          )}

        </section>

      </main>
    </div>
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
}) {
  return (
    <div
      className={`relative w-full ${widthClass || ""}`}
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
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-900/5"
          role="listbox"
        >

          <div
            className="max-h-60 overflow-y-auto"
            style={{
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
                        size={
                          16
                        }
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
   LOADING
========================================================= */

function BookingLoading() {
  return (
    <div className="divide-y divide-slate-100">

      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="animate-pulse px-5 py-6 sm:px-6"
          >

            <div className="flex gap-4">

              <div className="h-10 w-10 rounded-full bg-slate-200" />

              <div className="flex-1 space-y-3">

                <div className="h-4 w-48 rounded bg-slate-200" />

                <div className="h-3 w-72 rounded bg-slate-100" />

              </div>

            </div>

          </div>
        )
      )}

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

export default AdminBookings;