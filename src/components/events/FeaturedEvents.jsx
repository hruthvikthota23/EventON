import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import EventCard from "./EventCard";
import { getFeaturedEvents } from "../../data/events";

function FeaturedEvents() {
  const featuredEvents = getFeaturedEvents();

  return (
    <section className="bg-gray-50 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-500">
              <Sparkles size={16} />
              Featured
            </div>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Events worth showing up for
            </h2>

            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-500">
              Discover some of the most exciting upcoming events
              happening in the community.
            </p>
          </div>

          <Link
            to="/events"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-orange-500"
          >
            View all events

            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Event Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.slice(0, 6).map((event) => (
            <EventCard
              key={event.id}
              event={event}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedEvents;