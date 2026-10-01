import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Gavel,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: (
      <>
        <p>
          By accessing or using EventON, you agree to be bound by these
          Terms & Conditions. If you do not agree with any part of
          these terms, please do not use the EventON platform.
        </p>

        <p className="mt-4">
          These terms apply to all users of EventON, including attendees,
          organizers, and other users who access or interact with the
          platform.
        </p>
      </>
    ),
  },

  {
    title: "2. Using EventON",
    content: (
      <>
        <p>
          EventON provides a platform for discovering events, managing
          events, and making event bookings.
        </p>

        <p className="mt-4">
          You agree to use the platform only for lawful purposes and in
          a way that does not interfere with the operation, security, or
          availability of EventON.
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Provide accurate information when required.</li>
          <li>Keep your account information reasonably up to date.</li>
          <li>Do not misuse or attempt to disrupt the platform.</li>
          <li>Do not use EventON for unlawful activities.</li>
        </ul>
      </>
    ),
  },

  {
    title: "3. User Accounts",
    content: (
      <>
        <p>
          Some EventON features require you to create an account. You
          are responsible for maintaining the confidentiality of your
          account information and for activity performed through your
          account.
        </p>

        <p className="mt-4">
          If you believe that your account has been accessed without
          authorization, you should contact EventON support as soon as
          reasonably possible.
        </p>
      </>
    ),
  },

  {
    title: "4. Event Listings",
    content: (
      <>
        <p>
          Event information displayed on EventON may be provided by
          event organizers. Organizers are responsible for ensuring
          that the information they provide is accurate and
          appropriate.
        </p>

        <p className="mt-4">
          EventON may display, update, remove, or restrict event
          listings when necessary to maintain the operation and
          integrity of the platform.
        </p>
      </>
    ),
  },

  {
    title: "5. Bookings & Tickets",
    content: (
      <>
        <p>
          When you make a booking through EventON, the information
          associated with that booking may be stored in connection with
          your account.
        </p>

        <p className="mt-4">
          Booking availability, ticket limits, pricing, event details,
          and cancellation conditions may vary depending on the event.
          Users should review the relevant event information before
          completing a booking.
        </p>
      </>
    ),
  },

  {
    title: "6. Cancellations",
    content: (
      <>
        <p>
          Cancellation availability depends on the status and
          conditions of the relevant booking and event.
        </p>

        <p className="mt-4">
          EventON may prevent cancellation when a booking is no longer
          eligible for cancellation, including when an event has
          already started, completed, or the booking has already been
          cancelled.
        </p>
      </>
    ),
  },

  {
    title: "7. Organizer Responsibilities",
    content: (
      <>
        <p>
          Organizers are responsible for the events they create and
          manage through EventON.
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Provide accurate event information.</li>
          <li>Manage event capacity and attendee information.</li>
          <li>Communicate relevant event updates.</li>
          <li>Handle event-related responsibilities appropriately.</li>
          <li>Follow applicable laws and regulations.</li>
        </ul>
      </>
    ),
  },

  {
    title: "8. Intellectual Property",
    content: (
      <>
        <p>
          The EventON platform, including its design, branding,
          interface, content, and software, may contain material
          protected by applicable intellectual property laws.
        </p>

        <p className="mt-4">
          You may not reproduce, modify, distribute, or commercially
          exploit EventON content or platform components without
          appropriate authorization.
        </p>
      </>
    ),
  },

  {
    title: "9. Platform Availability",
    content: (
      <>
        <p>
          EventON aims to provide a reliable platform, but continuous
          or uninterrupted availability cannot be guaranteed.
        </p>

        <p className="mt-4">
          The platform may occasionally be unavailable because of
          maintenance, updates, technical issues, security measures, or
          circumstances outside our reasonable control.
        </p>
      </>
    ),
  },

  {
    title: "10. Changes to These Terms",
    content: (
      <>
        <p>
          EventON may update these Terms & Conditions as the platform
          develops, new features are introduced, or our practices
          change.
        </p>

        <p className="mt-4">
          Updated terms will be made available on this page. Continued
          use of EventON after changes are published may indicate that
          you have reviewed and accepted the updated terms.
        </p>
      </>
    ),
  },
];

function TermsConditions() {
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
              EventON Terms
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Simple rules for
              <br />
              <span className="text-orange-500">using EventON.</span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              These Terms & Conditions explain the rules and
              responsibilities that apply when you use the EventON
              platform and services.
            </p>

            {/* Updated */}
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Last updated: October 2026
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK TERMS POINTS
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              Terms at EventON
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              What you should know.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              A quick overview of the principles behind using EventON.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {/* Fair Use */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <CheckCircle2 size={21} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Responsible Use
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use EventON responsibly, lawfully, and without
                interfering with the platform or other users.
              </p>
            </div>

            {/* Events */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <CalendarDays size={21} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Event Responsibility
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Organizers are responsible for the events and
                information they publish through EventON.
              </p>
            </div>

            {/* Account */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <UserRound size={21} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Account Responsibility
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Keep your account information secure and use your
                EventON account appropriately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TERMS CONTENT
      ====================================================== */}

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              Terms & Conditions
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Understanding the rules of EventON.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              Please review the following sections before using the
              platform.
            </p>
          </div>

          {/* Terms card */}
          <div className="mx-auto mt-12 max-w-5xl">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8 lg:p-10">
                {/* Important note */}
                <div className="rounded-2xl bg-[#070b14] p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                      <Gavel size={21} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Terms overview
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        These terms describe the general rules for using
                        the current EventON platform. As EventON evolves,
                        these terms may be updated to reflect new
                        features, services, practices, and applicable
                        requirements.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div className="mt-10 space-y-0">
                  {sections.map((section) => (
                    <section
                      key={section.title}
                      className="border-b border-slate-100 py-8 first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                        {section.title}
                      </h2>

                      <div className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                        {section.content}
                      </div>
                    </section>
                  ))}
                </div>

                {/* =================================================
                    TERMS CONTACT
                ================================================== */}

                <div className="mt-10 rounded-2xl border border-orange-100 bg-orange-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                      <Mail size={20} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Questions about these terms?
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        If you have questions about these Terms &
                        Conditions or how they apply to your use of
                        EventON, contact us at:
                      </p>

                      <a
                        href="mailto:legal@eventon.com"
                        className="mt-3 inline-block text-sm font-semibold text-orange-600 transition hover:text-orange-700"
                      >
                        legal@eventon.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                NAVIGATION
            ================================================== */}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/privacy-policy"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-6
                  text-sm
                  font-semibold
                  text-slate-700
                  transition-all
                  duration-200
                  hover:border-orange-200
                  hover:text-orange-500
                  hover:shadow-sm
                "
              >
                Privacy Policy
              </Link>

              <Link
                to="/help-center"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-6
                  text-sm
                  font-semibold
                  text-slate-700
                  transition-all
                  duration-200
                  hover:border-orange-200
                  hover:text-orange-500
                  hover:shadow-sm
                "
              >
                Help Center
              </Link>

              <Link
                to="/contact"
                className="
                  group
                  inline-flex
                  h-12
                  items-center
                  justify-center
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
                  hover:shadow-orange-500/30
                "
              >
                Contact Us

                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM CTA
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="rounded-3xl bg-[#070b14] px-6 py-14 text-center sm:px-12 lg:px-20 lg:py-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
              <FileText size={27} />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              EventON
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Ready to explore EventON?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Discover events, connect with experiences, and start using
              EventON today.
            </p>

            <Link
              to="/events"
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
              Explore Events

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

export default TermsConditions;