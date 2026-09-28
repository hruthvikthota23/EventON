import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Mail,
  MapPin,
  ShieldCheck,
  Ticket,
  UserRound,
  UserRoundCog,
  Users,
  XCircle,
} from "lucide-react";

import {
  getStoredEvents,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

import {
  getStoredBookings,
  BOOKINGS_UPDATED_EVENT,
} from "../../utils/bookingStorage";

const ACCOUNTS_STORAGE_KEY = "eventon_accounts";

/* =========================================================
   ROLE HELPERS
========================================================= */

const normalizeRole = (role) => {
  const normalized = String(role || "attendee")
    .trim()
    .toLowerCase();

  if (
    normalized === "organizer" ||
    normalized === "admin"
  ) {
    return normalized;
  }

  return "attendee";
};

const getRoleLabel = (role) => {
  const normalized = normalizeRole(role);

  if (normalized === "organizer") {
    return "Organizer";
  }

  if (normalized === "admin") {
    return "Admin";
  }

  return "Attendee";
};

const getRoleStyle = (role) => {
  const normalized = normalizeRole(role);

  if (normalized === "organizer") {
    return "border-violet-200 bg-violet-50 text-violet-600";
  }

  if (normalized === "admin") {
    return "border-orange-200 bg-orange-50 text-orange-600";
  }

  return "border-blue-200 bg-blue-50 text-blue-600";
};

const getRoleIcon = (role) => {
  const normalized = normalizeRole(role);

  if (normalized === "organizer") {
    return UserRoundCog;
  }

  if (normalized === "admin") {
    return ShieldCheck;
  }

  return UserRound;
};

/* =========================================================
   BOOKING HELPERS
========================================================= */

const getBookingStatus = (booking) => {
  const status = String(
    booking?.status || "confirmed"
  )
    .trim()
    .toLowerCase();

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

  if (status === "pending") {
    return "pending";
  }

  return "confirmed";
};

const getBookingStatusLabel = (status) => {
  if (status === "cancelled") {
    return "Cancelled";
  }

  if (status === "completed") {
    return "Completed";
  }

  if (status === "pending") {
    return "Pending";
  }

  return "Confirmed";
};

const getBookingStatusStyle = (status) => {
  if (status === "cancelled") {
    return {
      badge:
        "border-red-200 bg-red-50 text-red-600",
      dot: "bg-red-500",
      icon: XCircle,
    };
  }

  if (status === "completed") {
    return {
      badge:
        "border-blue-200 bg-blue-50 text-blue-600",
      dot: "bg-blue-500",
      icon: CheckCircle2,
    };
  }

  if (status === "pending") {
    return {
      badge:
        "border-amber-200 bg-amber-50 text-amber-600",
      dot: "bg-amber-500",
      icon: Clock3,
    };
  }

  return {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  };
};

const getBookingQuantity = (booking) => {
  const quantity = Number(
    booking?.quantity ??
      booking?.tickets ??
      booking?.ticketCount ??
      booking?.numberOfTickets ??
      1
  );

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    return 1;
  }

  return quantity;
};

const getBookingAmount = (booking) => {
  const amount = Number(
    booking?.totalAmount ??
      booking?.totalPrice ??
      booking?.amount ??
      booking?.price ??
      0
  );

  return Number.isFinite(amount)
    ? amount
    : 0;
};

const getBookingDate = (booking) => {
  return (
    booking?.createdAt ||
    booking?.bookingDate ||
    booking?.date ||
    booking?.createdOn ||
    booking?.timestamp ||
    null
  );
};

/* =========================================================
   DATE / EVENT HELPERS
========================================================= */

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const getEventDate = (event) => {
  return (
    event?.date ||
    event?.eventDate ||
    event?.startDate ||
    null
  );
};

const getEventTime = (event) => {
  const startTime =
    event?.time ||
    event?.startTime ||
    "";

  const endTime =
    event?.endTime ||
    event?.finishTime ||
    "";

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return (
    startTime ||
    endTime ||
    "Time not available"
  );
};

const getEventLocation = (event) => {
  if (!event) {
    return "Location not available";
  }

  const location =
    event?.location ||
    event?.venue ||
    event?.address ||
    "";

  const city =
    event?.city ||
    event?.locationCity ||
    "";

  if (location && city) {
    if (
      String(location)
        .toLowerCase()
        .includes(
          String(city).toLowerCase()
        )
    ) {
      return String(location);
    }

    return `${location}, ${city}`;
  }

  return (
    location ||
    city ||
    "Location not available"
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

function AdminUserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =======================================================
     LOAD ACTUAL DATA
  ======================================================= */

  const loadData = () => {
    try {
      setLoading(true);

      /* -----------------------------------------------
         USERS
      ------------------------------------------------ */

      const rawAccounts =
        localStorage.getItem(
          ACCOUNTS_STORAGE_KEY
        );

      const accounts = rawAccounts
        ? JSON.parse(rawAccounts)
        : [];

      const foundUser =
        Array.isArray(accounts)
          ? accounts.find(
              (account) =>
                String(account?.id) ===
                String(userId)
            )
          : null;

      setUser(foundUser || null);

      /* -----------------------------------------------
         BOOKINGS
      ------------------------------------------------ */

      const storedBookings =
        getStoredBookings();

      setBookings(
        Array.isArray(storedBookings)
          ? storedBookings
          : []
      );

      /* -----------------------------------------------
         EVENTS
      ------------------------------------------------ */

      const storedEvents =
        getStoredEvents();

      setEvents(
        Array.isArray(storedEvents)
          ? storedEvents
          : []
      );
    } catch (error) {
      console.error(
        "Unable to load admin user details:",
        error
      );

      setUser(null);
      setBookings([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LIVE UPDATES
  ======================================================= */

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
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
      EVENTS_UPDATED_EVENT,
      handleUpdate
    );

    window.addEventListener(
      BOOKINGS_UPDATED_EVENT,
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

      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        handleUpdate
      );

      window.removeEventListener(
        BOOKINGS_UPDATED_EVENT,
        handleUpdate
      );
    };
  }, [userId]);

  /* =======================================================
     USER BOOKINGS
  ======================================================= */

  const userBookings = useMemo(() => {
    if (!user) {
      return [];
    }

    const currentUserId =
      String(user.id || "");

    const currentEmail =
      String(user.email || "")
        .trim()
        .toLowerCase();

    return bookings.filter(
      (booking) => {
        const bookingUserId =
          String(
            booking?.userId ??
              booking?.attendeeId ??
              booking?.attendee?.userId ??
              booking?.user?.id ??
              ""
          );

        const bookingEmail =
          String(
            booking?.attendee?.email ??
              booking?.attendeeEmail ??
              booking?.userEmail ??
              booking?.email ??
              booking?.user?.email ??
              ""
          )
            .trim()
            .toLowerCase();

        return (
          (
            currentUserId &&
            bookingUserId ===
              currentUserId
          ) ||
          (
            currentEmail &&
            bookingEmail ===
              currentEmail
          )
        );
      }
    );
  }, [bookings, user]);

  /* =======================================================
     EVENT MAP
  ======================================================= */

  const eventMap = useMemo(() => {
    return new Map(
      events.map((event) => [
        String(event.id),
        event,
      ])
    );
  }, [events]);

  /* =======================================================
     GET BOOKING EVENT
  ======================================================= */

  const getBookingEvent = (booking) => {
    const eventId =
      booking?.eventId ??
      booking?.event?.id;

    return (
      eventMap.get(
        String(eventId)
      ) ||
      booking?.event ||
      null
    );
  };

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const totalBookings =
      userBookings.length;

    const confirmedBookings =
      userBookings.filter(
        (booking) =>
          getBookingStatus(
            booking
          ) === "confirmed"
      ).length;

    const pendingBookings =
      userBookings.filter(
        (booking) =>
          getBookingStatus(
            booking
          ) === "pending"
      ).length;

    const cancelledBookings =
      userBookings.filter(
        (booking) =>
          getBookingStatus(
            booking
          ) === "cancelled"
      ).length;

    const completedBookings =
      userBookings.filter(
        (booking) =>
          getBookingStatus(
            booking
          ) === "completed"
      ).length;

    const activeBookings =
      userBookings.filter(
        (booking) =>
          getBookingStatus(
            booking
          ) !== "cancelled"
      );

    const tickets =
      activeBookings.reduce(
        (total, booking) =>
          total +
          getBookingQuantity(
            booking
          ),
        0
      );

    const totalSpent =
      activeBookings.reduce(
        (total, booking) =>
          total +
          getBookingAmount(
            booking
          ),
        0
      );

    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      completedBookings,
      tickets,
      totalSpent,
    };
  }, [userBookings]);

  /* =======================================================
     SORT BOOKINGS
  ======================================================= */

  const sortedBookings = useMemo(() => {
    return [...userBookings].sort(
      (a, b) => {
        const dateA =
          getBookingDate(a);

        const dateB =
          getBookingDate(b);

        const timeA = dateA
          ? new Date(
              dateA
            ).getTime()
          : 0;

        const timeB = dateB
          ? new Date(
              dateB
            ).getTime()
          : 0;

        return timeB - timeA;
      }
    );
  }, [userBookings]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-28 rounded bg-slate-200" />

            <div className="rounded-2xl bg-white p-7">
              <div className="flex gap-5">
                <div className="h-20 w-20 rounded-2xl bg-slate-200" />

                <div className="space-y-3">
                  <div className="h-6 w-52 rounded bg-slate-200" />
                  <div className="h-4 w-72 rounded bg-slate-100" />
                  <div className="h-4 w-56 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     USER NOT FOUND
  ======================================================= */

  if (!user) {
    return (
      <div className="min-h-full bg-slate-50">
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center px-5 py-10">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <UserRound size={26} />
            </div>

            <h1 className="mt-5 text-lg font-bold text-slate-900">
              User not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This account could not be
              found in EventON.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/users"
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <ArrowLeft size={16} />
              Back to Users
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     USER DISPLAY
  ======================================================= */

  const role =
    normalizeRole(user.role);

  const RoleIcon =
    getRoleIcon(role);

  const displayName =
    user.name ||
    "Unnamed User";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50">
      {/* ===================================================
          PAGE TITLE
      =================================================== */}

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-orange-600"
          >
            <ArrowLeft size={16} />
            Back to Users
          </Link>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            User Details
          </h1>
        </div>
      </section>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-6 lg:px-8">
        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* PROFILE */}

              <div className="flex min-w-0 items-center gap-5">
                {/* PROFESSIONAL USER AVATAR */}

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm sm:h-20 sm:w-20">
                  <UserRound
                    size={34}
                    strokeWidth={1.7}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      {displayName}
                    </h2>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getRoleStyle(
                        role
                      )}`}
                    >
                      <RoleIcon size={13} />
                      {getRoleLabel(role)}
                    </span>
                  </div>

                  {/* EMAIL */}

                  <a
                    href={`mailto:${user.email || ""}`}
                    className="mt-3 flex items-center gap-2 break-all text-sm font-medium text-slate-500 transition hover:text-orange-600"
                  >
                    <Mail
                      size={15}
                      className="shrink-0"
                    />

                    {user.email ||
                      "No email"}
                  </a>

                  {/* USER ID */}

                  <p className="mt-2 break-all text-sm text-slate-500">
                    User ID:{" "}
                    <span className="font-semibold text-slate-700">
                      {user.id ||
                        "Not available"}
                    </span>
                  </p>
                </div>
              </div>

              {/* ACCOUNT STATUS */}

              <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                    Account
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-emerald-700">
                    Active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UserDetailStatCard
            title="Total Bookings"
            value={
              statistics.totalBookings
            }
            icon={Ticket}
            iconClass="bg-blue-50 text-blue-600"
          />

          <UserDetailStatCard
            title="Confirmed"
            value={
              statistics.confirmedBookings
            }
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <UserDetailStatCard
            title="Pending"
            value={
              statistics.pendingBookings
            }
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />

          <UserDetailStatCard
            title="Cancelled"
            value={
              statistics.cancelledBookings
            }
            icon={XCircle}
            iconClass="bg-red-50 text-red-600"
          />

          <UserDetailStatCard
            title="Tickets"
            value={
              statistics.tickets
            }
            icon={Users}
            iconClass="bg-violet-50 text-violet-600"
          />

          <UserDetailStatCard
            title="Total Spent"
            value={`₹${statistics.totalSpent.toLocaleString(
              "en-IN"
            )}`}
            icon={IndianRupee}
            iconClass="bg-orange-50 text-orange-600"
          />
        </section>

        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="text-sm font-bold text-slate-900">
              Account Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            <InfoItem
              label="Full Name"
              value={
                user.name ||
                "Not available"
              }
              icon={UserRound}
            />

            <InfoItem
              label="Email Address"
              value={
                user.email ||
                "Not available"
              }
              icon={Mail}
            />

            <InfoItem
              label="Role"
              value={getRoleLabel(role)}
              icon={RoleIcon}
            />

            <InfoItem
              label="User ID"
              value={
                user.id ||
                "Not available"
              }
              icon={ShieldCheck}
              full
            />

            <InfoItem
              label="Account Status"
              value="Active"
              icon={CheckCircle2}
            />

            <InfoItem
              label="Registration"
              value={
                user.createdAt
                  ? formatDate(
                      user.createdAt
                    )
                  : user.createdOn
                  ? formatDate(
                      user.createdOn
                    )
                  : "Available account"
              }
              icon={Clock3}
            />
          </div>
        </section>

        {/* =================================================
            BOOKING HISTORY
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* HEADER */}

          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Booking History
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  All bookings associated
                  with this account
                </p>
              </div>

              <div className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-600">
                <Ticket size={14} />
                {userBookings.length}
              </div>
            </div>
          </div>

          {/* BOOKINGS */}

          {sortedBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Ticket size={25} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No bookings yet
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                No booking records are
                associated with this user.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4 sm:p-5">
              {sortedBookings.map(
                (booking, index) => {
                  const event =
                    getBookingEvent(
                      booking
                    );

                  const status =
                    getBookingStatus(
                      booking
                    );

                  const statusStyle =
                    getBookingStatusStyle(
                      status
                    );

                  const bookingId =
                    booking?.id ??
                    booking?.bookingId ??
                    "Not available";

                  const eventDate =
                    getEventDate(event);

                  const eventTime =
                    getEventTime(event);

                  const eventLocation =
                    getEventLocation(event);

                  return (
                    <article
                      key={
                        bookingId !==
                        "Not available"
                          ? bookingId
                          : `${booking?.eventId}-${index}`
                      }
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                    >
                      {/* EVENT HEADER */}

                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                        {/* EVENT IMAGE */}

                        <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-32">
                          {event?.image ? (
                            <img
                              src={event.image}
                              alt={
                                event?.title ||
                                "Event"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                              <CalendarDays
                                size={28}
                              />
                            </div>
                          )}
                        </div>

                        {/* EVENT CONTENT */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-slate-900">
                                {event?.title ||
                                  booking?.eventName ||
                                  "Event"}
                              </h3>

                              {event?.category && (
                                <p className="mt-1 text-xs font-medium text-slate-400">
                                  {event.category}
                                </p>
                              )}
                            </div>

                            {/* STATUS */}

                            <span
                              className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyle.badge}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                              />

                              {getBookingStatusLabel(
                                status
                              )}
                            </span>
                          </div>

                          {/* LOCATION */}

                          <div className="mt-3 flex items-start gap-2">
                            <MapPin
                              size={15}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />

                            <span className="text-xs font-medium leading-5 text-slate-600">
                              {eventLocation}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* EVENT META */}

                      <div className="grid grid-cols-1 border-t border-slate-100 bg-slate-50 sm:grid-cols-3">
                        <BookingMeta
                          icon={CalendarDays}
                          label="Date"
                          value={
                            eventDate
                              ? formatDate(
                                  eventDate
                                )
                              : "Not available"
                          }
                        />

                        <BookingMeta
                          icon={Clock3}
                          label="Time"
                          value={
                            eventTime
                          }
                        />

                        <BookingMeta
                          icon={MapPin}
                          label="Location"
                          value={
                            eventLocation
                          }
                        />
                      </div>

                      {/* BOOKING META */}

                      <div className="grid grid-cols-1 gap-4 border-t border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
                        <BookingValue
                          label="Booking ID"
                          value={bookingId}
                          full
                        />

                        <BookingValue
                          label="Tickets"
                          value={
                            getBookingQuantity(
                              booking
                            )
                          }
                        />

                        <BookingValue
                          label="Amount"
                          value={`₹${getBookingAmount(
                            booking
                          ).toLocaleString(
                            "en-IN"
                          )}`}
                        />

                        <BookingValue
                          label="Booked On"
                          value={formatDateTime(
                            getBookingDate(
                              booking
                            )
                          )}
                        />
                      </div>

                      {/* CANCELLED */}

                      {status ===
                        "cancelled" && (
                        <div className="mx-4 mb-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3 sm:mx-5 sm:mb-5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-red-500">
                            <XCircle size={16} />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-red-700">
                              Booking Cancelled
                            </p>

                            <p className="mt-0.5 text-[11px] leading-5 text-red-600">
                              This booking remains
                              in the user's history
                              but is excluded from
                              active ticket and
                              spending totals.
                            </p>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function UserDetailStatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="flex min-h-[116px] w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">
            {value}
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

/* =========================================================
   ACCOUNT INFO
========================================================= */

function InfoItem({
  label,
  value,
  icon: Icon,
  full = false,
}) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p
          className={`mt-1 text-sm font-semibold text-slate-700 ${
            full
              ? "break-all"
              : "break-words"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING META
========================================================= */

function BookingMeta({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-xs font-semibold leading-5 text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING VALUE
========================================================= */

function BookingValue({
  label,
  value,
  full = false,
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-bold text-slate-800 ${
          full
            ? "break-all"
            : "break-words"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default AdminUserDetails;