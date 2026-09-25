import { Link, Outlet } from "react-router-dom";
import { CalendarDays } from "lucide-react";

function AuthLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <header className="h-16 shrink-0 border-b border-slate-200 bg-white">
        <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">

          {/* EXACT SAME LOGO AS NAVBAR.JSX */}
          <Link
            to="/"
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
          </Link>

        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;