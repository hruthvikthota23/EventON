import { Link, useLocation } from "react-router-dom";
import {
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

  // ---------------------------------------------------------
  // FALLBACK
  // ---------------------------------------------------------

  if (!booking) {
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
              Booking not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              We couldn't find the booking information.
              Please return to the events page and try
              again.
            </p>

            <Link
              to="/events"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
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

  const formattedDate = new Date(
    event.date
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =====================================================
          SUCCESS HEADER
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-12 text-center sm:px-8 lg:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2
              size={34}
              className="text-green-500"
            />
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-green-600">
            Booking confirmed
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            You're going to the event!
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Your booking has been successfully created.
            Keep your booking ID for future reference.
          </p>
        </div>
      </section>

      {/* =====================================================
          CONFIRMATION CONTENT
      ====================================================== */}

      <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        {/* Booking ID */}

        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                Booking ID
              </p>

              <p className="mt-1 font-mono text-lg font-bold tracking-wide text-slate-900">
                {bookingId}
              </p>
            </div>

            <p className="text-xs text-slate-500">
              Present this ID at the event if required.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* =================================================
              EVENT DETAILS
          ================================================== */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <img
              src={event.image}
              alt={event.title}
              className="h-56 w-full object-cover sm:h-72"
            />

            <div className="p-6 sm:p-8">
              <span className="inline-flex rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
                {event.category}
              </span>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                {event.title}
              </h2>

              {/* Event Information */}

              <div className="mt-7 space-y-5">
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

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Clock3 size={19} />
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

                    <p className="mt-0.5 text-sm text-slate-500">
                      {event.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              BOOKING DETAILS
          ================================================== */}

          <aside>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <User
                    size={18}
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
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Booking details
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

                      <span className="text-xl font-bold text-slate-900">
                        ₹{totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs leading-5 text-slate-500">
                  A confirmation email would normally be
                  sent to:
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {attendee.email}
                </p>
              </div>
            </div>

            {/* Actions */}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link
                to="/events"
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold !text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
                <ArrowLeft
                size={17}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />

                <span>Browse more events</span>
            </Link>

            <Link
                to={`/events/${event.id}`}
                className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
            >
                View event
            </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default BookingConfirmation;