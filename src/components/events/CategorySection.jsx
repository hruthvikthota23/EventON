import {
  BriefcaseBusiness,
  Code2,
  GraduationCap,
  Music2,
  Palette,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Technology",
    description: "Tech conferences, meetups & hackathons",
    icon: Code2,
    color: "bg-blue-50 text-blue-600",
    slug: "technology",
  },
  {
    name: "Music",
    description: "Concerts, festivals & live performances",
    icon: Music2,
    color: "bg-purple-50 text-purple-600",
    slug: "music",
  },
  {
    name: "Business",
    description: "Networking, startups & conferences",
    icon: BriefcaseBusiness,
    color: "bg-amber-50 text-amber-600",
    slug: "business",
  },
  {
    name: "Sports",
    description: "Matches, marathons & fitness events",
    icon: Trophy,
    color: "bg-green-50 text-green-600",
    slug: "sports",
  },
  {
    name: "Education",
    description: "Workshops, seminars & bootcamps",
    icon: GraduationCap,
    color: "bg-red-50 text-red-600",
    slug: "education",
  },
  {
    name: "Arts & Culture",
    description: "Exhibitions, art & cultural events",
    icon: Palette,
    color: "bg-pink-50 text-pink-600",
    slug: "arts-culture",
  },
];

function CategorySection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">

        {/* Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
              Explore
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Explore by category
            </h2>

            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-500">
              Find events that match your interests and discover
              something new to experience.
            </p>
          </div>

          <Link
            to="/events"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-orange-500"
          >
            View all events

            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Categories */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.slug}
                to={`/events?category=${category.slug}`}
                className="group rounded-2xl border border-gray-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.color}`}
                  >
                    <Icon size={23} strokeWidth={2} />
                  </div>

                  <span className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-orange-500">
                    →
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {category.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategorySection;