import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  TicketCheck,
  UserCircle,
  LogOut,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function OrganizerSidebar({
  mobileOpen = false,
  onClose,
}) {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  // =========================================================
  // NAVIGATION ITEMS
  // =========================================================

  const navigationItems = [
    {
      label: "Dashboard",
      path: "/organizer",
      icon: LayoutDashboard,
    },
    {
      label: "My Events",
      path: "/organizer/events",
      icon: CalendarDays,
    },
    {
      label: "Create Event",
      path: "/organizer/events/create",
      icon: PlusCircle,
    },
    {
      label: "Bookings",
      path: "/organizer/bookings",
      icon: TicketCheck,
    },
    {
      label: "Profile",
      path: "/organizer/profile",
      icon: UserCircle,
    },
  ];

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();

    if (onClose) {
      onClose();
    }

    navigate("/", {
      replace: true,
    });
  };

  // =========================================================
  // SIDEBAR CONTENT
  // =========================================================

  const sidebarContent = (
    <div className="flex h-full flex-col">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800 px-5">
        <NavLink
          to="/organizer"
          onClick={onClose}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white shadow-sm">
            E
          </span>

          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              Event<span className="text-orange-400">ON</span>
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Organizer
            </p>
          </div>
        </NavLink>

        {/* Mobile close */}

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close organizer menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* =====================================================
          ORGANIZER PROFILE
      ====================================================== */}

      <div className="border-b border-slate-800 px-5 py-5">
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
            {user?.name
              ? user.name
                  .charAt(0)
                  .toUpperCase()
              : "O"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name || "Organizer"}
            </p>

            <p className="truncate text-xs text-slate-500">
              {user?.email || "Organizer account"}
            </p>
          </div>

        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          Management
        </p>

        <div className="space-y-1">
          {navigationItems.map(
            ({
              label,
              path,
              icon: Icon,
            }) => (
              <NavLink
                key={path}
                to={path}
                end={
                  path === "/organizer"
                }
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      strokeWidth={
                        isActive ? 2.2 : 2
                      }
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-500 transition group-hover:text-slate-300"
                      }
                    />

                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            )
          )}
        </div>
      </nav>

      {/* =====================================================
          BOTTOM ACTIONS
      ====================================================== */}

      <div className="shrink-0 border-t border-slate-800 p-3">

        {/* View public website */}

        <NavLink
          to="/events"
          onClick={onClose}
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <CalendarDays size={19} />
          <span>View Events</span>
        </NavLink>

        {/* Logout */}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>

      </div>
    </div>
  );

  // =========================================================
  // DESKTOP + MOBILE
  // =========================================================

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-slate-950 lg:block">
        {sidebarContent}
      </aside>

      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close organizer menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =====================================================
          MOBILE SIDEBAR
      ====================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export default OrganizerSidebar;