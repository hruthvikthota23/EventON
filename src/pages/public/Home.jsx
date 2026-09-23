import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import CategorySection from "../../components/events/CategorySection";
import FeaturedEvents from "../../components/events/FeaturedEvents";
import UpcomingEvents from "../../components/events/UpcomingEvents";
import WhyEventON from "../../components/home/WhyEventON";
import OrganizerCTA from "../../components/home/OrganizerCTA";

function Home() {
  return (
    <main className="bg-white">

      {/* ================= HERO ================= */}
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
              <span className="text-orange-500"> Connect.</span>
              <br />
              Experience.
            </h1>

            {/* Description */}
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
              Find conferences, workshops, concerts, meetups,
              sports events, and experiences worth showing up for.
            </p>

            {/* Search Card */}
            <div className="mx-auto mt-10 w-full max-w-4xl rounded-2xl border border-white/10 bg-white p-2 shadow-2xl">

              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">

                {/* Search */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-50">
                  <Search
                    size={20}
                    className="shrink-0 text-gray-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-400">
                      What are you looking for?
                    </p>

                    <input
                      type="text"
                      placeholder="Search events"
                      className="mt-1 w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-50">
                  <MapPin
                    size={20}
                    className="shrink-0 text-gray-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-400">
                      Where
                    </p>

                    <input
                      type="text"
                      placeholder="City or location"
                      className="mt-1 w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Button */}
                <button
                  type="button"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 text-sm font-bold text-white transition hover:bg-orange-600 active:scale-[0.98]"
                >
                  <Search size={18} />
                  Search
                </button>
              </div>
            </div>

            {/* Browse */}
            <Link
              to="/events"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-white"
            >
              Browse all events
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">

            {/* Stat */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm">
              <CalendarDays
                size={23}
                className="mx-auto text-orange-500"
              />

              <p className="mt-4 text-2xl font-bold text-white">
                500+
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Events
              </p>
            </div>

            {/* Stat */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm">
              <MapPin
                size={23}
                className="mx-auto text-orange-500"
              />

              <p className="mt-4 text-2xl font-bold text-white">
                50+
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Locations
              </p>
            </div>

            {/* Stat */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm">
              <Users
                size={23}
                className="mx-auto text-orange-500"
              />

              <p className="mt-4 text-2xl font-bold text-white">
                10K+
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Attendees
              </p>
            </div>

          </div>
        </div>
      </section>
      <CategorySection />
      <FeaturedEvents />
      <UpcomingEvents />
      <WhyEventON />
      <OrganizerCTA />
    </main>
  );
}

export default Home;