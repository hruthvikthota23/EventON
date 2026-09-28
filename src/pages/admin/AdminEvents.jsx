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
  Clock3,
  Eye,
  Search,
  Ticket,
  Users,
  X,
  XCircle,
  ChevronDown,
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
   BOOKING HELPERS
========================================================= */

/*
 * Convert different possible booking quantity fields
 * into one reliable ticket count.
 */
const getBookingQuantity = (booking) => {
  const quantity = Number(
    booking?.quantity ??
      booking?.tickets ??
      booking?.ticketCount ??
      booking?.numberOfTickets ??
      1
  );

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    return 1;
  }

  return quantity;
};

/*
 * Normalize booking status.
 */
const getBookingStatus = (booking) => {
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
};

/*
 * Cancelled bookings should not occupy seats.
 *
 * Confirmed, pending and completed bookings
 * are treated as occupied.
 */
const isActiveBooking = (booking) => {
  const status =
    getBookingStatus(booking);

  return status !== "cancelled";
};


/* =========================================================
   EVENT LIFECYCLE HELPERS
========================================================= */

const parseEventDateTime = (dateValue, timeValue, endOfDay = false) => {
  if (!dateValue) {
    return null;
  }

  const dateString = String(dateValue).trim();
  const timeString = String(timeValue || '').trim();

  const value = timeString
    ? `${dateString}T${timeString}`
    : `${dateString}T${endOfDay ? '23:59:59' : '00:00:00'}`;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getEventLifecycleStatus = (event, nowValue = Date.now()) => {
  const storedStatus = String(event?.status || 'published')
    .trim()
    .toLowerCase();

  if (storedStatus === 'draft') {
    return 'draft';
  }

  if (storedStatus === 'cancelled' || storedStatus === 'canceled') {
    return 'cancelled';
  }

  const now = new Date(nowValue);
  const start = parseEventDateTime(event?.date, event?.time);
  const end = parseEventDateTime(
    event?.date,
    event?.endTime,
    true
  );

  if (end && now >= end) {
    return 'completed';
  }

  if (start && now >= start) {
    return 'ongoing';
  }

  return 'published';
};

/* =========================================================
   ORGANIZER DISPLAY
========================================================= */

const getOrganizerDisplayName = (event) => {
  const organizerId = event?.organizerId;

  if (organizerId) {
    try {
      const accounts = JSON.parse(
        localStorage.getItem("eventon_accounts") || "[]"
      );

      if (Array.isArray(accounts)) {
        const organizer = accounts.find(
          (account) =>
            String(account?.id) === String(organizerId) &&
            String(account?.role || "").toLowerCase() === "organizer"
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
};

/* =========================================================
   COMPONENT
========================================================= */

function AdminEvents() {
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
     LOAD ACTUAL EVENTS + BOOKINGS
  ======================================================= */

  const loadData = () => {
    try {
      const storedEvents =
        getStoredEvents();

      const storedBookings =
        getStoredBookings();

      setEvents(
        Array.isArray(storedEvents)
          ? storedEvents
          : []
      );

      setBookings(
        Array.isArray(storedBookings)
          ? storedBookings
          : []
      );
    } catch (error) {
      console.error(
        "Unable to load admin events:",
        error
      );

      setEvents([]);
      setBookings([]);
    }
  };

  /* =======================================================
     LIVE DATA UPDATES
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
      EVENTS_UPDATED_EVENT,
      handleUpdate
    );

    window.addEventListener(
      BOOKINGS_UPDATED_EVENT,
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleUpdate
      );

      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        handleUpdate
      );

      window.removeEventListener(
        BOOKINGS_UPDATED_EVENT,
        handleUpdate
      );
    };
  }, []);

  /* =======================================================
     REFRESH LIFECYCLE STATUS
  ======================================================= */

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(Date.now());
    };

    updateClock();

    const intervalId = window.setInterval(
      updateClock,
      60 * 1000
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  /* =======================================================
     CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
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
     ACTUAL BOOKINGS BY EVENT
  ======================================================= */

  const bookingsByEvent = useMemo(() => {
    const map = new Map();

    bookings.forEach((booking) => {
      /*
       * Cancelled bookings do not occupy seats.
       */
      if (!isActiveBooking(booking)) {
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

      const quantity =
        getBookingQuantity(
          booking
        );

      map.set(
        key,
        current + quantity
      );
    });

    return map;
  }, [bookings]);

  /* =======================================================
     GET ACTUAL BOOKED TICKETS
  ======================================================= */

  const getActualBookedSeats = (
    event
  ) => {
    if (!event?.id) {
      return 0;
    }

    return (
      bookingsByEvent.get(
        String(event.id)
      ) || 0
    );
  };

  /* =======================================================
     EVENT STATUS
  ======================================================= */

  const getEventStatus = (
    event
  ) => {
    const lifecycleStatus =
      getEventLifecycleStatus(
        event,
        currentTime
      );

    /*
     * Completed and ongoing are lifecycle states.
     * They take priority over booking capacity so a
     * historical event never appears as "Sold Out".
     */
    if (
      lifecycleStatus === "completed" ||
      lifecycleStatus === "ongoing"
    ) {
      return lifecycleStatus;
    }

    const capacity = Number(
      event?.capacity || 0
    );

    const bookedSeats =
      getActualBookedSeats(
        event
      );

    /*
     * Sold Out is based on REAL bookings.
     * It applies only before an event is completed.
     */
    if (
      capacity > 0 &&
      bookedSeats >= capacity
    ) {
      return "sold-out";
    }

    return lifecycleStatus;
  };

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics =
    useMemo(() => {
      const published =
        events.filter(
          (event) =>
            getEventStatus(
              event
            ) === "published"
        );

      const draft =
        events.filter(
          (event) =>
            getEventStatus(
              event
            ) === "draft"
        );

      const soldOut =
        events.filter(
          (event) =>
            getEventStatus(
              event
            ) === "sold-out"
        );

      const completed =
        events.filter(
          (event) =>
            getEventStatus(
              event
            ) === "completed"
        );

      return {
        total: events.length,
        published: published.length,
        draft: draft.length,
        soldOut: soldOut.length,
        completed: completed.length,
      };
    }, [
      events,
      bookingsByEvent,
      currentTime,
    ]);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories =
    useMemo(() => {
      const categoryValues =
        events
          .map(
            (event) =>
              event?.category
          )
          .filter(Boolean)
          .map(
            (category) =>
              String(
                category
              ).trim()
          );

      return [
        ...new Set(
          categoryValues
        ),
      ].sort((a, b) =>
        a.localeCompare(b)
      );
    }, [events]);

  /* =======================================================
     FILTER EVENTS
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

          const organizer =
            String(
              getOrganizerDisplayName(event)
            ).toLowerCase();

          const category =
            String(
              event?.category || ""
            )
              .trim()
              .toLowerCase();

          const status =
            getEventStatus(
              event
            );

          const matchesSearch =
            !query ||
            title.includes(
              query
            ) ||
            location.includes(
              query
            ) ||
            city.includes(
              query
            ) ||
            organizer.includes(
              query
            );

          const matchesStatus =
            statusFilter ===
              "all" ||
            status ===
              statusFilter;

          const matchesCategory =
            categoryFilter ===
              "all" ||
            category ===
              categoryFilter.toLowerCase();

          return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
          );
        }
      );
    }, [
      events,
      searchQuery,
      statusFilter,
      categoryFilter,
      bookingsByEvent,
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

  /* =======================================================
     STATUS LABEL
  ======================================================= */

  const getStatusLabel = (
    status
  ) => {
    if (
      status === "sold-out"
    ) {
      return "Sold Out";
    }

    if (status === "draft") {
      return "Draft";
    }

    if (status === "completed") {
      return "Completed";
    }

    if (status === "ongoing") {
      return "Ongoing";
    }

    if (
      status === "cancelled" ||
      status === "canceled"
    ) {
      return "Cancelled";
    }

    return "Published";
  };

  /* =======================================================
     STATUS STYLE
  ======================================================= */

  const getStatusStyle = (
    status
  ) => {
    if (
      status === "sold-out"
    ) {
      return "bg-red-50 text-red-600";
    }

    if (status === "draft") {
      return "bg-amber-50 text-amber-600";
    }

    if (status === "completed") {
      return "bg-blue-50 text-blue-600";
    }

    if (status === "ongoing") {
      return "bg-indigo-50 text-indigo-600";
    }

    if (
      status === "cancelled" ||
      status === "canceled"
    ) {
      return "bg-slate-100 text-slate-600";
    }

    return "bg-emerald-50 text-emerald-600";
  };

  /* =======================================================
     STATUS ICON
  ======================================================= */

  const getStatusIcon = (
    status
  ) => {
    if (
      status === "sold-out"
    ) {
      return XCircle;
    }

    if (status === "draft") {
      return Clock3;
    }

    if (status === "completed") {
      return CalendarDays;
    }

    if (status === "ongoing") {
      return Clock3;
    }

    if (
      status === "cancelled" ||
      status === "canceled"
    ) {
      return XCircle;
    }

    return CheckCircle2;
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
      value: "published",
      label: "Published",
    },
    {
      value: "draft",
      label: "Draft",
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
      value: "sold-out",
      label: "Sold Out",
    },
  ];

  /* =======================================================
     CATEGORY OPTIONS
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
     SELECTED DROPDOWN LABELS
  ======================================================= */

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
                Events
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage all events
                created and published
                across EventON.
              </p>

            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <CalendarDays
                size={17}
              />

              <span>
                {statistics.total.toLocaleString(
                  "en-IN"
                )}{" "}
                total events
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-6 lg:px-8">

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <EventStatCard
            title="Total Events"
            value={
              statistics.total
            }
            icon={CalendarDays}
            iconClass="bg-blue-50 text-blue-600"
          />

          <EventStatCard
            title="Published"
            value={
              statistics.published
            }
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <EventStatCard
            title="Draft Events"
            value={
              statistics.draft
            }
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />

          <EventStatCard
            title="Sold Out"
            value={
              statistics.soldOut
            }
            icon={Ticket}
            iconClass="bg-red-50 text-red-600"
          />

          <EventStatCard
            title="Completed"
            value={
              statistics.completed
            }
            icon={CalendarDays}
            iconClass="bg-blue-50 text-blue-600"
          />

        </section>

        {/* =================================================
            EVENTS CARD
        ================================================= */}

        <section className="mt-6 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* =================================================
              SEARCH + FILTER BAR
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
                  value={
                    searchQuery
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchQuery(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search your events..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery(
                        ""
                      )
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
                onChange={(
                  value
                ) => {
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
                onChange={(
                  value
                ) => {
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
              EVENT LIST
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
            />
          ) : (
            <div className="divide-y divide-slate-100">

              {filteredEvents.map(
                (event) => {

                  /* =========================================
                     REAL BOOKING DATA
                  ========================================= */

                  const status =
                    getEventStatus(
                      event
                    );

                  const StatusIcon =
                    getStatusIcon(
                      status
                    );

                  const capacity =
                    Number(
                      event?.capacity ||
                        0
                    );

                  /*
                   * IMPORTANT:
                   *
                   * Do NOT use:
                   *
                   * event.bookedSeats
                   *
                   * We calculate this from
                   * actual bookings.
                   */
                  const bookedSeats =
                    getActualBookedSeats(
                      event
                    );

                  const availableSeats =
                    Math.max(
                      capacity -
                        bookedSeats,
                      0
                    );

                  const bookingPercentage =
                    capacity > 0
                      ? Math.min(
                          (bookedSeats /
                            capacity) *
                            100,
                          100
                        )
                      : 0;

                  return (
                    <div
                      key={
                        event.id
                      }
                      className="group px-5 py-5 transition hover:bg-slate-50 sm:px-6"
                    >

                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">

                        {/* ====================================
                            EVENT
                        ==================================== */}

                        <div className="flex min-w-0 flex-1 gap-4">

                          <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                            {event?.image ? (
                              <img
                                src={
                                  event.image
                                }
                                alt={
                                  event.title ||
                                  "Event"
                                }
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <CalendarDays
                                  size={
                                    24
                                  }
                                />
                              </div>
                            )}

                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
                                {event?.title ||
                                  "Untitled Event"}
                              </h3>

                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusStyle(
                                  status
                                )}`}
                              >

                                <StatusIcon
                                  size={
                                    12
                                  }
                                />

                                {
                                  getStatusLabel(
                                    status
                                  )
                                }

                              </span>

                            </div>

                            <p className="mt-1 text-xs font-medium text-orange-500">
                              {event?.category ||
                                "General Event"}
                            </p>

                            <p className="mt-2 line-clamp-1 text-xs text-slate-500">
                              {event?.location ||
                                event?.city ||
                                "Location not available"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">

                              {event?.date ||
                                "Date not available"}

                              {event?.time
                                ? ` • ${event.time}`
                                : ""}

                            </p>

                          </div>

                        </div>

                        {/* ====================================
                            ORGANIZER
                        ==================================== */}

                        <div className="flex items-center gap-3 xl:w-44">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                            <Users
                              size={
                                16
                              }
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                              Organizer
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                              {getOrganizerDisplayName(
                                event
                              )}
                            </p>

                          </div>

                        </div>

                        {/* ====================================
                            ACTUAL BOOKINGS
                        ==================================== */}

                        <div className="xl:w-48">

                          <div className="flex items-center justify-between gap-3">

                            <div>

                              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                Bookings
                              </p>

                              <p className="mt-1 text-xs font-semibold text-slate-700">

                                {bookedSeats.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                /{" "}
                                {capacity.toLocaleString(
                                  "en-IN"
                                )}

                              </p>

                            </div>

                            <span className="text-[11px] font-semibold text-slate-500">

                              {Math.round(
                                bookingPercentage
                              )}
                              %

                            </span>

                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-orange-500 transition-all duration-300"
                              style={{
                                width: `${bookingPercentage}%`,
                              }}
                            />

                          </div>

                          <p className="mt-1.5 text-[10px] text-slate-400">

                            {availableSeats.toLocaleString(
                              "en-IN"
                            )}{" "}
                            seats available

                          </p>

                        </div>

                        {/* ====================================
                            PRICE
                        ==================================== */}

                        <div className="xl:w-24 xl:text-right">

                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Price
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-900">

                            ₹
                            {Number(
                              event?.price ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </p>

                        </div>

                        {/* ====================================
                            VIEW
                        ==================================== */}

                        <div className="flex items-center xl:w-20 xl:justify-end">

                          <Link
                            to={`/admin/events/${event.id}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 transition hover:text-orange-600"
                          >

                            <Eye
                              size={
                                16
                              }
                            />

                            <span className="hidden sm:inline">
                              View
                            </span>

                            <ArrowRight
                              size={
                                15
                              }
                            />

                          </Link>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
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
  scrollable = false,
}) {
  return (
    <div
      className={`relative w-full ${
        widthClass || ""
      }`}
    >

      {/* BUTTON */}

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

      {/* DROPDOWN */}

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
            className={`overflow-y-auto ${
              scrollable
                ? "max-h-56"
                : "max-h-56"
            }`}
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

function EventStatCard({
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
   EMPTY STATE
========================================================= */

function EmptyEventsState({
  hasFilters,
  onClear,
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
          : "No events yet"}

      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">

        {hasFilters
          ? "Try changing your search or filter options."
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

export default AdminEvents;