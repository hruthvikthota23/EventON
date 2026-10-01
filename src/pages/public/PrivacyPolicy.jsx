import {
  ArrowRight,
  Database,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Information We Collect",
    content: (
      <>
        <p>
          When you use EventON, we may collect information that you
          provide directly, such as your name, email address, account
          details, and information related to events and bookings.
        </p>

        <p className="mt-4">
          We may also collect information about how you interact with
          the EventON platform, such as pages visited, features used,
          and basic technical information needed to operate the service.
        </p>
      </>
    ),
  },

  {
    title: "2. How We Use Your Information",
    content: (
      <>
        <p>
          Information collected through EventON may be used to provide,
          maintain, and improve our services.
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Create and manage your EventON account.</li>
          <li>Process and manage event bookings.</li>
          <li>Provide event-related information and updates.</li>
          <li>Improve the EventON platform and user experience.</li>
          <li>Respond to support requests and inquiries.</li>
          <li>Maintain platform security and prevent misuse.</li>
        </ul>
      </>
    ),
  },

  {
    title: "3. Information Sharing",
    content: (
      <p>
        EventON does not sell your personal information. Information
        may be shared when necessary to provide the services you
        request, operate the platform, comply with applicable legal
        requirements, or protect the security and integrity of
        EventON.
      </p>
    ),
  },

  {
    title: "4. Event & Booking Information",
    content: (
      <>
        <p>
          When you book an event, information necessary to manage the
          booking may be associated with your account and the relevant
          event.
        </p>

        <p className="mt-4">
          Organizers may receive information necessary to manage
          attendees and administer their events.
        </p>
      </>
    ),
  },

  {
    title: "5. Data Security",
    content: (
      <>
        <p>
          We take reasonable measures to protect information handled
          through EventON against unauthorized access, alteration,
          disclosure, or destruction.
        </p>

        <p className="mt-4">
          However, no internet-based service can guarantee absolute
          security.
        </p>
      </>
    ),
  },

  {
    title: "6. Cookies & Similar Technologies",
    content: (
      <p>
        EventON may use local storage, cookies, or similar technologies
        to remember preferences, maintain sessions, and support
        essential platform functionality.
      </p>
    ),
  },

  {
    title: "7. Your Choices",
    content: (
      <>
        <p>
          Depending on the features available to you, you may be able
          to review or update your account information through your
          EventON profile.
        </p>

        <p className="mt-4">
          If you have questions about your personal information or
          would like to make a privacy-related request, you can contact
          us using the information below.
        </p>
      </>
    ),
  },

  {
    title: "8. Third-Party Services",
    content: (
      <p>
        EventON may use third-party services to support functionality
        such as hosting, analytics, communication, or other platform
        operations. Those services may process information according
        to their own privacy policies.
      </p>
    ),
  },

  {
    title: "9. Children's Privacy",
    content: (
      <p>
        EventON is not intended to knowingly collect personal
        information from children where such collection is prohibited
        by applicable law.
      </p>
    ),
  },

  {
    title: "10. Changes to This Privacy Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time as EventON
        develops or our practices change. When changes are made, the
        updated version will be made available on this page.
      </p>
    ),
  },
];

function PrivacyPolicy() {
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
              EventON Privacy
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Your privacy
              <br />
              <span className="text-orange-500">matters.</span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              This Privacy Policy explains how EventON handles
              information when you use our platform and services.
            </p>

            {/* Updated */}
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Last updated: October 2026
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK PRIVACY POINTS
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              Privacy at EventON
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How we approach your information.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              Here are some of the key principles behind how EventON
              handles information.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {/* Secure Information */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <LockKeyhole size={21} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Secure Information
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                We take reasonable measures to protect information
                handled through EventON.
              </p>
            </div>

            {/* Responsible Use */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Database size={21} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Responsible Use
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Information is used to provide and improve EventON
                services and support.
              </p>
            </div>

            {/* Your Information */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <UserRound size={21} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Your Information
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You can contact us with questions or requests regarding
                your personal information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          POLICY CONTENT
      ====================================================== */}

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              Privacy Policy
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Understanding how EventON handles information.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              Please review the following sections for more information.
            </p>
          </div>

          {/* Policy card */}
          <div className="mx-auto mt-12 max-w-5xl">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8 lg:p-10">
                {/* Important note */}
                <div className="rounded-2xl bg-[#070b14] p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                      <ShieldCheck size={21} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Privacy overview
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        This policy is intended to explain EventON&apos;s
                        general approach to privacy for the current
                        project. As the platform evolves, this policy
                        should be reviewed and updated to reflect the
                        actual data practices, services, and applicable
                        legal requirements.
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
                    PRIVACY CONTACT
                ================================================== */}

                <div className="mt-10 rounded-2xl border border-orange-100 bg-orange-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                      <Mail size={20} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Privacy questions?
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        If you have questions about this Privacy Policy
                        or how EventON handles information, contact us at:
                      </p>

                      <a
                        href="mailto:privacy@eventon.com"
                        className="mt-3 inline-block text-sm font-semibold text-orange-600 transition hover:text-orange-700"
                      >
                        privacy@eventon.com
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
                Visit Help Center
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
              <ShieldCheck size={27} />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              EventON
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Questions about your privacy?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              If you need more information about how EventON handles
              your information, our team is here to help.
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
              Contact Us

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

export default PrivacyPolicy;