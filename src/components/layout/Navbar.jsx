import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const profileRef = useRef(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ---------------------------------------------------------
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ---------------------------------------------------------

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------

  const handleLogout = () => {
    logout();

    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);

    navigate("/login");
  };

  // ---------------------------------------------------------
  // CLOSE MOBILE MENU
  // ---------------------------------------------------------

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // ---------------------------------------------------------
  // CLOSE PROFILE MENU
  // ---------------------------------------------------------

  const closeProfileMenu = () => {
    setIsProfileOpen(false);
  };

  // ---------------------------------------------------------
  // USER INITIALS
  // ---------------------------------------------------------

  const getInitials = (name = "") => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return "U";
    }

    const words = trimmedName.split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${
      words[words.length - 1][0]
    }`.toUpperCase();
  };

  // ---------------------------------------------------------
  // NAVBAR
  // ---------------------------------------------------------

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ================================================= */}
        {/* LOGO */}
        {/* ================================================= */}

        <Link
          to="/"
          onClick={() => {
            closeMobileMenu();
            closeProfileMenu();
          }}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white shadow-sm">
            E
          </span>

          <span className="text-xl font-bold tracking-tight text-slate-900">
            Event<span className="text-orange-500">ON</span>
          </span>
        </Link>

        {/* ================================================= */}
        {/* DESKTOP NAVIGATION */}
        {/* ================================================= */}

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 transition hover:text-orange-500"
          >
            Home
          </Link>

          <Link
            to="/events"
            className="text-sm font-medium text-slate-600 transition hover:text-orange-500"
          >
            Events
          </Link>
        </nav>

        {/* ================================================= */}
        {/* DESKTOP ACTIONS */}
        {/* ================================================= */}

        <div className="hidden items-center gap-3 md:flex">

          {/* Search */}
          <Link
            to="/events"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Search events"
          >
            <Search size={19} />
          </Link>

          {/* ================================================= */}
          {/* LOGGED OUT */}
          {/* ================================================= */}

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                Get Started
              </Link>
            </>
          ) : (

            /* ================================================= */
            /* LOGGED IN PROFILE */
            /* ================================================= */

            <div
              ref={profileRef}
              className="relative"
              onMouseLeave={() => setIsProfileOpen(false)}
            >

              {/* Profile Button */}

              <button
                type="button"
                onClick={() =>
                  setIsProfileOpen(
                    (previous) => !previous
                  )
                }
                className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition ${
                  isProfileOpen
                    ? "bg-slate-100"
                    : "hover:bg-slate-100"
                }`}
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                {/* Avatar */}

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                  {getInitials(user?.name)}
                </span>

                {/* Name */}

                <span className="max-w-28 truncate text-sm font-semibold text-slate-700">
                  {user?.name || "Account"}
                </span>

                {/* Arrow */}

                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isProfileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* ================================================= */}
              {/* PROFILE DROPDOWN */}
              {/* ================================================= */}

              <div
                className={`absolute right-0 top-full w-64 pt-2 transition-all duration-200 ${
                  isProfileOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible translate-y-1 opacity-0"
                }`}
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                  {/* User Information */}

                  <div className="border-b border-slate-100 px-4 py-4">
                    <div className="flex items-center gap-3">

                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                        {getInitials(user?.name)}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {user?.name ||
                            "EventON User"}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {user?.email}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* MENU OPTIONS */}
                  {/* ================================================= */}

                  <div className="p-2">

                    {/* My Profile */}

                    <Link
                      to="/profile"
                      onClick={closeProfileMenu}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      <User
                        size={17}
                        className="text-slate-400"
                      />

                      <span>My Profile</span>
                    </Link>

                    {/* My Bookings */}

                    <Link
                      to="/bookings"
                      onClick={closeProfileMenu}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      <CalendarDays
                        size={17}
                        className="text-slate-400"
                      />

                      <span>My Bookings</span>
                    </Link>

                  </div>

                  {/* ================================================= */}
                  {/* LOGOUT */}
                  {/* ================================================= */}

                  <div className="border-t border-slate-100 p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />

                      <span>Logout</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* MOBILE MENU BUTTON */}
        {/* ================================================= */}

        <button
          type="button"
          onClick={() =>
            setIsMobileMenuOpen(
              (previous) => !previous
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </div>

      {/* ================================================= */}
      {/* MOBILE MENU */}
      {/* ================================================= */}

      {isMobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

            {/* Navigation */}

            <nav className="space-y-1">

              <Link
                to="/"
                onClick={closeMobileMenu}
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Home
              </Link>

              <Link
                to="/events"
                onClick={closeMobileMenu}
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Events
              </Link>

            </nav>

            <div className="my-3 border-t border-slate-100" />

            {/* ================================================= */}
            {/* MOBILE LOGGED OUT */}
            {/* ================================================= */}

            {!isAuthenticated ? (
              <div className="space-y-2">

                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block rounded-xl bg-orange-500 px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Get Started
                </Link>

              </div>
            ) : (

              /* ================================================= */
              /* MOBILE LOGGED IN */
              /* ================================================= */

              <div>

                {/* User */}

                <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    {getInitials(user?.name)}
                  </span>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold text-slate-900">
                      {user?.name ||
                        "EventON User"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user?.email}
                    </p>

                  </div>

                </div>

                {/* My Profile */}

                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <User
                    size={18}
                    className="text-slate-400"
                  />

                  My Profile
                </Link>

                {/* My Bookings */}

                <Link
                  to="/bookings"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <CalendarDays
                    size={18}
                    className="text-slate-400"
                  />

                  My Bookings
                </Link>

                {/* Logout */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={18} />

                  Logout
                </button>

              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;