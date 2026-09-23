import { ArrowRight, CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import EventCard from "./EventCard";
import { events } from "../../data/events";

function UpcomingEvents() {
  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">

        {/* Section Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-500">
              <CalendarClock size={16} />
              Coming Up
            </div>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Upcoming events
            </h2>

            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-500">
              Plan ahead and find your next event before the
              tickets run out.
            </p>
          </div>

          <Link
            to="/events"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-orange-500"
          >
            Explore all events

            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Events */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {upcomingEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-orange-200 hover:text-orange-500 hover:shadow-md"
          >
            Browse all events
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default UpcomingEvents;