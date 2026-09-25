import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import EventCard from "./EventCard";
import {
  getStoredEvents,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function isPublished(event) {
  return normalize(event?.status || "published") === "published";
}

function getEventTimestamp(event) {
  if (!event?.date) {
    return Number.POSITIVE_INFINITY;
  }

  const date = new Date(event.date);

  if (Number.isNaN(date.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  const time = String(event.time || "").trim();

  const match = time.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i
  );

  if (match) {
    let hours = Number(match[1]);
    const minutes = Number(match[2] || 0);
    const period = match[3]?.toUpperCase();

    if (period === "PM" && hours < 12) {
      hours += 12;
    }

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    if (
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    ) {
      date.setHours(hours, minutes, 0, 0);
    }
  }

  return date.getTime();
}

function FeaturedEvents() {
  const [events, setEvents] = useState([]);

  // =========================================================
  // LOAD REAL EVENTON EVENTS
  // =========================================================

  useEffect(() => {
    const loadEvents = () => {
      try {
        const storedEvents = getStoredEvents();

        setEvents(
          Array.isArray(storedEvents)
            ? storedEvents
            : []
        );
      } catch (error) {
        console.error(
          "EventON: unable to load featured events.",
          error
        );

        setEvents([]);
      }
    };

    loadEvents();

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      loadEvents
    );

    window.addEventListener(
      "storage",
      loadEvents
    );

    return () => {
      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        loadEvents
      );

      window.removeEventListener(
        "storage",
        loadEvents
      );
    };
  }, []);

  // =========================================================
  // REAL FEATURED EVENTS
  //
  // Rules:
  // 1. Published only
  // 2. featured === true
  // 3. Event must still be upcoming
  // 4. Soonest event first
  // 5. Maximum 6 cards
  // =========================================================

  const featuredEvents = useMemo(() => {
    const now = Date.now();

    return events
      .filter(isPublished)
      .filter((event) => {
        const timestamp = getEventTimestamp(event);

        return (
          Number.isFinite(timestamp) &&
          timestamp >= now
        );
      })
      .filter((event) => {
        return (
          event?.featured === true ||
          normalize(event?.featured) === "true"
        );
      })
      .sort(
        (a, b) =>
          getEventTimestamp(a) -
          getEventTimestamp(b)
      )
      .slice(0, 6);
  }, [events]);

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
              Discover upcoming events currently featured
              on EventON.
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

        {featuredEvents.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
              <Sparkles
                size={24}
                className="text-orange-500"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              No featured events yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Featured upcoming events will appear here
              when organizers publish them.
            </p>

            <Link
              to="/events"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600"
            >
              Browse all events
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}

export default FeaturedEvents;
