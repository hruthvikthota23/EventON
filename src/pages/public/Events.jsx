import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
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

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function isPublished(event) {
  return normalize(event?.status || "published") === "published";
}

function Events() {
  const [searchParams, setSearchParams] = useSearchParams();

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

  const [sortBy, setSortBy] = useState("date-asc");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [storedEvents, setStoredEvents] = useState(() => {
    try {
      const events = getStoredEvents();
      return Array.isArray(events) ? events : [];
    } catch (error) {
      console.error("EventON: unable to load events.", error);
      return [];
    }
  });

  useEffect(() => {
    const refreshEvents = () => {
      try {
        const events = getStoredEvents();
        setStoredEvents(Array.isArray(events) ? events : []);
      } catch (error) {
        console.error("EventON: unable to refresh events.", error);
      }
    };

    window.addEventListener(EVENTS_UPDATED_EVENT, refreshEvents);
    window.addEventListener("storage", refreshEvents);

    return () => {
      window.removeEventListener(EVENTS_UPDATED_EVENT, refreshEvents);
      window.removeEventListener("storage", refreshEvents);
    };
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedLocation(searchParams.get("location") || "");
    setSelectedDate(searchParams.get("date") || "all");
  }, [searchParams]);

  const publicEvents = useMemo(
    () => storedEvents.filter(isPublished),
    [storedEvents]
  );

  const locations = useMemo(() => {
    return [
      ...new Set(
        publicEvents
          .map((event) => String(event.city || "").trim())
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [publicEvents]);

  const selectedCategoryName = useMemo(() => {
    const selected = normalize(selectedCategory);

    return eventCategories.find(
      (category) =>
        normalize(category.slug) === selected ||
        normalize(category.name) === selected
    )?.name;
  }, [selectedCategory]);

  const filteredEvents = useMemo(() => {
    const query = normalize(searchQuery);
    const category = normalize(selectedCategory);
    const location = normalize(selectedLocation);

    return [...publicEvents]
      .filter((event) => {
        if (!query) {
          return true;
        }

        const searchableText = [
          event.title,
          event.description,
          event.organizer,
          event.location,
          event.city,
          event.category,
          event.categorySlug,
        ]
          .filter(Boolean)
          .map(normalize)
          .join(" ");

        return searchableText.includes(query);
      })

      .filter((event) => {
        if (!category) {
          return true;
        }

        return (
          normalize(event.categorySlug) === category ||
          normalize(event.category) === category ||
          normalize(event.category) === normalize(selectedCategoryName)
        );
      })

      .filter((event) => {
        if (!location) {
          return true;
        }

        return (
          normalize(event.city).includes(location) ||
          normalize(event.location).includes(location)
        );
      })

      .filter((event) => {
        if (
          selectedDate !== "today" &&
          selectedDate !== "week" &&
          selectedDate !== "month" &&
          selectedDate !== "upcoming"
        ) {
          return true;
        }

        const timestamp = getEventTimestamp(event);

        if (!Number.isFinite(timestamp)) {
          return false;
        }

        const eventDate = new Date(timestamp);
        const today = new Date();

        eventDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (selectedDate === "today") {
          return eventDate.getTime() === today.getTime();
        }

        if (selectedDate === "upcoming") {
          return timestamp >= Date.now();
        }

        if (selectedDate === "week") {
          const day = today.getDay();
          const daysFromMonday = day === 0 ? 6 : day - 1;

          const monday = new Date(today);
          monday.setDate(today.getDate() - daysFromMonday);
          monday.setHours(0, 0, 0, 0);

          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          sunday.setHours(23, 59, 59, 999);

          return eventDate >= monday && eventDate <= sunday;
        }

        if (selectedDate === "month") {
          return (
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear()
          );
        }

        return true;
      })

      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return getEventTimestamp(b) - getEventTimestamp(a);
        }

        if (sortBy === "price-asc") {
          return Number(a.price) - Number(b.price);
        }

        if (sortBy === "price-desc") {
          return Number(b.price) - Number(a.price);
        }

        return getEventTimestamp(a) - getEventTimestamp(b);
      });
  }, [
    publicEvents,
    searchQuery,
    selectedCategory,
    selectedCategoryName,
    selectedLocation,
    selectedDate,
    sortBy,
  ]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (!value || value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
    setIsMobileFiltersOpen(false);
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    Boolean(selectedCategory) ||
    Boolean(selectedLocation) ||
    selectedDate !== "all";

  const selectClass =
    "h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            Explore EventON
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Discover events worth attending.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Search by event, category, city, location, or date and find
            published events available on EventON.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm lg:grid lg:grid-cols-[minmax(280px,1fr)_210px_210px_210px] lg:gap-2">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchQuery(value);
                  updateFilter("search", value);
                }}
                placeholder="Search events..."
                aria-label="Search events"
                className="h-12 w-full rounded-xl border border-transparent bg-white pl-11 pr-10 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => updateFilter("search", "")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="relative">
              <MapPin
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={selectedLocation}
                onChange={(event) =>
                  updateFilter("location", event.target.value)
                }
                placeholder="Any city or location"
                aria-label="Filter by location"
                className={selectClass}
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedCategory}
                onChange={(event) =>
                  updateFilter("category", event.target.value)
                }
                className={selectClass}
                aria-label="Filter by category"
              >
                <option value="">All categories</option>

                {eventCategories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedDate}
                onChange={(event) =>
                  updateFilter("date", event.target.value)
                }
                className={selectClass}
                aria-label="Filter by date"
              >
                <option value="all">All dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div className="lg:hidden">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchQuery(value);
                  updateFilter("search", value);
                }}
                placeholder="Search events..."
                aria-label="Search events"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm text-slate-900 outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => updateFilter("search", "")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setIsMobileFiltersOpen((current) => !current)
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <SlidersHorizontal size={17} />
                Filters
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  aria-label="Sort events"
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="date-asc">Soonest</option>
                  <option value="date-desc">Latest</option>
                  <option value="price-asc">Price: Low</option>
                  <option value="price-desc">Price: High</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {isMobileFiltersOpen && (
              <div className="mt-3 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={(event) =>
                    updateFilter("location", event.target.value)
                  }
                  placeholder="City or location"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    updateFilter("category", event.target.value)
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="">All categories</option>

                  {eventCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDate}
                  onChange={(event) =>
                    updateFilter("date", event.target.value)
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="all">All dates</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                </select>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-11 rounded-xl bg-slate-900 text-sm font-semibold text-white"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {searchQuery && (
                <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                  Search: {searchQuery}
                </span>
              )}

              {selectedCategory && (
                <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                  Category: {selectedCategoryName || selectedCategory}
                </span>
              )}

              {selectedLocation && (
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  Location: {selectedLocation}
                </span>
              )}

              {selectedDate !== "all" && (
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold capitalize text-emerald-700">
                  Date: {selectedDate}
                </span>
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-bold text-slate-500 hover:text-orange-600"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-500">
              {filteredEvents.length.toLocaleString("en-IN")}{" "}
              {filteredEvents.length === 1 ? "event" : "events"}
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {hasActiveFilters ? "Matching events" : "All published events"}
            </h2>
          </div>

          <div className="relative w-full sm:w-52">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              aria-label="Sort events"
            >
              <option value="date-asc">Soonest first</option>
              <option value="date-desc">Latest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Search size={25} className="text-slate-400" />
            </div>

            <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">
              No events found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              No published events match your current search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Events;
