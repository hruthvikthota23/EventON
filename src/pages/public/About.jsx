import { Link } from "react-router-dom";
import {
  CalendarDays,
  Search,
  Ticket,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function About() {
  const features = [
    {
      icon: Search,
      title: "Discover Events",
      description:
        "Explore events across different categories and find experiences that match your interests.",
    },
    {
      icon: Ticket,
      title: "Book Easily",
      description:
        "Reserve your spot through a simple and convenient booking experience.",
    },
    {
      icon: Users,
      title: "For Organizers",
      description:
        "Create and manage events while keeping track of bookings and attendees.",
    },
    {
      icon: ShieldCheck,
      title: "Stay Organized",
      description:
        "Keep your event bookings and important details organized in one place.",
    },
  ];

  return (
    <div className="min-h-full bg-white text-slate-900">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden bg-[#070b14]">
        {/* Background glow */}
        <div className="absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="absolute right-[20%] top-[20%] h-32 w-32 rounded-full bg-orange-500/5 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3.5 py-2 text-xs font-semibold text-orange-400">
              <Sparkles size={14} />
              About EventON
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Events made
              <br />
              <span className="text-orange-500">simple.</span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              EventON is an event management platform designed to make
              discovering, booking, and managing events simple and convenient.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/events"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-600 hover:shadow-orange-500/30"
              >
                Explore Events

                <ArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white bg-white px-6 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:bg-slate-100"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHO WE ARE
      ====================================================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            {/* Text */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                Who We Are
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                One place for your next experience.
              </h2>

              <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
                EventON brings event discovery and event management together
                in one platform. Whether you are looking for something
                exciting to attend or planning an event of your own, EventON
                provides the tools to make the process easier.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Our goal is to create a straightforward experience where
                attendees can discover and book events while organizers can
                create, manage, and monitor their events from one place.
              </p>
            </div>

            {/* Card */}
            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm sm:p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm">
                  <CalendarDays size={28} strokeWidth={2} />
                </div>

                <h3 className="mt-7 text-2xl font-bold text-slate-900">
                  Built around events
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  From discovering an event to completing a booking, EventON
                  keeps the experience focused, clear, and easy to navigate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ====================================================== */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              What EventON Offers
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need for events
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              A simple platform for both attendees and event organizers.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION
      ====================================================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="rounded-3xl bg-[#070b14] px-6 py-14 text-center sm:px-12 lg:px-20 lg:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              Our Mission
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Making every event easier to discover, book, and manage.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              EventON is built around a simple idea: event experiences should
              begin with a smooth and reliable booking journey.
            </p>

            <Link
              to="/events"
              className="group mt-9 inline-flex h-12 items-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-600"
            >
              Find Your Next Event

              <ArrowRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;