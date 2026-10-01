import { Link, Outlet, useLocation } from "react-router-dom";
import { CalendarDays } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function AppLayout() {
  const location = useLocation();

  // =========================================================
  // AUTH PAGES
  // =========================================================

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  // =========================================================
  // AUTH LAYOUT
  // =========================================================

  if (isAuthPage) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-slate-50">

        {/* ===================================================
            AUTH HEADER
        =================================================== */}

        <header className="h-16 shrink-0 border-b border-slate-200 bg-white">
          <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">

            <Link
              to="/"
              className="flex h-10 shrink-0 items-center gap-3"
              aria-label="Go to EventON home"
            >
              {/* EventON Icon */}

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
                <CalendarDays
                  size={25}
                  strokeWidth={2}
                />
              </span>

              {/* EventON Name */}

              <span className="whitespace-nowrap text-[22px] font-bold leading-10 tracking-tight text-slate-900">
                Event
                <span className="text-orange-500">
                  ON
                </span>
              </span>
            </Link>

          </div>
        </header>

        {/* ===================================================
            AUTH CONTENT
        =================================================== */}

        <main className="min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </main>

      </div>
    );
  }

  // =========================================================
  // NORMAL APPLICATION LAYOUT
  // =========================================================

  return (
    <div className="flex min-h-screen flex-col">

      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

    </div>
  );
}

export default AppLayout;