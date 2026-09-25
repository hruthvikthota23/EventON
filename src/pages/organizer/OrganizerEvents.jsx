import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Edit3,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Ticket,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  EVENTS_UPDATED_EVENT,
  deleteStoredEvent,
  getStoredEventsByOrganizer,
} from "../../utils/eventStorage";

// =========================================================
// HELPERS
// =========================================================

function formatDate(dateValue) {
  if (!dateValue) {
    return "Date unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getEventDate(event) {
  if (!event?.date) {
    return null;
  }

  const date = new Date(event.date);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isUpcoming(event) {
  const date = getEventDate(event);

  if (!date) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date >= today;
}

function getStatusClasses(status) {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();

  if (normalized === "published") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "draft") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  if (normalized === "cancelled") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (normalized === "completed") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function formatStatus(status) {
  const value = String(status || "unknown");

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

// =========================================================
// EVENT CARD
// =========================================================

function OrganizerEventCard({
  event,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const capacity = Number(event.capacity) || 0;

  const bookedSeats =
    Number(event.bookedSeats) || 0;

  const availableSeats = Math.max(
    capacity - bookedSeats,
    0
  );

  const occupancy =
    capacity > 0
      ? Math.min(
          (bookedSeats / capacity) * 100,
          100
        )
      : 0;

  const upcoming = isUpcoming(event);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Image */}
      <div className="relative h-48 bg-slate-100">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <CalendarDays size={42} />
          </div>
        )}

        {/* Status */}
        <span
          className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
            event.status
          )}`}
        >
          {formatStatus(event.status)}
        </span>

        {/* Menu */}
        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={() =>
              setMenuOpen((current) => !current)
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-900"
            aria-label="Event actions"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <Link
                to={`/organizer/events/${event.id}/edit`}
                onClick={() =>
                  setMenuOpen(false)
                }
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Edit3 size={16} />
                Edit event
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(event);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-lg font-bold text-slate-900">
              {event.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {event.category || "General Event"}
            </p>
          </div>

          <span className="shrink-0 text-sm font-bold text-slate-900">
            {Number(event.price) > 0
              ? formatCurrency(event.price)
              : "Free"}
          </span>
        </div>

        {/* Event information */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays
              size={16}
              className="shrink-0 text-orange-500"
            />

            <span>
              {formatDate(event.date)}
            </span>

            {event.time && (
              <>
                <span className="text-slate-300">
                  •
                </span>

                <Clock3
                  size={15}
                  className="text-orange-500"
                />

                <span>{event.time}</span>
              </>
            )}
          </div>

          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin
              size={16}
              className="mt-0.5 shrink-0 text-orange-500"
            />

            <span className="line-clamp-1">
              {event.location ||
                event.city ||
                "Location unavailable"}
            </span>
          </div>
        </div>

        {/* Capacity */}
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users
                size={16}
                className="text-slate-500"
              />

              <span className="text-sm font-medium text-slate-700">
                Ticket capacity
              </span>
            </div>

            <span className="text-sm font-semibold text-slate-900">
              {bookedSeats} / {capacity}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{
                width: `${occupancy}%`,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {availableSeats} seats available
            </span>

            <span className="font-medium text-slate-600">
              {Math.round(occupancy)}% booked
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <span
            className={`text-xs font-medium ${
              upcoming
                ? "text-emerald-600"
                : "text-slate-500"
            }`}
          >
            {upcoming
              ? "Upcoming event"
              : "Past event"}
          </span>

          <Link
            to={`/organizer/events/${event.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 transition hover:text-orange-600"
          >
            View details
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// =========================================================
// DELETE MODAL
// =========================================================

function DeleteModal({
  event,
  onClose,
  onConfirm,
}) {
  if (!event) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Delete event?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will permanently remove{" "}
              <span className="font-semibold text-slate-700">
                {event.title}
              </span>{" "}
              from your organizer events.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Trash2 size={16} />
            Delete event
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MAIN PAGE
// =========================================================

function OrganizerEvents() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [deleteEvent, setDeleteEvent] =
    useState(null);

  // =======================================================
  // LOAD EVENTS
  // =======================================================

  const loadEvents = useCallback(() => {
    if (!user?.id) {
      setEvents([]);
      return;
    }

    const organizerEvents =
      getStoredEventsByOrganizer(user.id);

    setEvents(organizerEvents);
  }, [user?.id]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // =======================================================
  // EVENT UPDATES
  // =======================================================

  useEffect(() => {
    const handleUpdate = () => {
      loadEvents();
    };

    const handleStorage = (event) => {
      if (event.key === "eventon_events") {
        loadEvents();
      }
    };

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [loadEvents]);

  // =======================================================
  // FILTER EVENTS
  // =======================================================

  const filteredEvents = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        String(event.title || "")
          .toLowerCase()
          .includes(query) ||
        String(event.category || "")
          .toLowerCase()
          .includes(query) ||
        String(event.location || "")
          .toLowerCase()
          .includes(query) ||
        String(event.city || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        String(event.status || "")
          .toLowerCase() ===
          statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  // =======================================================
  // COUNTS
  // =======================================================

  const counts = useMemo(() => {
    return {
      all: events.length,

      published: events.filter(
        (event) =>
          String(event.status || "")
            .toLowerCase() === "published"
      ).length,

      draft: events.filter(
        (event) =>
          String(event.status || "")
            .toLowerCase() === "draft"
      ).length,

      completed: events.filter(
        (event) =>
          String(event.status || "")
            .toLowerCase() === "completed"
      ).length,

      cancelled: events.filter(
        (event) =>
          String(event.status || "")
            .toLowerCase() === "cancelled"
      ).length,
    };
  }, [events]);

  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete = () => {
    if (!deleteEvent?.id) {
      return;
    }

    deleteStoredEvent(deleteEvent.id);

    setDeleteEvent(null);

    loadEvents();
  };

  // =======================================================
  // EMPTY USER
  // =======================================================

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <Users
            className="mx-auto text-slate-300"
            size={42}
          />

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Organizer account required
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please log in to manage your events.
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <>
      <section className="min-h-full bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          {/* Header */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold text-orange-500">
                Event Management
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Events
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create, manage, and track all events
                created by you.
              </p>
            </div>

            <Link
              to="/organizer/events/create"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              <Plus size={18} />
              Create Event
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              ["All", counts.all, "all"],
              [
                "Published",
                counts.published,
                "published",
              ],
              ["Drafts", counts.draft, "draft"],
              [
                "Completed",
                counts.completed,
                "completed",
              ],
              [
                "Cancelled",
                counts.cancelled,
                "cancelled",
              ],
            ].map(([label, count, value]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setStatusFilter(value)
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  statusFilter === value
                    ? "border-orange-200 bg-orange-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-xs font-medium text-slate-500">
                  {label}
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {count}
                </p>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search your events..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">
                  All statuses
                </option>

                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Draft
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="mt-6">
            {filteredEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  {events.length === 0 ? (
                    <CalendarDays size={26} />
                  ) : (
                    <Search size={26} />
                  )}
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-900">
                  {events.length === 0
                    ? "You haven't created any events"
                    : "No matching events"}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {events.length === 0
                    ? "Create your first event and it will appear here."
                    : "Try changing your search or status filter."}
                </p>

                {events.length === 0 && (
                  <Link
                    to="/organizer/events/create"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                  >
                    <Plus size={18} />
                    Create Event
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map(
                  (event) => (
                    <OrganizerEventCard
                      key={event.id}
                      event={event}
                      onDelete={
                        setDeleteEvent
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <DeleteModal
        event={deleteEvent}
        onClose={() => setDeleteEvent(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default OrganizerEvents;