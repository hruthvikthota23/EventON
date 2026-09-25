import {
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
  ArrowRight,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import BookingStatus from "./BookingStatus";

function BookingCard({
  booking,
  onCancel,
}) {
  // =========================================================
  // SAFETY CHECK
  // =========================================================

  if (!booking) {
    return null;
  }

  const {
    bookingId,
    event,
    ticketCount,
    totalPrice,
    status,
  } = booking;

  // Prevent the card from crashing if event data is missing.
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
                to="/bookings"
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

  // =========================================================
  // DATE
  // =========================================================

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

  // =========================================================
  // STATUS
  // =========================================================

  const isCancelled =
    status === "cancelled";

  // =========================================================
  // BOOKING ID
  // =========================================================

  const normalizedBookingId =
    String(bookingId || "").trim();

  // =========================================================
  // UI
  // =========================================================

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white transition ${
        isCancelled
          ? "border-slate-200 opacity-90"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {/* =====================================================
          EVENT IMAGE
      ====================================================== */}

      <div className="relative">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title || "Event"}
            className={`h-52 w-full object-cover sm:h-56 ${
              isCancelled
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

        {/* Status */}

        <div className="absolute right-4 top-4">
          <BookingStatus
            status={status}
          />
        </div>

        {/* Category */}

        {event.category && (
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
              {event.category}
            </span>
          </div>
        )}
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="p-5 sm:p-6">

        {/* Event title */}

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

        {/* Event information */}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">

          {/* Date */}

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

          {/* Time */}

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Clock3 size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Time
              </p>

              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {event.time || "Time unavailable"}
              </p>
            </div>
          </div>

          {/* Location */}

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

          {/* Tickets */}

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Ticket size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Tickets
              </p>

              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {ticketCount}{" "}
                {ticketCount === 1
                  ? "ticket"
                  : "tickets"}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

          {/* Amount */}

          <div>
            <p className="text-xs text-slate-400">
              Total paid
            </p>

            <p className="mt-0.5 text-xl font-bold text-slate-900">
              ₹{Number(totalPrice) || 0}
            </p>
          </div>

          {/* Actions */}

          <div className="flex w-full gap-2 sm:w-auto">

            {/* =================================================
                VIEW BOOKING
            ================================================== */}

            <Link
              to={
                normalizedBookingId
                  ? `/bookings/${encodeURIComponent(
                      normalizedBookingId
                    )}`
                  : "/bookings"
              }
              className="group inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-none"
            >
              View booking

              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            {/* =================================================
                CANCEL
            ================================================== */}

            {!isCancelled && (
              <button
                type="button"
                onClick={() =>
                  onCancel?.(booking)
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
  );
}

export default BookingCard;