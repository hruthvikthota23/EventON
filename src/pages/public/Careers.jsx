import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  MapPin,
  Users,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const openings = [
  {
    title: "Frontend Developer",
    type: "Full-time",
    location: "Hyderabad, India",
    description:
      "Build clean, responsive, and user-friendly experiences for the EventON platform.",
    skills: ["React.js", "JavaScript", "Tailwind CSS"],
  },
  {
    title: "Backend Developer",
    type: "Full-time",
    location: "Hyderabad, India",
    description:
      "Design reliable APIs and backend services that power events, bookings, and user management.",
    skills: ["Node.js", "Express.js", "REST APIs"],
  },
  {
    title: "UI/UX Designer",
    type: "Full-time",
    location: "Hyderabad, India",
    description:
      "Create simple and engaging experiences that make discovering and managing events effortless.",
    skills: ["Figma", "UI Design", "UX Research"],
  },
];

function Careers() {
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
              Careers at EventON
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Build the future
              <br />
              <span className="text-orange-500">of events.</span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              We&apos;re building EventON to make discovering, organizing,
              and experiencing events simpler. Come build meaningful
              products with us.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#open-positions"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-600 hover:shadow-orange-500/30"
              >
                View Open Positions

                <ArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </a>

              <Link
                to="/about"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white bg-white px-6 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:bg-slate-100"
              >
                About EventON
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY EVENTON
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            {/* Text */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                Why EventON?
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Work on something people experience.
              </h2>

              <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
                EventON brings attendees and organizers together through
                a simple event management experience. Every feature we
                build has a real-world purpose.
              </p>

              {/* Benefits */}
              <div className="mt-7 space-y-5">
                {/* Benefit 1 */}
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Build meaningful products
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Solve practical problems for event attendees and
                      organizers.
                    </p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Learn and grow
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Work with modern technologies and continuously
                      develop your skills.
                    </p>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Grow together
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Collaborate with people who enjoy building,
                      learning, and sharing ideas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm sm:p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm">
                  <Code2 size={28} strokeWidth={2} />
                </div>

                <h3 className="mt-7 text-2xl font-bold text-slate-900">
                  Build with modern technology
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Work across frontend, backend, design, data, and
                  product to create experiences people can use every
                  day.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4">
                    <Users
                      size={22}
                      className="text-orange-500"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      Collaborate
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Share ideas and build better solutions together.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <BriefcaseBusiness
                      size={22}
                      className="text-orange-500"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      Make an impact
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Turn ideas into useful products and experiences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          OPEN POSITIONS
      ====================================================== */}

      <section
        id="open-positions"
        className="border-y border-slate-200 bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              Open Positions
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Find your next opportunity.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              Explore the opportunities currently available at EventON.
            </p>
          </div>

          {/* Job cards */}
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {openings.map((job) => (
              <article
                key={job.title}
                className="
                  flex
                  h-full
                  flex-col
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:border-orange-200
                  hover:shadow-lg
                  sm:p-7
                "
              >
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <BriefcaseBusiness size={22} />
                </div>

                {/* Title */}
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {job.title}
                </h3>

                {/* Job information */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {job.type}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    <MapPin size={12} />
                    {job.location}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-5 text-sm leading-6 text-slate-500">
                  {job.description}
                </p>

                {/* Skills */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Apply */}
                <div className="mt-auto pt-7">
                  <a
                    href={`mailto:careers@eventon.com?subject=Application for ${encodeURIComponent(
                      job.title
                    )}`}
                    className="
                      group
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-orange-500
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      shadow-lg
                      shadow-orange-500/20
                      transition
                      hover:bg-orange-600
                      hover:shadow-orange-500/30
                    "
                  >
                    Apply Now

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          NO MATCH CTA
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="rounded-3xl bg-[#070b14] px-6 py-14 text-center sm:px-12 lg:px-20 lg:py-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
              <Users size={26} />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              Didn&apos;t find your role?
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              We&apos;d still love to hear from you.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              We&apos;re always interested in meeting people who are
              passionate about technology, events, and building great
              experiences.
            </p>

            <a
              href="mailto:careers@eventon.com?subject=General Career Inquiry"
              className="
                group
                mt-9
                inline-flex
                h-12
                items-center
                gap-2
                rounded-xl
                bg-orange-500
                px-6
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-orange-500/20
                transition-all
                duration-200
                hover:bg-orange-600
              "
            >
              Send Your Resume

              <ArrowRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Careers;