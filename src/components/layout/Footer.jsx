import {
  ArrowUpRight,
  CalendarDays,
  Globe2,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Footer() {
const { user } = useAuth();

const role = user?.role
  ? String(user.role).trim().toLowerCase()
  : null;

// Create Event
const createEventPath =
  role === "organizer"
    ? "/organizer/events/create"
    : "/register";

// My Bookings
const bookingsPath =
  role === "organizer"
    ? "/organizer/bookings"
    : role === "admin"
    ? "/admin/bookings"
    : role === "attendee"
    ? "/my-bookings"
    : "/register";

  // =========================================================
  // SHARE
  // =========================================================

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "EventON",
          text: "Discover. Connect. Experience.",
          url: window.location.origin,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          window.location.origin
        );
      }
    } catch {
      // User cancelled sharing.
    }
  };

  return (
    <footer className="min-h-[calc(100vh-72px)] overflow-hidden bg-gray-950 text-white">
      {/* =====================================================
          LARGE EVENTON BRAND
      ====================================================== */}

      <section className="flex min-h-[45vh] items-center border-b border-gray-800">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
          <Link
            to="/"
            className="flex max-w-full flex-col items-center text-center"
          >
            {/* =================================================
                LARGE EVENTON LOGO
            ================================================== */}

            <div className="flex max-w-full items-center justify-center gap-4 sm:gap-6 lg:gap-8">
              {/* Calendar Icon */}
              <div
                className="
                  flex
                  h-[clamp(5rem,10vw,10rem)]
                  w-[clamp(5rem,10vw,10rem)]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[22%]
                  bg-orange-500
                "
              >
                <CalendarDays
                  strokeWidth={2}
                  className="
                    h-[58%]
                    w-[58%]
                    text-white
                  "
                />
              </div>

              {/* EventON Text */}
              <span
                className="
                  whitespace-nowrap
                  text-[clamp(4.5rem,10vw,10rem)]
                  font-black
                  leading-none
                  tracking-[-0.075em]
                  text-white
                "
              >
                Event<span className="text-orange-500">ON</span>
              </span>
            </div>

            {/* =================================================
                TAGLINE
            ================================================== */}

            <p
              className="
                mt-5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.32em]
                text-gray-500
                sm:text-xs
                sm:tracking-[0.45em]
              "
            >
              Discover. Connect. Experience.
            </p>
          </Link>
        </div>
      </section>

      {/* =====================================================
          FOOTER CONTENT
      ====================================================== */}

      <section className="flex flex-1 items-center">
        <div
          className="
            mx-auto
            w-full
            max-w-7xl
            px-5
            py-8
            sm:px-8
            sm:py-10
            lg:px-10
          "
        >
          {/* =================================================
              FOOTER COLUMNS
          ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-8
              sm:grid-cols-2
              lg:grid-cols-4
              lg:gap-16
            "
          >
            {/* =================================================
                BRAND
            ================================================== */}

            <div>
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
                  Event<span className="text-orange-500">ON</span>
                </span>
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
                Discover amazing events, connect with people,
                and create memorable experiences with EventON.
              </p>

              {/* Social / Contact */}
              <div className="mt-5 flex items-center gap-3">
                {/* Email */}
                <a
                  href="mailto:support@eventon.com"
                  aria-label="Email EventON"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-800
                    text-gray-400
                    transition
                    hover:bg-orange-500
                    hover:text-white
                  "
                >
                  <Mail size={17} />
                </a>

                {/* Contact */}
                <Link
                  to="/contact"
                  aria-label="Contact EventON"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-800
                    text-gray-400
                    transition
                    hover:bg-orange-500
                    hover:text-white
                  "
                >
                  <MessageCircle size={17} />
                </Link>

                {/* Share */}
                <button
                  type="button"
                  aria-label="Share EventON"
                  onClick={handleShare}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-800
                    text-gray-400
                    transition
                    hover:bg-orange-500
                    hover:text-white
                  "
                >
                  <Share2 size={17} />
                </button>

                {/* Website */}
                <Link
                  to="/"
                  aria-label="EventON website"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-800
                    text-gray-400
                    transition
                    hover:bg-orange-500
                    hover:text-white
                  "
                >
                  <Globe2 size={17} />
                </Link>
              </div>
            </div>

            {/* =================================================
                PLATFORM
            ================================================== */}

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Platform
              </h3>

              <ul className="mt-4 space-y-3">
                {/* Browse Events */}
                <li>
                  <Link
                    to="/events"
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-sm
                      text-gray-400
                      transition
                      hover:text-orange-400
                    "
                  >
                    Browse Events
                    <ArrowUpRight size={13} />
                  </Link>
                </li>

                {/* Create Event */}
                <li>
                  <Link
                    to={createEventPath}
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-sm
                      text-gray-400
                      transition
                      hover:text-orange-400
                    "
                  >
                    Create an Event
                    <ArrowUpRight size={13} />
                  </Link>
                </li>

                {/* My Bookings */}
                <li>
                  <Link
                    to={bookingsPath}
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-sm
                      text-gray-400
                      transition
                      hover:text-orange-400
                    "
                  >
                    My Bookings
                    <ArrowUpRight size={13} />
                  </Link>
                </li>
              </ul>
            </div>

            {/* =================================================
                COMPANY
            ================================================== */}

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Company
              </h3>

              <ul className="mt-4 space-y-3">
                {/* About */}
                <li>
                  <Link
                    to="/about"
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-sm
                      text-gray-400
                      transition
                      hover:text-orange-400
                    "
                  >
                    About Us
                    <ArrowUpRight size={13} />
                  </Link>
                </li>

                {/* Contact */}
                <li>
                  <Link
                    to="/contact"
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-sm
                      text-gray-400
                      transition
                      hover:text-orange-400
                    "
                  >
                    Contact
                    <ArrowUpRight size={13} />
                  </Link>
                </li>

                {/* Careers */}
                <li>
                  <Link
                    to="/careers"
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-sm
                      text-gray-400
                      transition
                      hover:text-orange-400
                    "
                  >
                    Careers
                    <ArrowUpRight size={13} />
                  </Link>
                </li>
              </ul>
            </div>

            {/* =================================================
                SUPPORT
            ================================================== */}

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Support
              </h3>

              <ul className="mt-4 space-y-3">
                {/* Help Center */}
                <li>
                  <Link
                    to="/help-center"
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-sm
                      text-gray-400
                      transition
                      hover:text-orange-400
                    "
                  >
                    Help Center
                    <ArrowUpRight size={13} />
                  </Link>
                </li>

                {/* Privacy Policy */}
                <li>
                  <Link
                    to="/privacy-policy"
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-sm
                      text-gray-400
                      transition
                      hover:text-orange-400
                    "
                  >
                    Privacy Policy
                    <ArrowUpRight size={13} />
                  </Link>
                </li>

                {/* Terms & Conditions */}
                <li>
                  <Link
                    to="/terms"
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-sm
                      text-gray-400
                      transition
                      hover:text-orange-400
                    "
                  >
                    Terms & Conditions
                    <ArrowUpRight size={13} />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* =====================================================
              DIVIDER
          ====================================================== */}

          <div className="my-6 h-px bg-gray-800" />

          {/* =====================================================
              BOTTOM
          ====================================================== */}

          <div
            className="
              flex
              flex-col
              gap-2
              pb-0
              text-sm
              text-gray-500
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <p>
              © {new Date().getFullYear()} EventON.
              All rights reserved.
            </p>

            <p>
              Discover. Connect. Experience.
            </p>
          </div>
        </div>
      </section>
    </footer>
  );
}

export default Footer;