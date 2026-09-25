import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import CategorySection from "../../components/events/CategorySection";
import FeaturedEvents from "../../components/events/FeaturedEvents";
import UpcomingEvents from "../../components/events/UpcomingEvents";
import WhyEventON from "../../components/home/WhyEventON";
import OrganizerCTA from "../../components/home/OrganizerCTA";

import {
  getStoredEvents,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

import {
  getStoredBookings,
  BOOKINGS_UPDATED_EVENT,
} from "../../utils/bookingStorage";

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function isPublished(event) {
  return normalize(event?.status || "published") === "published";
}

function isActiveBooking(booking) {
  const status = normalize(booking?.status || "confirmed");

  return (
    status !== "cancelled" &&
    status !== "canceled"
  );
}

function Home() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);

  // =========================================================
  // LOAD REAL EVENTON DATA
  // =========================================================

  useEffect(() => {
    const loadHomeData = () => {
      try {
        const storedEvents = getStoredEvents();
        setEvents(
          Array.isArray(storedEvents)
            ? storedEvents
            : []
        );
      } catch (error) {
        console.error(
          "EventON: unable to load events.",
          error
        );
        setEvents([]);
      }

      try {
        const storedBookings = getStoredBookings();
        setBookings(
          Array.isArray(storedBookings)
            ? storedBookings
            : []
        );
      } catch (error) {
        console.error(
          "EventON: unable to load bookings.",
          error
        );
        setBookings([]);
      }
    };

    loadHomeData();

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      loadHomeData
    );

    window.addEventListener(
      BOOKINGS_UPDATED_EVENT,
      loadHomeData
    );

    window.addEventListener(
      "storage",
      loadHomeData
    );

    return () => {
      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        loadHomeData
      );

      window.removeEventListener(
        BOOKINGS_UPDATED_EVENT,
        loadHomeData
      );

      window.removeEventListener(
        "storage",
        loadHomeData
      );
    };
  }, []);

  // =========================================================
  // REAL PUBLIC EVENTS
  // =========================================================

  const publishedEvents = useMemo(() => {
    return events.filter(isPublished);
  }, [events]);

  // =========================================================
  // REAL EVENT COUNT
  // =========================================================

  const eventCount = publishedEvents.length;

  // =========================================================
  // REAL LOCATION COUNT
  //
  // Count unique cities first. If an event has no city,
  // fall back to its venue/location.
  // =========================================================

  const locationCount = useMemo(() => {
    const uniqueLocations = new Set();

    publishedEvents.forEach((event) => {
      const city = String(event?.city || "").trim();
      const location = String(event?.location || "").trim();

      if (city) {
        uniqueLocations.add(normalize(city));
        return;
      }

      if (location) {
        uniqueLocations.add(normalize(location));
      }
    });

    return uniqueLocations.size;
  }, [publishedEvents]);

  // =========================================================
  // REAL ATTENDEE COUNT
  //
  // Count unique active attendees from booking records.
  // Supports both current attendeeId/email fields and
  // legacy attendee objects.
  // =========================================================

  const attendeeCount = useMemo(() => {
    const attendeeKeys = new Set();

    bookings
      .filter(isActiveBooking)
      .forEach((booking) => {
        const attendeeId =
          booking?.attendeeId ||
          booking?.userId ||
          booking?.user?.id ||
          booking?.attendee?.id;

        const attendeeEmail =
          booking?.attendeeEmail ||
          booking?.email ||
          booking?.user?.email ||
          booking?.attendee?.email;

        const key = normalize(
          attendeeId || attendeeEmail
        );

        if (key) {
          attendeeKeys.add(key);
        }
      });

    return attendeeKeys.size;
  }, [bookings]);

  // =========================================================
  // HERO SEARCH
  // =========================================================

  const handleSearch = (event) => {
    event.preventDefault();

    const search = searchQuery.trim();
    const location = locationQuery.trim();

    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    if (location) {
      params.set("location", location);
    }

    navigate(
      params.toString()
        ? `/events?${params.toString()}`
        : "/events"
    );
  };

  return (
    <main className="bg-white">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#070b14]">

        {/* Background Glow */}

        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="pointer-events-none absolute right-0 top-0 h-[350px] w-[350px] rounded-full bg-orange-400/5 blur-[100px]" />

        {/* Hero Container */}

        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-32">

          {/* Hero Content */}

          <div className="mx-auto w-full max-w-4xl text-center">

            {/* Badge */}

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Discover events happening around you
            </div>

            {/* Heading */}

            <h1 className="mt-8 text-5xl font-extrabold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Discover.
              <span className="text-orange-500">
                {" "}Connect.
              </span>
              <br />
              Experience.
            </h1>

            {/* Description */}

            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
              Find conferences, workshops, concerts,
              meetups, sports events, and experiences
              worth showing up for.
            </p>

            {/* =================================================
                REAL SEARCH
            ================================================== */}

            <form
              onSubmit={handleSearch}
              className="mx-auto mt-10 w-full max-w-4xl rounded-2xl border border-white/10 bg-white p-2 shadow-2xl"
            >

              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">

                {/* Event Search */}

                <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-50">

                  <Search
                    size={20}
                    className="shrink-0 text-gray-400"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      What are you looking for?
                    </p>

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(
                          event.target.value
                        )
                      }
                      placeholder="Search events"
                      aria-label="Search events"
                      autoComplete="off"
                      className="mt-1 w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
                    />

                  </div>

                </div>

                {/* Location Search */}

                <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-50">

                  <MapPin
                    size={20}
                    className="shrink-0 text-gray-400"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Where
                    </p>

                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(event) =>
                        setLocationQuery(
                          event.target.value
                        )
                      }
                      placeholder="City or location"
                      aria-label="Search by city or location"
                      autoComplete="off"
                      className="mt-1 w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
                    />

                  </div>

                </div>

                {/* Search Button */}

                <button
                  type="submit"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 text-sm font-bold text-white transition hover:bg-orange-600 active:scale-[0.98]"
                >
                  <Search size={18} />
                  Search
                </button>

              </div>

            </form>

            {/* Browse */}

            <Link
              to="/events"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-white"
            >
              Browse all events
              <ArrowRight size={16} />
            </Link>

          </div>

          {/* =================================================
              REAL STATS
          ================================================== */}

          <div className="mx-auto mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">

            {/* Events */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm transition hover:border-orange-500/30 hover:bg-white/[0.06]">

              <CalendarDays
                size={23}
                className="mx-auto text-orange-500"
              />

              <p className="mt-4 text-2xl font-bold text-white">
                {eventCount.toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Published Events
              </p>

            </div>

            {/* Locations */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm transition hover:border-orange-500/30 hover:bg-white/[0.06]">

              <MapPin
                size={23}
                className="mx-auto text-orange-500"
              />

              <p className="mt-4 text-2xl font-bold text-white">
                {locationCount.toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Locations
              </p>

            </div>

            {/* Attendees */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm transition hover:border-orange-500/30 hover:bg-white/[0.06]">

              <Users
                size={23}
                className="mx-auto text-orange-500"
              />

              <p className="mt-4 text-2xl font-bold text-white">
                {attendeeCount.toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Active Attendees
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          OTHER HOME SECTIONS
      ====================================================== */}

      <CategorySection />

      <FeaturedEvents />

      <UpcomingEvents />

      <WhyEventON />

      <OrganizerCTA />

    </main>
  );
}

export default Home;
