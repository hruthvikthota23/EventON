import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  "Create and publish events",
  "Manage attendees",
  "Track event performance",
];

function OrganizerCTA() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16">

          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">

            {/* Content */}
            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300">
                <CalendarPlus size={16} className="text-orange-500" />
                For event organizers
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Have an event to organize?
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
                Bring your event to life with EventON. Create your
                event, reach attendees, and manage everything from
                one place.
              </p>

              {/* Features */}
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-orange-500"
                    />

                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="lg:pr-2">
              <Link
                to="/register"
                className="group inline-flex w-full items-center justify-center gap-3 rounded-xl bg-orange-500 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/10 transition hover:bg-orange-600 sm:w-auto"
              >
                Create an Event

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 sm:justify-start">
                <Users size={14} />
                Grow your event community
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default OrganizerCTA;