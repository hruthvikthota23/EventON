import { Link, Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <header className="h-16 shrink-0 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center px-5 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white">
              E
            </span>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Event<span className="text-orange-500">
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