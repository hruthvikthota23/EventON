import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronsDown,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import EventCard from "../../components/events/EventCard";
import { eventCategories } from "../../data/events";
import {
  getStoredEvents,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

/* =========================================================
   HELPERS
========================================================= */

const getEventTimestamp = (event) => {
  if (!event?.date) return 0;

  const dateString = String(event.date).trim();

  let timestamp = 0;

  // Parse YYYY-MM-DD locally to avoid UTC date shifting
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);

    timestamp = new Date(
      year,
      month - 1,
      day
    ).getTime();
  } else {
    timestamp = new Date(dateString).getTime();
  }

  if (Number.isNaN(timestamp)) return 0;

  /*
    Parse event time when available.
    Supports:
    10:30 AM
    7:00 PM
    10:30
  */
  if (event.time) {
    const timeValue = String(event.time).trim();

    const timeMatch = timeValue.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
    );

    if (timeMatch) {
      let hours = Number(timeMatch[1]);
      const minutes = Number(timeMatch[2]);
      const meridiem = timeMatch[3]?.toUpperCase();

      if (meridiem === "PM" && hours !== 12) {
        hours += 12;
      }

      if (meridiem === "AM" && hours === 12) {
        hours = 0;
      }

      const baseDate = new Date(timestamp);

      baseDate.setHours(hours, minutes, 0, 0);

      return baseDate.getTime();
    }
  }

  return timestamp;
};

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const isPubliclyVisibleStatus = (event) => {
  const status = normalize(event?.status);

  return status === "published" || status === "sold-out";
};

const isEventCompleted = (event, currentTime) => {
  const eventTime = getEventTimestamp(event);

  if (!eventTime) return false;

  return eventTime < currentTime;
};

/* =========================================================
   COMPONENT
========================================================= */

function Events() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentTime, setCurrentTime] = useState(Date.now());

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  const [selectedLocation, setSelectedLocation] = useState(
    searchParams.get("location") || ""
  );

  const [selectedDate, setSelectedDate] = useState(
    searchParams.get("date") || "all"
  );

  const [sortBy, setSortBy] = useState(
    searchParams.get("sort") || "date-asc"
  );

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] =
    useState(false);

  const [storedEvents, setStoredEvents] = useState(() =>
    getStoredEvents()
  );

  /* =========================================================
     REFRESH EVENTS
  ========================================================= */

  useEffect(() => {
    const refreshEvents = () => {
      setStoredEvents(getStoredEvents());
    };

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      refreshEvents
    );

    window.addEventListener("storage", refreshEvents);

    return () => {
      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        refreshEvents
      );

      window.removeEventListener("storage", refreshEvents);
    };
  }, []);

  /* =========================================================
     SYNC URL FILTERS
  ========================================================= */

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedLocation(searchParams.get("location") || "");
    setSelectedDate(searchParams.get("date") || "all");
    setSortBy(searchParams.get("sort") || "date-asc");
  }, [searchParams]);

  /* =========================================================
     CURRENT TIME
  ========================================================= */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 60 * 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* =========================================================
     PUBLIC EVENTS
  ========================================================= */

  const publicEvents = useMemo(() => {
    return storedEvents.filter((event) => {
      // Only published and sold-out events are public
      if (!isPubliclyVisibleStatus(event)) {
        return false;
      }

      // Hide completed events
      if (isEventCompleted(event, currentTime)) {
        return false;
      }

      return true;
    });
  }, [storedEvents, currentTime]);

  /* =========================================================
     CATEGORY NAME
  ========================================================= */

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return "";

    const category = eventCategories.find((item) => {
      return (
        normalize(item.slug) === normalize(selectedCategory) ||
        normalize(item.name) === normalize(selectedCategory)
      );
    });

    return category?.name || selectedCategory;
  }, [selectedCategory]);

  /* =========================================================
     FILTER + SORT
  ========================================================= */

  const filteredEvents = useMemo(() => {
    const normalizedSearch = normalize(searchQuery);
    const normalizedLocation = normalize(selectedLocation);
    const normalizedCategory = normalize(selectedCategory);

    const now = new Date(currentTime);

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const endOfWeek = new Date(startOfToday);

    endOfWeek.setDate(
      endOfWeek.getDate() + (7 - endOfWeek.getDay())
    );

    endOfWeek.setHours(23, 59, 59, 999);

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const filtered = publicEvents.filter((event) => {
      /* -----------------------------------------------------
         SEARCH
      ----------------------------------------------------- */

      if (normalizedSearch) {
        const searchableText = [
          event.title,
          event.description,
          event.organizer,
          event.organizerName,
          event.location,
          event.city,
          event.category,
          event.categorySlug,
        ]
          .map(normalize)
          .join(" ");

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      /* -----------------------------------------------------
         CATEGORY
      ----------------------------------------------------- */

      if (normalizedCategory) {
        const eventCategory = normalize(event.category);
        const eventCategorySlug = normalize(
          event.categorySlug
        );

        if (
          eventCategory !== normalizedCategory &&
          eventCategorySlug !== normalizedCategory
        ) {
          return false;
        }
      }

      /* -----------------------------------------------------
         LOCATION
      ----------------------------------------------------- */

      if (normalizedLocation) {
        const eventCity = normalize(event.city);
        const eventLocation = normalize(event.location);

        if (
          !eventCity.includes(normalizedLocation) &&
          !eventLocation.includes(normalizedLocation)
        ) {
          return false;
        }
      }

      /* -----------------------------------------------------
         DATE
      ----------------------------------------------------- */

      const eventTimestamp = getEventTimestamp(event);

      if (!eventTimestamp) {
        return false;
      }

      const eventDate = new Date(eventTimestamp);

      if (selectedDate === "today") {
        if (
          eventDate < startOfToday ||
          eventDate > endOfToday
        ) {
          return false;
        }
      }

      if (selectedDate === "week") {
        if (
          eventDate < startOfToday ||
          eventDate > endOfWeek
        ) {
          return false;
        }
      }

      if (selectedDate === "month") {
        if (
          eventDate < startOfToday ||
          eventDate > endOfMonth
        ) {
          return false;
        }
      }

      if (selectedDate === "upcoming") {
        if (eventTimestamp < currentTime) {
          return false;
        }
      }

      return true;
    });

    /* -------------------------------------------------------
       SORT
    ------------------------------------------------------- */

    return [...filtered].sort((a, b) => {
      const timestampA = getEventTimestamp(a);
      const timestampB = getEventTimestamp(b);

      if (sortBy === "date-desc") {
        return timestampB - timestampA;
      }

      if (sortBy === "price-asc") {
        return (
          Number(a.price || a.ticketPrice || 0) -
          Number(b.price || b.ticketPrice || 0)
        );
      }

      if (sortBy === "price-desc") {
        return (
          Number(b.price || b.ticketPrice || 0) -
          Number(a.price || a.ticketPrice || 0)
        );
      }

      return timestampA - timestampB;
    });
  }, [
    publicEvents,
    searchQuery,
    selectedCategory,
    selectedLocation,
    selectedDate,
    sortBy,
    currentTime,
  ]);

  /* =========================================================
     UPDATE FILTER
  ========================================================= */

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    setSearchParams(params);
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLocation("");
    setSelectedDate("all");
    setSortBy("date-asc");

    setSearchParams({});
  };

  /* =========================================================
     SCROLL TO SEARCH
  ========================================================= */

  const scrollToSearch = () => {
    const searchSection =
      document.getElementById("event-search");

    if (!searchSection) return;

    /*
      Navbar height is approximately 64px.
      Keep the search section directly below it.
    */

    const navbarOffset = 64;

    const targetPosition =
      searchSection.getBoundingClientRect().top +
      window.scrollY -
      navbarOffset;

    window.scrollTo({
      top: Math.max(targetPosition, 0),
      behavior: "smooth",
    });
  };

  /* =========================================================
     ACTIVE FILTERS
  ========================================================= */

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCategory) ||
    Boolean(selectedLocation) ||
    selectedDate !== "all";

  /* =========================================================
     SELECT STYLES
  ========================================================= */

  const selectClass =
    "h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10";

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-white">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden bg-[#070b14]">
        {/* Background glows */}

        <div className="pointer-events-none absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="pointer-events-none absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="pointer-events-none absolute right-[20%] top-[20%] h-32 w-32 rounded-full bg-orange-500/5 blur-3xl" />

        {/* Hero content */}

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-4xl">
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Explore EventON
            </p>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Discover events
              <br />

              <span className="text-orange-500">
                worth attending.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Find conferences, workshops, concerts, meetups,
              sports events, and experiences happening around
              you.
            </p>
          </div>
        </div>

        {/* =================================================
            EXPLORE EVENTS BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={scrollToSearch}
          aria-label="Explore events"
          className="group absolute bottom-7 left-1/2 z-20 -translate-x-1/2"
        >
          <span
            className="
              flex items-center gap-3
              rounded-full
              border border-white/15
              bg-white/[0.06]
              px-5 py-2.5
              text-xs font-semibold uppercase
              tracking-[0.18em]
              text-slate-300
              shadow-lg shadow-black/20
              backdrop-blur-md
              transition-all duration-300
              hover:border-orange-400/40
              hover:bg-white/10
              hover:text-white
              hover:shadow-orange-500/10
            "
          >
            <span>Explore Events</span>

            <span
              className="
                flex h-7 w-7 items-center justify-center
                rounded-full
                border border-white/20
                bg-white/5
                transition-all duration-300
                group-hover:border-orange-400/50
                group-hover:bg-orange-500/10
              "
            >
              <ChevronsDown
                size={17}
                strokeWidth={2}
                className="
                  text-slate-300
                  transition-all duration-300
                  group-hover:translate-y-0.5
                  group-hover:text-orange-400
                "
              />
            </span>
          </span>
        </button>
      </section>

      {/* =====================================================
          SEARCH + FILTERS
      ===================================================== */}

      <section
        id="event-search"
        className="border-b border-slate-200 bg-white"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* =================================================
              DESKTOP SEARCH
          ================================================= */}

          <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm md:block">
            <div className="grid grid-cols-12 gap-2">
              {/* Search */}

              <div className="relative col-span-5">
                <Search
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSearchQuery(value);
                    updateFilter("search", value);
                  }}
                  placeholder="Search events..."
                  className="
                    h-12 w-full rounded-xl
                    border border-slate-200
                    bg-white pl-11 pr-4
                    text-sm text-slate-700
                    outline-none transition
                    placeholder:text-slate-400
                    focus:border-orange-400
                    focus:ring-4
                    focus:ring-orange-500/10
                  "
                />
              </div>

              {/* Location */}

              <div className="relative col-span-3">
                <MapPin
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={selectedLocation}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedLocation(value);
                    updateFilter("location", value);
                  }}
                  placeholder="Any city or location"
                  className="
                    h-12 w-full rounded-xl
                    border border-slate-200
                    bg-white pl-11 pr-4
                    text-sm text-slate-700
                    outline-none transition
                    placeholder:text-slate-400
                    focus:border-orange-400
                    focus:ring-4
                    focus:ring-orange-500/10
                  "
                />
              </div>

              {/* Category */}

              <div className="relative col-span-2">
                <SlidersHorizontal
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedCategory(value);
                    updateFilter("category", value);
                  }}
                  className={`${selectClass} pl-11`}
                >
                  <option value="">
                    All categories
                  </option>

                  {eventCategories.map((category) => (
                    <option
                      key={category.slug || category.name}
                      value={
                        category.slug || category.name
                      }
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {/* Date */}

              <div className="relative col-span-2">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={selectedDate}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedDate(value);
                    updateFilter("date", value);
                  }}
                  className={`${selectClass} pl-11`}
                >
                  <option value="all">
                    All dates
                  </option>

                  <option value="today">
                    Today
                  </option>

                  <option value="week">
                    This week
                  </option>

                  <option value="month">
                    This month
                  </option>

                  <option value="upcoming">
                    Upcoming
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* =================================================
              MOBILE SEARCH
          ================================================= */}

          <div className="md:hidden">
            <div className="flex gap-2">
              {/* Search */}

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSearchQuery(value);
                    updateFilter("search", value);
                  }}
                  placeholder="Search events..."
                  className="
                    h-12 w-full rounded-xl
                    border border-slate-200
                    bg-slate-50 pl-11 pr-4
                    text-sm outline-none transition
                    focus:border-orange-400
                    focus:ring-4
                    focus:ring-orange-500/10
                  "
                />
              </div>

              {/* Filter button */}

              <button
                type="button"
                onClick={() =>
                  setIsMobileFiltersOpen(
                    (prev) => !prev
                  )
                }
                className="
                  flex h-12 w-12 shrink-0
                  items-center justify-center
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  text-slate-600
                  transition
                  hover:border-orange-300
                  hover:bg-orange-50
                  hover:text-orange-600
                "
                aria-label="Open filters"
              >
                <SlidersHorizontal size={19} />
              </button>
            </div>

            {/* Mobile filters */}

            {isMobileFiltersOpen && (
              <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {/* Location */}

                <div className="relative">
                  <MapPin
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={selectedLocation}
                    onChange={(e) => {
                      const value = e.target.value;

                      setSelectedLocation(value);
                      updateFilter("location", value);
                    }}
                    placeholder="Any city or location"
                    className="
                      h-12 w-full rounded-xl
                      border border-slate-200
                      bg-white pl-11 pr-4
                      text-sm outline-none
                      focus:border-orange-400
                      focus:ring-4
                      focus:ring-orange-500/10
                    "
                  />
                </div>

                {/* Category */}

                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const value = e.target.value;

                      setSelectedCategory(value);
                      updateFilter("category", value);
                    }}
                    className={selectClass}
                  >
                    <option value="">
                      All categories
                    </option>

                    {eventCategories.map((category) => (
                      <option
                        key={category.slug || category.name}
                        value={
                          category.slug || category.name
                        }
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* Date */}

                <div className="relative">
                  <select
                    value={selectedDate}
                    onChange={(e) => {
                      const value = e.target.value;

                      setSelectedDate(value);
                      updateFilter("date", value);
                    }}
                    className={selectClass}
                  >
                    <option value="all">
                      All dates
                    </option>

                    <option value="today">
                      Today
                    </option>

                    <option value="week">
                      This week
                    </option>

                    <option value="month">
                      This month
                    </option>

                    <option value="upcoming">
                      Upcoming
                    </option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          EVENTS SECTION
      ===================================================== */}

      <section className="bg-slate-50 py-10 sm:py-12 lg:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* =================================================
              EVENTS HEADER
          ================================================= */}

          <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-500">
                {selectedCategoryName ||
                  "EventON Events"}
              </p>

              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {hasActiveFilters
                  ? "Matching events"
                  : "Upcoming events"}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                {filteredEvents.length === 0
                  ? "No events match your current filters."
                  : `${filteredEvents.length} event${
                      filteredEvents.length === 1
                        ? ""
                        : "s"
                    } available to explore.`}
              </p>
            </div>

            {/* =================================================
                SORT
            ================================================= */}

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500">
                Sort by
              </span>

              <div className="relative min-w-[180px]">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSortBy(value);
                    updateFilter("sort", value);
                  }}
                  className="
                    h-11 w-full appearance-none
                    rounded-xl
                    border border-slate-200
                    bg-white px-4 pr-10
                    text-sm font-semibold
                    text-slate-700
                    outline-none transition
                    focus:border-orange-400
                    focus:ring-4
                    focus:ring-orange-500/10
                  "
                >
                  <option value="date-asc">
                    Date: Earliest
                  </option>

                  <option value="date-desc">
                    Date: Latest
                  </option>

                  <option value="price-asc">
                    Price: Low to High
                  </option>

                  <option value="price-desc">
                    Price: High to Low
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* =================================================
              ACTIVE FILTERS
          ================================================= */}

          {hasActiveFilters && (
            <div className="mb-7 flex flex-wrap items-center gap-2">
              {/* Search filter */}

              {searchQuery && (
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                  Search: {searchQuery}
                </span>
              )}

              {/* Location filter */}

              {selectedLocation && (
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                  Location: {selectedLocation}
                </span>
              )}

              {/* Category filter */}

              {selectedCategory && (
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                  Category:{" "}
                  {selectedCategoryName ||
                    selectedCategory}
                </span>
              )}

              {/* Date filter */}

              {selectedDate !== "all" && (
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold capitalize text-slate-600">
                  Date: {selectedDate}
                </span>
              )}

              {/* Clear filters */}

              <button
                type="button"
                onClick={clearFilters}
                className="
                  inline-flex items-center gap-1
                  rounded-full
                  px-3 py-1.5
                  text-xs font-bold
                  text-orange-600
                  transition
                  hover:bg-orange-50
                "
              >
                <X size={14} />
                Clear filters
              </button>
            </div>
          )}

          {/* =================================================
              EVENT GRID
          ================================================= */}

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))}
            </div>
          ) : (
            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <CalendarDays size={30} />
              </div>

              <h3 className="mt-6 text-2xl font-black text-slate-950">
                No events found
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Try changing your search or filters to find
                more events available on EventON.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    mt-7 inline-flex
                    items-center justify-center
                    rounded-xl
                    bg-orange-500
                    px-6 py-3
                    text-sm font-bold
                    text-white
                    shadow-lg
                    shadow-orange-500/20
                    transition
                    hover:bg-orange-600
                  "
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Events;