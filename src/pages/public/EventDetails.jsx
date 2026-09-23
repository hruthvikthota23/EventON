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
  getEventById,
  getAvailableSeats,
  isEventSoldOut,
} from "../../data/events";

function EventDetails() {
  const { id } = useParams();

  const event = getEventById(id);

  // Event not found
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
              The event you're looking for doesn't exist or
              may have been removed.
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

  const availableSeats = getAvailableSeats(event);
  const soldOut = isEventSoldOut(event);

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
        <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-12">
            {/* Event Image */}

            <div className="relative overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={event.image}
                alt={event.title}
                className="aspect-[16/10] h-full w-full object-cover"
              />

              {/* Category */}

              <div className="absolute left-4 top-4">
                <span className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
                  {event.category}
                </span>
              </div>

              {/* Sold Out */}

              {soldOut && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55">
                  <span className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Event Summary */}

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

              {/* Event Information */}

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
                      {event.time} – {event.endTime}
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

                    <p className="mt-0.5 text-sm text-slate-500">
                      {event.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organizer */}

              <div className="mt-7 border-t border-slate-200 pt-6">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Organized by
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {event.organizer}
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
            {/* About Event */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">
                About this event
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                {event.description}
              </p>

              {/* Event highlights */}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
                        {event.capacity} attendees
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={19}
                      className={
                        soldOut
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Availability
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {soldOut
                          ? "Sold out"
                          : `${availableSeats} seats left`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Card */}

            <aside className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Tickets
                </p>

                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <span className="text-3xl font-bold text-slate-900">
                      ₹{event.price}
                    </span>

                    <span className="ml-1 text-sm text-slate-500">
                      / person
                    </span>
                  </div>

                  {!soldOut && (
                    <span className="text-xs font-semibold text-green-600">
                      {availableSeats} left
                    </span>
                  )}
                </div>

                <div className="my-6 border-t border-slate-200" />

                {/* Booking Button */}

                {soldOut ? (
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
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100"
                  >
                    Book Tickets
                  </Link>
                )}

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  Secure your spot before tickets run out.
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