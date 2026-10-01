import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  HelpCircle,
  Ticket,
  UserRound,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const faqSections = [
  {
    title: "Bookings & Tickets",
    icon: Ticket,
    questions: [
      {
        question: "How do I book an event?",
        answer:
          "Browse the available events, open the event you want to attend, select the number of tickets, and continue with the booking process.",
      },
      {
        question: "Where can I see my bookings?",
        answer:
          "After signing in, open My Bookings from your account menu. You can view your upcoming, ongoing, completed, and cancelled bookings there.",
      },
      {
        question: "Can I cancel my booking?",
        answer:
          "You can cancel an eligible upcoming booking from your My Bookings section. Bookings that are already ongoing, completed, or cancelled cannot be cancelled.",
      },
    ],
  },
  {
    title: "Account",
    icon: UserRound,
    questions: [
      {
        question: "How do I create an EventON account?",
        answer:
          "Click Register from the EventON navigation menu and complete the registration form with your required account details.",
      },
      {
        question: "How can I update my profile?",
        answer:
          "Open your profile from the account menu and select the Edit Profile option to update your account information.",
      },
      {
        question: "How do I log out?",
        answer:
          "Open the account menu from the navigation bar and select Logout.",
      },
    ],
  },
  {
    title: "Events & Organizers",
    icon: CalendarDays,
    questions: [
      {
        question: "How can I create an event?",
        answer:
          "Organizers can use the Create an Event option to open the event creation page and provide the required event details.",
      },
      {
        question: "How can I manage my events?",
        answer:
          "Organizers can manage their events from the Organizer Dashboard, including viewing and updating their event information.",
      },
      {
        question: "Who can create events?",
        answer:
          "Event creation is available through the organizer workflow. Users who want to organize events can register and use the organizer features.",
      },
    ],
  },
];

function HelpCenter() {
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (sectionIndex, questionIndex) => {
    const key = `${sectionIndex}-${questionIndex}`;

    setOpenQuestion((current) =>
      current === key ? null : key
    );
  };

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
              EventON Help Center
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              We&apos;re here to
              <br />
              <span className="text-orange-500">help.</span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              Find answers to common questions about bookings, accounts,
              events, and using EventON.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#faq"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-600 hover:shadow-orange-500/30"
              >
                Browse FAQs

                <ArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </a>

              <Link
                to="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white bg-white px-6 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:bg-slate-100"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK HELP
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              Quick Help
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Find what you need faster.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              Get quick information about the most common EventON
              features.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {/* Bookings */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Ticket size={21} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Booking Help
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Learn about booking events, tickets, cancellations, and
                your booking history.
              </p>
            </div>

            {/* Account */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <UserRound size={21} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Account Help
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Find information about registration, profiles, and
                managing your EventON account.
              </p>
            </div>

            {/* Events */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <CalendarDays size={21} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Event Help
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Learn how organizers can create, manage, and publish
                events on EventON.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ====================================================== */}

      <section
        id="faq"
        className="border-y border-slate-200 bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              Frequently Asked Questions
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Find the answers you need.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              Browse the common questions below to quickly find useful
              information.
            </p>
          </div>

          {/* FAQ sections */}
          <div className="mx-auto mt-12 max-w-4xl space-y-8">
            {faqSections.map((section, sectionIndex) => {
              const Icon = section.icon;

              return (
                <div key={section.title}>
                  {/* Section heading */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                      <Icon size={19} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
                      {section.title}
                    </h3>
                  </div>

                  {/* Questions */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {section.questions.map(
                      (item, questionIndex) => {
                        const key = `${sectionIndex}-${questionIndex}`;
                        const isOpen = openQuestion === key;

                        return (
                          <div
                            key={item.question}
                            className="border-b border-slate-200 last:border-b-0"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                toggleQuestion(
                                  sectionIndex,
                                  questionIndex
                                )
                              }
                              className="
                                flex
                                w-full
                                items-center
                                justify-between
                                gap-5
                                px-5
                                py-5
                                text-left
                                transition
                                hover:bg-slate-50
                                sm:px-6
                              "
                              aria-expanded={isOpen}
                            >
                              <span className="text-sm font-semibold text-slate-900 sm:text-base">
                                {item.question}
                              </span>

                              <ChevronDown
                                size={19}
                                className={`shrink-0 text-slate-500 transition-transform duration-200 ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            {isOpen && (
                              <div className="px-5 pb-5 sm:px-6">
                                <p className="text-sm leading-7 text-slate-500">
                                  {item.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          STILL NEED HELP
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="rounded-3xl bg-[#070b14] px-6 py-14 text-center sm:px-12 lg:px-20 lg:py-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
              <HelpCircle size={27} />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              Still Need Help?
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              We&apos;re happy to help.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              If you couldn&apos;t find the answer you&apos;re looking for,
              our team is ready to help you with your question.
            </p>

            <Link
              to="/contact"
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
              Contact Support

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

export default HelpCenter;