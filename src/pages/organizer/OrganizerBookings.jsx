import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  IndianRupee,
  Search,
  Ticket,
  Users,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { getStoredBookings } from "../../utils/bookingStorage";

import {
  getStoredEventsByOrganizer,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

import { BOOKINGS_UPDATED_EVENT } from "../../utils/bookingStorage";

function OrganizerBookings() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadBookings = useCallback(() => {
    if (!user?.id) {
      setEvents([]);
      setBookings([]);
      setLoading(false);
      return;
    }

    const organizerEvents =
      getStoredEventsByOrganizer(user.id);

    const organizerEventIds = new Set(
      organizerEvents.map((event) => String(event.id))
    );

    const allBookings = getStoredBookings();

    const organizerBookings = allBookings.filter((booking) => {
      const bookingEventId =
        booking?.eventId ??
        booking?.event?.id;

      return organizerEventIds.has(
        String(bookingEventId)
      );
    });

    setEvents(organizerEvents);
    setBookings(organizerBookings);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadBookings();

    const handleUpdate = () => {
      loadBookings();
    };

    window.addEventListener(
      BOOKINGS_UPDATED_EVENT,
      handleUpdate
    );

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      handleUpdate
    );

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
        BOOKINGS_UPDATED_EVENT,
        handleUpdate
      );

      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );

      window.removeEventListener(
        "eventon:auth-updated",
        handleUpdate
      );
    };
  }, [loadBookings]);

  // =========================================================
  // EVENT MAP
  // =========================================================

  const eventMap = useMemo(() => {
    return new Map(
      events.map((event) => [
        String(event.id),
        event,
      ])
    );
  }, [events]);

  // =========================================================
  // GET ATTENDEE
  // =========================================================

  const getAttendee = useCallback((booking) => {
    return {
      name:
        booking?.attendee?.name ||
        booking?.attendeeName ||
        booking?.userName ||
        booking?.name ||
        "Attendee",

      email:
        booking?.attendee?.email ||
        booking?.attendeeEmail ||
        booking?.userEmail ||
        booking?.email ||
        "No email",

      phone:
        booking?.attendee?.phone ||
        booking?.phone ||
        "No phone",
    };
  }, []);

  // =========================================================
  // BOOKING STATUS
  // =========================================================

  const getBookingStatus = (booking) => {
    const status = String(
      booking.status || "confirmed"
    ).toLowerCase();

    if (
      status === "cancelled" ||
      status === "canceled"
    ) {
      return "cancelled";
    }

    if (
      status === "completed" ||
      status === "attended"
    ) {
      return "completed";
    }

    return "confirmed";
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const bookingEventId =
        booking?.eventId ??
        booking?.event?.id;

      const event = eventMap.get(
        String(bookingEventId)
      );

      const attendee = getAttendee(booking);

      const status = getBookingStatus(booking);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        booking.id,
        booking.bookingId,

        attendee.name,
        attendee.email,

        event?.title,
        event?.city,
        event?.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    bookings,
    eventMap,
    getAttendee,
    search,
    statusFilter,
  ]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    let confirmed = 0;
    let cancelled = 0;
    let completed = 0;
    let ticketsSold = 0;
    let revenue = 0;

    bookings.forEach((booking) => {
      const status = getBookingStatus(booking);

      const quantity = Math.max(
        1,
        Number(
          booking.quantity ??
            booking.tickets ??
            booking.ticketCount ??
            1
        )
      );

      const amount = Number(
        booking.totalAmount ??
          booking.totalPrice ??
          booking.amount ??
          0
      );

      if (status === "confirmed") {
        confirmed += 1;
        ticketsSold += quantity;
        revenue += amount;
      }

      if (status === "completed") {
        completed += 1;
        ticketsSold += quantity;
        revenue += amount;
      }

      if (status === "cancelled") {
        cancelled += 1;
      }
    });

    return {
      total: bookings.length,
      confirmed,
      cancelled,
      completed,
      ticketsSold,
      revenue,
    };
  }, [bookings]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getQuantity = (booking) => {
    return Math.max(
      1,
      Number(
        booking.quantity ??
          booking.tickets ??
          booking.ticketCount ??
          1
      )
    );
  };

  const getAmount = (booking) => {
    return Number(
      booking.totalAmount ??
        booking.totalPrice ??
        booking.amount ??
        0
    );
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  const getStatusClasses = (status) => {
    if (status === "confirmed") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "cancelled") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-blue-200 bg-blue-50 text-blue-700";
  };

  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!user) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Organizer login required
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please log in to view organizer bookings.
          </p>
        </div>
      </section>
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <section className="min-h-full bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <section className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

        {/* HEADER */}

        <div>
          <p className="text-sm font-semibold text-orange-500">
            Organizer Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Bookings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage attendees, tickets, booking status,
            and revenue across your events.
          </p>
        </div>

        {/* STATS */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={Ticket}
            label="Total Bookings"
            value={statistics.total}
          />

          <StatCard
            icon={CheckCircle2}
            label="Confirmed"
            value={statistics.confirmed}
          />

          <StatCard
            icon={Users}
            label="Tickets Sold"
            value={statistics.ticketsSold}
          />

          <StatCard
            icon={IndianRupee}
            label="Revenue"
            value={formatCurrency(
              statistics.revenue
            )}
          />

        </div>

        {/* SECONDARY STATS */}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <XCircle size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Cancelled Bookings
                </p>

                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {statistics.cancelled}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Completed Bookings
                </p>

                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {statistics.completed}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* FILTERS */}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search attendee, email, event..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["confirmed", "Confirmed"],
                ["completed", "Completed"],
                ["cancelled", "Cancelled"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setStatusFilter(value)
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    statusFilter === value
                      ? "bg-orange-500 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* BOOKINGS */}

        <div className="mt-6">

          {filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Ticket size={25} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                No bookings found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search || statusFilter !== "all"
                  ? "Try changing your search or filters."
                  : "Bookings for your events will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1100px]">

                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Attendee
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Event
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Tickets
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredBookings.map(
                      (booking) => {
                        const event =
                          eventMap.get(
                            String(
                              booking.eventId
                            )
                          );

                        const attendee =
                          getAttendee(booking);

                        const status =
                          getBookingStatus(
                            booking
                          );

                        const bookingId =
                          booking.id ||
                          booking.bookingId;

                        return (
                          <tr
                            key={
                              bookingId ||
                              `${booking.event?.id || booking.eventId}-${booking.createdAt}`
                            }
                            className="transition hover:bg-slate-50"
                          >

                            {/* ATTENDEE */}

                            <td className="px-6 py-5">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {attendee.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {attendee.email}
                                </p>
                              </div>
                            </td>

                            {/* EVENT */}

                            <td className="px-6 py-5">
                              <p className="max-w-xs truncate text-sm font-semibold text-slate-800">
                                {event?.title ||
                                  "Event unavailable"}
                              </p>

                              {event?.city && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {event.city}
                                </p>
                              )}
                            </td>

                            {/* DATE */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <CalendarDays size={15} />
                                {formatDate(
                                  booking.event?.date ||
                                    booking.bookingDate ||
                                    booking.createdAt
                                )}
                              </div>
                            </td>

                            {/* TICKETS */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Users size={15} />
                                {getQuantity(
                                  booking
                                )}
                              </div>
                            </td>

                            {/* AMOUNT */}

                            <td className="px-6 py-5">
                              <p className="text-sm font-bold text-slate-900">
                                {formatCurrency(
                                  getAmount(
                                    booking
                                  )
                                )}
                              </p>
                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                                  status
                                )}`}
                              >
                                {status ===
                                "confirmed" ? (
                                  <CheckCircle2
                                    size={13}
                                  />
                                ) : status ===
                                  "cancelled" ? (
                                  <XCircle
                                    size={13}
                                  />
                                ) : (
                                  <Clock3
                                    size={13}
                                  />
                                )}

                                {status
                                  .charAt(0)
                                  .toUpperCase() +
                                  status.slice(1)}
                              </span>
                            </td>

                            {/* VIEW */}

                            <td className="px-6 py-5 text-right">
                              <Link
                                to={`/organizer/bookings/${bookingId}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                              >
                                <Eye size={14} />
                                View Details
                              </Link>
                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>
                </table>
              </div>

              {/* MOBILE */}

              <div className="divide-y divide-slate-100 lg:hidden">

                {filteredBookings.map(
                  (booking) => {
                    const bookingEventId =
                      booking?.eventId ??
                      booking?.event?.id;

                    const event =
                      eventMap.get(
                        String(bookingEventId)
                      );

                    const attendee =
                      getAttendee(booking);

                    const status =
                      getBookingStatus(
                        booking
                      );

                    const bookingId =
                      booking.id ||
                      booking.bookingId;

                    return (
                      <div
                        key={
                          bookingId ||
                          `${booking.event?.id || booking.eventId}-${booking.createdAt}`
                        }
                        className="p-5 sm:p-6"
                      >

                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {attendee.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {attendee.email}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                              status
                            )}`}
                          >
                            {status
                              .charAt(0)
                              .toUpperCase() +
                              status.slice(1)}
                          </span>
                        </div>

                        <div className="mt-5 rounded-xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {event?.title ||
                              "Event unavailable"}
                          </p>

                          {event?.city && (
                            <p className="mt-1 text-xs text-slate-500">
                              {event.city}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4">

                          <div>
                            <p className="text-xs text-slate-400">
                              Booking date
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                              <CalendarDays size={14} />

                              {formatDate(
                                booking.event?.date ||
                                  booking.bookingDate ||
                                  booking.createdAt
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Tickets
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                              <Users size={14} />
                              {getQuantity(
                                booking
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Amount
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-900">
                              {formatCurrency(
                                getAmount(
                                  booking
                                )
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Booking ID
                            </p>

                            <p className="mt-1 truncate text-xs font-medium text-slate-600">
                              {bookingId || "—"}
                            </p>
                          </div>

                        </div>

                        <Link
                          to={`/organizer/bookings/${bookingId}`}
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Eye size={16} />
                          View Booking Details
                        </Link>

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 truncate text-xl font-bold text-slate-900">
            {value}
          </p>
        </div>

      </div>
    </div>
  );
}

export default OrganizerBookings;