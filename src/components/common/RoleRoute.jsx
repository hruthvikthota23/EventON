import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function RoleRoute({ allowedRoles = [] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // ---------------------------------------------------------
  // WAIT FOR AUTH RESTORE
  // ---------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // NOT LOGGED IN
  // ---------------------------------------------------------

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ---------------------------------------------------------
  // ROLE CHECK
  // ---------------------------------------------------------

  const userRole = String(
    user.role || "attendee"
  ).toLowerCase();

  const hasPermission =
    allowedRoles.includes(userRole);

  // ---------------------------------------------------------
  // ACCESS DENIED
  // ---------------------------------------------------------

  if (!hasPermission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <ShieldAlert size={30} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Access Denied
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You don't have permission to access this
            section of EventON.
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-left">
            <p className="text-xs text-slate-400">
              Current Role
            </p>

            <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
              {userRole}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="mt-6 w-full rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Back to EventON
          </button>

        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // AUTHORIZED
  // ---------------------------------------------------------

  return <Outlet />;
}

export default RoleRoute;