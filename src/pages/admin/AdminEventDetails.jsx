import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

import {
  getStoredEvents,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

import {
  getStoredBookings,
  BOOKINGS_UPDATED_EVENT,
} from "../../utils/bookingStorage";


/* =========================================================
   EVENT LIFECYCLE HELPERS
========================================================= */

/*
 * Parse EventON date + time into a local Date.
 *
 * Supports the normal HTML date value:
 *   YYYY-MM-DD
 *
 * and also the display format:
 *   DD-MM-YYYY
 */
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

  const storedStatus = String(
    event.status || "published"
  )
    .trim()
    .toLowerCase();

  /*
   * These are explicit administrative states.
   * Lifecycle calculation should not turn them into
   * Completed/Ongoing.
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
   * If an end time exists:
   *   now >= end -> Completed
   *   start <= now < end -> Ongoing
   *
   * If no end time exists:
   *   now >= start -> Completed
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
   * Sold-out remains a public/admin lifecycle state
   * until the event is actually completed.
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

/*
 * Get the number of tickets/seats from a booking.
 *
 * Supports the different booking field names used by
 * the EventON booking data.
 */
const getBookingQuantity = (booking) => {
  const quantity = Number(
    booking?.quantity ??
      booking?.seats ??
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

/*
 * Only cancelled bookings should release seats.
 *
 * Pending, confirmed, completed and attended
 * bookings are considered active for the admin
 * seat calculation.
 */
const isActiveBooking = (booking) => {
  return (
    getBookingStatus(booking) !==
    "cancelled"
  );
};

/*
 * Get booking timestamp for sorting.
 */
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

  const timestamp =
    new Date(rawDate).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
};

/*
 * Get booking amount.
 *
 * First use the amount stored on the booking.
 * If it is not available, calculate:
 *
 * event ticket price × booking quantity
 */
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

  const quantity =
    getBookingQuantity(
      booking
    );

  return (
    Number(ticketPrice || 0) *
    quantity
  );
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

  return event?.organizer || "EventON Organizer";
};

/* =========================================================
   COMPONENT
========================================================= */

function AdminEventDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [event, setEvent] =
    useState(null);

  const [bookings, setBookings] =
    useState([]);

  /* =======================================================
     LOAD EVENT + BOOKINGS
  ======================================================= */

  const loadData = () => {
    try {
      const storedEvents =
        getStoredEvents();

      const storedBookings =
        getStoredBookings();

      const foundEvent =
        storedEvents.find(
          (item) =>
            String(item.id) ===
            String(id)
        );

      setEvent(
        foundEvent || null
      );

      if (foundEvent) {
        const eventBookings =
          storedBookings.filter(
            (booking) =>
              String(
                booking?.eventId
              ) ===
              String(
                foundEvent.id
              )
          );

        setBookings(
          eventBookings
        );
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error(
        "Unable to load event details:",
        error
      );

      setEvent(null);
      setBookings([]);
    }
  };

  /* =======================================================
     LIVE UPDATES
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
  }, [id]);

  /* =======================================================
     ACTIVE BOOKINGS
  ======================================================= */

  const activeBookings =
    useMemo(() => {
      return bookings.filter(
        (booking) =>
          isActiveBooking(
            booking
          )
      );
    }, [bookings]);

  /* =======================================================
     ACTUAL TICKETS SOLD
  ======================================================= */

  const actualTicketsSold =
    useMemo(() => {
      return activeBookings.reduce(
        (total, booking) => {
          return (
            total +
            getBookingQuantity(
              booking
            )
          );
        },
        0
      );
    }, [activeBookings]);

  /* =======================================================
     EVENT STATUS
  ======================================================= */

  const [lifecycleNow, setLifecycleNow] =
    useState(() => new Date());

  /*
   * Recalculate the lifecycle every minute.
   * This is display-only; the stored event status
   * is not modified.
   */
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLifecycleNow(new Date());
    }, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const eventStatus =
    useMemo(() => {
      if (!event) {
        return "published";
      }

      const lifecycleStatus =
        getEventLifecycleStatus(
          event,
          lifecycleNow
        );

      /*
       * Completed/Ongoing must be determined from
       * the actual event date/time before sold-out.
       */
      if (
        lifecycleStatus === "completed" ||
        lifecycleStatus === "ongoing"
      ) {
        return lifecycleStatus;
      }

      const capacity = Number(
        event.capacity || 0
      );

      /*
       * Sold out is calculated using actual active
       * booking records and applies only while the
       * event has not completed.
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

  const statusLabel =
    useMemo(() => {
      if (
        eventStatus === "completed"
      ) {
        return "Completed";
      }

      if (
        eventStatus === "ongoing"
      ) {
        return "Ongoing";
      }

      if (
        eventStatus === "sold-out"
      ) {
        return "Sold Out";
      }

      if (
        eventStatus === "draft"
      ) {
        return "Draft";
      }

      if (
        eventStatus === "cancelled" ||
        eventStatus === "canceled"
      ) {
        return "Cancelled";
      }

      return "Published";
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

  const metrics =
    useMemo(() => {
      if (!event) {
        return {
          capacity: 0,
          booked: 0,
          available: 0,
          percentage: 0,
          revenue: 0,
        };
      }

      const capacity = Number(
        event.capacity || 0
      );

      /*
       * REAL BOOKINGS
       */
      const booked =
        actualTicketsSold;

      /*
       * NEVER allow available seats
       * to become negative.
       */
      const available =
        Math.max(
          capacity - booked,
          0
        );

      /*
       * REAL BOOKING PERCENTAGE
       */
      const percentage =
        capacity > 0
          ? Math.min(
              (booked /
                capacity) *
                100,
              100
            )
          : 0;

      /*
       * REAL REVENUE
       */
      const revenue =
        activeBookings.reduce(
          (
            total,
            booking
          ) => {
            return (
              total +
              getBookingAmount(
                booking,
                event.price
              )
            );
          },
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

  const recentBookings =
    useMemo(() => {
      return [...bookings]
        .sort(
          (a, b) =>
            getBookingTimestamp(
              b
            ) -
            getBookingTimestamp(
              a
            )
        )
        .slice(0, 5);
    }, [bookings]);

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!event) {
    return (
      <div className="min-h-full bg-slate-50">

        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center px-5 sm:px-6 lg:px-8">

          <div className="max-w-md text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <CalendarDays
                size={28}
              />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Event not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The event you are
              looking for does not
              exist or may have
              been removed.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/events"
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <ArrowLeft
                size={17}
              />
              Back to Events
            </button>

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     RENDER
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
            onClick={() =>
              navigate(
                "/admin/events"
              )
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-orange-600"
          >
            <ArrowLeft
              size={17}
            />
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
                  <CalendarDays
                    size={48}
                  />
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
                  <StatusIcon
                    size={13}
                  />

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
                    event.time ||
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

            </div>

          </div>

        </section>

        {/* =================================================
            METRIC CARDS
        ================================================= */}

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            title="Tickets Sold"
            value={
              metrics.booked
            }
            icon={Ticket}
            iconClass="bg-blue-50 text-blue-600"
            suffix={`of ${metrics.capacity}`}
          />

          <MetricCard
            title="Available Seats"
            value={
              metrics.available
            }
            icon={Users}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <MetricCard
            title="Ticket Price"
            value={`₹${Number(
              event.price || 0
            ).toLocaleString(
              "en-IN"
            )}`}
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

          {/* ================================================
              BOOKING OVERVIEW
          ================================================ */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

              <h2 className="text-sm font-semibold text-slate-900">
                Booking Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current ticket sales and
                seat availability
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

              {/* PROGRESS */}

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-300"
                  style={{
                    width: `${metrics.percentage}%`,
                  }}
                />

              </div>

              {/* SUMMARY */}

              <div className="mt-5 grid grid-cols-3 gap-3">

                <BookingOverviewItem
                  label="Sold"
                  value={
                    metrics.booked
                  }
                />

                <BookingOverviewItem
                  label="Available"
                  value={
                    metrics.available
                  }
                />

                <BookingOverviewItem
                  label="Capacity"
                  value={
                    metrics.capacity
                  }
                />

              </div>

            </div>

          </div>

          {/* ================================================
              EVENT INFORMATION
          ================================================ */}

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
                Latest bookings for this
                event
              </p>

            </div>

            <div className="text-xs font-medium text-slate-500">

              {activeBookings.length.toLocaleString(
                "en-IN"
              )}{" "}
              active bookings

            </div>

          </div>

          {recentBookings.length ===
          0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Ticket
                  size={22}
                />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No bookings yet
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Bookings for this
                event will appear
                here.
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
                    status ===
                    "cancelled";

                  /* =========================================
                     ATTENDEE
                  ========================================= */

                  const attendeeName =
                    booking?.attendee
                      ?.name ||
                    booking?.userName ||
                    booking?.name ||
                    booking?.attendeeName ||
                    "Guest User";

                  const attendeeEmail =
                    booking?.attendee
                      ?.email ||
                    booking?.userEmail ||
                    booking?.email ||
                    "No email";

                  /* =========================================
                     BOOKING ID
                  ========================================= */

                  const bookingId =
                    booking?.id ||
                    booking?.bookingId ||
                    "—";

                  /* =========================================
                     TICKETS
                  ========================================= */

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
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {
                                attendeeName
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {
                                attendeeEmail
                              }
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
                            {
                              quantity
                            }
                          </p>

                        </div>

                        {/* STATUS */}

                        <div className="sm:w-28 sm:text-right">

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              isCancelled
                                ? "bg-red-50 text-red-600"
                                : status ===
                                  "pending"
                                ? "bg-amber-50 text-amber-600"
                                : status ===
                                  "completed"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >

                            {isCancelled ? (
                              <XCircle
                                size={
                                  12
                                }
                              />
                            ) : (
                              <CheckCircle2
                                size={
                                  12
                                }
                              />
                            )}

                            {isCancelled
                              ? "Cancelled"
                              : status ===
                                "pending"
                              ? "Pending"
                              : status ===
                                "completed"
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
              to="/admin/bookings"
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
        <Icon
          size={17}
        />
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
          <Icon
            size={21}
          />
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
        {Number(
          value || 0
        ).toLocaleString(
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

export default AdminEventDetails;