import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  PlayCircle,
  Ticket,
  TrendingUp,
  UserRoundCog,
  Users,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getStoredEvents,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

import {
  getStoredBookings,
  BOOKINGS_UPDATED_EVENT,
} from "../../utils/bookingStorage";

const ACCOUNTS_STORAGE_KEY = "eventon_accounts";

/* =========================================================
   DATE / TIME HELPERS
========================================================= */

function parseEventDateTime(dateValue, timeValue) {
  if (!dateValue) return null;

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

  const match = timeText.match(
    /^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i
  );

  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hour !== 12) {
    hour += 12;
  }

  if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  const result = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0
  );

  return Number.isNaN(result.getTime()) ? null : result;
}

/* =========================================================
   EVENT LIFECYCLE STATUS
========================================================= */

function getEventLifecycleStatus(event, bookedTickets = 0) {
  const storedStatus = String(
    event?.status || "published"
  )
    .trim()
    .toLowerCase();

  if (storedStatus === "draft") {
    return "Draft";
  }

  if (
    storedStatus === "cancelled" ||
    storedStatus === "canceled"
  ) {
    return "Cancelled";
  }

  const start = parseEventDateTime(
    event?.date,
    event?.time || event?.startTime
  );

  if (start) {
    const end = event?.endTime
      ? parseEventDateTime(event.date, event.endTime)
      : start;

    const now = Date.now();

    if (end && now >= end.getTime()) {
      return "Completed";
    }

    if (now >= start.getTime()) {
      return "Ongoing";
    }
  }

  const capacity = Number(event?.capacity) || 0;

  if (
    storedStatus === "sold-out" ||
    (capacity > 0 && bookedTickets >= capacity)
  ) {
    return "Sold out";
  }

  return "Published";
}

/* =========================================================
   FOUR STATUS SYSTEM
========================================================= */

function getUnifiedStatus(event) {
  const storedStatus = String(
    event?.status || "published"
  )
    .trim()
    .toLowerCase();

  if (
    storedStatus === "cancelled" ||
    storedStatus === "canceled"
  ) {
    return "cancelled";
  }

  const start = parseEventDateTime(
    event?.date,
    event?.time || event?.startTime
  );

  if (!start) {
    return "upcoming";
  }

  const end = event?.endTime
    ? parseEventDateTime(event.date, event.endTime)
    : start;

  const now = Date.now();

  if (end && now >= end.getTime()) {
    return "completed";
  }

  if (now >= start.getTime()) {
    return "ongoing";
  }

  return "upcoming";
}

/* =========================================================
   BOOKING STATUS
========================================================= */

function BookingStatus({ status }) {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase();

  const statusConfig = {
    upcoming: {
      label: "Upcoming",
      icon: Clock3,
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    ongoing: {
      label: "Ongoing",
      icon: PlayCircle,
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },

    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  };

  const config =
    statusConfig[normalizedStatus] ||
    statusConfig.upcoming;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${config.className}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

function AdminDashboard() {
  const { user } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadDashboardData = useCallback(() => {
    let storedAccounts = [];

    try {
      const rawAccounts = localStorage.getItem(
        ACCOUNTS_STORAGE_KEY
      );

      if (rawAccounts) {
        const parsedAccounts = JSON.parse(rawAccounts);

        if (Array.isArray(parsedAccounts)) {
          storedAccounts = parsedAccounts;
        }
      }
    } catch (error) {
      console.error(
        "Unable to load EventON accounts:",
        error
      );
    }

    const storedEvents = getStoredEvents();
    const storedBookings = getStoredBookings();

    setAccounts(
      Array.isArray(storedAccounts)
        ? storedAccounts
        : []
    );

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
  }, []);

  /* =======================================================
     INITIAL LOAD + LIVE UPDATES
  ======================================================= */

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener(
      "storage",
      handleUpdate
    );

    window.addEventListener(
      "eventon:auth-updated",
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
        "eventon:auth-updated",
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
  }, [loadDashboardData]);

  /* =======================================================
     ACCOUNT MAP
  ======================================================= */

  const accountMap = useMemo(() => {
    return new Map(
      accounts.map((account) => [
        String(account.id),
        account,
      ])
    );
  }, [accounts]);

  /* =======================================================
     EVENT MAP
  ======================================================= */

  const eventMap = useMemo(() => {
    return new Map(
      events.map((event) => [
        String(event.id),
        event,
      ])
    );
  }, [events]);

  /* =======================================================
     BOOKING HELPERS
  ======================================================= */

  const isCancelledBooking = useCallback(
    (booking) => {
      const status = String(
        booking?.status || "confirmed"
      )
        .trim()
        .toLowerCase();

      return (
        status === "cancelled" ||
        status === "canceled"
      );
    },
    []
  );

  const activeBookings = useMemo(() => {
    return bookings.filter(
      (booking) => !isCancelledBooking(booking)
    );
  }, [bookings, isCancelledBooking]);

  /* =======================================================
     RESOLVE BOOKING USER
  ======================================================= */

  const getBookingUser = useCallback(
    (booking) => {
      const attendee = booking?.attendee || {};

      if (attendee.userId) {
        const account = accountMap.get(
          String(attendee.userId)
        );

        if (account) {
          return {
            name:
              account.name ||
              attendee.name ||
              "Attendee",

            email:
              account.email ||
              attendee.email ||
              "No email",

            id: account.id,
          };
        }
      }

      if (booking?.userId) {
        const account = accountMap.get(
          String(booking.userId)
        );

        if (account) {
          return {
            name:
              account.name ||
              attendee.name ||
              "Attendee",

            email:
              account.email ||
              attendee.email ||
              "No email",

            id: account.id,
          };
        }
      }

      if (attendee.email) {
        const normalizedEmail = String(
          attendee.email
        )
          .trim()
          .toLowerCase();

        const account = accounts.find(
          (item) =>
            String(item.email || "")
              .trim()
              .toLowerCase() === normalizedEmail
        );

        if (account) {
          return {
            name:
              account.name ||
              attendee.name ||
              "Attendee",

            email:
              account.email ||
              attendee.email ||
              "No email",

            id: account.id,
          };
        }
      }

      return {
        name:
          attendee.name ||
          booking?.name ||
          "Attendee",

        email:
          attendee.email ||
          booking?.email ||
          "No email",

        id:
          attendee.userId ||
          booking?.userId ||
          null,
      };
    },
    [accountMap, accounts]
  );

  /* =======================================================
     GET BOOKING EVENT
  ======================================================= */

  const getBookingEvent = useCallback(
    (booking) => {
      if (booking?.eventId) {
        const storedEvent = eventMap.get(
          String(booking.eventId)
        );

        if (storedEvent) {
          return storedEvent;
        }
      }

      return booking?.event || null;
    },
    [eventMap]
  );

  /* =======================================================
     ACTUAL BOOKED TICKETS
  ======================================================= */

  const getActualBookedTickets = useCallback(
    (eventId) => {
      return activeBookings.reduce(
        (total, booking) => {
          if (
            String(booking.eventId) !==
            String(eventId)
          ) {
            return total;
          }

          return (
            total +
            (Number(booking.ticketCount) || 0)
          );
        },
        0
      );
    },
    [activeBookings]
  );

  /* =======================================================
     ATTENDEE STATISTICS
  ======================================================= */

  const userStatistics = useMemo(() => {
    const attendees = accounts.filter(
      (account) =>
        String(account.role)
          .trim()
          .toLowerCase() === "attendee"
    );

    const organizers = accounts.filter(
      (account) =>
        String(account.role)
          .trim()
          .toLowerCase() === "organizer"
    );

    return {
      attendees: attendees.length,
      organizers: organizers.length,
    };
  }, [accounts]);

  /* =======================================================
     EVENT STATISTICS
  ======================================================= */

  const eventStatistics = useMemo(() => {
    const statuses = events.map((event) =>
      getEventLifecycleStatus(
        event,
        getActualBookedTickets(event.id)
      )
    );

    return {
      total: events.length,

      published: statuses.filter(
        (status) => status === "Published"
      ).length,

      ongoing: statuses.filter(
        (status) => status === "Ongoing"
      ).length,

      completed: statuses.filter(
        (status) => status === "Completed"
      ).length,

      soldOut: statuses.filter(
        (status) => status === "Sold out"
      ).length,

      cancelled: statuses.filter(
        (status) => status === "Cancelled"
      ).length,
    };
  }, [events, getActualBookedTickets]);

  /* =======================================================
     BOOKING STATISTICS
  ======================================================= */

  const bookingStatistics = useMemo(() => {
    const ticketsSold =
      activeBookings.reduce(
        (total, booking) =>
          total +
          (Number(booking.ticketCount) || 0),
        0
      );

    const revenue =
      activeBookings.reduce(
        (total, booking) =>
          total +
          (Number(booking.totalPrice) || 0),
        0
      );

    return {
      total: activeBookings.length,
      ticketsSold,
      revenue,
    };
  }, [activeBookings]);

  /* =======================================================
     AVERAGE BOOKING VALUE
  ======================================================= */

  const revenuePerBooking = useMemo(() => {
    if (bookingStatistics.total === 0) {
      return 0;
    }

    return (
      bookingStatistics.revenue /
      bookingStatistics.total
    );
  }, [
    bookingStatistics.revenue,
    bookingStatistics.total,
  ]);

  /* =======================================================
     RECENT BOOKINGS
  ======================================================= */

  const recentBookings = useMemo(() => {
    return [...activeBookings]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ).getTime() -
          new Date(
            a.createdAt || 0
          ).getTime()
      )
      .slice(0, 5);
  }, [activeBookings]);

  /* =======================================================
     RECENT EVENTS
  ======================================================= */

  const recentEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        }

        return (
          new Date(a.date || 0).getTime() -
          new Date(b.date || 0).getTime()
        );
      })
      .slice(0, 5);
  }, [events]);

  /* =======================================================
     TOP 3 EVENT PERFORMANCE
  ======================================================= */

  const eventPerformance = useMemo(() => {
    return [...events]
      .map((event) => {
        const ticketsSold =
          getActualBookedTickets(event.id);

        const revenue = activeBookings
          .filter(
            (booking) =>
              String(booking.eventId) ===
              String(event.id)
          )
          .reduce(
            (total, booking) =>
              total +
              (Number(booking.totalPrice) || 0),
            0
          );

        const capacity =
          Number(event.capacity) || 0;

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
        };
      })
      .sort(
        (a, b) =>
          b.ticketsSold - a.ticketsSold
      )
      .slice(0, 3);
  }, [
    events,
    activeBookings,
    getActualBookedTickets,
  ]);

  /* =======================================================
     FORMATTERS
  ======================================================= */

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50">

      <main className="mx-auto w-full max-w-7xl px-5 pb-10 pt-6 sm:px-8 lg:px-10">

        {/* =================================================
            WELCOME CARD
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-6 p-6 sm:p-7 lg:flex-row lg:items-center">

            {/* WELCOME TEXT */}

            <div>

              <div className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                Admin Dashboard
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back,{" "}
                {user?.name || "Administrator"} 👋
              </h1>

              <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
                Manage your EventON platform,
                monitor events, users, bookings,
                and overall activity.
              </p>

            </div>

            {/* ACTIONS */}

            <div className="flex flex-wrap items-center gap-3">

              <Link
                to="/admin/events"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
              >
                <CalendarDays size={18} />
                Events
              </Link>

              <Link
                to="/admin/bookings"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                <Ticket size={18} />
                Bookings
              </Link>

            </div>

          </div>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* ATTENDEES */}

          <StatCard
            title="Attendees"
            value={userStatistics.attendees}
            subtitle="Active attendees"
            icon={Users}
            iconClass="bg-blue-50 text-blue-600"
          />

          {/* ORGANIZERS */}

          <StatCard
            title="Organizers"
            value={userStatistics.organizers}
            subtitle="Registered organizers"
            icon={UserRoundCog}
            iconClass="bg-violet-50 text-violet-600"
          />

          {/* EVENTS */}

          <StatCard
            title="Total Events"
            value={eventStatistics.total}
            subtitle={`${eventStatistics.published} published • ${eventStatistics.completed} completed`}
            icon={CalendarDays}
            iconClass="bg-orange-50 text-orange-600"
          />

          {/* REVENUE */}

          <StatCard
            title="Total Revenue"
            value={formatCurrency(
              bookingStatistics.revenue
            )}
            subtitle={`${bookingStatistics.total} active bookings`}
            icon={IndianRupee}
            iconClass="bg-emerald-50 text-emerald-600"
            isCurrency
          />

        </section>

        {/* =================================================
            PLATFORM REVENUE + EVENT OVERVIEW
        ================================================= */}

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* PLATFORM REVENUE */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-sm font-semibold text-slate-500">
                  Platform Revenue
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(
                    bookingStatistics.revenue
                  )}
                </h2>

                <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <TrendingUp size={16} />

                  <span>
                    Generated from active EventON
                    bookings
                  </span>
                </div>

              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <IndianRupee size={22} />
              </div>

            </div>

            {/* REVENUE DETAILS */}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

              <RevenueMiniCard
                label="Active Bookings"
                value={bookingStatistics.total}
              />

              <RevenueMiniCard
                label="Tickets Sold"
                value={bookingStatistics.ticketsSold}
              />

              <RevenueMiniCard
                label="Avg. Booking Value"
                value={formatCurrency(
                  revenuePerBooking
                )}
              />

            </div>

            <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">

              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-orange-500">
                  <TrendingUp size={16} />
                </div>

                <div>

                  <p className="text-xs font-bold text-orange-700">
                    Platform Activity
                  </p>

                  <p className="mt-1 text-xs leading-5 text-orange-600">
                    Revenue currently reflects active
                    bookings across all EventON events.
                    Cancelled bookings are excluded from
                    this platform figure.
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* EVENT OVERVIEW */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-semibold text-slate-900">
                  Event Overview
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Current platform status
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <CalendarDays size={19} />
              </div>

            </div>

            <div className="mt-6 space-y-5">

              <ProgressRow
                label="Published"
                value={eventStatistics.published}
                total={eventStatistics.total}
              />

              <ProgressRow
                label="Ongoing"
                value={eventStatistics.ongoing}
                total={eventStatistics.total}
              />

              <ProgressRow
                label="Completed"
                value={eventStatistics.completed}
                total={eventStatistics.total}
              />

              <ProgressRow
                label="Sold Out"
                value={eventStatistics.soldOut}
                total={eventStatistics.total}
              />

            </div>

          </section>

        </section>

        {/* =================================================
            RECENT BOOKINGS + RECENT EVENTS
        ================================================= */}

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* RECENT BOOKINGS */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <SectionHeader
              title="Recent Bookings"
              description="Latest active booking activity"
              count={`${bookingStatistics.total} active`}
              href="/admin/bookings"
            />

            {recentBookings.length === 0 ? (

              <EmptyState
                icon={Ticket}
                title="No bookings yet"
                description="Booking activity will appear here."
              />

            ) : (

              <div className="divide-y divide-slate-100">

                {recentBookings.map((booking) => {

                  const attendee =
                    getBookingUser(booking);

                  const event =
                    getBookingEvent(booking);

                  const bookingId =
                    booking.bookingId ||
                    booking.id;

                  const bookingStatus = event
                    ? getUnifiedStatus(event)
                    : "upcoming";

                  const finalStatus =
                    isCancelledBooking(booking)
                      ? "cancelled"
                      : bookingStatus;

                  return (
                    <Link
                      key={bookingId}
                      to={`/admin/bookings/${bookingId}`}
                      className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                    >

                      {/* ORANGE AVATAR */}

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                        {String(
                          attendee.name || "A"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="truncate text-sm font-semibold text-slate-900">
                            {attendee.name}
                          </p>

                          <BookingStatus
                            status={finalStatus}
                          />

                        </div>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {event?.title ||
                            "Event unavailable"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Booking #{bookingId}
                        </p>

                      </div>

                      <ArrowRight
                        size={15}
                        className="shrink-0 text-slate-300 transition group-hover:text-orange-500"
                      />

                    </Link>
                  );
                })}

              </div>
            )}

          </section>

          {/* RECENT EVENTS */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <SectionHeader
              title="Recent Events"
              description="Latest events on EventON"
              count={`${eventStatistics.total} total`}
              href="/admin/events"
            />

            {recentEvents.length === 0 ? (

              <EmptyState
                icon={CalendarDays}
                title="No events yet"
                description="Created events will appear here."
              />

            ) : (

              <div className="divide-y divide-slate-100">

                {recentEvents.map((event) => {

                  const actualBookedTickets =
                    getActualBookedTickets(
                      event.id
                    );

                  const capacity =
                    Number(event.capacity) || 0;

                  const status =
                    getUnifiedStatus(event);

                  return (
                    <Link
                      key={event.id}
                      to={`/admin/events/${event.id}`}
                      className="group block px-5 py-4 transition hover:bg-slate-50"
                    >

                      <div className="flex items-center gap-4">

                        {/* EVENT IMAGE */}

                        <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                          {event.image ? (

                            <img
                              src={event.image}
                              alt={
                                event.title ||
                                "Event"
                              }
                              className="h-full w-full object-cover"
                            />

                          ) : (

                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <CalendarDays
                                size={21}
                              />
                            </div>

                          )}

                        </div>

                        {/* EVENT DETAILS */}

                        <div className="min-w-0 flex-1">

                          <div className="flex min-w-0 flex-wrap items-center gap-2">

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {event.title ||
                                "Untitled Event"}
                            </p>

                            <BookingStatus
                              status={status}
                            />

                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">

                            <span className="flex items-center gap-1">
                              <Clock3 size={12} />
                              {formatDate(event.date)}
                            </span>

                            {event.city && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {event.city}
                              </span>
                            )}

                          </div>

                          <p className="mt-1.5 text-xs text-slate-400">
                            {actualBookedTickets} /{" "}
                            {capacity} booked
                          </p>

                        </div>

                        <ArrowRight
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

        </section>

        {/* =================================================
            TOP 3 EVENT PERFORMANCE
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">

            <div>

              <h2 className="text-base font-semibold text-slate-900">
                Top 3 Event Performance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Best performing events by tickets sold
              </p>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <TrendingUp size={18} />
            </div>

          </div>

          {eventPerformance.length === 0 ? (

            <EmptyState
              icon={CalendarDays}
              title="No event performance data"
              description="Event booking activity will appear here."
            />

          ) : (

            <div className="divide-y divide-slate-100">

              {eventPerformance.map(
                (event, index) => {

                  const status =
                    getUnifiedStatus(event);

                  return (
                    <Link
                      key={event.id}
                      to={`/admin/events/${event.id}`}
                      className="group block px-5 py-5 transition hover:bg-slate-50"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

                        {/* EVENT INFO */}

                        <div className="flex min-w-0 flex-1 items-center gap-4">

                          {/* RANK */}

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-sm font-bold text-orange-600">
                            #{index + 1}
                          </div>

                          {/* IMAGE */}

                          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                            {event.image ? (

                              <img
                                src={event.image}
                                alt={
                                  event.title ||
                                  "Event"
                                }
                                className="h-full w-full object-cover"
                              />

                            ) : (

                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <CalendarDays
                                  size={22}
                                />
                              </div>

                            )}

                          </div>

                          {/* DETAILS */}

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="truncate text-sm font-semibold text-slate-900">
                                {event.title ||
                                  "Untitled Event"}
                              </p>

                              <BookingStatus
                                status={status}
                              />

                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">

                              <span className="flex items-center gap-1">
                                <Clock3 size={12} />
                                {formatDate(
                                  event.date
                                )}
                              </span>

                              {event.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {event.city}
                                </span>
                              )}

                            </div>

                          </div>

                        </div>

                        {/* TICKETS */}

                        <div className="w-full lg:w-72">

                          <div className="mb-2 flex items-center justify-between">

                            <span className="text-xs text-slate-500">
                              Tickets sold
                            </span>

                            <span className="text-sm font-semibold text-slate-900">
                              {event.ticketsSold} /{" "}
                              {event.capacity}
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

                        </div>

                        {/* REVENUE */}

                        <div className="flex shrink-0 items-center justify-between gap-5 lg:w-40 lg:justify-end">

                          <div>

                            <p className="text-xs text-slate-400">
                              Revenue
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {formatCurrency(
                                event.revenue
                              )}
                            </p>

                          </div>

                          <ArrowRight
                            size={17}
                            className="text-slate-300 transition group-hover:text-orange-500"
                          />

                        </div>

                      </div>

                    </Link>
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
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  description,
  count,
  href,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5">

      <div className="min-w-0">

        <h2 className="text-base font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 truncate text-xs text-slate-500">
          {description}
        </p>

      </div>

      <div className="flex shrink-0 items-center gap-3">

        {count && (
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
            {count}
          </span>
        )}

        <Link
          to={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-orange-600"
        >
          <span className="hidden sm:inline">
            View all
          </span>

          <ArrowRight size={16} />
        </Link>

      </div>

    </div>
  );
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
  isCurrency = false,
}) {
  return (
    <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="truncate text-sm font-medium text-slate-500">
            {title}
          </p>

          <p
            className={`mt-2 font-bold tracking-tight text-slate-900 ${
              isCurrency
                ? "text-2xl"
                : "text-3xl"
            }`}
          >
            {isCurrency
              ? value
              : Number(value || 0).toLocaleString(
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

      <p className="mt-3 truncate text-xs text-slate-500">
        {subtitle}
      </p>

    </div>
  );
}

/* =========================================================
   REVENUE MINI CARD
========================================================= */

function RevenueMiniCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 text-lg font-bold text-slate-900">
        {typeof value === "number"
          ? value.toLocaleString("en-IN")
          : value}
      </p>

    </div>
  );
}

/* =========================================================
   PROGRESS ROW
========================================================= */

function ProgressRow({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.min((value / total) * 100, 100)
      : 0;

  return (
    <div>

      <div className="mb-2 flex items-center justify-between text-xs">

        <span className="font-medium text-slate-600">
          {label}
        </span>

        <span className="font-semibold text-slate-900">
          {value}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Icon size={22} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}

export default AdminDashboard;