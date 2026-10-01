import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  getStoredEvents,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

import {
  getStoredBookings,
  BOOKINGS_UPDATED_EVENT,
} from "../../utils/bookingStorage";

/* =========================================================
   HELPERS
========================================================= */

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

/* =========================================================
   HOME HERO
========================================================= */

function HomeHero() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);

  /* =======================================================
     LOAD REAL EVENTON DATA
  ======================================================= */

  useEffect(() => {
    const loadHomeData = () => {
      /* ---------------------------------------------------
         EVENTS
      --------------------------------------------------- */

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

      /* ---------------------------------------------------
         BOOKINGS
      --------------------------------------------------- */

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

    /* EventON custom events */

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      loadHomeData
    );

    window.addEventListener(
      BOOKINGS_UPDATED_EVENT,
      loadHomeData
    );

    /* Cross-tab localStorage updates */

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

  /* =======================================================
     PUBLISHED EVENTS
  ======================================================= */

  const publishedEvents = useMemo(() => {
    return events.filter(isPublished);
  }, [events]);

  /* =======================================================
     STAT 1
     PUBLISHED EVENTS
  ======================================================= */

  const publishedEventCount = publishedEvents.length;

  /* =======================================================
     STAT 2
     CITIES COVERED

     Count unique cities from published events.
  ======================================================= */

  const cityCount = useMemo(() => {
    const cities = new Set();

    publishedEvents.forEach((event) => {
      const city = String(
        event?.city || ""
      ).trim();

      if (city) {
        cities.add(normalize(city));
      }
    });

    return cities.size;
  }, [publishedEvents]);

  /* =======================================================
     STAT 3
     REGISTERED ATTENDEES

     Count unique attendees from active bookings.

     Supports:
     - attendeeId
     - userId
     - user.id
     - attendee.id
     - attendeeEmail
     - email
     - user.email
     - attendee.email
  ======================================================= */

  const attendeeCount = useMemo(() => {
    const attendees = new Set();

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

        const attendeeKey = normalize(
          attendeeId || attendeeEmail
        );

        if (attendeeKey) {
          attendees.add(attendeeKey);
        }
      });

    return attendees.size;
  }, [bookings]);

  /* =======================================================
     SEARCH
  ======================================================= */

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

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section className="relative overflow-hidden bg-[#070b14]">
      {/* =================================================
          BACKGROUND GLOW
      ================================================== */}

      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="pointer-events-none absolute right-0 top-0 h-[350px] w-[350px] rounded-full bg-orange-400/5 blur-[100px]" />

      {/* =================================================
          HERO CONTAINER
      ================================================== */}

      <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-32">
        {/* =================================================
            HERO CONTENT
        ================================================== */}

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
              {" "}
              Connect.
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
              SEARCH
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
                      setSearchQuery(event.target.value)
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
                      setLocationQuery(event.target.value)
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

          {/* Browse Events */}

          <Link
            to="/events"
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-white"
          >
            Browse all events
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* =================================================
            EVENTON PLATFORM STATS
        ================================================== */}

        <div className="mx-auto mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {/* =================================================
              PUBLISHED EVENTS
          ================================================== */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm transition hover:border-orange-500/30 hover:bg-white/[0.06]">
            <CalendarDays
              size={23}
              className="mx-auto text-orange-500"
            />

            <p className="mt-4 text-2xl font-bold text-white">
              {publishedEventCount.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Published Events
            </p>
          </div>

          {/* =================================================
              CITIES COVERED
          ================================================== */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm transition hover:border-orange-500/30 hover:bg-white/[0.06]">
            <MapPin
              size={23}
              className="mx-auto text-orange-500"
            />

            <p className="mt-4 text-2xl font-bold text-white">
              {cityCount.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Cities Covered
            </p>
          </div>

          {/* =================================================
              REGISTERED ATTENDEES
          ================================================== */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm transition hover:border-orange-500/30 hover:bg-white/[0.06]">
            <Users
              size={23}
              className="mx-auto text-orange-500"
            />

            <p className="mt-4 text-2xl font-bold text-white">
              {attendeeCount.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Registered Attendees
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;