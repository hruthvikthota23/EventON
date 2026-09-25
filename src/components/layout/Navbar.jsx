import { useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [isProfileOpen, setIsProfileOpen] =
    useState(false);

  const isOrganizer =
    user?.role === "organizer";

  const isAdmin =
    user?.role === "admin";

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();

    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);

    navigate("/login");
  };

  // =========================================================
  // CLOSE MOBILE MENU
  // =========================================================

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  // =========================================================
  // PROFILE CLICK
  // =========================================================

  const handleProfileClick = () => {
    setIsProfileOpen(
      (previous) => !previous
    );
  };

  // =========================================================
  // PROFILE HOVER
  // =========================================================

  const handleProfileMouseEnter = () => {
    setIsProfileOpen(true);
  };

  const handleProfileMouseLeave = () => {
    setIsProfileOpen(false);
  };

  // =========================================================
  // INITIALS
  // =========================================================

  const getInitials = (name = "") => {
    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) {
      return "U";
    }

    if (words.length === 1) {
      return words[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${words[0][0]}${words[
      words.length - 1
    ][0]}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

      {/* =====================================================
          NAVBAR CONTAINER
      ===================================================== */}

      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ===================================================
            LOGO
        =================================================== */}

        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white shadow-sm">
            E
          </span>

          <span className="text-xl font-bold tracking-tight text-slate-900">
            Event
            <span className="text-orange-500">
              ON
            </span>
          </span>
        </Link>

        {/* ===================================================
            DESKTOP NAVIGATION
        =================================================== */}

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

        {/* ===================================================
            DESKTOP ACTIONS
        =================================================== */}

        <div className="hidden items-center gap-3 md:flex">

          {/* Search */}

          <Link
            to="/events"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Search events"
          >
            <Search size={19} />
          </Link>

          {/* =================================================
              LOGGED OUT
          ================================================= */}

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
            /* =================================================
               LOGGED IN PROFILE
            ================================================= */

            <div
              className="relative"
              onMouseEnter={
                handleProfileMouseEnter
              }
              onMouseLeave={
                handleProfileMouseLeave
              }
            >

              {/* Profile Button */}

              <button
                type="button"
                onClick={handleProfileClick}
                className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
                aria-expanded={
                  isProfileOpen
                }
                aria-label="Open account menu"
              >

                {/* Avatar */}

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                  {getInitials(
                    user?.name
                  )}
                </span>

                {/* Name */}

                <span className="max-w-28 truncate text-sm font-semibold text-slate-700">
                  {user?.name ||
                    "Account"}
                </span>

                {/* Arrow */}

                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition ${
                    isProfileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />

              </button>

              {/* =================================================
                  DROPDOWN
              ================================================= */}

              {isProfileOpen && (
                <div className="absolute right-0 top-full pt-2">

                  <div className="w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                    {/* USER HEADER */}

                    <div className="border-b border-slate-100 px-4 py-4">

                      <div className="flex items-center gap-3">

                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                          {getInitials(
                            user?.name
                          )}
                        </span>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-bold text-slate-900">
                            {user?.name ||
                              "EventON User"}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {user?.email}
                          </p>

                          <p className="mt-1 text-[11px] font-semibold capitalize text-orange-500">
                            {user?.role ||
                              "attendee"}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        MENU
                    ================================================= */}

                    <div className="p-2">

                      {/* ORGANIZER DASHBOARD */}

                      {isOrganizer && (
                        <Link
                          to="/organizer"
                          onClick={() =>
                            setIsProfileOpen(
                              false
                            )
                          }
                          className="mb-1 flex items-center gap-3 rounded-xl bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
                        >
                          <LayoutDashboard
                            size={17}
                          />

                          Organizer Dashboard
                        </Link>
                      )}

                      {/* ADMIN DASHBOARD */}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() =>
                            setIsProfileOpen(
                              false
                            )
                          }
                          className="mb-1 flex items-center gap-3 rounded-xl bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
                        >
                          <LayoutDashboard
                            size={17}
                          />

                          Admin Dashboard
                        </Link>
                      )}

                      {/* PROFILE */}

<Link
  to={
    isOrganizer
      ? "/organizer/profile"
      : "/profile"
  }
  onClick={closeMobileMenu}
  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
>
  <User
    size={18}
    className="text-slate-400"
  />

  My Profile
</Link>

                      {/* BOOKINGS */}

                      <Link
                        to="/bookings"
                        onClick={() =>
                          setIsProfileOpen(
                            false
                          )
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Search
                          size={17}
                          className="text-slate-400"
                        />

                        My Bookings
                      </Link>

                    </div>

                    {/* =================================================
                        LOGOUT
                    ================================================= */}

                    <div className="border-t border-slate-100 p-2">

                      <button
                        type="button"
                        onClick={
                          handleLogout
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut
                          size={17}
                        />

                        Logout
                      </button>

                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* ===================================================
            MOBILE MENU BUTTON
        =================================================== */}

        <button
          type="button"
          onClick={() =>
            setIsMobileMenuOpen(
              (previous) =>
                !previous
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

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {isMobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white md:hidden">

          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

            {/* PUBLIC NAVIGATION */}

            <nav className="space-y-1">

              <Link
                to="/"
                onClick={
                  closeMobileMenu
                }
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Home
              </Link>

              <Link
                to="/events"
                onClick={
                  closeMobileMenu
                }
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Events
              </Link>

            </nav>

            <div className="my-3 border-t border-slate-100" />

            {/* =================================================
                MOBILE LOGGED OUT
            ================================================= */}

            {!isAuthenticated ? (
              <div className="space-y-2">

                <Link
                  to="/login"
                  onClick={
                    closeMobileMenu
                  }
                  className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={
                    closeMobileMenu
                  }
                  className="block rounded-xl bg-orange-500 px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Get Started
                </Link>

              </div>
            ) : (
              /* =================================================
                 MOBILE LOGGED IN
              ================================================= */

              <div>

                {/* USER */}

                <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    {getInitials(
                      user?.name
                    )}
                  </span>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold text-slate-900">
                      {user?.name ||
                        "EventON User"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user?.email}
                    </p>

                    <p className="mt-1 text-[11px] font-semibold capitalize text-orange-500">
                      {user?.role ||
                        "attendee"}
                    </p>

                  </div>

                </div>

                {/* ORGANIZER DASHBOARD */}

                {isOrganizer && (
                  <Link
                    to="/organizer"
                    onClick={
                      closeMobileMenu
                    }
                    className="mb-1 flex items-center gap-3 rounded-xl bg-orange-50 px-3 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
                  >
                    <LayoutDashboard
                      size={18}
                    />

                    Organizer Dashboard
                  </Link>
                )}

                {/* ADMIN DASHBOARD */}

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={
                      closeMobileMenu
                    }
                    className="mb-1 flex items-center gap-3 rounded-xl bg-orange-50 px-3 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
                  >
                    <LayoutDashboard
                      size={18}
                    />

                    Admin Dashboard
                  </Link>
                )}

                {/* PROFILE */}

                <Link
                  to="/profile"
                  onClick={
                    closeMobileMenu
                  }
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <User
                    size={18}
                    className="text-slate-400"
                  />

                  My Profile
                </Link>

                {/* BOOKINGS */}

                <Link
                  to="/bookings"
                  onClick={
                    closeMobileMenu
                  }
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Search
                    size={18}
                    className="text-slate-400"
                  />

                  My Bookings
                </Link>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut
                    size={18}
                  />

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