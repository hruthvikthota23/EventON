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

        {/* Footer Main */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
                <CalendarDays size={21} strokeWidth={2.5} />
              </div>

              <span className="text-2xl font-bold tracking-tight">
                Event<span className="text-orange-500">ON</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-400">
              Discover amazing events, connect with people,
              and create memorable experiences with EventON.
            </p>

            {/* Contact / Social-style Actions */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                aria-label="Website"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition hover:bg-orange-500 hover:text-white"
              >
                <Globe2 size={17} />
              </button>

              <button
                type="button"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition hover:bg-orange-500 hover:text-white"
              >
                <Mail size={17} />
              </button>

              <button
                type="button"
                aria-label="Community"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition hover:bg-orange-500 hover:text-white"
              >
                <MessageCircle size={17} />
              </button>

              <button
                type="button"
                aria-label="Share EventON"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition hover:bg-orange-500 hover:text-white"
              >
                <Share2 size={17} />
              </button>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Platform
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/events"
                  className="text-sm text-gray-400 transition hover:text-orange-400"
                >
                  Browse Events
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="text-sm text-gray-400 transition hover:text-orange-400"
                >
                  Create an Event
                </Link>
              </li>

              <li>
                <Link
                  to="/login"
                  className="text-sm text-gray-400 transition hover:text-orange-400"
                >
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <button
                  type="button"
                  className="text-sm text-gray-400 transition hover:text-orange-400"
                >
                  About Us
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="text-sm text-gray-400 transition hover:text-orange-400"
                >
                  Contact
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="text-sm text-gray-400 transition hover:text-orange-400"
                >
                  Careers
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Support
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <button
                  type="button"
                  className="text-sm text-gray-400 transition hover:text-orange-400"
                >
                  Help Center
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="text-sm text-gray-400 transition hover:text-orange-400"
                >
                  Privacy Policy
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="text-sm text-gray-400 transition hover:text-orange-400"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-gray-800" />

        {/* Bottom */}
        <div className="flex flex-col gap-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} EventON. All rights reserved.
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