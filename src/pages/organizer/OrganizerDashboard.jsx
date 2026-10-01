import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  IndianRupee,
  MapPin,
  Plus,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";

import BookingStatus from "../../components/bookings/BookingStatus";

import {
  EVENTS_UPDATED_EVENT,
  getStoredEventsByOrganizer,
} from "../../utils/eventStorage";

import {
  BOOKINGS_UPDATED_EVENT,
  getStoredBookings,
} from "../../utils/bookingStorage";

const USER_STORAGE_KEY = "eventon_user";

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Date unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function parseEventDateTime(dateValue, timeValue) {
  if (!dateValue) {
    return null;
  }

  const dateText = String(dateValue).trim();
  const timeText = String(timeValue || "00:00").trim();

  let year;
  let month;
  let day;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    [year, month, day] = dateText.split("-").map(Number);
  } else if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(dateText)) {
    [day, month, year] = dateText.split(/[-/]/).map(Number);
  } else {
    const parsed = new Date(dateText);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    year = parsed.getFullYear();
    month = parsed.getMonth() + 1;
    day = parsed.getDate();
  }

  /*
   * Supports:
   * 10:30
   * 10:30 AM
   * 10:30 PM
   * 10:30:00
   * 10:30:00 PM
   */
  const timeMatch = timeText.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
  );

  if (!timeMatch) {
    return null;
  }

  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const second = Number(timeMatch[3] || 0);
  const meridiem = timeMatch[4]?.toUpperCase();

  if (meridiem === "PM" && hour !== 12) {
    hour += 12;
  }

  if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return null;
  }

  const result = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    0
  );

  return Number.isNaN(result.getTime()) ? null : result;
}

function getEventStart(event) {
  return parseEventDateTime(
    event?.date,
    event?.time || event?.startTime || "00:00"
  );
}

function getEventEnd(event) {
  const start = getEventStart(event);

  if (!start) {
    return null;
  }

  const endTime = event?.endTime || event?.finishTime;

  if (!endTime) {
    return start;
  }

  const end = parseEventDateTime(event.date, endTime);

  if (!end) {
    return start;
  }

  /*
   * If an event starts at 10 PM and ends at 1 AM,
   * treat the end as the following day.
   */
  if (end.getTime() < start.getTime()) {
    end.setDate(end.getDate() + 1);
  }

  return end;
}

/* =========================================================
   EVENT STATUS
========================================================= */

function getEventStatus(event, now = Date.now()) {
  const storedStatus = String(event?.status || "")
    .trim()
    .toLowerCase();

  if (
    storedStatus === "cancelled" ||
    storedStatus === "canceled"
  ) {
    return "cancelled";
  }

  if (storedStatus === "draft") {
    return "upcoming";
  }

  const start = getEventStart(event);
  const end = getEventEnd(event);

  if (!start) {
    return "upcoming";
  }

  const startTime = start.getTime();
  const endTime = end?.getTime() || startTime;

  if (now < startTime) {
    return "upcoming";
  }

  if (now >= startTime && now < endTime) {
    return "ongoing";
  }

  return "completed";
}

function isUpcomingEvent(event, now = Date.now()) {
  return getEventStatus(event, now) === "upcoming";
}

/* =========================================================
   BOOKING HELPERS
========================================================= */

function getBookingEventId(booking) {
  return (
    booking?.eventId ||
    booking?.event?.id ||
    booking?.event?.eventId ||
    null
  );
}

function isActiveBooking(booking) {
  const status = String(booking?.status || "")
    .trim()
    .toLowerCase();

  return !["cancelled", "canceled"].includes(status);
}

function isConfirmedBooking(booking) {
  return isActiveBooking(booking);
}

function getBookingTicketCount(booking) {
  return Number(
    booking?.ticketCount ??
      booking?.quantity ??
      0
  );
}

function getBookingRevenue(booking) {
  return Number(
    booking?.totalPrice ??
      booking?.totalAmount ??
      booking?.amount ??
      0
  );
}

function getBookingCreatedTime(booking) {
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

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>

          {subtitle && (
            <p className="mt-1.5 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

function OrganizerDashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  const loadDashboardData = useCallback(() => {
    try {
      const storedUser = localStorage.getItem(
        USER_STORAGE_KEY
      );

      if (!storedUser) {
        setUser(null);
        setEvents([]);
        setBookings([]);
        return;
      }

      const currentUser = JSON.parse(storedUser);

      setUser(currentUser);

      if (!currentUser?.id) {
        setEvents([]);
        setBookings([]);
        return;
      }

      /* -----------------------------------------------
         ORGANIZER EVENTS
      ----------------------------------------------- */

      const organizerEvents =
        getStoredEventsByOrganizer(currentUser.id);

      const safeEvents = Array.isArray(organizerEvents)
        ? organizerEvents
        : [];

      setEvents(safeEvents);

      /* -----------------------------------------------
         ORGANIZER BOOKINGS
      ----------------------------------------------- */

      const allBookings = getStoredBookings();

      const organizerEventIds = new Set(
        safeEvents.map((event) => String(event.id))
      );

      const organizerBookings = allBookings.filter(
        (booking) =>
          organizerEventIds.has(
            String(getBookingEventId(booking))
          )
      );

      setBookings(
        Array.isArray(organizerBookings)
          ? organizerBookings
          : []
      );
    } catch (error) {
      console.error(
        "Unable to load organizer dashboard:",
        error
      );

      setUser(null);
      setEvents([]);
      setBookings([]);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  /* =======================================================
     LIVE UPDATES
  ======================================================= */

  useEffect(() => {
    const handleEventsUpdated = () => {
      loadDashboardData();
    };

    const handleBookingsUpdated = () => {
      loadDashboardData();
    };

    const handleStorage = (event) => {
      if (
        event.key === USER_STORAGE_KEY ||
        event.key === "eventon_events" ||
        event.key === "eventon_bookings"
      ) {
        loadDashboardData();
      }
    };

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      handleEventsUpdated
    );

    window.addEventListener(
      BOOKINGS_UPDATED_EVENT,
      handleBookingsUpdated
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        handleEventsUpdated
      );

      window.removeEventListener(
        BOOKINGS_UPDATED_EVENT,
        handleBookingsUpdated
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [loadDashboardData]);

  /* =======================================================
     LIFECYCLE CLOCK
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
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const upcomingEvents = events.filter(
      (event) =>
        getEventStatus(event, currentTime) === "upcoming"
    );

    const ongoingEvents = events.filter(
      (event) =>
        getEventStatus(event, currentTime) === "ongoing"
    );

    const completedEvents = events.filter(
      (event) =>
        getEventStatus(event, currentTime) === "completed"
    );

    const cancelledEvents = events.filter(
      (event) =>
        getEventStatus(event, currentTime) === "cancelled"
    );

    const activeBookings = bookings.filter(
      isConfirmedBooking
    );

    const ticketsSold = activeBookings.reduce(
      (total, booking) =>
        total + getBookingTicketCount(booking),
      0
    );

    const revenue = activeBookings.reduce(
      (total, booking) =>
        total + getBookingRevenue(booking),
      0
    );

    return {
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      ongoingEvents: ongoingEvents.length,
      completedEvents: completedEvents.length,
      cancelledEvents: cancelledEvents.length,
      totalBookings: activeBookings.length,
      ticketsSold,
      revenue,
    };
  }, [events, bookings, currentTime]);

  /* =======================================================
     UPCOMING EVENTS
  ======================================================= */

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((event) =>
        isUpcomingEvent(event, currentTime)
      )
      .sort((a, b) => {
        const dateA =
          getEventStart(a)?.getTime() || 0;

        const dateB =
          getEventStart(b)?.getTime() || 0;

        return dateA - dateB;
      })
      .slice(0, 5);
  }, [events, currentTime]);

  /* =======================================================
     RECENT BOOKINGS
  ======================================================= */

  const recentBookings = useMemo(() => {
    return [...bookings]
      .filter(isConfirmedBooking)
      .sort(
        (a, b) =>
          getBookingCreatedTime(b) -
          getBookingCreatedTime(a)
      )
      .slice(0, 5);
  }, [bookings]);

  /* =======================================================
     TOP 3 EVENT PERFORMANCE
  ======================================================= */

  const eventPerformance = useMemo(() => {
    return events
      .map((event) => {
        const eventBookings = bookings.filter(
          (booking) =>
            String(getBookingEventId(booking)) ===
              String(event.id) &&
            isConfirmedBooking(booking)
        );

        const ticketsSold = eventBookings.reduce(
          (total, booking) =>
            total + getBookingTicketCount(booking),
          0
        );

        const revenue = eventBookings.reduce(
          (total, booking) =>
            total + getBookingRevenue(booking),
          0
        );

        const capacity = Number(event.capacity) || 0;

        const percentage =
          capacity > 0
            ? Math.min(
                (ticketsSold / capacity) * 100,
                100
              )
            : 0;

        return {
          ...event,
          ticketsSold,
          revenue,
          capacity,
          percentage,
          lifecycleStatus: getEventStatus(
            event,
            currentTime
          ),
        };
      })
      .filter((event) => event.ticketsSold > 0)
      .sort((a, b) => {
        if (b.ticketsSold !== a.ticketsSold) {
          return b.ticketsSold - a.ticketsSold;
        }

        if (b.revenue !== a.revenue) {
          return b.revenue - a.revenue;
        }

        return b.percentage - a.percentage;
      })
      .slice(0, 3);
  }, [events, bookings, currentTime]);

  /* =======================================================
     LOGIN STATE
  ======================================================= */

  if (!user) {
    return (
      <section className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-5 py-10">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Users size={25} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Organizer account required
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Please log in with an organizer
              account to access the dashboard.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     DASHBOARD UI
  ======================================================= */

  return (
    <section className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600">
              <TrendingUp size={13} />
              Organizer Dashboard
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back,{" "}
              {user.name || "Organizer"} 👋
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your events, monitor bookings,
              and track your event performance from
              one place.
            </p>
          </div>

          <Link
            to="/organizer/events/create"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md"
          >
            <Plus size={18} />
            Create Event
          </Link>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Events"
            value={statistics.totalEvents}
            subtitle={`${statistics.upcomingEvents} upcoming • ${statistics.completedEvents} completed`}
            icon={CalendarDays}
            iconClass="bg-orange-50 text-orange-500"
          />

          <StatCard
            title="Upcoming Events"
            value={statistics.upcomingEvents}
            subtitle={`${statistics.ongoingEvents} currently ongoing`}
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Total Bookings"
            value={statistics.totalBookings}
            subtitle={`${statistics.ticketsSold} tickets sold`}
            icon={Ticket}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Revenue"
            value={formatCurrency(statistics.revenue)}
            subtitle="From active bookings"
            icon={IndianRupee}
            iconClass="bg-violet-50 text-violet-600"
          />
        </div>

        {/* =================================================
            UPCOMING + RECENT BOOKINGS
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">

          {/* =================================================
              UPCOMING EVENTS
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Upcoming Events
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your next scheduled events
                </p>
              </div>

              <Link
                to="/organizer/events"
                className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 transition hover:text-orange-600"
              >
                View all
                <ChevronRight size={16} />
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <CalendarDays size={25} />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  No upcoming events
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                  Create an event to see your
                  upcoming schedule here.
                </p>

                <Link
                  to="/organizer/events/create"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-orange-600"
                >
                  <Plus size={15} />
                  Create Event
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingEvents.map((event) => {
                  const availableSeats = Math.max(
                    Number(event.capacity || 0) -
                      Number(event.bookedSeats || 0),
                    0
                  );

                  return (
                    <Link
                      key={event.id}
                      to={`/organizer/events/${event.id}`}
                      className="group flex gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                    >
                      {/* IMAGE */}

                      <div className="hidden h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:block">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.title || "Event"}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <CalendarDays size={24} />
                          </div>
                        )}
                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-slate-900">
                              {event.title}
                            </h3>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <Clock3 size={12} />
                                {formatDate(event.date)}
                              </span>

                              {event.time && (
                                <span>
                                  {event.time}
                                </span>
                              )}
                            </div>
                          </div>

                          <BookingStatus
                            status={getEventStatus(
                              event,
                              currentTime
                            )}
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={13} />
                            {event.city ||
                              event.location ||
                              "Location unavailable"}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Users size={13} />
                            {availableSeats} seats left
                          </span>
                        </div>
                      </div>

                      <div className="hidden items-center self-center text-slate-300 transition group-hover:text-orange-500 sm:flex">
                        <ArrowUpRight size={19} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* =================================================
              RECENT BOOKINGS
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Recent Bookings
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest active bookings
                </p>
              </div>

              <Link
                to="/organizer/bookings"
                className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 transition hover:text-orange-600"
              >
                View all
                <ChevronRight size={16} />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Ticket size={25} />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  No bookings yet
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                  Bookings for your events will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentBookings.map((booking) => {
                  const event = events.find(
                    (item) =>
                      String(item.id) ===
                      String(
                        getBookingEventId(booking)
                      )
                  );

                  const bookingId =
                    booking.bookingId ||
                    booking.id;

                  const attendeeName =
                    booking.attendee?.name ||
                    booking.user?.name ||
                    "Attendee";

                  return (
                    <Link
                      key={bookingId}
                      to={`/organizer/bookings/${bookingId}`}
                      className="group block px-5 py-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">

                        {/* AVATAR */}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-sm font-bold text-orange-600">
                          {String(attendeeName)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        {/* INFO */}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {attendeeName}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {event?.title ||
                              "Event unavailable"}
                          </p>

                          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
                            <span>
                              {getBookingTicketCount(
                                booking
                              )}{" "}
                              ticket
                              {getBookingTicketCount(
                                booking
                              ) !== 1
                                ? "s"
                                : ""}
                            </span>

                            <span>
                              {formatDate(
                                booking.createdAt ||
                                  booking.bookedAt ||
                                  booking.bookingDate ||
                                  booking.createdDate ||
                                  booking.dateCreated
                              )}
                            </span>
                          </div>
                        </div>

                        {/* AMOUNT */}

                        <div className="hidden shrink-0 text-right sm:block">
                          <p className="text-sm font-bold text-slate-900">
                            {formatCurrency(
                              getBookingRevenue(
                                booking
                              )
                            )}
                          </p>

                          <p className="mt-1 text-[10px] font-medium text-emerald-600">
                            Active
                          </p>
                        </div>

                        <ChevronRight
                          size={17}
                          className="shrink-0 text-slate-300 transition group-hover:text-orange-500"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* =================================================
            TOP 3 PERFORMANCE
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <TrendingUp size={17} />
                </div>

                <h2 className="text-base font-bold text-slate-900">
                  Top 3 Event Performance
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Your highest-performing events based on
                active tickets sold
              </p>
            </div>

            <Link
              to="/organizer/events"
              className="hidden items-center gap-1 text-sm font-semibold text-orange-500 transition hover:text-orange-600 sm:inline-flex"
            >
              View events
              <ChevronRight size={16} />
            </Link>
          </div>

          {eventPerformance.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <TrendingUp size={25} />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                No performance data
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                Create events and receive bookings
                to see your top performing events.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-3">
              {eventPerformance.map(
                (event, index) => (
                  <Link
                    key={event.id}
                    to={`/organizer/events/${event.id}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
                  >
                    {/* IMAGE */}

                    <div className="relative h-40 overflow-hidden bg-slate-100">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={
                            event.title || "Event"
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <CalendarDays size={32} />
                        </div>
                      )}

                      {/* RANK */}

                      <div className="absolute left-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-lg bg-white/95 px-2 text-xs font-black text-orange-600 shadow-sm backdrop-blur">
                        #{index + 1}
                      </div>

                      {/* STATUS */}

                      <div className="absolute right-3 top-3">
                        <BookingStatus
                          status={
                            event.lifecycleStatus
                          }
                        />
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="p-4">
                      <h3 className="truncate text-sm font-bold text-slate-900">
                        {event.title ||
                          "Untitled Event"}
                      </h3>

                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={12} />
                          {formatDate(event.date)}
                        </span>

                        {event.city && (
                          <span className="inline-flex min-w-0 items-center gap-1 truncate">
                            <MapPin size={12} />
                            {event.city}
                          </span>
                        )}
                      </div>

                      {/* PROGRESS */}

                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-500">
                            Tickets sold
                          </span>

                          <span className="text-xs font-bold text-slate-900">
                            {event.ticketsSold}
                            {event.capacity
                              ? ` / ${event.capacity}`
                              : ""}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-orange-500 transition-all duration-500"
                            style={{
                              width: `${event.percentage}%`,
                            }}
                          />
                        </div>

                        <div className="mt-1.5 flex justify-end">
                          <span className="text-[10px] font-medium text-slate-400">
                            {Math.round(
                              event.percentage
                            )}
                            % booked
                          </span>
                        </div>
                      </div>

                      {/* FOOTER */}

                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="text-[11px] text-slate-400">
                            Revenue
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-slate-900">
                            {formatCurrency(
                              event.revenue
                            )}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 transition group-hover:text-orange-600">
                          Details
                          <ArrowUpRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Quickly access the tools you use most.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <QuickAction
              to="/organizer/events/create"
              icon={CalendarDays}
              title="Create an Event"
              description="Publish a new event for attendees."
              action="Create now"
            />

            <QuickAction
              to="/organizer/events"
              icon={Ticket}
              title="Manage Events"
              description="View and manage all your events."
              action="Manage events"
            />

            <QuickAction
              to="/organizer/bookings"
              icon={Users}
              title="View Bookings"
              description="See attendees and booking activity."
              action="View bookings"
            />
          </div>
        </section>
      </div>
    </section>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        <Icon size={21} />
      </div>

      <h3 className="mt-4 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-500">
        {action}

        <ChevronRight
          size={16}
          className="transition group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}

export default OrganizerDashboard;