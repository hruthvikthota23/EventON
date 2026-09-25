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
} from "../../utils/bookingStorage";

import {
  getStoredEventById,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

import BookingStatus from "../../components/bookings/BookingStatus";

function BookingDetails() {
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
          from: `/bookings/${bookingId}`,
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
              to="/bookings"
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
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
              to="/bookings"
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
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
    booking.status || "confirmed";

  const isCancelled =
    status === "cancelled";

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
            to="/bookings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
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

            <BookingStatus
              status={status}
            />
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
                  {event.category}
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
                        {event.time}

                        {event.endTime
                          ? ` – ${event.endTime}`
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
                        {event.location}
                      </p>

                      {event.city && (
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
                  status={status}
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

              {/* VIEW EVENT */}

              <Link
                to={`/events/${event.id}`}
                className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold !text-white transition hover:bg-slate-800"
              >
                View Event
              </Link>

              {/* BACK TO BOOKINGS */}

              <Link
                to="/bookings"
                className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Back to My Bookings
              </Link>

            </div>
          </aside>

        </div>
      </section>
    </main>
  );
}

export default BookingDetails;