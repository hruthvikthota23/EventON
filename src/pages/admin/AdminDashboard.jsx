import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  IndianRupee,
  MapPin,
  Ticket,
  TrendingUp,
  UserRoundCog,
  Users,
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
    if (Number.isNaN(parsed.getTime())) return null;

    year = parsed.getFullYear();
    month = parsed.getMonth() + 1;
    day = parsed.getDate();
  }

  const match = timeText.match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);

  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

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

function getEventLifecycleStatus(event, bookedTickets = 0) {
  const storedStatus = String(event?.status || "published")
    .trim()
    .toLowerCase();

  if (storedStatus === "draft") return "Draft";

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

function AdminDashboard() {
  const { user } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  const loadDashboardData = useCallback(() => {
    let storedAccounts = [];

    try {
      const rawAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);

      if (rawAccounts) {
        const parsedAccounts = JSON.parse(rawAccounts);

        if (Array.isArray(parsedAccounts)) {
          storedAccounts = parsedAccounts;
        }
      }
    } catch (error) {
      console.error("Unable to load EventON accounts:", error);
    }

    const storedEvents = getStoredEvents();
    const storedBookings = getStoredBookings();

    setAccounts(Array.isArray(storedAccounts) ? storedAccounts : []);
    setEvents(Array.isArray(storedEvents) ? storedEvents : []);
    setBookings(Array.isArray(storedBookings) ? storedBookings : []);
  }, []);

  // =========================================================
  // INITIAL LOAD + LIVE UPDATES
  // =========================================================

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("eventon:auth-updated", handleUpdate);
    window.addEventListener(EVENTS_UPDATED_EVENT, handleUpdate);
    window.addEventListener(BOOKINGS_UPDATED_EVENT, handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("eventon:auth-updated", handleUpdate);
      window.removeEventListener(EVENTS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener(BOOKINGS_UPDATED_EVENT, handleUpdate);
    };
  }, [loadDashboardData]);

  // =========================================================
  // ACCOUNT MAP
  // =========================================================

  const accountMap = useMemo(() => {
    return new Map(
      accounts.map((account) => [String(account.id), account])
    );
  }, [accounts]);

  // =========================================================
  // EVENT MAP
  // =========================================================

  const eventMap = useMemo(() => {
    return new Map(
      events.map((event) => [String(event.id), event])
    );
  }, [events]);

  // =========================================================
  // BOOKING STATUS HELPERS
  // =========================================================

  const isCancelledBooking = useCallback((booking) => {
    const status = String(booking?.status || "confirmed")
      .trim()
      .toLowerCase();

    return status === "cancelled" || status === "canceled";
  }, []);

  const isActiveBooking = useCallback(
    (booking) => !isCancelledBooking(booking),
    [isCancelledBooking]
  );

  // =========================================================
  // ACTIVE BOOKINGS
  // =========================================================

  const activeBookings = useMemo(() => {
    return bookings.filter((booking) => isActiveBooking(booking));
  }, [bookings, isActiveBooking]);

  // =========================================================
  // RESOLVE BOOKING USER
  // =========================================================

  const getBookingUser = useCallback(
    (booking) => {
      const attendee = booking?.attendee || {};

      if (attendee.userId) {
        const account = accountMap.get(String(attendee.userId));

        if (account) {
          return {
            name: account.name || attendee.name || "Attendee",
            email: account.email || attendee.email || "No email",
            phone:
              attendee.phone || account.phone || "No phone",
            id: account.id,
          };
        }
      }

      if (booking?.userId) {
        const account = accountMap.get(String(booking.userId));

        if (account) {
          return {
            name: account.name || attendee.name || "Attendee",
            email: account.email || attendee.email || "No email",
            phone:
              attendee.phone || account.phone || "No phone",
            id: account.id,
          };
        }
      }

      if (attendee.email) {
        const normalizedEmail = String(attendee.email)
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
            name: account.name || attendee.name || "Attendee",
            email: account.email || attendee.email,
            phone:
              attendee.phone || account.phone || "No phone",
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
        phone:
          attendee.phone ||
          booking?.phone ||
          "No phone",
        id:
          attendee.userId ||
          booking?.userId ||
          null,
      };
    },
    [accountMap, accounts]
  );

  // =========================================================
  // GET BOOKING EVENT
  // =========================================================

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

  // =========================================================
  // ACTUAL BOOKED TICKETS
  // =========================================================

  const getActualBookedTickets = useCallback(
    (eventId) => {
      return activeBookings.reduce((total, booking) => {
        if (
          String(booking.eventId) !== String(eventId)
        ) {
          return total;
        }

        return (
          total +
          (Number(booking.ticketCount) || 0)
        );
      }, 0);
    },
    [activeBookings]
  );

  // =========================================================
  // USER STATISTICS
  // =========================================================

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

    const admins = accounts.filter(
      (account) =>
        String(account.role)
          .trim()
          .toLowerCase() === "admin"
    );

    return {
      total: accounts.length,
      attendees: attendees.length,
      organizers: organizers.length,
      admins: admins.length,
    };
  }, [accounts]);

  // =========================================================
  // EVENT STATISTICS
  // =========================================================

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
    };
  }, [events, getActualBookedTickets]);

  // =========================================================
  // BOOKING STATISTICS
  // =========================================================

  const bookingStatistics = useMemo(() => {
    const ticketsSold = activeBookings.reduce(
      (total, booking) =>
        total + (Number(booking.ticketCount) || 0),
      0
    );

    const revenue = activeBookings.reduce(
      (total, booking) =>
        total + (Number(booking.totalPrice) || 0),
      0
    );

    return {
      total: activeBookings.length,
      ticketsSold,
      revenue,
    };
  }, [activeBookings]);

  // =========================================================
  // RECENT BOOKINGS
  // =========================================================

  const recentBookings = useMemo(() => {
    return [...activeBookings]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 5);
  }, [activeBookings]);

  // =========================================================
  // RECENT EVENTS
  // =========================================================

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

  // =========================================================
  // EVENT PERFORMANCE
  // =========================================================

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
        };
      })
      .sort((a, b) => b.ticketsSold - a.ticketsSold)
      .slice(0, 3);
  }, [
    events,
    activeBookings,
    getActualBookedTickets,
  ]);

  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

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

  const getEventStatus = (event) =>
    getEventLifecycleStatus(
      event,
      getActualBookedTickets(event?.id)
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-full bg-slate-50">
      {/* =====================================================
          WELCOME
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-orange-500">
              Admin Dashboard
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back,{" "}
              {user?.name || "Administrator"} 👋
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Manage users, events, bookings, and
              platform activity from one place.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto w-full max-w-7xl px-5 pb-10 pt-6 sm:px-6 lg:px-8">
        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={userStatistics.total}
            subtitle={`${userStatistics.attendees} attendees`}
            icon={Users}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Organizers"
            value={userStatistics.organizers}
            subtitle="Registered organizers"
            icon={UserRoundCog}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Total Events"
            value={eventStatistics.total}
            subtitle={`${eventStatistics.published} published • ${eventStatistics.completed} completed`}
            icon={CalendarDays}
            iconClass="bg-orange-50 text-orange-600"
          />

          <StatCard
            title="Total Bookings"
            value={bookingStatistics.total}
            subtitle={`${bookingStatistics.ticketsSold} tickets sold`}
            icon={Ticket}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </section>

        {/* ===================================================
            REVENUE + EVENT OVERVIEW
        =================================================== */}

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Revenue
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(
                    bookingStatistics.revenue
                  )}
                </h2>

                <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <TrendingUp size={16} />
                  <span>From active bookings</span>
                </div>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <IndianRupee size={21} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniStat
                label="Active Bookings"
                value={bookingStatistics.total}
              />

              <MiniStat
                label="Total Events"
                value={eventStatistics.total}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Event Overview
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Current platform status
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                <CalendarDays size={18} />
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

        {/* ===================================================
            RECENT BOOKINGS + RECENT EVENTS
        =================================================== */}

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* =================================================
              RECENT BOOKINGS
          ================================================= */}

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

                  return (
                    <Link
                      key={bookingId}
                      to={`/admin/bookings/${bookingId}`}
                      className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                        {String(
                          attendee.name || "A"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {attendee.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {event?.title ||
                            "Event unavailable"}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span>
                            {booking.ticketCount || 0}{" "}
                            {Number(
                              booking.ticketCount
                            ) === 1
                              ? "ticket"
                              : "tickets"}
                          </span>

                          <span>
                            {formatDate(
                              booking.createdAt
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(
                            booking.totalPrice
                          )}
                        </p>

                        <ArrowRight
                          size={15}
                          className="ml-auto mt-2 text-slate-300 transition group-hover:text-orange-500"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* =================================================
              RECENT EVENTS
          ================================================= */}

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
                    getEventStatus(event);

                  return (
                    <Link
                      key={event.id}
                      to={`/admin/events/${event.id}`}
                      className="group block px-5 py-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-4">
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

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {event.title ||
                                "Untitled Event"}
                            </p>

                            <span
                              className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex ${
                                status === "Sold out"
                                  ? "bg-red-50 text-red-600"
                                  : status === "Completed"
                                  ? "bg-blue-50 text-blue-600"
                                  : status === "Ongoing"
                                  ? "bg-amber-50 text-amber-600"
                                  : status === "Published"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : status === "Cancelled"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {status}
                            </span>
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

        {/* ===================================================
            EVENT PERFORMANCE
        =================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Event Performance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Booking performance across your events
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
              {eventPerformance.map((event) => {
                const status =
                  getEventStatus(event);

                return (
                  <Link
                    key={event.id}
                    to={`/admin/events/${event.id}`}
                    className="group block px-5 py-5 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                      {/* EVENT INFO */}

                      <div className="flex min-w-0 flex-1 items-center gap-4">
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

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {event.title ||
                                "Untitled Event"}
                            </p>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                status === "Sold out"
                                  ? "bg-red-50 text-red-600"
                                  : status === "Completed"
                                  ? "bg-blue-50 text-blue-600"
                                  : status === "Ongoing"
                                  ? "bg-amber-50 text-amber-600"
                                  : status === "Published"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : status === "Cancelled"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {status}
                            </span>
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
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ===========================================================
// SECTION HEADER
// ===========================================================

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

// ===========================================================
// STAT CARD
// ===========================================================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {Number(value || 0).toLocaleString(
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

// ===========================================================
// MINI STAT
// ===========================================================

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {Number(value || 0).toLocaleString(
          "en-IN"
        )}
      </p>
    </div>
  );
}

// ===========================================================
// PROGRESS ROW
// ===========================================================

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

// ===========================================================
// EMPTY STATE
// ===========================================================

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