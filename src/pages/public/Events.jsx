import { useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import EventCard from "../../components/events/EventCard";
import { events, eventCategories } from "../../data/events";

function Events() {
  // =========================================================
  // STATE
  // =========================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");

  // Mobile filter bottom sheet
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] =
    useState(false);

  // =========================================================
  // DYNAMIC LOCATIONS
  // =========================================================

  const locations = useMemo(() => {
    return [
      ...new Set(
        events
          .map((event) => event.city)
          .filter(Boolean)
      ),
    ].sort();
  }, []);

  // =========================================================
  // SELECTED CATEGORY NAME
  // =========================================================

  const selectedCategoryName = eventCategories.find(
    (category) => category.slug === selectedCategory
  )?.name;

  // =========================================================
  // FILTER + SORT EVENTS
  // =========================================================

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...events]
      // -------------------------------------------------------
      // SEARCH
      // -------------------------------------------------------
      .filter((event) => {
        if (!query) return true;

        const searchableText = [
          event.title,
          event.description,
          event.organizer,
          event.location,
          event.city,
          event.category,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })

      // -------------------------------------------------------
      // CATEGORY
      // -------------------------------------------------------
      .filter((event) => {
        if (!selectedCategory) return true;

        return event.categorySlug === selectedCategory;
      })

      // -------------------------------------------------------
      // LOCATION
      // -------------------------------------------------------
      .filter((event) => {
        if (!selectedLocation) return true;

        return event.city === selectedLocation;
      })

      // -------------------------------------------------------
      // DATE
      // -------------------------------------------------------
      .filter((event) => {
        if (selectedDate === "all") {
          return true;
        }

        const eventDate = new Date(event.date);
        const today = new Date();

        eventDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // TODAY
        if (selectedDate === "today") {
          return eventDate.getTime() === today.getTime();
        }

        // THIS WEEK
        if (selectedDate === "week") {
          const day = today.getDay();

          // Monday = first day of week
          const daysFromMonday = day === 0 ? 6 : day - 1;

          const monday = new Date(today);

          monday.setDate(
            today.getDate() - daysFromMonday
          );

          monday.setHours(0, 0, 0, 0);

          const sunday = new Date(monday);

          sunday.setDate(monday.getDate() + 6);

          sunday.setHours(23, 59, 59, 999);

          return (
            eventDate >= monday &&
            eventDate <= sunday
          );
        }

        // THIS MONTH
        if (selectedDate === "month") {
          return (
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() ===
              today.getFullYear()
          );
        }

        return true;
      })

      // -------------------------------------------------------
      // SORT
      // -------------------------------------------------------
      .sort((a, b) => {
        // Soonest
        if (sortBy === "date-asc") {
          return (
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
          );
        }

        // Latest
        if (sortBy === "date-desc") {
          return (
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
          );
        }

        // Price: Low to High
        if (sortBy === "price-asc") {
          return Number(a.price) - Number(b.price);
        }

        // Price: High to Low
        if (sortBy === "price-desc") {
          return Number(b.price) - Number(a.price);
        }

        return 0;
      });
  }, [
    searchQuery,
    selectedCategory,
    selectedLocation,
    selectedDate,
    sortBy,
  ]);

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLocation("");
    setSelectedDate("all");
  };

  // =========================================================
  // ACTIVE FILTER COUNT
  // =========================================================

  const activeFilterCount = [
    selectedCategory,
    selectedLocation,
    selectedDate !== "all" ? selectedDate : "",
  ].filter(Boolean).length;

  // =========================================================
  // DATE LABEL
  // =========================================================

  const dateLabel =
    selectedDate === "today"
      ? "Today"
      : selectedDate === "week"
        ? "This week"
        : selectedDate === "month"
          ? "This month"
          : "";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
              Explore EventON
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Discover events worth attending.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Find conferences, workshops, concerts, sports,
              meetups and more happening around you.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          SEARCH & FILTERS
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          {/* =================================================
              DESKTOP FILTERS
          ================================================== */}

          <div className="hidden gap-3 lg:grid lg:grid-cols-[1fr_220px_180px_220px]">
            {/* Search */}

            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search events..."
                aria-label="Search events"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  ×
                </button>
              )}
            </div>

            {/* Location */}

            <div className="relative">
              <MapPin
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedLocation}
                onChange={(event) =>
                  setSelectedLocation(event.target.value)
                }
                aria-label="Filter by location"
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              >
                <option value="">All locations</option>

                {locations.map((location) => (
                  <option
                    key={location}
                    value={location}
                  >
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}

            <div className="relative">
              <CalendarDays
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(event.target.value)
                }
                aria-label="Filter by date"
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              >
                <option value="all">Any date</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>

            {/* Category */}

            <div className="relative">
              <SlidersHorizontal
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
                aria-label="Filter by category"
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              >
                <option value="">All categories</option>

                {eventCategories.map((category) => (
                  <option
                    key={category.slug}
                    value={category.slug}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* =================================================
              MOBILE CONTROLS
          ================================================== */}

          <div className="lg:hidden">
            {/* Mobile Search */}

            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search events..."
                aria-label="Search events"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  ×
                </button>
              )}
            </div>

            {/* Mobile Filter + Sort */}

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setIsMobileFiltersOpen(true)
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <SlidersHorizontal size={17} />

                Filters

                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                aria-label="Sort events"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              >
                <option value="date-asc">
                  Soonest
                </option>

                <option value="date-desc">
                  Latest
                </option>

                <option value="price-asc">
                  Price: Low
                </option>

                <option value="price-desc">
                  Price: High
                </option>
              </select>
            </div>
          </div>

          {/* =================================================
              MOBILE FILTER BOTTOM SHEET
          ================================================== */}

          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Overlay */}

              <button
                type="button"
                aria-label="Close filters"
                onClick={() =>
                  setIsMobileFiltersOpen(false)
                }
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              />

              {/* Bottom Sheet */}

              <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl">
                {/* Header */}

                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Filters
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Refine your event search
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setIsMobileFiltersOpen(false)
                    }
                    aria-label="Close filters"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Filter Fields */}

                <div className="space-y-6 px-5 py-6">
                  {/* Category */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Category
                    </label>

                    <select
                      value={selectedCategory}
                      onChange={(event) =>
                        setSelectedCategory(
                          event.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    >
                      <option value="">
                        All categories
                      </option>

                      {eventCategories.map(
                        (category) => (
                          <option
                            key={category.slug}
                            value={category.slug}
                          >
                            {category.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Location */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Location
                    </label>

                    <select
                      value={selectedLocation}
                      onChange={(event) =>
                        setSelectedLocation(
                          event.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    >
                      <option value="">
                        All locations
                      </option>

                      {locations.map((location) => (
                        <option
                          key={location}
                          value={location}
                        >
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Date
                    </label>

                    <select
                      value={selectedDate}
                      onChange={(event) =>
                        setSelectedDate(
                          event.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    >
                      <option value="all">
                        Any date
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
                    </select>
                  </div>
                </div>

                {/* Bottom Actions */}

                <div className="sticky bottom-0 border-t border-slate-200 bg-white p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Clear all
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setIsMobileFiltersOpen(false)
                      }
                      className="h-11 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Show {filteredEvents.length}{" "}
                      {filteredEvents.length === 1
                        ? "event"
                        : "events"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          RESULTS
      ====================================================== */}

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        {/* Results Header */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : selectedCategory
                  ? `Browsing ${selectedCategoryName} events`
                  : selectedLocation
                    ? `Events in ${selectedLocation}`
                    : selectedDate === "today"
                      ? "Events happening today"
                      : selectedDate === "week"
                        ? "Events happening this week"
                        : selectedDate === "month"
                          ? "Events happening this month"
                          : "Explore our collection"}
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              All events
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1
              ? "event"
              : "events"}{" "}
            available
          </p>
        </div>

        {/* =================================================
            DESKTOP SORT
        ================================================== */}

        <div className="mt-8 hidden border-t border-slate-200 pt-6 sm:flex sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredEvents.length}
            </span>{" "}
            {filteredEvents.length === 1
              ? "event"
              : "events"}
          </p>

          <div className="flex items-center gap-3">
            <label
              htmlFor="desktop-sort-events"
              className="whitespace-nowrap text-sm font-medium text-slate-600"
            >
              Sort by
            </label>

            <select
              id="desktop-sort-events"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              className="h-10 min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            >
              <option value="date-asc">
                Date: Soonest
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
          </div>
        </div>

        {/* =================================================
            ACTIVE FILTER CHIPS
        ================================================== */}

        {(searchQuery ||
          selectedCategory ||
          selectedLocation ||
          selectedDate !== "all") && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {/* Search */}

            {searchQuery && (
              <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
                Search: {searchQuery}
              </span>
            )}

            {/* Category */}

            {selectedCategory && (
              <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-700">
                Category: {selectedCategoryName}
              </span>
            )}

            {/* Location */}

            {selectedLocation && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700">
                Location: {selectedLocation}
              </span>
            )}

            {/* Date */}

            {selectedDate !== "all" && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">
                Date: {dateLabel}
              </span>
            )}

            {/* Clear */}

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
            >
              Clear all
            </button>
          </div>
        )}

        {/* =================================================
            EVENT GRID
        ================================================== */}

        {filteredEvents.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          ================================================== */

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Search
                size={24}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-900">
              No events found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              We couldn't find any events matching your
              current filters. Try changing your search or
              filter options.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
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