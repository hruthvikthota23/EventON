import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Minus,
  Plus,
  Ticket,
  User,
} from "lucide-react";

import {
  getStoredEventById,
  updateStoredEvent,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

import { saveBooking } from "../../utils/bookingStorage";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  // =========================================================
  // EVENT STATE
  // =========================================================

  const [event, setEvent] = useState(() =>
    getStoredEventById(id)
  );

  // =========================================================
  // TICKET STATE
  // =========================================================

  const [ticketCount, setTicketCount] = useState(1);

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // =========================================================
  // ERROR STATE
  // =========================================================

  const [errors, setErrors] = useState({});

  // =========================================================
  // SUBMITTING STATE
  // =========================================================

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================================
  // LOAD EVENT FROM LOCAL STORAGE
  // =========================================================

  useEffect(() => {
    const loadEvent = () => {
      const storedEvent = getStoredEventById(id);

      setEvent(storedEvent);

      // If the event becomes unavailable,
      // make sure ticket count stays valid.
      if (storedEvent) {
        const capacity =
          Number(storedEvent.capacity) || 0;

        const bookedSeats =
          Number(storedEvent.bookedSeats) || 0;

        const availableSeats = Math.max(
          capacity - bookedSeats,
          0
        );

        setTicketCount((currentCount) => {
          if (availableSeats <= 0) {
            return 1;
          }

          return Math.min(
            currentCount,
            availableSeats
          );
        });
      }
    };

    loadEvent();

    // EventON internal update
    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      loadEvent
    );

    // Cross-tab localStorage update
    window.addEventListener(
      "storage",
      loadEvent
    );

    return () => {
      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        loadEvent
      );

      window.removeEventListener(
        "storage",
        loadEvent
      );
    };
  }, [id]);

  // =========================================================
  // AUTHENTICATION CHECK
  // =========================================================

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: {
          from: `/events/${id}/book`,
        },
      });
    }
  }, [
    id,
    isAuthenticated,
    isLoading,
    navigate,
  ]);

  // =========================================================
  // PREFILL USER DETAILS
  // =========================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      name: previous.name || user.name || "",
      email: previous.email || user.email || "",
    }));
  }, [user]);

  // =========================================================
  // AVAILABILITY
  // =========================================================

  const capacity = event
    ? Number(event.capacity) || 0
    : 0;

  const bookedSeats = event
    ? Number(event.bookedSeats) || 0
    : 0;

  const availableSeats = Math.max(
    capacity - bookedSeats,
    0
  );

  const soldOut =
    !event ||
    availableSeats <= 0 ||
    event.status === "sold-out";

  // =========================================================
  // TOTAL PRICE
  // =========================================================

  const totalPrice = useMemo(() => {
    if (!event) {
      return 0;
    }

    return (
      (Number(event.price) || 0) *
      ticketCount
    );
  }, [event, ticketCount]);

  // =========================================================
  // DATE
  // =========================================================

  const formattedDate = event
    ? new Date(event.date).toLocaleDateString(
        "en-IN",
        {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "";

  // =========================================================
  // INPUT HANDLER
  // =========================================================

  const handleInputChange = (inputEvent) => {
    const {
      name,
      value,
    } = inputEvent.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      form: "",
    }));
  };

  // =========================================================
  // TICKET QUANTITY
  // =========================================================

  const increaseTickets = () => {
    if (ticketCount < availableSeats) {
      setTicketCount(
        (count) => count + 1
      );

      setErrors((previous) => ({
        ...previous,
        tickets: "",
        form: "",
      }));
    }
  };

  const decreaseTickets = () => {
    if (ticketCount > 1) {
      setTicketCount(
        (count) => count - 1
      );

      setErrors((previous) => ({
        ...previous,
        tickets: "",
        form: "",
      }));
    }
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name =
        "Please enter your name.";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email =
        "Please enter your email.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone =
        "Please enter your phone number.";
    } else if (
      !/^[6-9]\d{9}$/.test(
        formData.phone.trim()
      )
    ) {
      newErrors.phone =
        "Please enter a valid 10-digit phone number.";
    }

    // Tickets
    if (
      ticketCount < 1 ||
      ticketCount > availableSeats
    ) {
      newErrors.tickets =
        availableSeats > 0
          ? `Only ${availableSeats} seats are available.`
          : "This event is sold out.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // =========================================================
  // SUBMIT BOOKING
  // =========================================================

  const handleSubmit = (submitEvent) => {
    submitEvent.preventDefault();

    // Prevent duplicate submission
    if (isSubmitting) {
      return;
    }

    // Authentication protection
    if (
      !isAuthenticated ||
      !user
    ) {
      navigate("/login", {
        replace: true,
        state: {
          from: `/events/${id}/book`,
        },
      });

      return;
    }

    // Event must exist
    const latestEvent =
      getStoredEventById(id);

    if (!latestEvent) {
      setErrors({
        form:
          "This event is no longer available.",
      });

      return;
    }

    // Recalculate availability
    // immediately before booking.
    const latestCapacity =
      Number(latestEvent.capacity) || 0;

    const latestBookedSeats =
      Number(
        latestEvent.bookedSeats
      ) || 0;

    const latestAvailableSeats =
      Math.max(
        latestCapacity -
          latestBookedSeats,
        0
      );

    // Event sold out
    if (latestAvailableSeats <= 0) {
      setEvent(latestEvent);

      setErrors({
        form:
          "Sorry, this event is now sold out.",
      });

      setTicketCount(1);

      return;
    }

    // Ticket quantity exceeds latest availability
    if (
      ticketCount >
      latestAvailableSeats
    ) {
      setEvent(latestEvent);

      setTicketCount(
        latestAvailableSeats
      );

      setErrors({
        tickets:
          `Only ${latestAvailableSeats} seats are currently available.`,
      });

      return;
    }

    // Validate form
    const isValid =
      validateForm();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      // =====================================================
      // CREATE BOOKING ID
      // =====================================================

      const bookingId =
        `EVT-${Date.now()
          .toString()
          .slice(-8)}`;

      // =====================================================
      // CREATE BOOKING
      // =====================================================

      const booking = {
        bookingId,

        event: latestEvent,

        eventId: latestEvent.id,

        // Primary attendee relationship.
        attendeeId: user.id || null,

        attendee: {
          userId: user.id || null,
          name: formData.name.trim(),
          email: user.email,
          phone: formData.phone.trim(),
        },

        ticketCount,

        totalPrice:
          (Number(latestEvent.price) || 0) *
          ticketCount,

        status: "confirmed",

        createdAt:
          new Date().toISOString(),
      };

      // =====================================================
      // UPDATE EVENT SEAT COUNT FIRST
      // =====================================================
      //
      // We update the event before saving the booking so the
      // availability is reserved first. If saving the booking
      // fails, the event seat count is rolled back below.
      // =====================================================

      const newBookedSeats =
        latestBookedSeats +
        ticketCount;

      const updatedEvent = {
        ...latestEvent,

        bookedSeats:
          newBookedSeats,

        // Keep the event status in sync.
        status:
          newBookedSeats >= latestCapacity
            ? "sold-out"
            : latestEvent.status === "sold-out"
              ? "published"
              : latestEvent.status,
      };

      const eventUpdateResult =
        updateStoredEvent(
          latestEvent.id,
          {
            bookedSeats:
              updatedEvent.bookedSeats,
            status:
              updatedEvent.status,
          }
        );

      // updateStoredEvent returns the updated event list.
      // If it fails to return a valid result, do not create
      // a booking that is not reflected in event availability.
      if (!eventUpdateResult) {
        setErrors({
          form:
            "Unable to reserve seats. Please try again.",
        });

        setIsSubmitting(false);

        return;
      }

      // =====================================================
      // SAVE BOOKING
      // =====================================================

      const savedBooking =
        saveBooking(booking);

      if (!savedBooking) {
        // Roll the seats back because the booking could not
        // be persisted successfully.
        updateStoredEvent(
          latestEvent.id,
          {
            bookedSeats:
              latestBookedSeats,
            status:
              latestEvent.status,
          }
        );

        setEvent(latestEvent);

        setErrors({
          form:
            "Unable to save your booking. Your seats were not charged.",
        });

        setIsSubmitting(false);

        return;
      }

      // =====================================================
      // GO TO CONFIRMATION
      // =====================================================

      navigate(
        "/booking-confirmation",
        {
          state: {
            booking: {
              ...savedBooking,

              // Pass the latest event
              // information to confirmation.
              event: updatedEvent,
            },
          },
        }
      );
    } catch (error) {
      console.error(
        "Unable to complete booking:",
        error
      );

      setErrors({
        form:
          "Something went wrong while creating your booking. Please try again.",
      });

      setIsSubmitting(false);
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
              Event not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              The event you're trying to book
              doesn't exist or may have been
              removed.
            </p>

            <Link
              to="/events"
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              Back to events
            </Link>

          </div>

        </section>

      </main>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">

          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to event
          </Link>

        </div>

      </section>

      {/* =====================================================
          BOOKING CONTENT
      ====================================================== */}

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">

        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">

          {/* =================================================
              LEFT SIDE
          ================================================== */}

          <div className="space-y-6">

            {/* =================================================
                EVENT SUMMARY
            ================================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

              <div className="flex flex-col gap-5 sm:flex-row">

                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-32 w-full rounded-xl object-cover sm:h-28 sm:w-40"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded-xl bg-slate-100 sm:h-28 sm:w-40">
                    <Ticket
                      size={32}
                      className="text-slate-300"
                    />
                  </div>
                )}

                <div className="min-w-0">

                  <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                    {event.category}
                  </span>

                  <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    {event.title}
                  </h1>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">

                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {formattedDate}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={14} />
                      {event.time}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} />
                      {event.city}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                ATTENDEE DETAILS
            ================================================== */}

            <form
              id="booking-form"
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
            >

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">
                  Attendee details
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  Tell us about you
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  We'll use these details to
                  send your booking confirmation.
                </p>

              </div>

              {/* General error */}

              {errors.form && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {errors.form}
                </div>
              )}

              <div className="mt-7 space-y-5">

                {/* =================================================
                    NAME
                ================================================== */}

                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="relative">

                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={
                        handleInputChange
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                        errors.name
                          ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                          : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                      }`}
                    />

                  </div>

                  {errors.name && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.name}
                    </p>
                  )}

                </div>

                {/* =================================================
                    EMAIL
                ================================================== */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={
                      handleInputChange
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                      errors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />

                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.email}
                    </p>
                  )}

                  <p className="mt-1.5 text-xs text-slate-400">
                    Your account email will be used
                    for the booking.
                  </p>

                </div>

                {/* =================================================
                    PHONE
                ================================================== */}

                <div>

                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Phone number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.phone}
                    onChange={
                      handleInputChange
                    }
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                      errors.phone
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />

                  {errors.phone && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.phone}
                    </p>
                  )}

                </div>

              </div>

            </form>

          </div>

          {/* =================================================
              RIGHT SIDE — BOOKING SUMMARY
          ================================================== */}

          <aside className="lg:sticky lg:top-24">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              {/* Header */}

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Booking summary
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    Your tickets
                  </h2>

                </div>

                <Ticket
                  size={21}
                  className="text-orange-500"
                />

              </div>

              {/* =================================================
                  TICKET QUANTITY
              ================================================== */}

              <div className="mt-7">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-semibold text-slate-900">
                      Tickets
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      ₹{Number(event.price) || 0}{" "}
                      per ticket
                    </p>

                  </div>

                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">

                    <button
                      type="button"
                      onClick={
                        decreaseTickets
                      }
                      disabled={
                        ticketCount <= 1 ||
                        isSubmitting
                      }
                      aria-label="Decrease ticket quantity"
                      className="flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="flex h-10 min-w-10 items-center justify-center border-x border-slate-200 bg-white text-sm font-bold text-slate-900">
                      {ticketCount}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseTickets
                      }
                      disabled={
                        ticketCount >=
                          availableSeats ||
                        soldOut ||
                        isSubmitting
                      }
                      aria-label="Increase ticket quantity"
                      className="flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={16} />
                    </button>

                  </div>

                </div>

                {errors.tickets && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    {errors.tickets}
                  </p>
                )}

                {!soldOut && (
                  <p className="mt-3 text-xs text-slate-500">
                    {availableSeats} seats
                    currently available.
                  </p>
                )}

              </div>

              <div className="my-6 border-t border-slate-200" />

              {/* =================================================
                  PRICE
              ================================================== */}

              <div className="space-y-3">

                <div className="flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Ticket price
                  </span>

                  <span className="font-medium text-slate-900">
                    ₹{Number(event.price) || 0}
                  </span>

                </div>

                <div className="flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Quantity
                  </span>

                  <span className="font-medium text-slate-900">
                    × {ticketCount}
                  </span>

                </div>

                <div className="border-t border-slate-100 pt-3">

                  <div className="flex items-center justify-between">

                    <span className="text-base font-semibold text-slate-900">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-slate-900">
                      ₹{totalPrice}
                    </span>

                  </div>

                </div>

              </div>

              {/* =================================================
                  AVAILABILITY
              ================================================== */}

              <div
                className={`mt-6 flex items-start gap-3 rounded-xl p-3.5 ${
                  soldOut
                    ? "bg-red-50"
                    : "bg-green-50"
                }`}
              >

                <CheckCircle2
                  size={18}
                  className={
                    soldOut
                      ? "mt-0.5 shrink-0 text-red-500"
                      : "mt-0.5 shrink-0 text-green-500"
                  }
                />

                <div>

                  <p className="text-xs font-semibold text-slate-900">

                    {soldOut
                      ? "This event is sold out"
                      : `${availableSeats} seats available`}

                  </p>

                  {!soldOut && (
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      Select your tickets and
                      continue to booking.
                    </p>
                  )}

                </div>

              </div>

              {/* =================================================
                  SUBMIT
              ================================================== */}

              <button
                type="submit"
                form="booking-form"
                disabled={
                  soldOut ||
                  isLoading ||
                  isSubmitting
                }
                className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-orange-500 text-sm font-bold !text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                {isSubmitting
                  ? "Confirming booking..."
                  : soldOut
                    ? "Sold Out"
                    : "Continue to Payment"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                Your booking information is
                securely processed.
              </p>

            </div>

          </aside>

        </div>

      </section>

    </main>
  );
}

export default Booking;