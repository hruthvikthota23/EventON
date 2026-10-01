import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  X,
  XCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getStoredBookings,
  BOOKINGS_UPDATED_EVENT,
  cancelStoredBooking,
} from "../../utils/bookingStorage";

import {
  getStoredEvents,
  getStoredEventsByOrganizer,
  getStoredEventById,
  decrementEventSeats,
  incrementEventSeats,
  updateStoredEvent,
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

/* =========================================================
   BOOKING ID
========================================================= */

const getBookingId = (booking) =>
  booking?.id ||
  booking?.bookingId ||
  "—";

/* =========================================================
   BOOKING DATE
========================================================= */

const getBookingDate = (booking) =>
  booking?.createdAt ||
  booking?.bookingDate ||
  booking?.createdOn ||
  booking?.timestamp ||
  null;

/* =========================================================
   BOOKING AMOUNT
========================================================= */

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

  return (
    ticketPrice *
    getBookingQuantity(booking)
  );
};

/* =========================================================
   DATE FORMAT
========================================================= */

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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

/* =========================================================
   CURRENCY FORMAT
========================================================= */

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;

/* =========================================================
   TIME FORMAT
========================================================= */

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
   DATE/TIME PARSER
========================================================= */

const parseEventDateTime = (
  dateValue,
  timeValue
) => {
  if (!dateValue) {
    return null;
  }

  if (
    typeof dateValue === "string" &&
    dateValue.includes("T") &&
    !timeValue
  ) {
    const parsed = new Date(dateValue);

    return Number.isNaN(
      parsed.getTime()
    )
      ? null
      : parsed;
  }

  const dateString =
    String(dateValue);

  const match = dateString.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  let year;
  let month;
  let day;

  if (match) {
    year = Number(match[1]);
    month =
      Number(match[2]) - 1;
    day = Number(match[3]);
  } else {
    const parsed =
      new Date(dateString);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return null;
    }

    year =
      parsed.getFullYear();

    month =
      parsed.getMonth();

    day =
      parsed.getDate();
  }

  let hours = 0;
  let minutes = 0;

  if (timeValue) {
    const timeMatch =
      String(timeValue)
        .trim()
        .match(
          /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i
        );

    if (timeMatch) {
      hours =
        Number(timeMatch[1]);

      minutes =
        Number(timeMatch[2]);

      const meridiem =
        timeMatch[3]?.toUpperCase();

      if (
        meridiem === "PM" &&
        hours < 12
      ) {
        hours += 12;
      }

      if (
        meridiem === "AM" &&
        hours === 12
      ) {
        hours = 0;
      }
    }
  }

  return new Date(
    year,
    month,
    day,
    hours,
    minutes
  );
};

/* =========================================================
   EVENT START
========================================================= */

const getEventStart = (event) => {
  if (!event) {
    return null;
  }

  return parseEventDateTime(
    event?.date ||
      event?.eventDate ||
      event?.startDate,
    event?.startTime ||
      event?.time ||
      event?.eventTime
  );
};

/* =========================================================
   EVENT END
========================================================= */

const getEventEnd = (event) => {
  if (!event) {
    return null;
  }

  const date =
    event?.endDate ||
    event?.date ||
    event?.eventDate ||
    event?.startDate;

  if (
    event?.endTime ||
    event?.finishTime
  ) {
    return parseEventDateTime(
      date,
      event?.endTime ||
        event?.finishTime
    );
  }

  const start =
    getEventStart(event);

  if (!start) {
    return null;
  }

  const end =
    new Date(start);

  end.setHours(
    23,
    59,
    59,
    999
  );

  return end;
};

/* =========================================================
   BOOKING STATUS

   Upcoming
   Ongoing
   Completed
   Cancelled
========================================================= */

const getBookingStatus = (
  booking,
  event
) => {
  const storedStatus =
    String(
      booking?.status || ""
    )
      .trim()
      .toLowerCase();

  if (
    storedStatus === "cancelled" ||
    storedStatus === "canceled"
  ) {
    return "cancelled";
  }

  const start =
    getEventStart(event);

  const end =
    getEventEnd(event);

  if (!start) {
    if (
      storedStatus ===
      "completed"
    ) {
      return "completed";
    }

    return "upcoming";
  }

  const now = new Date();

  if (
    end &&
    now > end
  ) {
    return "completed";
  }

  if (now >= start) {
    return "ongoing";
  }

  return "upcoming";
};

/* =========================================================
   STATUS LABEL
========================================================= */

const getStatusLabel = (
  status
) => {
  switch (status) {
    case "upcoming":
      return "Upcoming";

    case "ongoing":
      return "Ongoing";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return "Upcoming";
  }
};

/* =========================================================
   STATUS CLASSES
========================================================= */

const getStatusClasses = (
  status
) => {
  switch (status) {
    case "upcoming":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "ongoing":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
};

/* =========================================================
   STATUS ICON
========================================================= */

const getStatusIcon = (
  status
) => {
  switch (status) {
    case "upcoming":
      return Clock3;

    case "ongoing":
      return Clock3;

    case "completed":
      return CheckCircle2;

    case "cancelled":
      return XCircle;

    default:
      return Clock3;
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

function ManagementBookingDetails() {
  const { bookingId } =
    useParams();

  const { user } =
    useAuth();

  const navigate =
    useNavigate();

  const normalizedRole =
    String(
      user?.role || ""
    )
      .trim()
      .toLowerCase();

  const isAdmin =
    normalizedRole ===
    "admin";

  const isOrganizer =
    normalizedRole ===
    "organizer";

  const [booking, setBooking] =
    useState(null);

  const [event, setEvent] =
    useState(null);

  const [attendee, setAttendee] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [cancelling, setCancelling] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState("");

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  /* =======================================================
     LOAD BOOKING
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
        isAdmin
          ? getStoredEvents()
          : user?.id
          ? getStoredEventsByOrganizer(
              user.id
            )
          : [];

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
            String(
              bookingEventId
            )
        ) ||
        foundBooking?.event ||
        null;

      /*
       * Organizer can only see
       * their own event booking.
       */

      if (
        isOrganizer &&
        !foundEvent
      ) {
        setBooking(null);
        setEvent(null);
        setAttendee(null);
        setLoading(false);
        return;
      }

      /* ===============================================
         ACCOUNTS
      =============================================== */

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
  }, [
    bookingId,
    user?.id,
    isAdmin,
    isOrganizer,
  ]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const status = useMemo(
    () =>
      getBookingStatus(
        booking,
        event
      ),
    [booking, event]
  );

  const quantity =
    getBookingQuantity(
      booking
    );

  const amount = useMemo(
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
    getStatusIcon(status);

  const location = [
    event?.location,
    event?.city,
  ]
    .filter(Boolean)
    .join(", ") ||
    "Location not available";

  /* =======================================================
     CANCEL PERMISSION

     BOTH ADMIN + ORGANIZER

     Only UPCOMING bookings can be cancelled.
  ======================================================= */

  const canCancelBooking =
    (isAdmin || isOrganizer) &&
    status === "upcoming" &&
    !cancelling;

  /* =======================================================
     OPEN CANCEL POPUP
  ======================================================= */

  const handleOpenCancelModal =
    () => {
      if (!canCancelBooking) {
        return;
      }

      setActionMessage("");

      setShowCancelModal(true);
    };

  /* =======================================================
     CLOSE CANCEL POPUP
  ======================================================= */

  const handleCloseCancelModal =
    () => {
      if (cancelling) {
        return;
      }

      setShowCancelModal(false);
    };

  /* =======================================================
     CANCEL BOOKING
  ======================================================= */

  const handleCancelBooking =
    () => {
      if (!canCancelBooking) {
        return;
      }

      setCancelling(true);
      setActionMessage("");

      try {
        /* ===============================================
           GET LATEST BOOKING
        =============================================== */

        const latestBookings =
          getStoredBookings();

        const currentBooking =
          latestBookings.find(
            (item) =>
              String(
                item?.bookingId ??
                  item?.id
              ) ===
              String(bookingId)
          );

        if (!currentBooking) {
          setActionMessage(
            "This booking is no longer available."
          );

          setShowCancelModal(false);

          return;
        }

        /* ===============================================
           RE-CHECK CURRENT STATUS
        =============================================== */

        const currentStatus =
          getBookingStatus(
            currentBooking,
            event
          );

        if (
          currentStatus !==
          "upcoming"
        ) {
          setBooking(
            currentBooking
          );

          setActionMessage(
            "This booking can no longer be cancelled."
          );

          setShowCancelModal(false);

          return;
        }

        /* ===============================================
           EVENT ID
        =============================================== */

        const eventId =
          currentBooking?.eventId ??
          currentBooking?.event?.id;

        if (!eventId) {
          setActionMessage(
            "The event linked to this booking could not be found."
          );

          setShowCancelModal(false);

          return;
        }

        /* ===============================================
           CURRENT EVENT
        =============================================== */

        const currentEvent =
          getStoredEventById(
            eventId
          );

        if (!currentEvent) {
          setActionMessage(
            "The event linked to this booking could not be found."
          );

          setShowCancelModal(false);

          return;
        }

        /* ===============================================
           TICKET QUANTITY
        =============================================== */

        const cancelledQuantity =
          Math.max(
            1,
            Number(
              currentBooking?.quantity ??
                currentBooking?.seats ??
                currentBooking?.tickets ??
                currentBooking?.ticketCount ??
                1
            )
          );

        /* ===============================================
           RESTORE EVENT SEATS
        =============================================== */

        const updatedEvent =
          decrementEventSeats(
            eventId,
            cancelledQuantity
          );

        if (!updatedEvent) {
          setActionMessage(
            "The event seats could not be restored. Please try again."
          );

          setShowCancelModal(false);

          return;
        }

        /* ===============================================
           RESTORE SOLD-OUT EVENT
        =============================================== */

        if (
          currentEvent.status ===
            "sold-out" &&
          Number(
            updatedEvent.bookedSeats
          ) <
            Number(
              updatedEvent.capacity
            )
        ) {
          updateStoredEvent(
            eventId,
            {
              status: "published",
            }
          );
        }

        /* ===============================================
           CANCEL BOOKING
        =============================================== */

        const storedBookingId =
          currentBooking?.bookingId ??
          currentBooking?.id;

        const cancellationResult =
          cancelStoredBooking(
            storedBookingId
          );

        /* ===============================================
           ROLLBACK IF BOOKING
           CANCELLATION FAILED
        =============================================== */

        if (
          !cancellationResult?.success
        ) {
          const rollbackEvent =
            getStoredEventById(
              eventId
            );

          if (rollbackEvent) {
            incrementEventSeats(
              eventId,
              cancelledQuantity
            );

            updateStoredEvent(
              eventId,
              {
                status:
                  currentEvent.status,
              }
            );
          }

          setActionMessage(
            cancellationResult?.error ||
              "The booking could not be cancelled."
          );

          setShowCancelModal(false);

          return;
        }

        /* ===============================================
           REFRESH EVENT
        =============================================== */

        const refreshedEvent =
          getStoredEventById(
            eventId
          );

        /* ===============================================
           UPDATE LOCAL BOOKING
        =============================================== */

        setBooking(
          cancellationResult.booking || {
            ...currentBooking,
            status:
              "cancelled",
            cancelledAt:
              new Date().toISOString(),
          }
        );

        setEvent(
          refreshedEvent ||
            updatedEvent
        );

        setActionMessage(
          "Booking cancelled successfully."
        );

        setShowCancelModal(false);

        /* ===============================================
           REFRESH EVENTON SCREENS
        =============================================== */

        window.dispatchEvent(
          new Event(
            BOOKINGS_UPDATED_EVENT
          )
        );

        window.dispatchEvent(
          new Event(
            EVENTS_UPDATED_EVENT
          )
        );
      } catch (error) {
        console.error(
          "Unable to cancel booking:",
          error
        );

        setActionMessage(
          "Unable to cancel this booking. Please try again."
        );

        setShowCancelModal(false);
      } finally {
        setCancelling(false);
      }
    };

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
    const backPath = isAdmin
      ? "/admin/bookings"
      : "/organizer/bookings";

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
            The booking you're looking
            for could not be found in
            EventON.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(backPath)
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            <ArrowLeft size={17} />

            Back to Bookings
          </button>
        </div>
      </section>
    );
  }

  const backPath = isAdmin
    ? "/admin/bookings"
    : "/organizer/bookings";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-5 py-7 sm:px-6 lg:px-8">

        {/* BACK */}

        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-orange-600"
        >
          <ArrowLeft size={17} />

          Back to Bookings
        </Link>

        {/* HEADER */}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                Booking
              </span>

              <span className="font-mono text-xs font-bold text-slate-500">
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

          {/* STATUS */}

          <span
            className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClasses(
              status
            )}`}
          >
            <StatusIcon size={16} />

            {getStatusLabel(status)}
          </span>
        </div>

        {/* =================================================
            ATTENDEE + EVENT
        ================================================= */}

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1.15fr]">

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
                  <UserRound size={19} />
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
                  <CalendarDays size={19} />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">

              {/* EVENT IMAGE */}

              <div className="h-48 w-full overflow-hidden rounded-2xl bg-slate-100 sm:h-56">
                {event?.image ? (
                  <img
                    src={event.image}
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
                <IndianRupee size={19} />
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={Ticket}
              label="Booking ID"
              value={bookingIdValue}
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

          {/* =================================================
              BOOKING ACTIONS

              BOTH ADMIN + ORGANIZER
          ================================================= */}

          {(isAdmin ||
            isOrganizer) && (
            <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Booking Actions
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {status ===
                    "upcoming"
                      ? "This booking can be cancelled before the event starts."
                      : "Only upcoming bookings can be cancelled."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleOpenCancelModal
                  }
                  disabled={
                    !canCancelBooking
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    canCancelBooking
                      ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100"
                      : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  }`}
                >
                  <XCircle size={16} />

                  Cancel Booking
                </button>
              </div>

              {actionMessage && (
                <p
                  className={`mt-3 text-sm font-medium ${
                    actionMessage.includes(
                      "successfully"
                    )
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {actionMessage}
                </p>
              )}
            </div>
          )}

          {/* CANCELLED MESSAGE */}

          {status ===
            "cancelled" &&
            actionMessage && (
              <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
                <p className="text-sm font-medium text-emerald-600">
                  {actionMessage}
                </p>
              </div>
            )}
        </section>
      </div>

      {/* =====================================================
          CANCEL BOOKING MODAL
      ===================================================== */}

      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseCancelModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <XCircle size={21} />
                </div>

                <div>
                  <h2
                    id="cancel-booking-title"
                    className="text-base font-bold text-slate-900"
                  >
                    Cancel Booking?
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    This action will update
                    the booking status.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseCancelModal
                }
                disabled={
                  cancelling
                }
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="px-5 py-5 sm:px-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">
                  {event?.title ||
                    "Event"}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>
                    Booking #
                    {
                      bookingIdValue
                    }
                  </span>

                  <span>
                    {quantity} ticket
                    {quantity !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Are you sure you want to
                cancel this booking? The
                booking will be marked as
                cancelled and its tickets
                will be restored to the
                event.
              </p>
            </div>

            {/* MODAL ACTIONS */}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={
                  handleCloseCancelModal
                }
                disabled={
                  cancelling
                }
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={
                  handleCancelBooking
                }
                disabled={
                  cancelling
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XCircle size={16} />

                {cancelling
                  ? "Cancelling..."
                  : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
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

export default ManagementBookingDetails;