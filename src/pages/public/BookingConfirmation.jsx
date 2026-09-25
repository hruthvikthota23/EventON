import { Link, useLocation } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Ticket,
  User,
} from "lucide-react";

function BookingConfirmation() {
  const location = useLocation();

  const booking = location.state?.booking;

  if (!booking) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="flex min-h-[calc(100vh-68px)] items-center justify-center px-5 py-16">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Ticket size={28} className="text-slate-400" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Booking not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              We couldn't find the booking information. Please return
              to the events page and try again.
            </p>

            <Link
              to="/events"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800"
            >
              <ArrowLeft size={17} />
              Browse events
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const {
    event,
    attendee,
    ticketCount,
    totalPrice,
    bookingId,
  } = booking;

  const formattedDate = new Date(event.date).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =====================================================
          FULL SCREEN SUCCESS
      ====================================================== */}

      <section className="relative flex min-h-[calc(100vh-68px)] items-center justify-center overflow-hidden border-b border-slate-200 bg-white px-5 py-16">
        {/* Background decoration */}

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-50 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
          {/* Success Icon */}

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/60">
            <CheckCircle2
              size={48}
              strokeWidth={2}
              className="text-green-500"
            />
          </div>

          {/* Label */}

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-green-600 sm:text-sm">
            Booking Confirmed
          </p>

          {/* Main Heading */}

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            You're going to the event!
          </h1>

          {/* Description */}

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Your booking has been successfully created.
            Your tickets are confirmed and ready for the event.
          </p>

          {/* Booking ID Card */}

          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-green-200 bg-green-50/80 p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-600">
              Booking ID
            </p>

            <p className="mt-3 font-mono text-2xl font-bold tracking-wider text-slate-900 sm:text-3xl">
              {bookingId}
            </p>

            <div className="mx-auto mt-4 h-px w-20 bg-green-200" />

            <p className="mt-4 text-xs leading-5 text-slate-500 sm:text-sm">
              Keep this ID safe. You may need it when checking
              your booking or at the event.
            </p>
          </div>

          {/* Quick Event Info */}

          <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} className="text-orange-500" />
              {formattedDate}
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock3 size={16} className="text-blue-500" />
              {event.time}
            </span>

            <span className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-green-500" />
              {event.city}
            </span>
          </div>

          {/* Scroll Indicator */}

          <div className="mt-12 flex flex-col items-center text-slate-400">
            <span className="text-xs font-medium">
              View booking details
            </span>

            <ArrowDown
              size={18}
              className="mt-2 animate-bounce"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          BOOKING DETAILS
      ====================================================== */}

      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
            Your booking
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Booking details
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Everything you need for your upcoming event.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* =================================================
              EVENT DETAILS
          ================================================== */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img
              src={event.image}
              alt={event.title}
              className="h-64 w-full object-cover sm:h-80"
            />

            <div className="p-6 sm:p-8">
              <span className="inline-flex rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
                {event.category}
              </span>

              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                {event.title}
              </h3>

              {/* Date */}

              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <CalendarDays size={20} />
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

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Clock3 size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {event.time} – {event.endTime}
                    </p>
                  </div>
                </div>

                {/* Location */}

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {event.location}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {event.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              BOOKING SUMMARY
          ================================================== */}

          <aside className="space-y-6">
            {/* Attendee */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <User
                    size={19}
                    className="text-slate-600"
                  />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Attendee
                  </p>

                  <p className="text-sm font-semibold text-slate-900">
                    {attendee.name}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Booking summary
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Tickets
                    </span>

                    <span className="font-semibold text-slate-900">
                      {ticketCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Price per ticket
                    </span>

                    <span className="font-semibold text-slate-900">
                      ₹{event.price}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        Total paid
                      </span>

                      <span className="text-2xl font-bold text-slate-900">
                        ₹{totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email */}

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs leading-5 text-slate-500">
                  Booking confirmation
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                  {attendee.email}
                </p>
              </div>
            </div>

            {/* Actions */}

            <div className="grid gap-3">
              <Link
                to={`/events/${event.id}`}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold !text-white transition hover:bg-slate-800"
              >
                View event
              </Link>

              <Link
                to="/events"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                Browse more events
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default BookingConfirmation;