import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Ticket,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function OrganizerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigation = [
    {
      label: "Home",
      path: "/",
      icon: Home,
    },
    {
      label: "Dashboard",
      path: "/organizer",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "My Events",
      path: "/organizer/events",
      icon: CalendarDays,
    },
    {
      label: "Bookings",
      path: "/organizer/bookings",
      icon: Ticket,
    },
  ];

  // =========================================================
  // PROFILE NAVIGATION
  // =========================================================

  const handleProfileClick = () => {
    setSidebarOpen(false);
    navigate("/organizer/profile");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* ---------------------------------------------------
            LOGO
        --------------------------------------------------- */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white shadow-sm">
              E
            </span>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Event<span className="text-orange-500">ON</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* ---------------------------------------------------
            ORGANIZER LABEL
        --------------------------------------------------- */}

        <div className="px-5 pb-3 pt-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Organizer
          </p>
        </div>

        {/* ---------------------------------------------------
            NAVIGATION
        --------------------------------------------------- */}

        <nav className="flex-1 space-y-1 px-3">

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

        </nav>

        {/* ---------------------------------------------------
            LOGOUT
        --------------------------------------------------- */}

        <div className="border-t border-slate-200 p-4">

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />

            <span>Logout</span>
          </button>

        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="lg:pl-72">

        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">

          {/* Mobile menu */}

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Desktop title */}

          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-500">
              Event Management
            </p>
          </div>

          {/* =================================================
              TOP RIGHT PROFILE
          ================================================= */}

          <button
            type="button"
            onClick={handleProfileClick}
            className="group ml-auto flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50"
            aria-label="Open organizer profile"
          >

            {/* Name */}

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900 transition group-hover:text-orange-600">
                {user?.name || "Organizer"}
              </p>

              <p className="text-xs text-slate-500">
                Organizer
              </p>
            </div>

            {/* Avatar */}

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "O"}
            </div>

          </button>

        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default OrganizerLayout;