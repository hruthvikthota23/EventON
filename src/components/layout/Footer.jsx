import {
  CalendarDays,
  Globe2,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";

import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10">

        {/* =====================================================
            FOOTER MAIN
        ====================================================== */}

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16">

          {/* ===================================================
              BRAND
          =================================================== */}

          <div className="lg:col-span-1">

            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
                <CalendarDays
                  size={21}
                  strokeWidth={2.5}
                />
              </div>

              <span className="text-2xl font-bold tracking-tight">
                Event<span className="text-orange-500">
                  ON
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-400">
              Discover amazing events, connect with people,
              and create memorable experiences with EventON.
            </p>

            {/* Social / Contact Icons */}

            <div className="mt-6 flex items-center gap-3">

              <a
                href="https://eventon.example.com"
                target="_blank"
                rel="noreferrer"
                aria-label="EventON website"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition hover:bg-orange-500 hover:text-white"
              >
                <Globe2 size={17} />
              </a>

              <a
                href="mailto:support@eventon.com"
                aria-label="Email EventON"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition hover:bg-orange-500 hover:text-white"
              >
                <Mail size={17} />
              </a>

              <a
                href="mailto:support@eventon.com"
                aria-label="Contact EventON"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition hover:bg-orange-500 hover:text-white"
              >
                <MessageCircle size={17} />
              </a>

              <button
                type="button"
                aria-label="Share EventON"
                onClick={async () => {
                  try {
                    if (
                      navigator.share
                    ) {
                      await navigator.share({
                        title: "EventON",
                        text: "Discover. Connect. Experience.",
                        url: window.location.origin,
                      });
                    } else {
                      await navigator.clipboard.writeText(
                        window.location.origin
                      );
                    }
                  } catch {
                    // User cancelled sharing.
                  }
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition hover:bg-orange-500 hover:text-white"
              >
                <Share2 size={17} />
              </button>

            </div>
          </div>

          {/* ===================================================
              PLATFORM
          =================================================== */}

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Platform
            </h3>

            <ul className="mt-5 space-y-3">

              {/* Browse Events */}

              <li>
                <Link
                  to="/events"
                  className="text-sm text-gray-400 transition hover:text-orange-400"
                >
                  Browse Events
                </Link>
              </li>

              {/* Create Event */}

              <li>
                <Link
                  to="/organizer/events/create"
                  className="text-sm text-gray-400 transition hover:text-orange-400"
                >
                  Create an Event
                </Link>
              </li>

              {/* My Bookings */}

              <li>
                <Link
                  to="/bookings"
                  className="text-sm text-gray-400 transition hover:text-orange-400"
                >
                  My Bookings
                </Link>
              </li>

            </ul>
          </div>

          {/* ===================================================
              COMPANY
          =================================================== */}

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>

            <ul className="mt-5 space-y-3">

              <li>
                <span className="text-sm text-gray-500">
                  About Us
                </span>
              </li>

              <li>
                <span className="text-sm text-gray-500">
                  Contact
                </span>
              </li>

              <li>
                <span className="text-sm text-gray-500">
                  Careers
                </span>
              </li>

            </ul>
          </div>

          {/* ===================================================
              SUPPORT
          =================================================== */}

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Support
            </h3>

            <ul className="mt-5 space-y-3">

              <li>
                <span className="text-sm text-gray-500">
                  Help Center
                </span>
              </li>

              <li>
                <span className="text-sm text-gray-500">
                  Privacy Policy
                </span>
              </li>

              <li>
                <span className="text-sm text-gray-500">
                  Terms & Conditions
                </span>
              </li>

            </ul>
          </div>

        </div>

        {/* =====================================================
            DIVIDER
        ====================================================== */}

        <div className="my-10 h-px bg-gray-800" />

        {/* =====================================================
            BOTTOM
        ====================================================== */}

        <div className="flex flex-col gap-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">

          <p>
            © {new Date().getFullYear()} EventON.
            All rights reserved.
          </p>

          <p>
            Discover. Connect. Experience.
          </p>

        </div>

      </div>
    </footer>
  );
}

export default Footer;