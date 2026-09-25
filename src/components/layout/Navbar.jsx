import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
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
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchInputRef = useRef(null);

  // =========================================================
  // ROLE
  // =========================================================

  const role = String(user?.role || "attendee")
    .trim()
    .toLowerCase();

  const isOrganizer = role === "organizer";
  const isAdmin = role === "admin";

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
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  // =========================================================
  // CLOSE MENUS
  // =========================================================

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);
  };

  // =========================================================
  // HOME / LOGO
  // =========================================================

  const goToHomeHero = () => {
    closeMenus();

    setIsSearchOpen(false);
    setSearchQuery("");

    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    navigate("/");

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  // =========================================================
  // SEARCH
  // =========================================================

  /*
    Search behavior:

    CLOSED
      [                         🔍 ]

    CLICK SEARCH ICON
      [              🔍 Search... ]

    OPEN
      - Typing does NOT close the search.
      - Moving from icon to input does NOT close it.
      - Pressing Enter performs the search.
      - Search remains open after Enter.
      - Search text is cleared after Enter.
      - Moving mouse outside the complete search area closes it.
      - Search text is cleared when it closes.
  */

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);

    setIsAccountOpen(false);
    setIsMobileMenuOpen(false);

    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const handleSearchAreaLeave = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      searchInputRef.current?.focus();
      return;
    }

    navigate(
      `/events?search=${encodeURIComponent(query)}`
    );

    // Keep search open.
    setIsSearchOpen(true);

    // Clear previous search.
    setSearchQuery("");

    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  // =========================================================
  // FOCUS SEARCH WHEN OPENED
  // =========================================================

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 280);

    return () => {
      clearTimeout(timer);
    };
  }, [isSearchOpen]);

  // =========================================================
  // ACCOUNT
  // =========================================================

  const handleAccountClick = () => {
    setIsAccountOpen((previous) => !previous);

    setIsSearchOpen(false);
    setSearchQuery("");

    setIsMobileMenuOpen(false);
  };

  const handleAccountMouseEnter = () => {
    setIsAccountOpen(true);
  };

  const handleAccountMouseLeave = () => {
    setIsAccountOpen(false);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    closeMenus();

    setIsSearchOpen(false);
    setSearchQuery("");

    logout();

    navigate("/", {
      replace: true,
    });
  };

  // =========================================================
  // MOBILE
  // =========================================================

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((previous) => !previous);

    setIsAccountOpen(false);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleMobileNavigation = () => {
    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  // =========================================================
  // COMMON NAV STYLE
  // =========================================================

  const desktopNavLink =
    "inline-flex h-10 items-center whitespace-nowrap text-[15px] font-medium leading-5 !text-slate-600 no-underline transition-colors duration-200 hover:!text-orange-500";

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">

      {/* =====================================================
          FIXED HEIGHT NAVBAR
      ===================================================== */}

      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">

        {/* ===================================================
            EVENTON LOGO
        =================================================== */}

        <button
          type="button"
          onClick={goToHomeHero}
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

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-10 md:flex">

          <Link
            to="/"
            onClick={goToHomeHero}
            className={desktopNavLink}
          >
            Home
          </Link>

          <Link
            to="/events"
            className={desktopNavLink}
          >
            Events
          </Link>

          <Link
            to="/about"
            className={desktopNavLink}
          >
            About Us
          </Link>

        </nav>

        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div className="ml-auto flex h-10 items-center">

          {/* =================================================
              SEARCH AREA

              FIXED 240px WIDTH

              Opens ONLY by CLICK.
              Closes when mouse leaves the area.
          ================================================= */}

          <div
            className="relative hidden h-10 w-[240px] shrink-0 items-center md:flex"
            onMouseLeave={handleSearchAreaLeave}
          >

            {/* ---------------------------------------------
                SEARCH ICON
            --------------------------------------------- */}

            <button
              type="button"
              aria-label="Search events"
              onClick={handleSearchIconClick}
              className={`absolute right-0 top-0 z-30 flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-slate-100 hover:text-orange-500 ${
                isSearchOpen
                  ? "pointer-events-none scale-75 opacity-0"
                  : "scale-100 opacity-100"
              }`}
            >
              <Search
                size={20}
                strokeWidth={2}
              />
            </button>

            {/* ---------------------------------------------
                SEARCH BAR
            --------------------------------------------- */}

            <form
              onSubmit={handleSearchSubmit}
              className={`absolute right-0 top-0 z-20 flex h-10 origin-right items-center overflow-hidden rounded-xl border bg-slate-50 shadow-sm transition-[width,opacity,transform,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isSearchOpen
                  ? "w-[240px] scale-100 border-slate-200 opacity-100"
                  : "pointer-events-none w-10 scale-[0.82] border-transparent opacity-0"
              }`}
            >

              {/* SEARCH ICON INSIDE BAR */}

              <span className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-400">
                <Search
                  size={17}
                  strokeWidth={2}
                />
              </span>

              {/* INPUT */}

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                }}
                placeholder="Search events..."
                autoComplete="off"
                className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-normal text-slate-800 outline-none placeholder:text-slate-400"
              />

            </form>

          </div>

          {/* =================================================
              ACCOUNT AREA
          ================================================= */}

          {isAuthenticated ? (

            <div
              className="relative ml-2 hidden h-10 md:block"
              onMouseEnter={handleAccountMouseEnter}
              onMouseLeave={handleAccountMouseLeave}
            >

              {/* ACCOUNT BUTTON */}

              <button
                type="button"
                onClick={handleAccountClick}
                className="flex h-10 items-center gap-2 rounded-xl px-2.5 transition-colors duration-200 hover:bg-slate-100"
                aria-expanded={isAccountOpen}
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
                className={`absolute right-0 top-full mt-2 w-60 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl transition-all duration-200 ${
                  isAccountOpen
                    ? "visible translate-y-0 scale-100 opacity-100"
                    : "invisible -translate-y-2 scale-95 opacity-0"
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
                  <Link
                    to="/organizer"
                    onClick={() =>
                      setIsAccountOpen(false)
                    }
                    className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
                  >
                    <LayoutDashboard size={18} />

                    <span>
                      Dashboard
                    </span>
                  </Link>
                )}

                {/* ADMIN DASHBOARD */}

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() =>
                      setIsAccountOpen(false)
                    }
                    className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
                  >
                    <LayoutDashboard size={18} />

                    <span>
                      Admin Dashboard
                    </span>
                  </Link>
                )}

                {/* MY PROFILE */}

                <Link
                  to={
                    isOrganizer
                      ? "/organizer/profile"
                      : "/profile"
                  }
                  onClick={() =>
                    setIsAccountOpen(false)
                  }
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
                >
                  <User size={18} />

                  <span>
                    My Profile
                  </span>
                </Link>

                {/* MY BOOKINGS */}

                <Link
                  to="/bookings"
                  onClick={() =>
                    setIsAccountOpen(false)
                  }
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
                >
                  <CalendarDays size={18} />

                  <span>
                    My Bookings
                  </span>
                </Link>

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

          ) : (

            /* =================================================
               LOGGED OUT
            ================================================= */

            <div className="ml-2 hidden h-10 items-center gap-2 md:flex">

              <Link
                to="/login"
                className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium leading-5 text-slate-600 transition-colors duration-200 hover:text-orange-500"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="inline-flex h-10 items-center rounded-xl bg-orange-500 px-4 text-sm font-semibold leading-5 text-white transition-all duration-200 hover:bg-orange-600 hover:shadow-md"
              >
                Register
              </Link>

            </div>

          )}

          {/* =================================================
              MOBILE BUTTON
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
      ===================================================== */}

      <div
        className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 md:hidden ${
          isMobileMenuOpen
            ? "max-h-[700px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >

        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

          {/* MOBILE SEARCH */}

          <form
            onSubmit={(event) => {
              handleSearchSubmit(event);
              setIsMobileMenuOpen(false);
            }}
            className="mb-4 flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3"
          >
            <Search
              size={18}
              className="mr-2 shrink-0 text-slate-400"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search events..."
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </form>

          {/* MOBILE NAV */}

          <nav className="flex flex-col gap-1">

            <Link
              to="/"
              onClick={() => {
                goToHomeHero();
                handleMobileNavigation();
              }}
              className="rounded-xl px-3 py-3 text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-orange-500"
            >
              Home
            </Link>

            <Link
              to="/events"
              onClick={handleMobileNavigation}
              className="rounded-xl px-3 py-3 text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-orange-500"
            >
              Events
            </Link>

            <Link
              to="/about"
              onClick={handleMobileNavigation}
              className="rounded-xl px-3 py-3 text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-orange-500"
            >
              About Us
            </Link>

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
                <Link
                  to="/organizer"
                  onClick={handleMobileNavigation}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
                >
                  <LayoutDashboard size={18} />

                  <span>
                    Dashboard
                  </span>
                </Link>
              )}

              {/* ADMIN DASHBOARD */}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={handleMobileNavigation}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
                >
                  <LayoutDashboard size={18} />

                  <span>
                    Admin Dashboard
                  </span>
                </Link>
              )}

              {/* MY PROFILE */}

              <Link
                to={
                  isOrganizer
                    ? "/organizer/profile"
                    : "/profile"
                }
                onClick={handleMobileNavigation}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
              >
                <User size={18} />

                <span>
                  My Profile
                </span>
              </Link>

              {/* MY BOOKINGS */}

              <Link
                to="/bookings"
                onClick={handleMobileNavigation}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-orange-500"
              >
                <CalendarDays size={18} />

                <span>
                  My Bookings
                </span>
              </Link>

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

              <Link
                to="/login"
                onClick={handleMobileNavigation}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition-colors hover:border-orange-200 hover:text-orange-500"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={handleMobileNavigation}
                className="flex-1 rounded-xl bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                Register
              </Link>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;