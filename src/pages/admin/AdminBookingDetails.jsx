import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Mail,
  MapPin,
  Ticket,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getStoredBookings,
  BOOKINGS_UPDATED_EVENT,
} from "../../utils/bookingStorage";

import {
  getStoredEvents,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

/* =========================================================
   CONSTANTS
========================================================= */

const ACCOUNTS_STORAGE_KEY =
  "eventon_accounts";

/* =========================================================
   BOOKING HELPERS
========================================================= */

const getBookingQuantity = (booking) => {
  const quantity = Number(
    booking?.quantity ??
      booking?.seats ??
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

const getBookingStatus = (booking) => {
  const value = String(
    booking?.status || "confirmed"
  )
    .trim()
    .toLowerCase();

  if (
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "cancelled";
  }

  if (
    value === "pending"
  ) {
    return "pending";
  }

  if (
    value === "completed" ||
    value === "attended"
  ) {
    return "completed";
  }

  return "confirmed";
};

const getBookingAmount = (
  booking,
  event
) => {
  const storedAmount = Number(
    booking?.totalAmount ??
      booking?.totalPrice ??
      booking?.amount ??
      booking?.price ??
      0
  );

  if (
    Number.isFinite(storedAmount) &&
    storedAmount > 0
  ) {
    return storedAmount;
  }

  const ticketPrice = Number(
    event?.price || 0
  );

  const quantity =
    getBookingQuantity(
      booking
    );

  return (
    ticketPrice * quantity
  );
};

const getBookingId = (booking) =>
  booking?.id ||
  booking?.bookingId ||
  "—";

const getBookingDate = (booking) =>
  booking?.createdAt ||
  booking?.bookingDate ||
  booking?.createdOn ||
  booking?.timestamp ||
  booking?.date ||
  null;

/* =========================================================
   FORMATTERS
========================================================= */

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
};

const formatCurrency = (value) => {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN")}`;
};

const formatTime = (
  startTime,
  endTime
) => {
  if (!startTime) {
    return "—";
  }

  return endTime
    ? `${startTime} - ${endTime}`
    : startTime;
};

/* =========================================================
   STATUS HELPERS
========================================================= */

const getStatusLabel = (
  status
) => {
  switch (status) {
    case "cancelled":
      return "Cancelled";

    case "pending":
      return "Pending";

    case "completed":
      return "Completed";

    default:
      return "Confirmed";
  }
};

const getStatusClasses = (
  status
) => {
  switch (status) {
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "completed":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
};

const getStatusIcon = (
  status
) => {
  switch (status) {
    case "cancelled":
      return XCircle;

    case "pending":
      return Clock3;

    case "completed":
      return CheckCircle2;

    default:
      return CheckCircle2;
  }
};

/* =========================================================
   ATTENDEE RESOLVER
========================================================= */

const getAttendee = (
  booking,
  accounts
) => {
  const attendee =
    booking?.attendee || {};

  const bookingUserId =
    booking?.userId ||
    booking?.attendeeId ||
    booking?.user?.id ||
    attendee?.userId ||
    attendee?.id;

  const bookingEmail =
    booking?.attendeeEmail ||
    booking?.userEmail ||
    booking?.email ||
    attendee?.email;

  let account = null;

  if (bookingUserId) {
    account =
      accounts.find(
        (item) =>
          String(item?.id) ===
          String(bookingUserId)
      ) || null;
  }

  if (
    !account &&
    bookingEmail
  ) {
    account =
      accounts.find(
        (item) =>
          String(
            item?.email || ""
          )
            .trim()
            .toLowerCase() ===
          String(
            bookingEmail
          )
            .trim()
            .toLowerCase()
      ) || null;
  }

  return {
    id:
      account?.id ||
      bookingUserId ||
      null,

    name:
      account?.name ||
      attendee?.name ||
      booking?.attendeeName ||
      booking?.userName ||
      booking?.name ||
      "Attendee",

    email:
      account?.email ||
      attendee?.email ||
      bookingEmail ||
      "No email",

    phone:
      account?.phone ||
      attendee?.phone ||
      booking?.phone ||
      "No phone",
  };
};

/* =========================================================
   COMPONENT
========================================================= */

function AdminBookingDetails() {
  const { bookingId } =
    useParams();

  const navigate =
    useNavigate();

  const [booking, setBooking] =
    useState(null);

  const [event, setEvent] =
    useState(null);

  const [attendee, setAttendee] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
     LOAD ACTUAL BOOKING
  ======================================================= */

  const loadBooking = () => {
    if (!bookingId) {
      setBooking(null);
      setEvent(null);
      setAttendee(null);
      setLoading(false);
      return;
    }

    try {
      const allBookings =
        getStoredBookings();

      const allEvents =
        getStoredEvents();

      const foundBooking =
        allBookings.find(
          (item) =>
            String(
              item?.id ??
                item?.bookingId
            ) ===
            String(bookingId)
        );

      if (!foundBooking) {
        setBooking(null);
        setEvent(null);
        setAttendee(null);
        setLoading(false);
        return;
      }

      const bookingEventId =
        foundBooking?.eventId ??
        foundBooking?.event?.id;

      const foundEvent =
        allEvents.find(
          (item) =>
            String(item?.id) ===
            String(bookingEventId)
        ) ||
        foundBooking?.event ||
        null;

      /* =========================================
         LOAD ACTUAL ACCOUNTS
      ========================================= */

      let accounts = [];

      try {
        const raw =
          localStorage.getItem(
            ACCOUNTS_STORAGE_KEY
          );

        if (raw) {
          const parsed =
            JSON.parse(raw);

          if (
            Array.isArray(parsed)
          ) {
            accounts = parsed;
          }
        }
      } catch (error) {
        console.error(
          "Unable to load EventON accounts:",
          error
        );
      }

      const foundAttendee =
        getAttendee(
          foundBooking,
          accounts
        );

      setBooking(
        foundBooking
      );

      setEvent(
        foundEvent
      );

      setAttendee(
        foundAttendee
      );
    } catch (error) {
      console.error(
        "Unable to load booking details:",
        error
      );

      setBooking(null);
      setEvent(null);
      setAttendee(null);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LIVE DATA UPDATES
  ======================================================= */

  useEffect(() => {
    setLoading(true);

    loadBooking();

    const handleUpdate = () => {
      loadBooking();
    };

    window.addEventListener(
      "storage",
      handleUpdate
    );

    window.addEventListener(
      BOOKINGS_UPDATED_EVENT,
      handleUpdate
    );

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
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
        BOOKINGS_UPDATED_EVENT,
        handleUpdate
      );

      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        handleUpdate
      );

      window.removeEventListener(
        "eventon:auth-updated",
        handleUpdate
      );
    };
  }, [bookingId]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const status =
    useMemo(
      () =>
        getBookingStatus(
          booking
        ),
      [booking]
    );

  const quantity =
    getBookingQuantity(
      booking
    );

  const amount =
    useMemo(
      () =>
        getBookingAmount(
          booking,
          event
        ),
      [booking, event]
    );

  const bookingDate =
    getBookingDate(
      booking
    );

  const bookingIdValue =
    getBookingId(
      booking
    );

  const StatusIcon =
    getStatusIcon(
      status
    );

  const location =
    [
      event?.location,
      event?.city,
    ]
      .filter(Boolean)
      .join(", ") ||
    "Location not available";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="min-h-full bg-slate-50">
        <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-slate-200" />

            <div className="mt-7 h-8 w-56 rounded-lg bg-slate-200" />

            <div className="mt-2 h-4 w-72 rounded bg-slate-100" />

            <div className="mt-8 h-64 rounded-2xl bg-slate-200" />

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="h-52 rounded-2xl bg-slate-200" />
              <div className="h-52 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!booking) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
            <Ticket size={28} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Booking not found
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            The booking you're
            looking for could not
            be found in EventON.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/bookings"
              )
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            <ArrowLeft
              size={17}
            />
            Back to Bookings
          </button>
        </div>
      </section>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-5 py-7 sm:px-6 lg:px-8">
        {/* =================================================
            BACK
        ================================================= */}

        <Link
          to="/admin/bookings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-orange-600"
        >
          <ArrowLeft
            size={17}
          />
          Back to Bookings
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                Booking
              </span>

              <span className="font-mono text-xs font-medium text-slate-400">
                #{bookingIdValue}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Booking Details
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Complete booking,
              attendee and event
              information.
            </p>
          </div>

          <span
            className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClasses(
              status
            )}`}
          >
            <StatusIcon
              size={16}
            />

            {getStatusLabel(
              status
            )}
          </span>
        </div>

        {/* =================================================
            BOOKING SUMMARY
        ================================================= */}

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
            <SummaryItem
              label="Tickets"
              value={quantity}
              icon={Ticket}
            />

            <SummaryItem
              label="Total Amount"
              value={formatCurrency(
                amount
              )}
              icon={IndianRupee}
            />

            <SummaryItem
              label="Booked On"
              value={formatDate(
                bookingDate
              )}
              icon={CalendarDays}
            />

            <SummaryItem
              label="Status"
              value={getStatusLabel(
                status
              )}
              icon={StatusIcon}
            />
          </div>
        </section>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          {/* =================================================
              ATTENDEE
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                    Customer
                  </p>

                  <h2 className="mt-1 text-base font-bold text-slate-900">
                    Attendee Information
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <UserRound
                    size={19}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* PROFILE */}

              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
                  {attendee?.name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "A"}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {attendee?.name ||
                      "Attendee"}
                  </h3>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {attendee?.email ||
                      "No email"}
                  </p>
                </div>
              </div>

              {/* DETAILS */}

              <div className="mt-5 space-y-4">
                <InfoItem
                  icon={Mail}
                  label="Email Address"
                  value={
                    attendee?.email ||
                    "No email"
                  }
                />

                <InfoItem
                  icon={Users}
                  label="Phone"
                  value={
                    attendee?.phone ||
                    "No phone"
                  }
                />

                {attendee?.id && (
                  <InfoItem
                    icon={UserRound}
                    label="User ID"
                    value={
                      attendee.id
                    }
                  />
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              EVENT
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                    Event
                  </p>

                  <h2 className="mt-1 text-base font-bold text-slate-900">
                    Event Information
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <CalendarDays
                    size={19}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* EVENT IMAGE */}

              <div className="h-48 w-full overflow-hidden rounded-2xl bg-slate-100 sm:h-56">
                {event?.image ? (
                  <img
                    src={
                      event.image
                    }
                    alt={
                      event.title ||
                      "Event"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <CalendarDays
                      size={32}
                    />
                  </div>
                )}
              </div>

              {/* EVENT TITLE */}

              <div className="mt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {event?.title ||
                      "Event unavailable"}
                  </h3>

                  {event?.category && (
                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600">
                      {event.category}
                    </span>
                  )}
                </div>
              </div>

              {/* EVENT DETAILS */}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={CalendarDays}
                  label="Event Date"
                  value={formatDate(
                    event?.date
                  )}
                />

                <InfoItem
                  icon={Clock3}
                  label="Time"
                  value={formatTime(
                    event?.time,
                    event?.endTime
                  )}
                />

                <InfoItem
                  icon={MapPin}
                  label="Full Location"
                  value={location}
                />

                <InfoItem
                  icon={Users}
                  label="Tickets"
                  value={`${quantity} ticket${
                    quantity !== 1
                      ? "s"
                      : ""
                  }`}
                />
              </div>
            </div>
          </section>
        </div>

        {/* =================================================
            PAYMENT INFORMATION
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                  Transaction
                </p>

                <h2 className="mt-1 text-base font-bold text-slate-900">
                  Payment Information
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <IndianRupee
                  size={19}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            <InfoItem
              icon={Ticket}
              label="Booking ID"
              value={
                bookingIdValue
              }
            />

            <InfoItem
              icon={CalendarDays}
              label="Booked On"
              value={formatDate(
                bookingDate
              )}
            />

            <InfoItem
              icon={IndianRupee}
              label="Ticket Price"
              value={formatCurrency(
                event?.price
              )}
            />

            <InfoItem
              icon={IndianRupee}
              label="Total Amount"
              value={formatCurrency(
                amount
              )}
            />
          </div>
        </section>

        {/* =================================================
            STATUS
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
              Current State
            </p>

            <h2 className="mt-1 text-base font-bold text-slate-900">
              Booking Status
            </h2>
          </div>

          <div className="p-5 sm:p-6">
            <div
              className={`flex items-start gap-4 rounded-2xl border p-4 sm:p-5 ${getStatusClasses(
                status
              )}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
                <StatusIcon
                  size={20}
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold">
                  {getStatusLabel(
                    status
                  )}
                </p>

                <p className="mt-1 text-xs leading-5 opacity-80">
                  {status ===
                  "cancelled"
                    ? "This booking has been cancelled. Its tickets are not counted as active event seats."
                    : status ===
                      "pending"
                    ? "This booking is currently pending confirmation."
                    : status ===
                      "completed"
                    ? "This booking has been completed."
                    : "This booking is currently active and its tickets are counted toward event occupancy."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            EVENT LOCATION HIGHLIGHT
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <MapPin
                  size={20}
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Event Location
                </p>

                <p className="mt-1 break-words text-sm font-bold text-slate-900">
                  {location}
                </p>
              </div>
            </div>

            <Link
              to={`/admin/events/${event?.id}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
            >
              View Event
              <ArrowLeft
                size={14}
                className="rotate-180"
              />
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}

/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="min-w-0 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-800">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default AdminBookingDetails;