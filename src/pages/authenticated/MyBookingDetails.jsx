import { useEffect, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Ticket,
  User,
  XCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getStoredBookingById,
  updateStoredBooking,
} from "../../utils/bookingStorage";

import {
  getStoredEventById,
  incrementEventSeats,
  decrementEventSeats,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

import BookingStatus from "../../components/bookings/BookingStatus";

const getEventDateTime = (dateValue, timeValue) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  if (!timeValue) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  const value = String(timeValue).trim();
  const match12 = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const match24 = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  let hours;
  let minutes;

  if (match12) {
    hours = Number(match12[1]);
    minutes = Number(match12[2]);
    const period = match12[3].toUpperCase();

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
  } else if (match24) {
    hours = Number(match24[1]);
    minutes = Number(match24[2]);
  } else {
    return date;
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0
  );
};

const getEventStatus = (bookingValue, eventValue) => {
  const rawStatus = String(bookingValue?.status || "").toLowerCase();

  if (rawStatus === "cancelled" || rawStatus === "canceled") {
    return "cancelled";
  }

  const start = getEventDateTime(
    eventValue?.date,
    eventValue?.time || eventValue?.startTime
  );

  if (!start) return "upcoming";

  const end = getEventDateTime(
    eventValue?.date,
    eventValue?.endTime || eventValue?.finishTime
  );

  const now = new Date();

  if (now < start) return "upcoming";
  if (end && now < end) return "ongoing";
  return "completed";
};

function MyBookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  // =========================================================
  // STATE
  // =========================================================

  const [booking, setBooking] = useState(null);
  const [isLoadingBooking, setIsLoadingBooking] =
    useState(true);
  const [isCancelling, setIsCancelling] =
    useState(false);
  const [cancelError, setCancelError] =
    useState("");
  const [showCancelModal, setShowCancelModal] =
    useState(false);

  // =========================================================
  // LOAD BOOKING
  // =========================================================

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !user?.email) {
      setBooking(null);
      setIsLoadingBooking(false);
      return;
    }

    if (!bookingId) {
      setBooking(null);
      setIsLoadingBooking(false);
      return;
    }

    const storedBooking =
      getStoredBookingById(bookingId);

    if (!storedBooking) {
      setBooking(null);
      setIsLoadingBooking(false);
      return;
    }

    // =======================================================
    // VERIFY BOOKING BELONGS TO CURRENT USER
    // =======================================================

    const bookingEmail = String(
      storedBooking?.attendee?.email || ""
    )
      .trim()
      .toLowerCase();

    const currentUserEmail = String(
      user.email || ""
    )
      .trim()
      .toLowerCase();

    if (
      !bookingEmail ||
      bookingEmail !== currentUserEmail
    ) {
      setBooking(null);
      setIsLoadingBooking(false);
      return;
    }

    setBooking(storedBooking);
    setIsLoadingBooking(false);
  }, [
    bookingId,
    user?.email,
    isAuthenticated,
    isLoading,
  ]);

  // =========================================================
  // LISTEN FOR BOOKING / EVENT UPDATES
  // =========================================================

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const reloadBooking = () => {
      if (
        !isAuthenticated ||
        !user?.email ||
        !bookingId
      ) {
        return;
      }

      const storedBooking =
        getStoredBookingById(bookingId);

      if (!storedBooking) {
        setBooking(null);
        return;
      }

      const bookingEmail = String(
        storedBooking?.attendee?.email || ""
      )
        .trim()
        .toLowerCase();

      const currentUserEmail = String(
        user.email || ""
      )
        .trim()
        .toLowerCase();

      if (
        !bookingEmail ||
        bookingEmail !== currentUserEmail
      ) {
        setBooking(null);
        return;
      }

      setBooking(storedBooking);
    };

    window.addEventListener(
      "eventon:bookings-updated",
      reloadBooking
    );

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      reloadBooking
    );

    window.addEventListener(
      "storage",
      reloadBooking
    );

    return () => {
      window.removeEventListener(
        "eventon:bookings-updated",
        reloadBooking
      );

      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        reloadBooking
      );

      window.removeEventListener(
        "storage",
        reloadBooking
      );
    };
  }, [
    bookingId,
    user?.email,
    isAuthenticated,
    isLoading,
  ]);

  // =========================================================
  // AUTH REDIRECT
  // =========================================================

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: {
          from: `/my-bookings/${bookingId}`,
        },
      });
    }
  }, [
    bookingId,
    isAuthenticated,
    isLoading,
    navigate,
  ]);

  // =========================================================
  // LOADING
  // =========================================================

  if (
    isLoading ||
    isLoadingBooking
  ) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center px-5 py-16 sm:px-8 lg:px-10">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading booking details...
            </p>
          </div>
        </section>
      </main>
    );
  }

  // =========================================================
  // BOOKING NOT FOUND
  // =========================================================

  if (!booking) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center px-5 py-16 sm:px-8 lg:px-10">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Ticket
                size={28}
                className="text-slate-400"
              />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Booking not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              We couldn't find this booking in
              your account. It may have been
              removed or the booking ID may be
              incorrect.
            </p>

            <Link
              to="/my-bookings"
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
            >
              <ArrowLeft size={17} />
              Back to bookings
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // =========================================================
  // EVENT
  // =========================================================

  const eventId =
    booking.eventId ||
    booking.event?.id;

  const storedEvent =
    eventId
      ? getStoredEventById(eventId)
      : null;

  const event =
    storedEvent ||
    booking.event;

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  const handleCancelBooking = () => {
    if (
      isCancelling ||
      !booking ||
      isCancelled ||
      displayStatus !== "upcoming"
    ) {
      return;
    }

    const latestBooking =
      getStoredBookingById(booking.bookingId);

    if (!latestBooking) {
      setCancelError(
        "This booking could not be found. Please refresh and try again."
      );
      return;
    }

    const latestBookingStatus = String(
      latestBooking.status || ""
    )
      .trim()
      .toLowerCase();

    if (
      latestBookingStatus === "cancelled" ||
      latestBookingStatus === "canceled"
    ) {
      setBooking(latestBooking);
      return;
    }

    const latestEvent =
      eventId ? getStoredEventById(eventId) : null;

    if (!latestEvent) {
      setCancelError(
        "The event information is no longer available."
      );
      return;
    }

    // Re-check the live event status immediately before opening
    // the confirmation modal.
    const latestDisplayStatus = getEventStatus(
      latestBooking,
      latestEvent
    );

    if (latestDisplayStatus !== "upcoming") {
      setBooking(latestBooking);
      setCancelError(
        "This booking can no longer be cancelled because the event has started or completed."
      );
      return;
    }

    setCancelError("");
    setShowCancelModal(true);
  };

  const confirmCancelBooking = () => {
    if (
      isCancelling ||
      !booking ||
      isCancelled ||
      displayStatus !== "upcoming"
    ) {
      return;
    }

    const latestBooking =
      getStoredBookingById(booking.bookingId);

    if (!latestBooking) {
      setShowCancelModal(false);
      setCancelError(
        "This booking could not be found. Please refresh and try again."
      );
      return;
    }

    const latestEvent =
      eventId ? getStoredEventById(eventId) : null;

    if (!latestEvent) {
      setShowCancelModal(false);
      setCancelError(
        "The event information is no longer available."
      );
      return;
    }

    const latestDisplayStatus = getEventStatus(
      latestBooking,
      latestEvent
    );

    if (latestDisplayStatus !== "upcoming") {
      setShowCancelModal(false);
      setBooking(latestBooking);
      setCancelError(
        "This booking can no longer be cancelled because the event has started or completed."
      );
      return;
    }

    setShowCancelModal(false);
    setIsCancelling(true);
    setCancelError("");

    try {
      const ticketQuantity = Math.max(
        Number(latestBooking.ticketCount) || 0,
        0
      );

      if (ticketQuantity < 1) {
        setCancelError(
          "This booking has an invalid ticket quantity."
        );
        return;
      }

      const updatedEvent = decrementEventSeats(
        latestEvent.id,
        ticketQuantity
      );

      if (!updatedEvent) {
        setCancelError(
          "Unable to restore event availability. The booking was not cancelled."
        );
        return;
      }

      const updatedBooking = updateStoredBooking(
        latestBooking.bookingId,
        {
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
        }
      );

      if (!updatedBooking) {
        // Roll back the seat change if booking update fails.
        incrementEventSeats(
          latestEvent.id,
          ticketQuantity
        );

        setCancelError(
          "Unable to cancel your booking. Please try again."
        );
        return;
      }

      const remainingSeats = Math.max(
        (Number(updatedEvent.capacity) || 0) -
          (Number(updatedEvent.bookedSeats) || 0),
        0
      );

      if (
        String(updatedEvent.status || "").toLowerCase() ===
          "sold-out" &&
        remainingSeats > 0
      ) {
        updateStoredEvent(latestEvent.id, {
          status: "published",
        });
      }

      window.dispatchEvent(
        new Event("eventon:bookings-updated")
      );

      const refreshedBooking =
        getStoredBookingById(
          latestBooking.bookingId
        );

      setBooking(
        refreshedBooking || updatedBooking
      );
    } catch (error) {
      console.error(
        "Unable to cancel booking:",
        error
      );

      setCancelError(
        "Something went wrong while cancelling your booking. Please try again."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // =========================================================
  // EVENT NOT FOUND
  // =========================================================

  if (!event) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center px-5 py-16 sm:px-8 lg:px-10">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Ticket
                size={28}
                className="text-slate-400"
              />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Event information unavailable
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              This booking exists, but the
              associated event information is no
              longer available.
            </p>

            <Link
              to="/my-bookings"
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
            >
              <ArrowLeft size={17} />
              Back to bookings
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // =========================================================
  // BOOKING DATA
  // =========================================================

  const attendee =
    booking.attendee || {};

  const ticketCount =
    Number(booking.ticketCount) || 0;

  const totalPrice =
    Number(booking.totalPrice) ||
    Number(event.price) * ticketCount;

  const status =
    String(booking.status || "")
      .trim()
      .toLowerCase();

  const isCancelled =
    status === "cancelled" ||
    status === "canceled";

  const displayStatus = getEventStatus(
    booking,
    event
  );

  const canCancel =
    displayStatus === "upcoming" &&
    !isCancelled;

  // =========================================================
  // DATE FORMATTING
  // =========================================================

  const getFormattedDate = (dateValue) => {
    if (!dateValue) {
      return "Date unavailable";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const getBookingDate = (dateValue) => {
    if (!dateValue) {
      return "Unavailable";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unavailable";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getBookingTime = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const formattedDate =
    getFormattedDate(event.date);

  const bookingDate =
    getBookingDate(booking.createdAt);

  const formattedBookingTime =
    getBookingTime(booking.createdAt);

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-slate-800 transition hover:bg-orange-50 hover:text-orange-600"
          >
            <ArrowLeft size={17} />
            Back to bookings
          </Link>
        </div>
      </section>

      {/* CONTENT */}

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">

        {/* PAGE HEADING */}

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
            Booking details
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {event.title}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Booking ID:{" "}
                <span className="font-mono font-semibold text-slate-700">
                  {booking.bookingId}
                </span>
              </p>
            </div>


          </div>
        </div>

        {/* MAIN GRID */}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* LEFT */}

          <div className="space-y-6">

            {/* EVENT CARD */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className={`h-64 w-full object-cover sm:h-80 ${
                    isCancelled
                      ? "grayscale-[30%]"
                      : ""
                  }`}
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center bg-slate-100 sm:h-80">
                  <Ticket
                    size={48}
                    className="text-slate-300"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8">

                <span className="inline-flex rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
                  {event.category || "General"}
                </span>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  {event.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {event.description}
                </p>

                {/* EVENT INFORMATION */}

                <div className="mt-7 grid gap-4 sm:grid-cols-2">

                  {/* DATE */}

                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                      <CalendarDays size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formattedDate}
                      </p>
                    </div>
                  </div>

                  {/* TIME */}

                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Clock3 size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Time
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {event.time ||
                          event.startTime ||
                          "Time unavailable"}

                        {(event.endTime ||
                          event.finishTime)
                          ? ` – ${
                              event.endTime ||
                              event.finishTime
                            }`
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* LOCATION */}

                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Location
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {event.location ||
                          event.city ||
                          "Location unavailable"}
                      </p>

                      {event.location &&
                        event.city && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {event.city}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* TICKETS */}

                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Ticket size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Tickets
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {ticketCount}{" "}
                        {ticketCount === 1
                          ? "ticket"
                          : "tickets"}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ATTENDEE DETAILS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">
                  Attendee
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  Attendee details
                </h2>
              </div>

              <div className="mt-6 space-y-4">

                {/* NAME */}

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <User size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Full name
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {attendee.name ||
                        "Not available"}
                    </p>
                  </div>
                </div>

                {/* EMAIL */}

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Mail size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">
                      Email
                    </p>

                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                      {attendee.email ||
                        "Not available"}
                    </p>
                  </div>
                </div>

                {/* PHONE */}

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Phone size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Phone
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {attendee.phone ||
                        "Not available"}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT */}

          <aside className="lg:sticky lg:top-24 lg:self-start">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              {/* SUMMARY HEADER */}

              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Booking summary
                </h2>

                <BookingStatus
                  status={displayStatus}
                />
              </div>

              <div className="my-6 border-t border-slate-200" />

              {/* PRICE */}

              <div className="space-y-4">

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Ticket price
                  </span>

                  <span className="font-semibold text-slate-900">
                    ₹{Number(event.price) || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Quantity
                  </span>

                  <span className="font-semibold text-slate-900">
                    × {ticketCount}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Total paid
                    </span>

                    <span className="text-2xl font-bold text-slate-900">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>

              </div>

              <div className="my-6 border-t border-slate-200" />

              {/* BOOKING DATE */}

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Booked on
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {bookingDate}

                  {formattedBookingTime && (
                    <span className="ml-1 font-normal text-slate-500">
                      at {formattedBookingTime}
                    </span>
                  )}
                </p>
              </div>

              {/* STATUS */}

              <div
                className={`mt-6 flex items-start gap-3 rounded-xl p-4 ${
                  isCancelled
                    ? "bg-red-50"
                    : "bg-green-50"
                }`}
              >
                {isCancelled ? (
                  <XCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />
                ) : (
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-green-500"
                  />
                )}

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {isCancelled
                      ? "Booking cancelled"
                      : "Booking confirmed"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {isCancelled
                      ? "This booking is no longer active."
                      : "Your ticket is confirmed. Keep your booking ID for reference."}
                  </p>
                </div>
              </div>

              {cancelError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-5 text-red-600">
                  {cancelError}
                </div>
              )}

              {/* CANCEL BOOKING */}

              <button
                type="button"
                onClick={canCancel ? handleCancelBooking : undefined}
                disabled={!canCancel || isCancelling}
                className={`mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                  canCancel
                    ? "border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50"
                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <XCircle size={17} />
                {isCancelled
                  ? "Booking Cancelled"
                  : canCancel
                  ? isCancelling
                    ? "Cancelling booking..."
                    : "Cancel Booking"
                  : displayStatus === "ongoing"
                  ? "Cancellation Unavailable"
                  : displayStatus === "completed"
                  ? "Cancellation Unavailable"
                  : "Cancellation Unavailable"}
              </button>

              {/* VIEW EVENT */}

              <Link
                to={`/events/${event.id}`}
                className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold !text-white transition hover:bg-slate-800"
              >
                View Event
              </Link>


            </div>
          </aside>

        </div>
      </section>

      {/* CANCEL CONFIRMATION MODAL */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-booking-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                <XCircle size={22} />
              </div>

              <div className="min-w-0">
                <h2
                  id="cancel-booking-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Cancel booking?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to cancel your booking for{" "}
                  <span className="font-semibold text-slate-700">
                    {event.title}
                  </span>
                  ? Your {ticketCount}{" "}
                  {ticketCount === 1 ? "ticket" : "tickets"} will be
                  released back to the event.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={confirmCancelBooking}
                disabled={isCancelling}
                className="h-11 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default MyBookingDetails;