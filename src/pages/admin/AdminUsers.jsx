import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  Search,
  UserRound,
  UserRoundCog,
  Users,
  X,
} from "lucide-react";

const ACCOUNTS_STORAGE_KEY = "eventon_accounts";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // =========================================================
  // LOAD REGISTERED USERS
  // Only Attendees and Organizers are considered registered users
  // =========================================================

  const loadUsers = () => {
    try {
      const rawAccounts = localStorage.getItem(
        ACCOUNTS_STORAGE_KEY
      );

      if (!rawAccounts) {
        setUsers([]);
        return;
      }

      const parsedAccounts = JSON.parse(rawAccounts);

      const registeredUsers = Array.isArray(parsedAccounts)
        ? parsedAccounts.filter((account) => {
            const role = String(account?.role || "attendee")
              .trim()
              .toLowerCase();

            return role === "attendee" || role === "organizer";
          })
        : [];

      setUsers(registeredUsers);
    } catch (error) {
      console.error(
        "Unable to load EventON users:",
        error
      );

      setUsers([]);
    }
  };

  // =========================================================
  // INITIAL LOAD + LIVE UPDATES
  // =========================================================

  useEffect(() => {
    loadUsers();

    const handleUpdate = () => {
      loadUsers();
    };

    window.addEventListener(
      "storage",
      handleUpdate
    );

    window.addEventListener(
      "eventon:auth-updated",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleUpdate
      );

      window.removeEventListener(
        "eventon:auth-updated",
        handleUpdate
      );
    };
  }, []);

  // =========================================================
  // USER STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const attendees = users.filter(
      (user) =>
        String(user.role || "")
          .trim()
          .toLowerCase() === "attendee"
    );

    const organizers = users.filter(
      (user) =>
        String(user.role || "")
          .trim()
          .toLowerCase() === "organizer"
    );

    return {
      total: users.length,
      attendees: attendees.length,
      organizers: organizers.length,
    };
  }, [users]);

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredUsers = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const role = String(
        user.role || "attendee"
      )
        .trim()
        .toLowerCase();

      // Only attendees and organizers
      if (
        role !== "attendee" &&
        role !== "organizer"
      ) {
        return false;
      }

      const matchesRole =
        roleFilter === "all" ||
        role === roleFilter;

      const matchesSearch =
        !query ||
        String(user.name || "")
          .toLowerCase()
          .includes(query) ||
        String(user.email || "")
          .toLowerCase()
          .includes(query) ||
        String(user.id || "")
          .toLowerCase()
          .includes(query);

      return (
        matchesRole &&
        matchesSearch
      );
    });
  }, [
    users,
    searchQuery,
    roleFilter,
  ]);

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  const clearSearch = () => {
    setSearchQuery("");
  };

  // =========================================================
  // ROLE LABEL
  // =========================================================

  const getRoleLabel = (role) => {
    const normalizedRole = String(
      role || "attendee"
    )
      .trim()
      .toLowerCase();

    if (normalizedRole === "organizer") {
      return "Organizer";
    }

    return "Attendee";
  };

  // =========================================================
  // ROLE STYLE
  // =========================================================

  const getRoleStyle = (role) => {
    const normalizedRole = String(
      role || "attendee"
    )
      .trim()
      .toLowerCase();

    if (normalizedRole === "organizer") {
      return "bg-violet-50 text-violet-600";
    }

    return "bg-blue-50 text-blue-600";
  };

  // =========================================================
  // ROLE ICON
  // =========================================================

  const getRoleIcon = (role) => {
    const normalizedRole = String(
      role || "attendee"
    )
      .trim()
      .toLowerCase();

    if (normalizedRole === "organizer") {
      return UserRoundCog;
    }

    return UserRound;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-full bg-slate-50">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-6 lg:px-8">

          <p className="text-sm font-medium text-orange-500">
            Administration
          </p>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Users
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage registered attendees
                and organizers across EventON.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users size={17} />

              <span>
                {statistics.total} registered users
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-6 lg:px-8">

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <UserStatCard
            title="Total Users"
            value={statistics.total}
            icon={Users}
            iconClass="bg-blue-50 text-blue-600"
          />

          <UserStatCard
            title="Attendees"
            value={statistics.attendees}
            icon={UserRound}
            iconClass="bg-blue-50 text-blue-600"
          />

          <UserStatCard
            title="Organizers"
            value={statistics.organizers}
            icon={UserRoundCog}
            iconClass="bg-violet-50 text-violet-600"
          />

        </section>

        {/* ===================================================
            USERS PANEL
        =================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* =================================================
              FILTER HEADER
          ================================================= */}

          <div className="border-b border-slate-200 p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* SEARCH */}

              <div className="relative w-full lg:max-w-md">

                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search by name, email or user ID..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}

              </div>

              {/* ROLE FILTERS */}

              <div className="flex flex-wrap items-center gap-2">

                <RoleFilterButton
                  label="All"
                  count={statistics.total}
                  active={roleFilter === "all"}
                  onClick={() =>
                    setRoleFilter("all")
                  }
                />

                <RoleFilterButton
                  label="Attendees"
                  count={statistics.attendees}
                  active={
                    roleFilter === "attendee"
                  }
                  onClick={() =>
                    setRoleFilter("attendee")
                  }
                />

                <RoleFilterButton
                  label="Organizers"
                  count={statistics.organizers}
                  active={
                    roleFilter === "organizer"
                  }
                  onClick={() =>
                    setRoleFilter("organizer")
                  }
                />

              </div>

            </div>
          </div>

          {/* =================================================
              RESULTS HEADER
          ================================================= */}

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Registered Users
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Showing{" "}
                {filteredUsers.length}{" "}
                of{" "}
                {users.length} users
              </p>
            </div>

          </div>

          {/* =================================================
              USER LIST
          ================================================= */}

          {filteredUsers.length === 0 ? (

            <EmptyUsersState
              hasFilters={
                Boolean(
                  searchQuery ||
                  roleFilter !== "all"
                )
              }
              onClear={() => {
                setSearchQuery("");
                setRoleFilter("all");
              }}
            />

          ) : (

            <div className="divide-y divide-slate-100">

              {filteredUsers.map((account) => {

                const role = String(
                  account.role || "attendee"
                )
                  .trim()
                  .toLowerCase();

                const RoleIcon =
                  getRoleIcon(role);

                const displayName =
                  account.name ||
                  "Unnamed User";

                const initial =
                  displayName
                    .charAt(0)
                    .toUpperCase();

                const userId =
                  account.id || "—";

                return (
                  <div
                    key={
                      account.id ||
                      account.email
                    }
                    className="group px-5 py-4 transition hover:bg-slate-50"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                      {/* =================================
                          USER
                      ================================= */}

                      <div className="flex min-w-0 flex-1 items-center gap-4">

                        {/* AVATAR */}

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                          {initial}
                        </div>

                        {/* USER DETAILS */}

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-900">
                            {displayName}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {account.email ||
                              "No email"}
                          </p>

                        </div>

                      </div>

                      {/* =================================
                          ROLE
                      ================================= */}

                      <div className="flex items-center gap-3 lg:w-40">

                        <span
                          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleStyle(
                            role
                          )}`}
                        >
                          <RoleIcon size={13} />

                          {getRoleLabel(role)}
                        </span>

                      </div>

                      {/* =================================
                          FULL USER ID
                      ================================= */}

                      <div className="w-full lg:w-[360px]">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          User ID
                        </p>

                        <p
                          className="mt-1 break-all text-xs font-medium text-slate-600"
                          title={userId}
                        >
                          {userId}
                        </p>

                      </div>

                      {/* =================================
                          VIEW BUTTON
                      ================================= */}

                      <div className="lg:w-28 lg:text-right">

                        <Link
                          to={`/admin/users/${account.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                        >
                          View Details

                          <ArrowRight size={13} />
                        </Link>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

// ===========================================================
// USER STAT CARD
// ===========================================================

function UserStatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {Number(value || 0).toLocaleString(
              "en-IN"
            )}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>

      </div>

    </div>
  );
}

// ===========================================================
// ROLE FILTER BUTTON
// ===========================================================

function RoleFilterButton({
  label,
  count,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
        active
          ? "bg-orange-500 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
      }`}
    >
      <span>{label}</span>

      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
          active
            ? "bg-white/20 text-white"
            : "bg-white text-slate-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// ===========================================================
// EMPTY USERS STATE
// ===========================================================

function EmptyUsersState({
  hasFilters,
  onClear,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Users size={25} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {hasFilters
          ? "No users found"
          : "No users yet"}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {hasFilters
          ? "Try changing your search or role filter."
          : "Registered EventON users will appear here."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-orange-600"
        >
          Clear filters
        </button>
      )}

    </div>
  );
}

export default AdminUsers;