import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Edit3,
  IndianRupee,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  EVENTS_UPDATED_EVENT,
  getStoredEventById,
} from "../../utils/eventStorage";

import {
  BOOKINGS_UPDATED_EVENT,
  getStoredBookings,
} from "../../utils/bookingStorage";

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
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

function getTicketCount(booking) {
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

function getStatusClasses(status) {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();

  if (normalized === "published") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "draft") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  if (normalized === "cancelled") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (normalized === "completed") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MAIN
// =========================================================

function OrganizerEventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // =======================================================
  // LOAD DATA
  // =======================================================

  const loadData = useCallback(() => {
    if (!id || !user?.id) {
      setEvent(null);
      setBookings([]);
      setLoading(false);
      return;
    }

    const storedEvent =
      getStoredEventById(id);

    // ---------------------------------------------------
    // Security check:
    // Organizer can only view their own event.
    // ---------------------------------------------------

    if (
      !storedEvent ||
      String(storedEvent.organizerId) !==
        String(user.id)
    ) {
      setEvent(null);
      setBookings([]);
      setLoading(false);
      return;
    }

    setEvent(storedEvent);

    const allBookings =
      getStoredBookings();

    const eventBookings =
      allBookings.filter(
        (booking) =>
          String(
            getBookingEventId(booking)
          ) === String(storedEvent.id)
      );

    setBookings(eventBookings);

    setLoading(false);
  }, [id, user?.id]);

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =======================================================
  // LIVE UPDATES
  // =======================================================

  useEffect(() => {
    const handleUpdate = () => {
      loadData();
    };

    const handleStorage = (storageEvent) => {
      if (
        storageEvent.key ===
          "eventon_events" ||
        storageEvent.key ===
          "eventon_bookings"
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

  // =======================================================
  // CALCULATIONS
  // =======================================================

  const confirmedBookings = useMemo(() => {
    return bookings.filter(
      isConfirmedBooking
    );
  }, [bookings]);

  const statistics = useMemo(() => {
    const ticketsSold =
      confirmedBookings.reduce(
        (total, booking) =>
          total + getTicketCount(booking),
        0
      );

    const revenue =
      confirmedBookings.reduce(
        (total, booking) =>
          total +
          getBookingRevenue(booking),
        0
      );

    const capacity =
      Number(event?.capacity) || 0;

    const availableSeats = Math.max(
      capacity - ticketsSold,
      0
    );

    const occupancy =
      capacity > 0
        ? Math.min(
            (ticketsSold / capacity) * 100,
            100
          )
        : 0;

    return {
      bookings: confirmedBookings.length,
      ticketsSold,
      revenue,
      availableSeats,
      occupancy,
    };
  }, [confirmedBookings, event]);

  // =======================================================
  // NOT LOGGED IN
  // =======================================================

  if (!user) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <Users
            size={42}
            className="mx-auto text-slate-300"
          />

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Organizer login required
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please log in to access this event.
          </p>

          <Link
            to="/login"
            className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <section className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-6 h-72 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </section>
    );
  }

  // =======================================================
  // EVENT NOT FOUND
  // =======================================================

  if (!event) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-5">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <CalendarDays size={25} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Event not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This event does not exist or you do not
            have permission to manage it.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/organizer/events")
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <ArrowLeft size={17} />
            Back to My Events
          </button>
        </div>
      </section>
    );
  }

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <section className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <Link
            to="/organizer/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to My Events
          </Link>
        </div>

        {/* =================================================
            EVENT HERO
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[360px_1fr]">
            {/* Image */}

            <div className="h-64 bg-slate-100 lg:h-full lg:min-h-[300px]">
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                  <CalendarDays size={50} />
                </div>
              )}
            </div>

            {/* Information */}

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                  {event.category ||
                    "General Event"}
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    event.status
                  )}`}
                >
                  {String(
                    event.status || "Unknown"
                  )
                    .charAt(0)
                    .toUpperCase() +
                    String(
                      event.status || "Unknown"
                    ).slice(1)}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {event.title}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                {event.description ||
                  "No event description available."}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CalendarDays
                    size={19}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock3
                    size={19}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {event.time || "Not set"}
                      {event.endTime
                        ? ` – ${event.endTime}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin
                    size={19}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {event.location ||
                        event.city ||
                        "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IndianRupee
                    size={19}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Ticket price
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {Number(event.price) > 0
                        ? formatCurrency(
                            event.price
                          )
                        : "Free"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={`/organizer/events/${event.id}/edit`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  <Edit3 size={17} />
                  Edit Event
                </Link>

                <Link
                  to={`/events/${event.id}`}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View Public Page
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Bookings"
            value={statistics.bookings}
            icon={Ticket}
          />

          <StatCard
            label="Tickets Sold"
            value={`${statistics.ticketsSold} / ${
              Number(event.capacity) || 0
            }`}
            icon={Users}
          />

          <StatCard
            label="Available Seats"
            value={statistics.availableSeats}
            icon={CalendarDays}
          />

          <StatCard
            label="Revenue"
            value={formatCurrency(
              statistics.revenue
            )}
            icon={IndianRupee}
          />
        </div>

        {/* =================================================
            CAPACITY
        ================================================= */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-900">
                Ticket Sales
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {statistics.ticketsSold} tickets sold
                out of{" "}
                {Number(event.capacity) || 0}
              </p>
            </div>

            <span className="text-lg font-bold text-orange-500">
              {Math.round(
                statistics.occupancy
              )}
              %
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{
                width: `${statistics.occupancy}%`,
              }}
            />
          </div>
        </div>

        {/* =================================================
            ATTENDEES
        ================================================= */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="font-bold text-slate-900">
                Attendees
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Confirmed bookings for this event
              </p>
            </div>

            <Link
              to={`/organizer/bookings?event=${event.id}`}
              className="text-sm font-semibold text-orange-500 hover:text-orange-600"
            >
              View all bookings
            </Link>
          </div>

          {confirmedBookings.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Users size={22} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-800">
                No confirmed bookings yet
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Attendees will appear here when they
                book this event.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {confirmedBookings.map(
                (booking) => {
                  const attendee =
                    booking.attendee ||
                    booking.user ||
                    {};

                  return (
                    <div
                      key={
                        booking.bookingId ||
                        booking.id
                      }
                      className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                          {String(
                            attendee.name ||
                              "A"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {attendee.name ||
                              "Attendee"}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {attendee.email ||
                              "Email unavailable"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <p className="text-xs text-slate-400">
                            Tickets
                          </p>

                          <p className="mt-1 font-semibold text-slate-800">
                            {getTicketCount(
                              booking
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Amount
                          </p>

                          <p className="mt-1 font-semibold text-slate-800">
                            {formatCurrency(
                              getBookingRevenue(
                                booking
                              )
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default OrganizerEventDetails;