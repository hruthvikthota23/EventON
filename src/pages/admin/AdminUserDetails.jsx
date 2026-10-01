import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Ticket,
  UserRound,
  UserRoundCog,
  Users,
  XCircle,
} from "lucide-react";

import {
  getStoredEvents,
  getStoredEventsByOrganizer,
} from "../../utils/eventStorage";

import {
  getStoredBookings,
} from "../../utils/bookingStorage";

const ACCOUNTS_STORAGE_KEY = "eventon_accounts";

/* =========================================================
   HELPERS
========================================================= */

function normalizeRole(role) {
  return String(role || "attendee")
    .trim()
    .toLowerCase();
}

function getEventStart(event) {
  if (!event?.date) {
    return null;
  }

  const start = new Date(
    `${event.date}T${event.time || "00:00"}`
  );

  return Number.isNaN(start.getTime())
    ? null
    : start;
}

function getEventEnd(event) {
  if (!event?.date) {
    return null;
  }

  const end = new Date(
    `${event.date}T${
      event.endTime ||
      event.time ||
      "23:59"
    }`
  );

  return Number.isNaN(end.getTime())
    ? null
    : end;
}

function getEventStatus(
  event,
  currentTime = new Date()
) {
  if (!event) {
    return "upcoming";
  }

  const storedStatus = String(
    event.status || ""
  )
    .trim()
    .toLowerCase();

  if (
    storedStatus === "cancelled" ||
    storedStatus === "canceled"
  ) {
    return "cancelled";
  }

  const start = getEventStart(event);
  const end = getEventEnd(event);

  if (!start) {
    return "upcoming";
  }

  if (currentTime < start) {
    return "upcoming";
  }

  if (end && currentTime < end) {
    return "ongoing";
  }

  return "completed";
}

function getBookingStatus(
  booking,
  event,
  currentTime = new Date()
) {
  const bookingStatus = String(
    booking?.status || ""
  )
    .trim()
    .toLowerCase();

  if (
    bookingStatus === "cancelled" ||
    bookingStatus === "canceled"
  ) {
    return "cancelled";
  }

  return getEventStatus(
    event,
    currentTime
  );
}

function getTicketCount(booking) {
  const value =
    booking?.quantity ??
    booking?.tickets ??
    booking?.ticketCount ??
    1;

  const count = Number(value);

  return Number.isFinite(count) && count > 0
    ? count
    : 1;
}

function getBookingId(booking) {
  return (
    booking?.id ??
    booking?.bookingId ??
    "—"
  );
}

function getBookingEventId(booking) {
  return (
    booking?.eventId ??
    booking?.event?.id ??
    null
  );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(timeValue) {
  if (!timeValue) {
    return "—";
  }

  const [hours, minutes] = String(
    timeValue
  )
    .split(":")
    .map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return timeValue;
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function AdminUserDetails() {
  const { userId } = useParams();

  const [user, setUser] = useState(null);

  const [allBookings, setAllBookings] =
    useState([]);

  const [allEvents, setAllEvents] =
    useState([]);

  const [organizerEvents, setOrganizerEvents] =
    useState([]);

  const [currentTime, setCurrentTime] =
    useState(new Date());

  const [activeView, setActiveView] =
    useState("attendee");

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = useCallback(() => {
    try {
      setLoading(true);

      const rawAccounts =
        localStorage.getItem(
          ACCOUNTS_STORAGE_KEY
        );

      if (!rawAccounts) {
        setUser(null);
        setAllBookings([]);
        setAllEvents([]);
        setOrganizerEvents([]);
        setLoading(false);
        return;
      }

      const accounts =
        JSON.parse(rawAccounts);

      const foundUser =
        Array.isArray(accounts)
          ? accounts.find(
              (account) =>
                String(account?.id) ===
                String(userId)
            )
          : null;

      if (!foundUser) {
        setUser(null);
        setAllBookings([]);
        setAllEvents([]);
        setOrganizerEvents([]);
        setLoading(false);
        return;
      }

      const role = normalizeRole(
        foundUser.role
      );

      /*
       * Only registered users:
       * attendee + organizer
       */

      if (
        role !== "attendee" &&
        role !== "organizer"
      ) {
        setUser(null);
        setAllBookings([]);
        setAllEvents([]);
        setOrganizerEvents([]);
        setLoading(false);
        return;
      }

      setUser(foundUser);

      const storedBookings =
        getStoredBookings();

      const storedEvents =
        getStoredEvents();

      setAllBookings(
        Array.isArray(storedBookings)
          ? storedBookings
          : []
      );

      setAllEvents(
        Array.isArray(storedEvents)
          ? storedEvents
          : []
      );

      if (role === "organizer") {
        const events =
          getStoredEventsByOrganizer(
            foundUser.id
          );

        setOrganizerEvents(
          Array.isArray(events)
            ? events
            : []
        );
      } else {
        setOrganizerEvents([]);
      }
    } catch (error) {
      console.error(
        "Unable to load user details:",
        error
      );

      setUser(null);
      setAllBookings([]);
      setAllEvents([]);
      setOrganizerEvents([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /* =======================================================
     LIVE UPDATES
  ======================================================= */

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    const updateTime = () => {
      setCurrentTime(new Date());
    };

    window.addEventListener(
      "storage",
      handleUpdate
    );

    window.addEventListener(
      "eventon:auth-updated",
      handleUpdate
    );

    window.addEventListener(
      "eventon:bookings-updated",
      handleUpdate
    );

    window.addEventListener(
      "eventon:events-updated",
      handleUpdate
    );

    const interval =
      window.setInterval(
        updateTime,
        30000
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

      window.removeEventListener(
        "eventon:bookings-updated",
        handleUpdate
      );

      window.removeEventListener(
        "eventon:events-updated",
        handleUpdate
      );

      window.clearInterval(interval);
    };
  }, [loadData]);

  /* =======================================================
     ROLE
  ======================================================= */

  const role = normalizeRole(
    user?.role
  );

  const isOrganizer =
    role === "organizer";

  /* =======================================================
     USER BOOKINGS
  ======================================================= */

  const userBookings = useMemo(() => {
    if (!user?.id) {
      return [];
    }

    return allBookings.filter(
      (booking) => {
        const bookingUserId =
          booking?.userId ??
          booking?.attendeeId ??
          booking?.user?.id ??
          booking?.attendee?.userId ??
          null;

        return (
          String(bookingUserId) ===
          String(user.id)
        );
      }
    );
  }, [
    allBookings,
    user,
  ]);

  /* =======================================================
     ATTENDEE STATISTICS
  ======================================================= */

  const attendeeStats = useMemo(() => {
    let upcoming = 0;
    let ongoing = 0;
    let completed = 0;
    let cancelled = 0;
    let tickets = 0;

    userBookings.forEach(
      (booking) => {
        const eventId =
          getBookingEventId(
            booking
          );

        const event =
          allEvents.find(
            (item) =>
              String(item?.id) ===
              String(eventId)
          );

        const status =
          getBookingStatus(
            booking,
            event,
            currentTime
          );

        tickets +=
          getTicketCount(
            booking
          );

        if (status === "upcoming") {
          upcoming++;
        } else if (
          status === "ongoing"
        ) {
          ongoing++;
        } else if (
          status === "completed"
        ) {
          completed++;
        } else if (
          status === "cancelled"
        ) {
          cancelled++;
        }
      }
    );

    return {
      totalBookings:
        userBookings.length,
      upcoming,
      ongoing,
      completed,
      cancelled,
      tickets,
    };
  }, [
    userBookings,
    allEvents,
    currentTime,
  ]);

  /* =======================================================
     ORGANIZER STATISTICS
  ======================================================= */

  const organizerStats = useMemo(() => {
    let upcoming = 0;
    let ongoing = 0;
    let completed = 0;
    let cancelled = 0;
    let ticketsSold = 0;

    organizerEvents.forEach(
      (event) => {
        const status =
          getEventStatus(
            event,
            currentTime
          );

        if (status === "upcoming") {
          upcoming++;
        } else if (
          status === "ongoing"
        ) {
          ongoing++;
        } else if (
          status === "completed"
        ) {
          completed++;
        } else if (
          status === "cancelled"
        ) {
          cancelled++;
        }

        const eventBookings =
          allBookings.filter(
            (booking) => {
              const eventId =
                getBookingEventId(
                  booking
                );

              const bookingStatus =
                String(
                  booking?.status || ""
                )
                  .trim()
                  .toLowerCase();

              return (
                String(eventId) ===
                  String(event.id) &&
                bookingStatus !==
                  "cancelled" &&
                bookingStatus !==
                  "canceled"
              );
            }
          );

        eventBookings.forEach(
          (booking) => {
            ticketsSold +=
              getTicketCount(
                booking
              );
          }
        );
      }
    );

    return {
      totalEvents:
        organizerEvents.length,
      upcoming,
      ongoing,
      completed,
      cancelled,
      ticketsSold,
    };
  }, [
    organizerEvents,
    allBookings,
    currentTime,
  ]);

  /* =======================================================
     RECENT BOOKINGS
  ======================================================= */

  const recentBookings = useMemo(() => {
    return [...userBookings]
      .sort((first, second) => {
        const firstDate =
          new Date(
            first?.createdAt ??
              first?.bookedAt ??
              first?.bookingDate ??
              0
          ).getTime();

        const secondDate =
          new Date(
            second?.createdAt ??
              second?.bookedAt ??
              second?.bookingDate ??
              0
          ).getTime();

        return (
          secondDate - firstDate
        );
      })
      .slice(0, 5);
  }, [userBookings]);

  /* =======================================================
     RECENT ORGANIZER EVENTS
  ======================================================= */

  const recentOrganizerEvents =
    useMemo(() => {
      return [...organizerEvents]
        .sort((first, second) => {
          const firstDate =
            getEventStart(
              first
            )?.getTime() || 0;

          const secondDate =
            getEventStart(
              second
            )?.getTime() || 0;

          return (
            secondDate - firstDate
          );
        })
        .slice(0, 5);
    }, [organizerEvents]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">
          Loading user details...
        </p>
      </div>
    );
  }

  /* =======================================================
     USER NOT FOUND
  ======================================================= */

  if (!user) {
    return (
      <div className="min-h-full bg-slate-50">
        <main className="mx-auto flex max-w-7xl flex-col items-center justify-center px-5 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <UserRound size={28} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            User not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The requested registered user
            could not be found.
          </p>

          <Link
            to="/admin/users"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            <ArrowLeft size={16} />
            Back to Users
          </Link>
        </main>
      </div>
    );
  }

  /* =======================================================
     USER INFORMATION
  ======================================================= */

  const fullName =
    user.name || "Unnamed User";

  const initial = fullName
    .charAt(0)
    .toUpperCase();

  const phone =
    user.mobile ||
    user.phone ||
    "Not provided";

  const email =
    user.email ||
    "No email available";

  const fullUserId =
    user.id || "Not available";

  const roleLabel = isOrganizer
    ? "Organizer"
    : "Attendee";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          {/* BACK */}

          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-500"
          >
            <ArrowLeft size={16} />
            Back to Users
          </Link>

          {/* USER CARD */}

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center">
              {/* LEFT SIDE */}

              <div className="flex min-w-0 flex-1 items-center gap-4">
                {/* AVATAR */}

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-xl font-bold text-orange-600">
                  {initial}
                </div>

                {/* NAME + CONTACT */}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      {fullName}
                    </h1>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                        isOrganizer
                          ? "bg-violet-50 text-violet-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {isOrganizer ? (
                        <UserRoundCog
                          size={14}
                        />
                      ) : (
                        <UserRound
                          size={14}
                        />
                      )}

                      {roleLabel}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
                    {/* PHONE */}

                    <span className="inline-flex items-center gap-2">
                      <Phone
                        size={15}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="break-all">
                        {phone}
                      </span>
                    </span>

                    {/* EMAIL */}

                    <span className="inline-flex items-center gap-2">
                      <Mail
                        size={15}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="break-all">
                        {email}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE USER ID */}

              <div className="w-full border-t border-slate-100 pt-4 lg:w-[330px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  User ID
                </p>

                <p
                  className="mt-2 break-all text-sm font-semibold leading-6 text-slate-700"
                  title={fullUserId}
                >
                  {fullUserId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-6 lg:px-8">
        {/* =================================================
            ORGANIZER SWITCH
        ================================================= */}

        {isOrganizer && (
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setActiveView(
                    "attendee"
                  )
                }
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeView ===
                  "attendee"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Ticket size={17} />
                  Attendee Activity
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveView(
                    "organizer"
                  )
                }
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeView ===
                  "organizer"
                    ? "bg-violet-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <CalendarDays
                    size={17}
                  />
                  Organizer Activity
                </span>
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            ATTENDEE ACTIVITY
        ================================================= */}

        {(!isOrganizer ||
          activeView ===
            "attendee") && (
          <AttendeeActivity
            stats={attendeeStats}
            bookings={recentBookings}
            events={allEvents}
            currentTime={currentTime}
          />
        )}

        {/* =================================================
            ORGANIZER ACTIVITY
        ================================================= */}

        {isOrganizer &&
          activeView ===
            "organizer" && (
            <OrganizerActivity
              stats={organizerStats}
              events={
                recentOrganizerEvents
              }
              allBookings={
                allBookings
              }
              currentTime={
                currentTime
              }
            />
          )}
      </main>
    </div>
  );
}

/* ===========================================================
   ATTENDEE ACTIVITY
=========================================================== */

function AttendeeActivity({
  stats,
  bookings,
  events,
  currentTime,
}) {
  return (
    <div className="space-y-6">
      {/* STATS */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Bookings"
          value={
            stats.totalBookings
          }
          icon={Ticket}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Upcoming"
          value={stats.upcoming}
          icon={Clock3}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Ongoing"
          value={stats.ongoing}
          icon={Clock3}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={XCircle}
          iconClass="bg-red-50 text-red-600"
        />

        <StatCard
          title="Tickets Booked"
          value={stats.tickets}
          icon={Users}
          iconClass="bg-violet-50 text-violet-600"
        />
      </section>

      {/* RECENT BOOKINGS */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5">
          <h2 className="text-base font-bold text-slate-900">
            Recent Bookings
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest events booked by this
            user.
          </p>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No bookings yet"
            description="This user has not booked any events."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map(
              (booking) => {
                const eventId =
                  getBookingEventId(
                    booking
                  );

                const event =
                  events.find(
                    (item) =>
                      String(
                        item?.id
                      ) ===
                      String(eventId)
                  );

                const status =
                  getBookingStatus(
                    booking,
                    event,
                    currentTime
                  );

                const ticketCount =
                  getTicketCount(
                    booking
                  );

                const bookingId =
                  getBookingId(
                    booking
                  );

                return (
                  <div
                    key={
                      booking.id ||
                      booking.bookingId ||
                      `${eventId}-${booking.createdAt}`
                    }
                    className="p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row">
                      {/* IMAGE */}

                      <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-36 sm:w-52">
                        <EventImage
                          src={
                            event?.image
                          }
                          alt={
                            event?.title ||
                            "Event"
                          }
                        />
                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-slate-900">
                              {event?.title ||
                                booking?.eventName ||
                                "Event"}
                            </h3>

                            <p className="mt-1 break-all text-xs font-medium text-slate-400">
                              Booking ID:{" "}
                              <span className="font-semibold text-slate-600">
                                {bookingId}
                              </span>
                            </p>
                          </div>

                          <StatusBadge
                            status={
                              status
                            }
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <InfoItem
                            label="Event Date"
                            value={
                              event?.date
                                ? formatDate(
                                    event.date
                                  )
                                : "—"
                            }
                            icon={
                              CalendarDays
                            }
                          />

                          <InfoItem
                            label="Time"
                            value={
                              event?.time
                                ? `${formatTime(
                                    event.time
                                  )}${
                                    event?.endTime
                                      ? ` - ${formatTime(
                                          event.endTime
                                        )}`
                                      : ""
                                  }`
                                : "—"
                            }
                            icon={
                              Clock3
                            }
                          />

                          <InfoItem
                            label="Location"
                            value={
                              [
                                event?.location,
                                event?.city,
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(
                                  ", "
                                ) ||
                              "—"
                            }
                            icon={MapPin}
                          />

                          <InfoItem
                            label="Tickets"
                            value={`${ticketCount} ${
                              ticketCount ===
                              1
                                ? "Ticket"
                                : "Tickets"
                            }`}
                            icon={
                              Ticket
                            }
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                          <span>
                            Booked on{" "}
                            <strong className="font-semibold text-slate-700">
                              {formatDateTime(
                                booking?.createdAt ??
                                  booking?.bookedAt ??
                                  booking?.bookingDate
                              )}
                            </strong>
                          </span>

                          {event?.category && (
                            <span>
                              Category:{" "}
                              <strong className="font-semibold text-slate-700">
                                {
                                  event.category
                                }
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/* ===========================================================
   ORGANIZER ACTIVITY
=========================================================== */

function OrganizerActivity({
  stats,
  events,
  allBookings,
  currentTime,
}) {
  return (
    <div className="space-y-6">
      {/* STATS */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Events"
          value={
            stats.totalEvents
          }
          icon={CalendarDays}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Upcoming"
          value={stats.upcoming}
          icon={Clock3}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Ongoing"
          value={stats.ongoing}
          icon={Clock3}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={XCircle}
          iconClass="bg-red-50 text-red-600"
        />

        <StatCard
          title="Tickets Sold"
          value={
            stats.ticketsSold
          }
          icon={Users}
          iconClass="bg-violet-50 text-violet-600"
        />
      </section>

      {/* EVENTS */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5">
          <h2 className="text-base font-bold text-slate-900">
            Organizer Events
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Events created and managed by
            this organizer.
          </p>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No events created"
            description="This organizer has not created any events yet."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {events.map((event) => {
              const status =
                getEventStatus(
                  event,
                  currentTime
                );

              const eventBookings =
                allBookings.filter(
                  (booking) => {
                    const eventId =
                      getBookingEventId(
                        booking
                      );

                    const bookingStatus =
                      String(
                        booking?.status ||
                          ""
                      )
                        .trim()
                        .toLowerCase();

                    return (
                      String(
                        eventId
                      ) ===
                        String(
                          event.id
                        ) &&
                      bookingStatus !==
                        "cancelled" &&
                      bookingStatus !==
                        "canceled"
                    );
                  }
                );

              const ticketsSold =
                eventBookings.reduce(
                  (
                    total,
                    booking
                  ) =>
                    total +
                    getTicketCount(
                      booking
                    ),
                  0
                );

              const capacity =
                Number(
                  event.capacity || 0
                );

              const availableSeats =
                Math.max(
                  capacity -
                    ticketsSold,
                  0
                );

              return (
                <div
                  key={event.id}
                  className="p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-5 lg:flex-row">
                    {/* IMAGE */}

                    <div className="h-36 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-40 sm:w-56">
                      <EventImage
                        src={event.image}
                        alt={
                          event.title ||
                          "Event"
                        }
                      />
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-slate-900">
                            {event.title ||
                              "Untitled Event"}
                          </h3>

                          <p className="mt-1 break-all text-xs font-medium text-slate-400">
                            Event ID:{" "}
                            <span className="font-semibold text-slate-600">
                              {event.id ||
                                "—"}
                            </span>
                          </p>
                        </div>

                        <StatusBadge
                          status={
                            status
                          }
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <InfoItem
                          label="Date"
                          value={
                            event.date
                              ? formatDate(
                                  event.date
                                )
                              : "—"
                          }
                          icon={
                            CalendarDays
                          }
                        />

                        <InfoItem
                          label="Time"
                          value={
                            event.time
                              ? `${formatTime(
                                  event.time
                                )}${
                                  event.endTime
                                    ? ` - ${formatTime(
                                        event.endTime
                                      )}`
                                    : ""
                                }`
                              : "—"
                          }
                          icon={
                            Clock3
                          }
                        />

                        <InfoItem
                          label="Location"
                          value={
                            event.location ||
                            event.city ||
                            "—"
                          }
                          icon={
                            MapPin
                          }
                        />

                        <InfoItem
                          label="Category"
                          value={
                            event.category ||
                            "General"
                          }
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
                        <MetricItem
                          label="Capacity"
                          value={
                            capacity ||
                            "—"
                          }
                        />

                        <MetricItem
                          label="Tickets Sold"
                          value={
                            ticketsSold
                          }
                        />

                        <MetricItem
                          label="Available Seats"
                          value={
                            capacity
                              ? availableSeats
                              : "—"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ===========================================================
   EVENT IMAGE
=========================================================== */

function EventImage({
  src,
  alt,
}) {
  const [imageError, setImageError] =
    useState(false);

  if (!src || imageError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
        <CalendarDays size={34} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() =>
        setImageError(true)
      }
    />
  );
}

/* ===========================================================
   INFO ITEM
=========================================================== */

function InfoItem({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex min-w-0 items-center gap-1.5">
        {Icon && (
          <Icon
            size={13}
            className="shrink-0 text-slate-400"
          />
        )}

        <p className="break-words text-xs font-semibold leading-5 text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ===========================================================
   METRIC ITEM
=========================================================== */

function MetricItem({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {Number(
          value || 0
        ).toLocaleString(
          "en-IN"
        )}
      </p>
    </div>
  );
}

/* ===========================================================
   STAT CARD
=========================================================== */

function StatCard({
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
            {Number(
              value || 0
            ).toLocaleString(
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

/* ===========================================================
   STATUS BADGE
=========================================================== */

function StatusBadge({
  status,
}) {
  const normalizedStatus =
    String(status || "")
      .trim()
      .toLowerCase();

  const statusConfig = {
    upcoming: {
      label: "Upcoming",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    ongoing: {
      label: "Ongoing",
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },

    completed: {
      label: "Completed",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    cancelled: {
      label: "Cancelled",
      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  };

  const config =
    statusConfig[
      normalizedStatus
    ] ||
    statusConfig.upcoming;

  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

/* ===========================================================
   EMPTY STATE
=========================================================== */

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={25} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default AdminUserDetails;