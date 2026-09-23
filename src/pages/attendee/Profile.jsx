import {
  ArrowLeft,
  CalendarDays,
  Mail,
  Pencil,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Profile() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-5 py-16">
          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <User
                size={28}
                className="text-slate-400"
              />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Login required
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please sign in to view your profile.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Sign in
            </Link>

          </div>
        </section>
      </main>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login", {
      replace: true,
    });
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to home
          </Link>

        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">

        {/* Heading */}

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Manage your EventON account information.
          </p>
        </div>

        {/* =================================================
            PROFILE CARD
        ================================================== */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">

          {/* Profile Header */}

          <div className="border-b border-slate-200 bg-slate-50 p-6 sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              {/* Avatar */}

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-2xl font-bold text-white shadow-sm">
                {user.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

              {/* User */}

              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-900">
                  {user.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  EventON Attendee
                </p>
              </div>

              {/* Edit */}

              <div className="sm:ml-auto">
                <Link
                  to="/profile/edit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Pencil size={15} />
                  Edit Profile
                </Link>
              </div>

            </div>
          </div>

          {/* Account Information */}

          <div className="p-6 sm:p-8">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">
                Personal information
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900">
                Account details
              </h3>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              {/* Name */}

              <div className="rounded-xl border border-slate-200 bg-white p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <User size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      Full name
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                      {user.name}
                    </p>
                  </div>

                </div>

              </div>

              {/* Email */}

              <div className="rounded-xl border border-slate-200 bg-white p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Mail size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      Email address
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                      {user.email}
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

        {/* =================================================
            QUICK LINKS
        ================================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <Link
            to="/bookings"
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <CalendarDays size={20} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  My Bookings
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  View and manage your event bookings.
                </p>
              </div>

            </div>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Account Security
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your account is protected by EventON authentication.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            LOGOUT
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="font-bold text-red-700">
                Sign out
              </h3>

              <p className="mt-1 text-sm text-red-600/80">
                Sign out of your EventON account on this device.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Logout
            </button>

          </div>

        </div>

      </section>
    </main>
  );
}

export default Profile;