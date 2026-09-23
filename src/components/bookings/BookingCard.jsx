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
  const {
    bookingId,
    event,
    ticketCount,
    totalPrice,
    status,
  } = booking;

  const formattedDate = new Date(
    event.date
  ).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isCancelled = status === "cancelled";

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
        <img
          src={event.image}
          alt={event.title}
          className={`h-52 w-full object-cover sm:h-56 ${
            isCancelled ? "grayscale-[30%]" : ""
          }`}
        />

        {/* Status */}

        <div className="absolute right-4 top-4">
          <BookingStatus status={status} />
        </div>

        {/* Category */}

        <div className="absolute bottom-4 left-4">
          <span className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
            {event.category}
          </span>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="p-5 sm:p-6">
        {/* Event title */}

        <div>
          <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            {event.title}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Booking ID:{" "}
            <span className="font-mono font-semibold text-slate-600">
              {bookingId}
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
                {event.time}
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
                {event.city}
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
              ₹{totalPrice}
            </p>
          </div>

          {/* Actions */}

          <div className="flex w-full gap-2 sm:w-auto">
            <Link
              to={`/bookings/${bookingId}`}
              className="group inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-none"
            >
              View booking

              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            {!isCancelled && (
              <button
                type="button"
                onClick={() => onCancel?.(booking)}
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