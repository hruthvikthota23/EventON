import { useEffect, useMemo, useState } from "react";

import { Link, useNavigate, useParams, useLocation } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  Ticket,
  Users,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getStoredEvents,
  updateStoredEvent,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

import {
  getStoredBookings,
  BOOKINGS_UPDATED_EVENT,
} from "../../utils/bookingStorage";

/* =========================================================
   EVENT LIFECYCLE HELPERS
========================================================= */

const parseEventDateTime = (dateValue, timeValue = "00:00") => {
  if (!dateValue) {
    return null;
  }

  const rawDate = String(dateValue).trim();

  let year;
  let month;
  let day;

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    [year, month, day] = rawDate.split("-").map(Number);
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(rawDate)) {
    [day, month, year] = rawDate.split("-").map(Number);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
    [day, month, year] = rawDate.split("/").map(Number);
  } else {
    const parsed = new Date(rawDate);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    const [hours = 0, minutes = 0] = String(timeValue || "00:00")
      .split(":")
      .map(Number);

    parsed.setHours(
      Number.isFinite(hours) ? hours : 0,
      Number.isFinite(minutes) ? minutes : 0,
      0,
      0
    );

    return parsed;
  }

  const [hours = 0, minutes = 0] = String(timeValue || "00:00")
    .split(":")
    .map(Number);

  const result = new Date(
    year,
    month - 1,
    day,
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0
  );

  return Number.isNaN(result.getTime()) ? null : result;
};

const getEventLifecycleStatus = (event, now = new Date()) => {
  if (!event) {
    return "published";
  }

  const storedStatus = String(event.status || "published")
    .trim()
    .toLowerCase();

  /*
   * These states must always remain explicit.
   */
  if (
    storedStatus === "draft" ||
    storedStatus === "cancelled" ||
    storedStatus === "canceled"
  ) {
    return storedStatus;
  }

  const start = parseEventDateTime(
    event.date,
    event.time || "00:00"
  );

  if (!start) {
    return storedStatus;
  }

  const end = event.endTime
    ? parseEventDateTime(event.date, event.endTime)
    : null;

  /*
   * If event has an end time:
   *
   * now >= end       => Completed
   * start <= now < end => Ongoing
   */
  if (end && end.getTime() > start.getTime()) {
    if (now.getTime() >= end.getTime()) {
      return "completed";
    }

    if (now.getTime() >= start.getTime()) {
      return "ongoing";
    }
  } else if (now.getTime() >= start.getTime()) {
    return "completed";
  }

  /*
   * Sold-out remains sold-out until the event
   * actually starts.
   */
  if (storedStatus === "sold-out") {
    return "sold-out";
  }

  return storedStatus === "published"
    ? "published"
    : storedStatus;
};

/* =========================================================
   BOOKING HELPERS
========================================================= */

const getBookingQuantity = (booking) => {
  const quantity = Number(
    booking?.quantity ??
      booking?.seats ??
      booking?.tickets ??
      booking?.ticketCount ??
      booking?.numberOfTickets ??
      1
  );

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 1;
  }

  return quantity;
};

const getBookingStatus = (booking) => {
  const status = String(booking?.status || "confirmed")
    .trim()
    .toLowerCase();

  if (
    status === "cancelled" ||
    status === "canceled"
  ) {
    return "cancelled";
  }

  if (status === "pending") {
    return "pending";
  }

  if (
    status === "completed" ||
    status === "attended"
  ) {
    return "completed";
  }

  return "confirmed";
};

const isActiveBooking = (booking) => {
  return getBookingStatus(booking) !== "cancelled";
};

const getBookingTimestamp = (booking) => {
  const rawDate =
    booking?.createdAt ??
    booking?.bookingDate ??
    booking?.createdOn ??
    booking?.timestamp ??
    booking?.date ??
    null;

  if (!rawDate) {
    return 0;
  }

  const timestamp = new Date(rawDate).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
};

const getBookingAmount = (
  booking,
  ticketPrice
) => {
  const storedAmount = Number(
    booking?.totalAmount ??
      booking?.totalPrice ??
      booking?.amount ??
      booking?.price ??
      0
  );

  if (
    Number.isFinite(storedAmount) &&
    storedAmount > 0
  ) {
    return storedAmount;
  }

  return (
    Number(ticketPrice || 0) *
    getBookingQuantity(booking)
  );
};

/* =========================================================
   ORGANIZER
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
            String(account?.role || "").toLowerCase() ===
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

  return event?.organizer || "EventON Organizer";
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

function ManagementEventDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  const { user } = useAuth();

  const isAdmin =
    String(user?.role || "").toLowerCase() === "admin" ||
    location.pathname.startsWith("/admin/");

  const isOrganizer =
    String(user?.role || "").toLowerCase() === "organizer" ||
    location.pathname.startsWith("/organizer/");

  const backPath = isAdmin
    ? "/admin/events"
    : "/organizer/events";

  const [event, setEvent] = useState(null);

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [lifecycleNow, setLifecycleNow] =
    useState(() => new Date());

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [cancelLoading, setCancelLoading] =
    useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = () => {
    try {
      const storedEvents = getStoredEvents();

      const storedBookings = getStoredBookings();

      const foundEvent = storedEvents.find(
        (item) =>
          String(item.id) === String(id)
      );

      /*
       * Organizer security:
       * organizer can only access their own events.
       */
      if (
        foundEvent &&
        isOrganizer &&
        !isAdmin &&
        String(foundEvent.organizerId) !==
          String(user?.id)
      ) {
        setEvent(null);
        setBookings([]);
        setLoading(false);
        return;
      }

      setEvent(foundEvent || null);

      if (foundEvent) {
        const eventBookings =
          storedBookings.filter(
            (booking) =>
              String(
                booking?.eventId
              ) ===
              String(foundEvent.id)
          );

        setBookings(eventBookings);
      } else {
        setBookings([]);
      }

      setLoading(false);
    } catch (error) {
      console.error(
        "Unable to load event details:",
        error
      );

      setEvent(null);
      setBookings([]);
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadData();
  }, [id, user?.id, isAdmin, isOrganizer]);

  /* =======================================================
     LIVE UPDATES
  ======================================================= */

  useEffect(() => {
    const handleUpdate = () => {
      loadData();
    };

    const handleStorage = (storageEvent) => {
      if (
        storageEvent.key === "eventon_events" ||
        storageEvent.key === "eventon_bookings"
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
  }, [id, user?.id, isAdmin, isOrganizer]);

  /* =======================================================
     LIFECYCLE CLOCK
  ======================================================= */

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLifecycleNow(new Date());
    }, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  /* =======================================================
     ACTIVE BOOKINGS
  ======================================================= */

  const activeBookings = useMemo(() => {
    return bookings.filter(isActiveBooking);
  }, [bookings]);

  /* =======================================================
     ACTUAL TICKETS SOLD
  ======================================================= */

  const actualTicketsSold = useMemo(() => {
    return activeBookings.reduce(
      (total, booking) =>
        total + getBookingQuantity(booking),
      0
    );
  }, [activeBookings]);

  /* =======================================================
     EVENT STATUS
  ======================================================= */

  const eventStatus = useMemo(() => {
    if (!event) {
      return "published";
    }

    const lifecycleStatus =
      getEventLifecycleStatus(
        event,
        lifecycleNow
      );

    /*
     * These always take priority.
     */
    if (
      lifecycleStatus === "completed" ||
      lifecycleStatus === "ongoing" ||
      lifecycleStatus === "cancelled" ||
      lifecycleStatus === "canceled" ||
      lifecycleStatus === "draft"
    ) {
      return lifecycleStatus;
    }

    const capacity =
      Number(event.capacity) || 0;

    /*
     * Sold-out is calculated from real active
     * bookings.
     */
    if (
      lifecycleStatus === "published" &&
      capacity > 0 &&
      actualTicketsSold >= capacity
    ) {
      return "sold-out";
    }

    return lifecycleStatus;
  }, [
    event,
    actualTicketsSold,
    lifecycleNow,
  ]);

  /* =======================================================
     STATUS LABEL
  ======================================================= */

  const statusLabel = useMemo(() => {
    if (eventStatus === "completed") {
      return "Completed";
    }

    if (eventStatus === "ongoing") {
      return "Ongoing";
    }

    if (eventStatus === "sold-out") {
      return "Sold Out";
    }

    if (eventStatus === "draft") {
      return "Draft";
    }

    if (
      eventStatus === "cancelled" ||
      eventStatus === "canceled"
    ) {
      return "Cancelled";
    }

    return "Upcoming";
  }, [eventStatus]);

  /* =======================================================
     STATUS ICON
  ======================================================= */

  const StatusIcon =
    eventStatus === "sold-out" ||
    eventStatus === "cancelled" ||
    eventStatus === "canceled"
      ? XCircle
      : eventStatus === "draft"
      ? Clock3
      : eventStatus === "ongoing"
      ? Clock3
      : eventStatus === "completed"
      ? CheckCircle2
      : CheckCircle2;

  /* =======================================================
     STATUS STYLE
  ======================================================= */

  const statusStyle =
    eventStatus === "completed"
      ? "bg-blue-50 text-blue-600"
      : eventStatus === "ongoing"
      ? "bg-cyan-50 text-cyan-600"
      : eventStatus === "sold-out"
      ? "bg-red-50 text-red-600"
      : eventStatus === "draft"
      ? "bg-amber-50 text-amber-600"
      : eventStatus === "cancelled" ||
        eventStatus === "canceled"
      ? "bg-slate-100 text-slate-600"
      : "bg-emerald-50 text-emerald-600";

  /* =======================================================
     EVENT METRICS
  ======================================================= */

  const metrics = useMemo(() => {
    if (!event) {
      return {
        capacity: 0,
        booked: 0,
        available: 0,
        percentage: 0,
        revenue: 0,
      };
    }

    const capacity =
      Number(event.capacity) || 0;

    const booked = actualTicketsSold;

    const available = Math.max(
      capacity - booked,
      0
    );

    const percentage =
      capacity > 0
        ? Math.min(
            (booked / capacity) * 100,
            100
          )
        : 0;

    const revenue =
      activeBookings.reduce(
        (total, booking) =>
          total +
          getBookingAmount(
            booking,
            event.price
          ),
        0
      );

    return {
      capacity,
      booked,
      available,
      percentage,
      revenue,
    };
  }, [
    event,
    activeBookings,
    actualTicketsSold,
  ]);

  /* =======================================================
     RECENT BOOKINGS
  ======================================================= */

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) =>
          getBookingTimestamp(b) -
          getBookingTimestamp(a)
      )
      .slice(0, 5);
  }, [bookings]);

  /* =======================================================
     CANCEL EVENT
  ======================================================= */

  const canCancelEvent =
    eventStatus === "published";

  const handleCancelEvent = () => {
    /*
     * Safety check:
     * cancellation is allowed ONLY for upcoming
     * events.
     */
    if (!canCancelEvent) {
      return;
    }

    setShowCancelModal(true);
  };

  const confirmCancelEvent = () => {
    if (!event || !canCancelEvent) {
      return;
    }

    setCancelLoading(true);

    try {
      /*
       * Get the latest event again.
       *
       * This prevents cancelling an event that
       * changed while this page was open.
       */
      const latestEvents = getStoredEvents();

      const latestEvent = latestEvents.find(
        (item) =>
          String(item.id) === String(event.id)
      );

      if (!latestEvent) {
        setShowCancelModal(false);
        setCancelLoading(false);
        return;
      }

      /*
       * Recalculate status using the latest data.
       */
      const latestLifecycleStatus =
        getEventLifecycleStatus(
          latestEvent,
          new Date()
        );

      const latestCapacity =
        Number(latestEvent.capacity) || 0;

      const latestBookings =
        getStoredBookings().filter(
          (booking) =>
            String(
              booking?.eventId
            ) === String(latestEvent.id)
        );

      const latestActiveTickets =
        latestBookings
          .filter(isActiveBooking)
          .reduce(
            (total, booking) =>
              total +
              getBookingQuantity(booking),
            0
          );

      const latestStatus =
        latestLifecycleStatus === "published" &&
        latestCapacity > 0 &&
        latestActiveTickets >= latestCapacity
          ? "sold-out"
          : latestLifecycleStatus;

      /*
       * Do not allow cancellation if the event
       * is no longer upcoming.
       */
      if (latestStatus !== "published") {
        setEvent(latestEvent);
        setShowCancelModal(false);
        setCancelLoading(false);
        return;
      }

      /*
       * IMPORTANT:
       *
       * updateStoredEvent() changes only the event
       * status. It preserves bookedSeats.
       */
      const updatedEvents =
        updateStoredEvent(
          latestEvent.id,
          {
            status: "cancelled",
          }
        );

      if (!Array.isArray(updatedEvents)) {
        throw new Error(
          "Unable to update event status."
        );
      }

      const updatedEvent =
        updatedEvents.find(
          (item) =>
            String(item.id) ===
            String(latestEvent.id)
        );

      setEvent(
        updatedEvent || {
          ...latestEvent,
          status: "cancelled",
        }
      );

      setShowCancelModal(false);
    } catch (error) {
      console.error(
        "Unable to cancel event:",
        error
      );
    } finally {
      setCancelLoading(false);
    }
  };

  /* =======================================================
     NOT LOGGED IN
  ======================================================= */

  if (!user) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <Users
            size={42}
            className="mx-auto text-slate-300"
          />

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Login required
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

  /* =======================================================
     LOADING
  ======================================================= */

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

  /* =======================================================
     EVENT NOT FOUND / UNAUTHORIZED
  ======================================================= */

  if (!event) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-5">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <CalendarDays size={28} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Event not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            The event does not exist or you do not
            have permission to manage it.
          </p>

          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            <ArrowLeft size={17} />
            Back to Events
          </button>
        </div>
      </section>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-orange-600"
          >
            <ArrowLeft size={17} />
            Back to Events
          </button>

        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto w-full max-w-7xl px-5 py-6 pb-10 sm:px-6 lg:px-8">

        {/* =================================================
            HERO EVENT CARD
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="grid lg:grid-cols-[420px_minmax(0,1fr)]">

            {/* IMAGE */}

            <div className="h-64 bg-slate-100 sm:h-80 lg:h-full lg:min-h-[360px]">

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
                  <CalendarDays size={48} />
                </div>
              )}

            </div>

            {/* INFORMATION */}

            <div className="flex flex-col p-6 sm:p-8">

              <div className="flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                  {event.category ||
                    "General Event"}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}
                >
                  <StatusIcon size={13} />
                  {statusLabel}
                </span>

              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {event.title ||
                  "Untitled Event"}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                {event.description ||
                  "No event description has been provided."}
              </p>

              {/* EVENT META */}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <EventMeta
                  icon={CalendarDays}
                  label="Date"
                  value={
                    event.date ||
                    "Date not available"
                  }
                />

                <EventMeta
                  icon={Clock3}
                  label="Time"
                  value={
                    event.endTime
                      ? `${event.time || "Not set"} – ${event.endTime}`
                      : event.time ||
                        "Time not available"
                  }
                />

                <EventMeta
                  icon={MapPin}
                  label="Location"
                  value={
                    event.location ||
                    event.city ||
                    "Location not available"
                  }
                />

                <EventMeta
                  icon={Users}
                  label="Organizer"
                  value={getOrganizerDisplayName(
                    event
                  )}
                />

              </div>

              {/* =================================================
                  CANCEL EVENT ACTION
              ================================================= */}

              <div className="mt-8 border-t border-slate-100 pt-6">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Event Management
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      You can cancel an event only while
                      it is upcoming.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!canCancelEvent}
                    onClick={handleCancelEvent}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                      canCancelEvent
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "cursor-not-allowed bg-slate-100 text-slate-400"
                    }`}
                  >
                    <XCircle size={17} />

                    {eventStatus === "cancelled" ||
                    eventStatus === "canceled"
                      ? "Event Cancelled"
                      : "Cancel Event"}
                  </button>

                </div>

              </div>

            </div>
          </div>

        </section>

        {/* =================================================
            METRIC CARDS
        ================================================= */}

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            title="Tickets Sold"
            value={metrics.booked}
            icon={Ticket}
            iconClass="bg-blue-50 text-blue-600"
            suffix={`of ${metrics.capacity}`}
          />

          <MetricCard
            title="Available Seats"
            value={metrics.available}
            icon={Users}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <MetricCard
            title="Ticket Price"
            value={`₹${Number(
              event.price || 0
            ).toLocaleString("en-IN")}`}
            icon={IndianRupee}
            iconClass="bg-orange-50 text-orange-600"
          />

          <MetricCard
            title="Revenue"
            value={`₹${metrics.revenue.toLocaleString(
              "en-IN"
            )}`}
            icon={IndianRupee}
            iconClass="bg-violet-50 text-violet-600"
          />

        </section>

        {/* =================================================
            CONTENT GRID
        ================================================= */}

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">

          {/* BOOKING OVERVIEW */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

              <h2 className="text-sm font-semibold text-slate-900">
                Booking Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current ticket sales and seat availability
              </p>

            </div>

            <div className="p-5 sm:p-6">

              <div className="flex items-end justify-between gap-4">

                <div>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {Math.round(
                      metrics.percentage
                    )}
                    %
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Capacity filled
                  </p>
                </div>

                <div className="text-right">

                  <p className="text-sm font-semibold text-slate-900">
                    {metrics.booked.toLocaleString(
                      "en-IN"
                    )}{" "}
                    /{" "}
                    {metrics.capacity.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    tickets sold
                  </p>

                </div>

              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-300"
                  style={{
                    width: `${metrics.percentage}%`,
                  }}
                />

              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">

                <BookingOverviewItem
                  label="Sold"
                  value={metrics.booked}
                />

                <BookingOverviewItem
                  label="Available"
                  value={metrics.available}
                />

                <BookingOverviewItem
                  label="Capacity"
                  value={metrics.capacity}
                />

              </div>

            </div>
          </div>

          {/* EVENT INFORMATION */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

              <h2 className="text-sm font-semibold text-slate-900">
                Event Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Important event details
              </p>

            </div>

            <div className="divide-y divide-slate-100">

              <InfoRow
                label="Category"
                value={
                  event.category ||
                  "General Event"
                }
              />

              <InfoRow
                label="City"
                value={
                  event.city ||
                  "Not specified"
                }
              />

              <InfoRow
                label="Start Time"
                value={
                  event.time ||
                  "Not specified"
                }
              />

              <InfoRow
                label="End Time"
                value={
                  event.endTime ||
                  "Not specified"
                }
              />

              <InfoRow
                label="Capacity"
                value={`${metrics.capacity.toLocaleString(
                  "en-IN"
                )} seats`}
              />

              <InfoRow
                label="Ticket Price"
                value={`₹${Number(
                  event.price || 0
                ).toLocaleString(
                  "en-IN"
                )}`}
              />

              <InfoRow
                label="Active Bookings"
                value={`${activeBookings.length.toLocaleString(
                  "en-IN"
                )} bookings`}
              />

            </div>

          </div>

        </section>

        {/* =================================================
            RECENT BOOKINGS
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div>

              <h2 className="text-sm font-semibold text-slate-900">
                Recent Bookings
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest bookings for this event
              </p>

            </div>

            <div className="text-xs font-medium text-slate-500">
              {activeBookings.length.toLocaleString(
                "en-IN"
              )}{" "}
              active bookings
            </div>

          </div>

          {recentBookings.length === 0 ? (

            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Ticket size={22} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No bookings yet
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Bookings for this event will appear here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {recentBookings.map(
                (booking) => {

                  const status =
                    getBookingStatus(
                      booking
                    );

                  const isCancelled =
                    status === "cancelled";

                  const attendeeName =
                    booking?.attendee?.name ||
                    booking?.userName ||
                    booking?.name ||
                    booking?.attendeeName ||
                    "Guest User";

                  const attendeeEmail =
                    booking?.attendee?.email ||
                    booking?.userEmail ||
                    booking?.email ||
                    "No email";

                  const bookingId =
                    booking?.id ||
                    booking?.bookingId ||
                    "—";

                  const quantity =
                    getBookingQuantity(
                      booking
                    );

                  return (
                    <div
                      key={
                        booking?.id ||
                        booking?.bookingId ||
                        `${attendeeEmail}-${bookingId}`
                      }
                      className="px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                    >

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                        {/* USER */}

                        <div className="flex min-w-0 flex-1 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                            {attendeeName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {attendeeName}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {attendeeEmail}
                            </p>

                          </div>

                        </div>

                        {/* BOOKING ID */}

                        <div className="sm:w-36">

                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Booking
                          </p>

                          <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                            {String(
                              bookingId
                            ).toUpperCase()}
                          </p>

                        </div>

                        {/* TICKETS */}

                        <div className="sm:w-20">

                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Tickets
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-700">
                            {quantity}
                          </p>

                        </div>

                        {/* STATUS */}

                        <div className="sm:w-28 sm:text-right">

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              isCancelled
                                ? "bg-red-50 text-red-600"
                                : status === "pending"
                                ? "bg-amber-50 text-amber-600"
                                : status === "completed"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >

                            {isCancelled ? (
                              <XCircle size={12} />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}

                            {isCancelled
                              ? "Cancelled"
                              : status === "pending"
                              ? "Pending"
                              : status === "completed"
                              ? "Completed"
                              : "Confirmed"}

                          </span>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* =================================================
            VIEW ALL BOOKINGS
        ================================================= */}

        {bookings.length > 5 && (
          <div className="mt-4 flex justify-end">

            <Link
              to={
                isAdmin
                  ? "/admin/bookings"
                  : "/organizer/bookings"
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            >
              View all bookings

              <ArrowLeft
                size={14}
                className="rotate-180"
              />
            </Link>

          </div>
        )}

      </main>

      {/* =================================================
          CANCEL EVENT CONFIRMATION MODAL
      ================================================= */}

      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-5"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !cancelLoading
            ) {
              setShowCancelModal(false);
            }
          }}
        >

          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-event-title"
          >

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <XCircle size={23} />
                </div>

                <div>

                  <h2
                    id="cancel-event-title"
                    className="text-base font-bold text-slate-900"
                  >
                    Cancel Event?
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    This action will mark the event as cancelled.
                  </p>

                </div>

              </div>

              <button
                type="button"
                disabled={cancelLoading}
                onClick={() =>
                  setShowCancelModal(false)
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <XCircle size={19} />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="px-6 py-5">

              <div className="rounded-xl border border-red-100 bg-red-50 p-4">

                <p className="text-sm font-semibold text-red-800">
                  {event.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  Once cancelled, this event will be shown
                  as Cancelled across EventON.
                </p>

              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Are you sure you want to cancel this event?
                The event data and existing booking records
                will remain stored.
              </p>

            </div>

            {/* MODAL ACTIONS */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                disabled={cancelLoading}
                onClick={() =>
                  setShowCancelModal(false)
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep Event
              </button>

              <button
                type="button"
                disabled={cancelLoading}
                onClick={confirmCancelEvent}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XCircle size={16} />

                {cancelLoading
                  ? "Cancelling..."
                  : "Yes, Cancel Event"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   EVENT META
========================================================= */

function EventMeta({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={17} />
      </div>

      <div className="min-w-0">

        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  title,
  value,
  icon: Icon,
  iconClass,
  suffix,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {suffix && (
            <p className="mt-1 text-xs text-slate-400">
              {suffix}
            </p>
          )}

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
   BOOKING OVERVIEW ITEM
========================================================= */

function BookingOverviewItem({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">

      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-900">
        {Number(value || 0).toLocaleString(
          "en-IN"
        )}
      </p>

    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">

      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="truncate text-right text-xs font-semibold text-slate-700">
        {value}
      </span>

    </div>
  );
}

export default ManagementEventDetails;