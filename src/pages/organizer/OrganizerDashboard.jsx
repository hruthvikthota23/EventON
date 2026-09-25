import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  IndianRupee,
  MapPin,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  EVENTS_UPDATED_EVENT,
  getStoredEventsByOrganizer,
} from "../../utils/eventStorage";

import {
  BOOKINGS_UPDATED_EVENT,
  getStoredBookings,
} from "../../utils/bookingStorage";

const USER_STORAGE_KEY = "eventon_user";

// =========================================================
// HELPERS
// =========================================================

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

function getEventDate(event) {
  if (!event?.date) {
    return null;
  }

  const date = new Date(event.date);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isUpcomingEvent(event) {
  const eventDate = getEventDate(event);

  if (!eventDate) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  return eventDate >= today;
}

function getBookingEventId(booking) {
  return (
    booking?.eventId ||
    booking?.event?.id ||
    booking?.event?.eventId ||
    null
  );
}

function isConfirmedBooking(booking) {
  const status = String(booking?.status || "")
    .trim()
    .toLowerCase();

  return (
    status === "confirmed" ||
    status === "completed" ||
    status === "paid"
  );
}

function getBookingTicketCount(booking) {
  return Number(
    booking?.ticketCount ??
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

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <Icon size={21} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

// =========================================================
// STATUS BADGE
// =========================================================

function EventStatus({ status }) {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase();

  const statusStyles = {
    published:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft:
      "bg-slate-100 text-slate-700 border-slate-200",
    cancelled:
      "bg-red-50 text-red-700 border-red-200",
    completed:
      "bg-blue-50 text-blue-700 border-blue-200",
  };

  const label =
    normalizedStatus.charAt(0).toUpperCase() +
    normalizedStatus.slice(1);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        statusStyles[normalizedStatus] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {label || "Unknown"}
    </span>
  );
}

// =========================================================
// DASHBOARD
// =========================================================

function OrganizerDashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);

  // =======================================================
  // LOAD USER
  // =======================================================

  const loadUser = useCallback(() => {
    try {
      const storedUser =
        localStorage.getItem(USER_STORAGE_KEY);

      if (!storedUser) {
        setUser(null);
        return null;
      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

      return parsedUser;
    } catch (error) {
      console.error(
        "Unable to load organizer user:",
        error
      );

      setUser(null);

      return null;
    }
  }, []);

  // =======================================================
  // LOAD DASHBOARD DATA
  // =======================================================

  const loadDashboardData = useCallback(() => {
    try {
      const storedUser =
        localStorage.getItem(USER_STORAGE_KEY);

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

      // -----------------------------------------------
      // Organizer's events only
      // -----------------------------------------------

      const organizerEvents =
        getStoredEventsByOrganizer(
          currentUser.id
        );

      setEvents(organizerEvents);

      // -----------------------------------------------
      // All bookings
      // -----------------------------------------------

      const allBookings =
        getStoredBookings();

      // -----------------------------------------------
      // Bookings belonging to organizer's events
      // -----------------------------------------------

      const organizerEventIds =
        new Set(
          organizerEvents.map((event) =>
            String(event.id)
          )
        );

      const organizerBookings =
        allBookings.filter((booking) =>
          organizerEventIds.has(
            String(getBookingEventId(booking))
          )
        );

      setBookings(organizerBookings);
    } catch (error) {
      console.error(
        "Unable to load organizer dashboard:",
        error
      );

      setEvents([]);
      setBookings([]);
    }
  }, []);

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadUser();
    loadDashboardData();
  }, [loadUser, loadDashboardData]);

  // =======================================================
  // LISTEN FOR LOCALSTORAGE EVENTS
  // =======================================================

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

  // =======================================================
  // CALCULATED STATISTICS
  // =======================================================

  const statistics = useMemo(() => {
    const publishedEvents = events.filter(
      (event) =>
        String(event?.status || "")
          .trim()
          .toLowerCase() === "published"
    );

    const upcomingEvents = events.filter(
      isUpcomingEvent
    );

    const confirmedBookings =
      bookings.filter(isConfirmedBooking);

    const ticketsSold =
      confirmedBookings.reduce(
        (total, booking) =>
          total +
          getBookingTicketCount(booking),
        0
      );

    const revenue =
      confirmedBookings.reduce(
        (total, booking) =>
          total +
          getBookingRevenue(booking),
        0
      );

    return {
      totalEvents: events.length,
      publishedEvents: publishedEvents.length,
      upcomingEvents: upcomingEvents.length,
      totalBookings: confirmedBookings.length,
      ticketsSold,
      revenue,
    };
  }, [events, bookings]);

  // =======================================================
  // UPCOMING EVENTS
  // =======================================================

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter(isUpcomingEvent)
      .sort((a, b) => {
        const dateA = getEventDate(a)?.getTime() || 0;
        const dateB = getEventDate(b)?.getTime() || 0;

        return dateA - dateB;
      })
      .slice(0, 5);
  }, [events]);

  // =======================================================
  // RECENT BOOKINGS
  // =======================================================

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const dateA = new Date(
          a?.createdAt ||
            a?.bookingDate ||
            0
        ).getTime();

        const dateB = new Date(
          b?.createdAt ||
            b?.bookingDate ||
            0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [bookings]);

  // =======================================================
  // EVENT PERFORMANCE
  // =======================================================

  const eventPerformance = useMemo(() => {
    return events
      .map((event) => {
        const eventBookings =
          bookings.filter(
            (booking) =>
              String(
                getBookingEventId(booking)
              ) === String(event.id) &&
              isConfirmedBooking(booking)
          );

        const ticketsSold =
          eventBookings.reduce(
            (total, booking) =>
              total +
              getBookingTicketCount(
                booking
              ),
            0
          );

        const revenue =
          eventBookings.reduce(
            (total, booking) =>
              total +
              getBookingRevenue(
                booking
              ),
            0
          );

        const capacity =
          Number(event.capacity) || 0;

        const percentage =
          capacity > 0
            ? Math.min(
                (ticketsSold / capacity) *
                  100,
                100
              )
            : 0;

        return {
          ...event,
          ticketsSold,
          revenue,
          percentage,
        };
      })
      .sort(
        (a, b) =>
          b.ticketsSold - a.ticketsSold
      )
      .slice(0, 5);
  }, [events, bookings]);

  // =======================================================
  // NO ORGANIZER USER
  // =======================================================

  if (!user) {
    return (
      <section className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-5 py-10">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500">
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

  // =======================================================
  // DASHBOARD UI
  // =======================================================

  return (
    <section className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-orange-500">
              Organizer Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back,{" "}
              {user.name || "Organizer"} 👋
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your events and keep track of
              bookings, tickets, and revenue from one
              place.
            </p>
          </div>

          <Link
            to="/organizer/events/create"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            <CalendarDays size={18} />
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
            subtitle={`${statistics.upcomingEvents} upcoming`}
            icon={CalendarDays}
          />

          <StatCard
            title="Published Events"
            value={statistics.publishedEvents}
            subtitle="Currently published"
            icon={CheckCircle2}
          />

          <StatCard
            title="Total Bookings"
            value={statistics.totalBookings}
            subtitle={`${statistics.ticketsSold} tickets sold`}
            icon={Ticket}
          />

          <StatCard
            title="Revenue"
            value={formatCurrency(
              statistics.revenue
            )}
            subtitle="From confirmed bookings"
            icon={IndianRupee}
          />
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* =================================================
              UPCOMING EVENTS
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-bold text-slate-900">
                  Upcoming Events
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your next scheduled events
                </p>
              </div>

              <Link
                to="/organizer/events"
                className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                View all
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {upcomingEvents.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <CalendarDays
                    className="mx-auto text-slate-300"
                    size={36}
                  />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No upcoming events
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Create an event to see it here.
                  </p>
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const availableSeats =
                    Math.max(
                      Number(event.capacity || 0) -
                        Number(
                          event.bookedSeats || 0
                        ),
                      0
                    );

                  return (
                    <div
                      key={event.id}
                      className="flex gap-4 px-5 py-4 sm:px-6"
                    >
                      <div className="hidden h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:block">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <CalendarDays
                              size={22}
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="line-clamp-1 font-semibold text-slate-900">
                              {event.title}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(
                                event.date
                              )}
                              {event.time
                                ? ` • ${event.time}`
                                : ""}
                            </p>
                          </div>

                          <EventStatus
                            status={
                              event.status
                            }
                          />
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin
                              size={13}
                            />
                            {event.city ||
                              event.location ||
                              "Location unavailable"}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Users
                              size={13}
                            />
                            {availableSeats} seats
                            left
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/organizer/events/${event.id}`}
                        className="hidden items-center self-center text-slate-400 transition hover:text-orange-500 sm:flex"
                        aria-label={`View ${event.title}`}
                      >
                        <ChevronRight
                          size={20}
                        />
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* =================================================
              RECENT BOOKINGS
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  Recent Bookings
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest confirmed bookings
                </p>
              </div>

              <Link
                to="/organizer/bookings"
                className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                View all
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentBookings.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Ticket
                    className="mx-auto text-slate-300"
                    size={36}
                  />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No bookings yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Bookings for your events will
                    appear here.
                  </p>
                </div>
              ) : (
                recentBookings.map((booking) => {
                  const event =
                    events.find(
                      (item) =>
                        String(item.id) ===
                        String(
                          getBookingEventId(
                            booking
                          )
                        )
                    );

                  return (
                    <div
                      key={
                        booking.bookingId ||
                        booking.id
                      }
                      className="px-5 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {booking.attendee
                              ?.name ||
                              booking.user?.name ||
                              "Attendee"}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {event?.title ||
                              "Event"}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-bold text-slate-900">
                          {formatCurrency(
                            getBookingRevenue(
                              booking
                            )
                          )}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
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
                              booking.bookingDate
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            EVENT PERFORMANCE
        ================================================= */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-900">
                Event Performance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Booking performance across your events
              </p>
            </div>

            <TrendingUp
              size={20}
              className="text-orange-500"
            />
          </div>

          {eventPerformance.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <TrendingUp
                className="mx-auto text-slate-300"
                size={36}
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No event performance data
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Create events and receive bookings to
                see performance.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {eventPerformance.map((event) => (
                <div
                  key={event.id}
                  className="px-5 py-5 sm:px-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-slate-900">
                          {event.title}
                        </h3>

                        <EventStatus
                          status={
                            event.status
                          }
                        />
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-orange-500 transition-all"
                          style={{
                            width: `${event.percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 text-sm md:w-72">
                      <div>
                        <p className="text-xs text-slate-400">
                          Tickets sold
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {event.ticketsSold}
                          {event.capacity
                            ? ` / ${event.capacity}`
                            : ""}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Revenue
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {formatCurrency(
                            event.revenue
                          )}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/organizer/events/${event.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600"
                    >
                      Details
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/organizer/events/create"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
          >
            <CalendarDays
              className="text-orange-500"
              size={22}
            />

            <h3 className="mt-4 font-bold text-slate-900">
              Create an Event
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Publish a new event for attendees.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-500">
              Create now
              <ChevronRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </span>
          </Link>

          <Link
            to="/organizer/events"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
          >
            <Ticket
              className="text-orange-500"
              size={22}
            />

            <h3 className="mt-4 font-bold text-slate-900">
              Manage Events
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Edit, publish, or manage your events.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-500">
              Manage events
              <ChevronRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </span>
          </Link>

          <Link
            to="/organizer/bookings"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
          >
            <Users
              className="text-orange-500"
              size={22}
            />

            <h3 className="mt-4 font-bold text-slate-900">
              View Bookings
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              See attendees and booking activity.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-500">
              View bookings
              <ChevronRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OrganizerDashboard;