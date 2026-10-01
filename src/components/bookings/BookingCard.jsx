import { useState } from "react";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
  ArrowRight,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { Link } from "react-router-dom";

import BookingStatus from "./BookingStatus";

/* =========================================================
   DATE + TIME HELPERS
========================================================= */

/**
 * Convert date + time into a JavaScript Date.
 *
 * Supported:
 * 10:00 AM
 * 03:30 PM
 * 14:30
 * 14:30:00
 */
function getEventDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const date = String(dateValue).trim();
  const time = String(timeValue).trim();

  if (!date || !time) {
    return null;
  }

  /* =======================================================
     12-HOUR FORMAT
     Example:
     10:00 AM
     03:30 PM
     10:00:30 AM
  ======================================================= */

  const twelveHourMatch = time.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i
  );

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2]);
    const seconds = Number(twelveHourMatch[3] || 0);
    const period = twelveHourMatch[4].toUpperCase();

    if (
      hours < 1 ||
      hours > 12 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return null;
    }

    if (period === "AM") {
      if (hours === 12) {
        hours = 0;
      }
    } else if (hours !== 12) {
      hours += 12;
    }

    const result = new Date(`${date}T00:00:00`);

    if (Number.isNaN(result.getTime())) {
      return null;
    }

    result.setHours(
      hours,
      minutes,
      seconds,
      0
    );

    return result;
  }

  /* =======================================================
     24-HOUR FORMAT
     Example:
     14:30
     14:30:00
  ======================================================= */

  const twentyFourHourMatch = time.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
  );

  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);
    const seconds = Number(
      twentyFourHourMatch[3] || 0
    );

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return null;
    }

    const result = new Date(`${date}T00:00:00`);

    if (Number.isNaN(result.getTime())) {
      return null;
    }

    result.setHours(
      hours,
      minutes,
      seconds,
      0
    );

    return result;
  }

  /* =======================================================
     FALLBACK
  ======================================================= */

  const fallback = new Date(
    `${date}T${time}`
  );

  return Number.isNaN(fallback.getTime())
    ? null
    : fallback;
}

/* =========================================================
   EVENT START
========================================================= */

function getEventStart(event) {
  if (!event) {
    return null;
  }

  return getEventDateTime(
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

  return getEventDateTime(
    event.date,
    event.endTime || event.finishTime
  );
}

/* =========================================================
   BOOKING STATUS
========================================================= */

/**
 * Returns ONLY:
 *
 * upcoming
 * ongoing
 * completed
 * cancelled
 *
 * Status is calculated from the actual event data.
 */
function getBookingStatus(booking, event) {
  const bookingStatus = String(
    booking?.status || ""
  )
    .trim()
    .toLowerCase();

  /* =======================================================
     CANCELLED BOOKING
  ======================================================= */

  if (
    bookingStatus === "cancelled" ||
    bookingStatus === "canceled"
  ) {
    return "cancelled";
  }

  /* =======================================================
     EVENT TIMES
  ======================================================= */

  const start = getEventStart(event);
  const end = getEventEnd(event);
  const now = new Date();

  /* =======================================================
     NO START TIME
  ======================================================= */

  if (!start) {
    if (!event?.date) {
      return "upcoming";
    }

    const eventDate = new Date(event.date);

    if (Number.isNaN(eventDate.getTime())) {
      return "upcoming";
    }

    const eventDay = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    if (eventDay > today) {
      return "upcoming";
    }

    if (eventDay < today) {
      return "completed";
    }

    return "upcoming";
  }

  /* =======================================================
     BEFORE EVENT
  ======================================================= */

  if (now < start) {
    return "upcoming";
  }

  /* =======================================================
     EVENT HAS STARTED
  ======================================================= */

  if (end) {
    if (now < end) {
      return "ongoing";
    }

    return "completed";
  }

  /* =======================================================
     NO END TIME
  ======================================================= */

  return "completed";
}

/* =========================================================
   BOOKING CARD
========================================================= */

function BookingCard({
  booking,
  onCancel,
}) {
  /* =======================================================
     IMPORTANT:
     ALL HOOKS MUST BE CALLED BEFORE ANY RETURN.
  ======================================================= */

  const [showCancelPopup, setShowCancelPopup] =
    useState(false);

  const [isCancelling, setIsCancelling] =
    useState(false);

  /* =======================================================
     SAFETY
  ======================================================= */

  if (!booking) {
    return null;
  }

  const {
    bookingId,
    event,
    ticketCount,
    totalPrice,
  } = booking;

  /* =======================================================
     EVENT MISSING
  ======================================================= */

  if (!event) {
    return (
      <article className="overflow-hidden rounded-2xl border border-red-100 bg-white">
        <div className="p-6">
          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Ticket size={20} />
            </div>

            <div className="min-w-0">

              <h3 className="text-lg font-bold text-slate-900">
                Event information unavailable
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Booking ID:{" "}
                <span className="font-mono font-semibold text-slate-700">
                  {bookingId || "Unavailable"}
                </span>
              </p>

              <Link
                to="/my-bookings"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                Back to bookings

                <ArrowRight size={15} />
              </Link>

            </div>

          </div>
        </div>
      </article>
    );
  }

  /* =======================================================
     REAL STATUS
  ======================================================= */

  const status = getBookingStatus(
    booking,
    event
  );

  /* =======================================================
     CANCEL ONLY UPCOMING
  ======================================================= */

  const canCancel =
    status === "upcoming" &&
    bookingStatusIsActive(booking);

  /* =======================================================
     DATE
  ======================================================= */

  const eventDate = event.date
    ? new Date(event.date)
    : null;

  const formattedDate =
    eventDate &&
    !Number.isNaN(eventDate.getTime())
      ? eventDate.toLocaleDateString(
          "en-IN",
          {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )
      : "Date unavailable";

  /* =======================================================
     TIME
  ======================================================= */

  const startTime =
    event.time ||
    event.startTime ||
    null;

  const endTime =
    event.endTime ||
    event.finishTime ||
    null;

  const formattedTime = startTime
    ? `${startTime}${
        endTime ? ` – ${endTime}` : ""
      }`
    : "Time unavailable";

  /* =======================================================
     CATEGORY
  ======================================================= */

  const category =
    event.category || "General";

  /* =======================================================
     BOOKING ID
  ======================================================= */

  const normalizedBookingId = String(
    bookingId || ""
  ).trim();

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <article
        className={`overflow-hidden rounded-2xl border bg-white transition ${
          status === "cancelled"
            ? "border-slate-200 opacity-90"
            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
        }`}
      >

        {/* =================================================
            IMAGE
        ================================================== */}

        <div className="relative">

          {event.image ? (
            <img
              src={event.image}
              alt={event.title || "Event"}
              className={`h-52 w-full object-cover sm:h-56 ${
                status === "cancelled"
                  ? "grayscale-[30%]"
                  : ""
              }`}
            />
          ) : (
            <div className="flex h-52 w-full items-center justify-center bg-slate-100 sm:h-56">
              <Ticket
                size={48}
                className="text-slate-300"
              />
            </div>
          )}

          {/* STATUS */}

          <div className="absolute right-4 top-4">
            <BookingStatus status={status} />
          </div>

          {/* CATEGORY */}

          <div className="absolute bottom-4 left-4">
            <span className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
              {category}
            </span>
          </div>

        </div>

        {/* =================================================
            CONTENT
        ================================================== */}

        <div className="p-5 sm:p-6">

          {/* EVENT TITLE */}

          <div>

            <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {event.title || "Untitled event"}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Booking ID:{" "}
              <span className="font-mono font-semibold text-slate-600">
                {normalizedBookingId ||
                  "Unavailable"}
              </span>
            </p>

          </div>

          {/* =================================================
              EVENT INFORMATION
          ================================================== */}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            {/* DATE */}

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <CalendarDays size={17} />
              </div>

              <div className="min-w-0">

                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Date
                </p>

                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {formattedDate}
                </p>

              </div>

            </div>

            {/* TIME */}

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Clock3 size={17} />
              </div>

              <div className="min-w-0">

                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Time
                </p>

                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {formattedTime}
                </p>

              </div>

            </div>

            {/* LOCATION */}

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <MapPin size={17} />
              </div>

              <div className="min-w-0">

                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Location
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                  {event.city ||
                    event.location ||
                    "Location unavailable"}
                </p>

              </div>

            </div>

            {/* TICKETS */}

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Ticket size={17} />
              </div>

              <div className="min-w-0">

                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Tickets
                </p>

                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {ticketCount || 0}{" "}
                  {Number(ticketCount) === 1
                    ? "ticket"
                    : "tickets"}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

            {/* TOTAL */}

            <div>

              <p className="text-xs text-slate-400">
                Total paid
              </p>

              <p className="mt-0.5 text-xl font-bold text-slate-900">
                ₹{Number(totalPrice) || 0}
              </p>

            </div>

            {/* ACTIONS */}

            <div className="flex w-full gap-2 sm:w-auto">

              {/* VIEW BOOKING */}

              <Link
                to={
                  normalizedBookingId
                    ? `/my-bookings/${encodeURIComponent(
                        normalizedBookingId
                      )}`
                    : "/my-bookings"
                }
                className="group inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-none"
              >
                View booking

                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              {/* CANCEL */}

              {canCancel && (
                <button
                  type="button"
                  onClick={() =>
                    setShowCancelPopup(true)
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100"
                >
                  <XCircle size={15} />

                  <span className="hidden sm:inline">
                    Cancel
                  </span>
                </button>
              )}

            </div>

          </div>

        </div>

      </article>

      {/* =====================================================
          CANCEL CONFIRMATION POPUP
      ====================================================== */}

      {showCancelPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-booking-title"
        >

          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

            <div className="p-5 sm:p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <AlertTriangle size={21} />
                </div>

                <div className="min-w-0">

                  <h3
                    id="cancel-booking-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    Cancel this booking?
                  </h3>

                  <p className="mt-1.5 text-sm leading-5 text-slate-500">
                    Are you sure you want to cancel
                    your booking for{" "}
                    <span className="font-semibold text-slate-700">
                      {event.title || "this event"}
                    </span>
                    ?
                  </p>

                </div>

              </div>

              {/* SUMMARY */}

              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">

                <div className="flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Tickets
                  </span>

                  <span className="font-semibold text-slate-800">
                    {ticketCount || 0}
                  </span>

                </div>

                <div className="mt-2 flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Total paid
                  </span>

                  <span className="font-semibold text-slate-800">
                    ₹{Number(totalPrice) || 0}
                  </span>

                </div>

              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                This will cancel your booking and
                update the available seats for this
                event.
              </p>

            </div>

            {/* MODAL ACTIONS */}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                disabled={isCancelling}
                onClick={() =>
                  setShowCancelPopup(false)
                }
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep Booking
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={async () => {
                  try {
                    setIsCancelling(true);

                    await onCancel?.(booking);

                    setShowCancelPopup(false);
                  } finally {
                    setIsCancelling(false);
                  }
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XCircle size={15} />

                {isCancelling
                  ? "Cancelling..."
                  : "Yes, Cancel Booking"}
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}

/* =========================================================
   BOOKING ACTIVE CHECK
========================================================= */

function bookingStatusIsActive(booking) {
  const status = String(
    booking?.status || ""
  )
    .trim()
    .toLowerCase();

  return (
    status !== "cancelled" &&
    status !== "canceled"
  );
}

export default BookingCard;