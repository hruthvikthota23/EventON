import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  // =========================================================
  // PROFILE
  // =========================================================

  const handleProfileClick = () => {
    setSidebarOpen(false);

    navigate("/admin/profile");
  };

  // =========================================================
  // CLOSE MOBILE SIDEBAR
  // =========================================================

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigation = [
    {
      label: "Home",
      path: "/",
      icon: Home,
      end: true,
    },
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Events",
      path: "/admin/events",
      icon: CalendarDays,
    },
    {
      label: "Bookings",
      path: "/admin/bookings",
      icon: Ticket,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* ===================================================
            LOGO
        =================================================== */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <button
            type="button"
            onClick={() => {
              closeSidebar();
              navigate("/");
            }}
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

          {/* Mobile close */}

          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* ===================================================
            NAVIGATION LABEL
        =================================================== */}

        <div className="px-5 pb-3 pt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Admin
          </p>
        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-orange-50 font-semibold text-orange-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.2 : 2}
                    />

                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ===================================================
            ACCOUNT / LOGOUT
        =================================================== */}

        <div className="shrink-0 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut
              size={18}
              className="transition group-hover:text-red-600"
            />

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
            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Desktop admin indicator */}

          <div className="hidden items-center gap-2 lg:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <LayoutDashboard size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Admin Panel
              </p>

              <p className="text-[11px] text-slate-500">
                EventON Management
              </p>
            </div>
          </div>

          {/* =================================================
              TOP RIGHT PROFILE
          ================================================= */}

          <button
            type="button"
            onClick={handleProfileClick}
            className="group ml-auto flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50"
            aria-label="Open admin profile"
          >
            {/* Name */}

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900 transition group-hover:text-orange-600">
                {user?.name || "Administrator"}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>

            {/* Avatar */}

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
              {user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "A"}
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

export default AdminLayout;