import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  // =========================================================
  // STATE
  // =========================================================

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [isAccountOpen, setIsAccountOpen] =
    useState(false);

  // =========================================================
  // REFS
  // =========================================================

  const accountCloseTimerRef = useRef(null);

  // =========================================================
  // ROLE
  // =========================================================

  const role = String(
    user?.role || "attendee"
  )
    .trim()
    .toLowerCase();

  const isOrganizer = role === "organizer";
  const isAdmin = role === "admin";

  // =========================================================
  // ROLE-BASED PROFILE PATH
  // =========================================================

  const profilePath =
    isAdmin
      ? "/admin/profile"
      : isOrganizer
      ? "/organizer/profile"
      : "/profile";

  // =========================================================
  // SCROLL TO TOP
  // =========================================================

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // SCROLL TO TOP WHEN ROUTE CHANGES
  // =========================================================
  //
  // This handles navigation such as:
  //
  // Home -> Events
  // Events -> About
  // About -> Home
  // Profile -> My Bookings
  // Dashboard -> Profile
  //
  // =========================================================

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  // =========================================================
  // NAVIGATION HANDLER
  // =========================================================
  //
  // If clicking the current page:
  //     manually scroll to top.
  //
  // If clicking another page:
  //     navigate to that page.
  //     useEffect above handles the scroll.
  //
  // =========================================================

  const handleNavigation = (path) => {
    closeMenus();

    if (location.pathname === path) {
      scrollToTop();
      return;
    }

    navigate(path);
  };

  // =========================================================
  // USER INITIALS
  // =========================================================

  const getInitials = (name = "") => {
    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return "U";
    }

    if (words.length === 1) {
      return words[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${words[0][0]}${words[words.length - 1][0]}`
      .toUpperCase();
  };

  // =========================================================
  // CLOSE MENUS
  // =========================================================

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);
  };

  // =========================================================
  // ACCOUNT DROPDOWN
  // =========================================================

  const clearAccountCloseTimer = () => {
    if (accountCloseTimerRef.current) {
      clearTimeout(accountCloseTimerRef.current);
      accountCloseTimerRef.current = null;
    }
  };

  const openAccountDropdown = () => {
    clearAccountCloseTimer();
    setIsAccountOpen(true);
  };

  const closeAccountDropdown = () => {
    clearAccountCloseTimer();

    accountCloseTimerRef.current = setTimeout(() => {
      setIsAccountOpen(false);
    }, 120);
  };

  const handleAccountClick = () => {
    clearAccountCloseTimer();

    setIsAccountOpen((previous) => !previous);
    setIsMobileMenuOpen(false);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    clearAccountCloseTimer();

    closeMenus();

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================================
  // MOBILE
  // =========================================================

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((previous) => !previous);

    setIsAccountOpen(false);

    clearAccountCloseTimer();
  };

  const handleMobileNavigation = () => {
    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);

    clearAccountCloseTimer();
  };

  // =========================================================
  // COMMON DESKTOP NAV STYLE
  // =========================================================

  const desktopNavLink =
    "inline-flex h-10 items-center whitespace-nowrap text-[15px] font-medium leading-5 !text-slate-600 no-underline transition-colors duration-200 hover:!text-orange-500";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">

      {/* =====================================================
          DESKTOP / MAIN NAVBAR
      ====================================================== */}

      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">

        {/* ===================================================
            EVENTON LOGO
        =================================================== */}

        <button
          type="button"
          onClick={() => handleNavigation("/")}
          className="flex h-10 shrink-0 items-center gap-3"
          aria-label="Go to EventON home"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
            <CalendarDays
              size={25}
              strokeWidth={2}
            />
          </span>

          <span className="whitespace-nowrap text-[22px] font-bold leading-10 tracking-tight text-slate-900">
            Event
            <span className="text-orange-500">
              ON
            </span>
          </span>
        </button>

        {/* ===================================================
            CENTER NAVIGATION
        =================================================== */}

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex lg:gap-10">

          {/* HOME */}

          <button
            type="button"
            onClick={() => handleNavigation("/")}
            className={desktopNavLink}
          >
            Home
          </button>

          {/* EVENTS */}

          <button
            type="button"
            onClick={() => handleNavigation("/events")}
            className={desktopNavLink}
          >
            Events
          </button>

          {/* ABOUT */}

          <button
            type="button"
            onClick={() => handleNavigation("/about")}
            className={desktopNavLink}
          >
            About Us
          </button>

        </nav>

        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div className="ml-auto flex h-10 items-center">

          {/* =================================================
              ACCOUNT
          ================================================= */}

          {isAuthenticated ? (

            <div
              className="relative hidden h-10 md:block"
              onMouseEnter={openAccountDropdown}
              onMouseLeave={closeAccountDropdown}
            >

              {/* =================================================
                  ACCOUNT BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={handleAccountClick}
                className="flex h-10 items-center gap-2 rounded-xl px-2.5 transition-colors duration-200 hover:bg-slate-100"
                aria-expanded={isAccountOpen}
                aria-haspopup="menu"
              >

                {/* AVATAR */}

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
                  {getInitials(user?.name)}
                </span>

                {/* NAME */}

                <span className="hidden max-w-[100px] truncate text-sm font-medium leading-5 text-slate-700 lg:block">
                  {user?.name || "Account"}
                </span>

                {/* ARROW */}

                <ChevronDown
                  size={16}
                  className={`shrink-0 text-slate-500 transition-transform duration-200 ${
                    isAccountOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />

              </button>

              {/* =================================================
                  ACCOUNT DROPDOWN
              ================================================= */}

              <div
                className={`absolute left-1/2 top-full z-[70] -translate-x-1/2 pt-2 ${
                  isAccountOpen
                    ? "visible"
                    : "invisible"
                }`}
                onMouseEnter={openAccountDropdown}
                onMouseLeave={closeAccountDropdown}
              >

                <div
                  className={`w-60 origin-top rounded-2xl border border-slate-200 bg-white p-2 shadow-xl transition-all duration-200 ${
                    isAccountOpen
                      ? "translate-y-0 scale-100 opacity-100"
                      : "-translate-y-2 scale-95 opacity-0"
                  }`}
                >

                  {/* USER INFO */}

                  <div className="border-b border-slate-100 px-3 py-3">

                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user?.name || "User"}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {user?.email || ""}
                    </p>

                  </div>

                  {/* ORGANIZER DASHBOARD */}

                  {isOrganizer && (
                    <button
                      type="button"
                      onClick={() =>
                        handleNavigation("/organizer")
                      }
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
                    >
                      <LayoutDashboard
                        size={18}
                      />

                      <span>
                        Dashboard
                      </span>
                    </button>
                  )}

                  {/* ADMIN DASHBOARD */}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() =>
                        handleNavigation("/admin")
                      }
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
                    >
                      <LayoutDashboard
                        size={18}
                      />

                      <span>
                        Admin Dashboard
                      </span>
                    </button>
                  )}

                  {/* MY PROFILE */}

                  <button
                    type="button"
                    onClick={() =>
                      handleNavigation(profilePath)
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
                  >
                    <User size={18} />

                    <span>
                      My Profile
                    </span>
                  </button>

                  {/* MY BOOKINGS */}

                  <button
                    type="button"
                    onClick={() =>
                      handleNavigation("/my-bookings")
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
                  >
                    <CalendarDays
                      size={18}
                    />

                    <span>
                      My Bookings
                    </span>
                  </button>

                  {/* DIVIDER */}

                  <div className="my-1 border-t border-slate-100" />

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={18} />

                    <span>
                      Logout
                    </span>
                  </button>

                </div>
              </div>

            </div>

          ) : (

            /* =================================================
               LOGGED OUT
            ================================================= */

            <div className="hidden h-10 items-center gap-2 md:flex">

              <button
                type="button"
                onClick={() =>
                  handleNavigation("/login")
                }
                className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium leading-5 text-slate-600 transition-colors duration-200 hover:text-orange-500"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() =>
                  handleNavigation("/register")
                }
                className="inline-flex h-10 items-center rounded-xl bg-orange-500 px-4 text-sm font-semibold leading-5 text-white transition-all duration-200 hover:bg-orange-600 hover:shadow-md"
              >
                Register
              </button>

            </div>
          )}

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={toggleMobileMenu}
            className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-orange-500 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>
      </div>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <div
        className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 md:hidden ${
          isMobileMenuOpen
            ? "max-h-[700px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >

        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

          {/* =================================================
              MOBILE NAVIGATION
          ================================================= */}

          <nav className="flex flex-col gap-1">

            {/* HOME */}

            <button
              type="button"
              onClick={() => {
                handleNavigation("/");
                handleMobileNavigation();
              }}
              className="rounded-xl px-3 py-3 text-left text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-orange-500"
            >
              Home
            </button>

            {/* EVENTS */}

            <button
              type="button"
              onClick={() => {
                handleNavigation("/events");
                handleMobileNavigation();
              }}
              className="rounded-xl px-3 py-3 text-left text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-orange-500"
            >
              Events
            </button>

            {/* ABOUT */}

            <button
              type="button"
              onClick={() => {
                handleNavigation("/about");
                handleMobileNavigation();
              }}
              className="rounded-xl px-3 py-3 text-left text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-orange-500"
            >
              About Us
            </button>

          </nav>

          {/* =================================================
              MOBILE ACCOUNT
          ================================================= */}

          {isAuthenticated ? (

            <div className="mt-3 border-t border-slate-100 pt-3">

              {/* USER */}

              <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
                  {getInitials(user?.name)}
                </span>

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user?.name || "User"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user?.email || ""}
                  </p>

                </div>

              </div>

              {/* ORGANIZER DASHBOARD */}

              {isOrganizer && (
                <button
                  type="button"
                  onClick={() => {
                    handleNavigation("/organizer");
                    handleMobileNavigation();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
                >
                  <LayoutDashboard
                    size={18}
                  />

                  <span>
                    Dashboard
                  </span>
                </button>
              )}

              {/* ADMIN DASHBOARD */}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    handleNavigation("/admin");
                    handleMobileNavigation();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
                >
                  <LayoutDashboard
                    size={18}
                  />

                  <span>
                    Admin Dashboard
                  </span>
                </button>
              )}

              {/* MY PROFILE */}

              <button
                type="button"
                onClick={() => {
                  handleNavigation(profilePath);
                  handleMobileNavigation();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
              >
                <User size={18} />

                <span>
                  My Profile
                </span>
              </button>

              {/* MY BOOKINGS */}

              <button
                type="button"
                onClick={() => {
                  handleNavigation("/my-bookings");
                  handleMobileNavigation();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
              >
                <CalendarDays
                  size={18}
                />

                <span>
                  My Bookings
                </span>
              </button>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={18} />

                <span>
                  Logout
                </span>
              </button>

            </div>

          ) : (

            /* =================================================
               MOBILE LOGIN / REGISTER
            ================================================= */

            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-4">

              <button
                type="button"
                onClick={() => {
                  handleNavigation("/login");
                  handleMobileNavigation();
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition-colors hover:border-orange-200 hover:text-orange-500"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  handleNavigation("/register");
                  handleMobileNavigation();
                }}
                className="flex-1 rounded-xl bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                Register
              </button>

            </div>
          )}

        </div>
      </div>

    </header>
  );
}

export default Navbar;