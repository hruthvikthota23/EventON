import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";

import {
  getStoredEventById,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

/* =========================================================
   DATE + TIME HELPERS
========================================================= */

function parseEventDateTime(dateValue, timeValue) {
  if (!dateValue) {
    return null;
  }

  const dateText = String(dateValue).trim();
  const timeText = String(timeValue || "00:00").trim();

  let year;
  let month;
  let day;

  /*
   * YYYY-MM-DD
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    [year, month, day] = dateText
      .split("-")
      .map(Number);
  }

  /*
   * DD-MM-YYYY
   * DD/MM/YYYY
   */
  else if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(dateText)) {
    [day, month, year] = dateText
      .split(/[-/]/)
      .map(Number);
  }

  /*
   * Any other valid date string
   */
  else {
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
   *
   * 17:30
   * 17:30:00
   * 5:30 PM
   * 05:30 PM
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

  /*
   * Convert 12-hour time to 24-hour time
   */
  if (meridiem === "PM" && hour !== 12) {
    hour += 12;
  }

  if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  /*
   * Validate time
   */
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

  /*
   * IMPORTANT:
   * Create the date using local browser time.
   * This prevents timezone shifting for
   * YYYY-MM-DD event dates.
   */
  const result = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    0
  );

  return Number.isNaN(result.getTime())
    ? null
    : result;
}

/* =========================================================
   EVENT START
========================================================= */

function getEventStart(event) {
  if (!event) {
    return null;
  }

  return parseEventDateTime(
    event.date,
    event.time || event.startTime
  );
}

/* =========================================================
   EVENT END
========================================================= */

function getEventEnd(event) {
  if (!event) {
    return null;
  }

  const endTime =
    event.endTime ||
    event.finishTime;

  /*
   * If there is no end time, we cannot determine
   * the exact completion time.
   */
  if (!endTime) {
    return null;
  }

  return parseEventDateTime(
    event.date,
    endTime
  );
}

/* =========================================================
   EVENT STATUS

   Upcoming
   Ongoing
   Completed
   Cancelled
   Draft
========================================================= */

function getEventStatus(
  event,
  currentTime = Date.now()
) {
  const storedStatus = String(
    event?.status || ""
  )
    .trim()
    .toLowerCase();

  /*
   * Stored cancellation always takes priority.
   */
  if (
    storedStatus === "cancelled" ||
    storedStatus === "canceled"
  ) {
    return "cancelled";
  }

  /*
   * Draft event
   */
  if (storedStatus === "draft") {
    return "draft";
  }

  const start = getEventStart(event);
  const end = getEventEnd(event);

  /*
   * If start time is unavailable,
   * do not incorrectly mark the event completed.
   */
  if (!start) {
    return "upcoming";
  }

  /*
   * BEFORE EVENT START
   *
   * Example:
   * Current = 17:14
   * Start   = 17:30
   *
   * Result = Upcoming
   */
  if (currentTime < start.getTime()) {
    return "upcoming";
  }

  /*
   * EVENT HAS STARTED
   *
   * If an end time exists:
   *
   * 17:30 <= current < 18:30
   * => Ongoing
   */
  if (end) {
    if (currentTime < end.getTime()) {
      return "ongoing";
    }

    /*
     * Current time has reached/passed end time.
     *
     * 18:30+
     * => Completed
     */
    return "completed";
  }

  /*
   * No end time was supplied.
   *
   * Once the event starts, keep it ongoing
   * instead of incorrectly marking it completed.
   */
  return "ongoing";
}

/* =========================================================
   COMPLETED CHECK
========================================================= */

function isEventCompleted(
  event,
  currentTime = Date.now()
) {
  return (
    getEventStatus(
      event,
      currentTime
    ) === "completed"
  );
}

/* =========================================================
   EVENT DETAILS
========================================================= */

function EventDetails() {
  const { id } = useParams();

  const [currentTime, setCurrentTime] =
    useState(() => Date.now());

  /* =======================================================
     EVENT STATE
  ======================================================= */

  const [event, setEvent] = useState(() =>
    getStoredEventById(id)
  );

  /* =======================================================
     LOAD EVENT
  ======================================================= */

  useEffect(() => {
    const loadEvent = () => {
      const storedEvent =
        getStoredEventById(id);

      setEvent(storedEvent);
    };

    loadEvent();

    /*
     * Refresh when EventON updates an event
     */
    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      loadEvent
    );

    /*
     * Refresh when localStorage changes
     * from another browser tab
     */
    window.addEventListener(
      "storage",
      loadEvent
    );

    return () => {
      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        loadEvent
      );

      window.removeEventListener(
        "storage",
        loadEvent
      );
    };
  }, [id]);

  /* =======================================================
     LIVE CLOCK

     Re-check event status every minute.
  ======================================================= */

  useEffect(() => {
    const intervalId =
      window.setInterval(() => {
        setCurrentTime(Date.now());
      }, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  /* =======================================================
     EVENT NOT FOUND
  ======================================================= */

  if (!event) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center px-5 py-16 sm:px-8 lg:px-10">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Ticket
                size={28}
                className="text-slate-400"
              />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Event not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              The event you're looking for doesn't
              exist or may have been removed.
            </p>

            <Link
              to="/events"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft size={17} />
              Back to events
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* =======================================================
     EVENT LIFECYCLE + AVAILABILITY
  ======================================================= */

  const eventStatus = getEventStatus(
    event,
    currentTime
  );

  const eventCompleted =
    eventStatus === "completed";

  const eventCancelled =
    eventStatus === "cancelled";

  const eventOngoing =
    eventStatus === "ongoing";

  const eventUpcoming =
    eventStatus === "upcoming";

  const capacity =
    Number(event.capacity) || 0;

  const bookedSeats = Math.min(
    Math.max(
      Number(event.bookedSeats) || 0,
      0
    ),
    Math.max(capacity, 0)
  );

  const availableSeats = Math.max(
    capacity - bookedSeats,
    0
  );

  /*
   * Sold out should only apply to an event
   * that is still active.
   */
  const soldOut =
    !eventCompleted &&
    !eventCancelled &&
    !eventOngoing &&
    (
      availableSeats <= 0 ||
      String(event.status || "")
        .trim()
        .toLowerCase() === "sold-out"
    );

  /*
   * Completed/cancelled/sold-out events
   * cannot be booked.
   */
  const bookingClosed =
    eventCompleted ||
    eventCancelled ||
    soldOut;

  /* =======================================================
     DATE
  ======================================================= */

  const formattedDate = new Date(
    event.date
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          BACK NAVIGATION
      ====================================================== */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-4 sm:px-8 lg:px-10">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to events
          </Link>
        </div>
      </div>

      {/* =====================================================
          EVENT HERO
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-12">

            {/* =================================================
                EVENT IMAGE
            ================================================== */}

            <div className="relative overflow-hidden rounded-2xl bg-slate-100">

              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className="aspect-[16/10] h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center bg-slate-100">
                  <Ticket
                    size={48}
                    className="text-slate-300"
                  />
                </div>
              )}

              {/* Category */}

              <div className="absolute left-4 top-4">
                <span className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
                  {event.category}
                </span>
              </div>

              {/* Event lifecycle */}

              {eventCompleted ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55">
                  <span className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900">
                    Completed
                  </span>
                </div>
              ) : eventCancelled ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55">
                  <span className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-red-600">
                    Cancelled
                  </span>
                </div>
              ) : (
                soldOut && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55">
                    <span className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900">
                      Sold Out
                    </span>
                  </div>
                )
              )}

            </div>

            {/* =================================================
                EVENT SUMMARY
            ================================================== */}

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
                {event.category}
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {event.title}
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-600">
                {event.description}
              </p>

              {/* =================================================
                  EVENT INFORMATION
              ================================================== */}

              <div className="mt-7 space-y-4">

                {/* Date */}

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formattedDate}
                    </p>
                  </div>
                </div>

                {/* Time */}

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Clock3 size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {event.time}

                      {event.endTime
                        ? ` – ${event.endTime}`
                        : ""}
                    </p>
                  </div>
                </div>

                {/* Location */}

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {event.location}
                    </p>

                    {event.city && (
                      <p className="mt-0.5 text-sm text-slate-500">
                        {event.city}
                      </p>
                    )}
                  </div>
                </div>

              </div>

              {/* =================================================
                  ORGANIZER
              ================================================== */}

              <div className="mt-7 border-t border-slate-200 pt-6">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Organized by
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {event.organizer ||
                    "EventON Organizer"}
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          EVENT DETAILS + BOOKING
      ====================================================== */}

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">

            {/* =================================================
                ABOUT EVENT
            ================================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

              <h2 className="text-xl font-bold text-slate-900">
                About this event
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                {event.description}
              </p>

              {/* Event highlights */}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                {/* Capacity */}

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">

                    <Users
                      size={19}
                      className="text-slate-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Capacity
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {capacity} attendees
                      </p>
                    </div>

                  </div>
                </div>

                {/* Availability */}

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">

                    <CheckCircle2
                      size={19}
                      className={
                        soldOut
                          ? "text-red-500"
                          : eventCompleted
                          ? "text-slate-500"
                          : "text-green-500"
                      }
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Availability
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {eventCancelled
                          ? "Event cancelled"
                          : eventCompleted
                          ? "Event completed"
                          : soldOut
                          ? "Sold out"
                          : eventOngoing
                          ? "Event is ongoing"
                          : `${availableSeats} seats left`}
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* =================================================
                BOOKING CARD
            ================================================== */}

            <aside className="lg:sticky lg:top-24">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Tickets
                </p>

                <div className="mt-2 flex items-end justify-between gap-4">

                  <div>
                    <span className="text-3xl font-bold text-slate-900">
                      ₹{Number(event.price) || 0}
                    </span>

                    <span className="ml-1 text-sm text-slate-500">
                      / person
                    </span>
                  </div>

                  {!bookingClosed && (
                    <span className="text-xs font-semibold text-green-600">
                      {availableSeats} left
                    </span>
                  )}

                  {eventOngoing && (
                    <span className="text-xs font-semibold text-blue-600">
                      Ongoing
                    </span>
                  )}

                  {eventCompleted && (
                    <span className="text-xs font-semibold text-slate-500">
                      Completed
                    </span>
                  )}

                  {eventCancelled && (
                    <span className="text-xs font-semibold text-red-500">
                      Cancelled
                    </span>
                  )}

                </div>

                <div className="my-6 border-t border-slate-200" />

                {/* Booking Button */}

                {eventCompleted ? (
                  <button
                    type="button"
                    disabled
                    className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-500"
                  >
                    Event Completed
                  </button>
                ) : eventCancelled ? (
                  <button
                    type="button"
                    disabled
                    className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-500"
                  >
                    Event Cancelled
                  </button>
                ) : soldOut ? (
                  <button
                    type="button"
                    disabled
                    className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-500"
                  >
                    Sold Out
                  </button>
                ) : (
                  <Link
                    to={`/events/${event.id}/book`}
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-orange-500 text-sm font-bold !text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100"
                  >
                    Book Tickets
                  </Link>
                )}

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  {eventCompleted
                    ? "This event has already ended."
                    : eventCancelled
                    ? "This event has been cancelled."
                    : soldOut
                    ? "Tickets for this event are sold out."
                    : eventOngoing
                    ? "This event is currently ongoing."
                    : "Secure your spot before tickets run out."}
                </p>

              </div>

            </aside>

          </div>
        </div>
      </section>

    </main>
  );
}

export default EventDetails;