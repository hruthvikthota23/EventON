import {
  CalendarCheck2,
  HeartHandshake,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";

const benefits = [
  {
    icon: Search,
    title: "Discover Easily",
    description:
      "Find events that match your interests using simple search and smart filters.",
  },
  {
    icon: Ticket,
    title: "Simple Booking",
    description:
      "Reserve your place through a straightforward and transparent booking experience.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Events",
    description:
      "Get clear event information including organizers, schedules, locations, and availability.",
  },
  {
    icon: CalendarCheck2,
    title: "Stay Organized",
    description:
      "Keep track of your upcoming events and bookings from one convenient place.",
  },
  {
    icon: HeartHandshake,
    title: "Connect & Experience",
    description:
      "Meet communities, discover new interests, and make every event more meaningful.",
  },
  {
    icon: Sparkles,
    title: "Built for Everyone",
    description:
      "Whether you're attending or organizing, EventON brings the experience together.",
  },
];

function WhyEventON() {
  return (
    <section className="bg-gray-50 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
            Why EventON
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for better events
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-500">
            From discovering your next experience to managing your
            event journey, EventON keeps everything simple and organized.
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-gray-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
                  <Icon size={23} strokeWidth={2} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  {benefit.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyEventON;