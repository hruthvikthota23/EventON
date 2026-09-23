import { useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";import {
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
  getEventById,
  getAvailableSeats,
  isEventSoldOut,
} from "../../data/events";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const event = getEventById(id);

  const [ticketCount, setTicketCount] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  // ---------------------------------------------------------
  // EVENT NOT FOUND
  // ---------------------------------------------------------

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
              The event you're trying to book doesn't
              exist or may have been removed.
            </p>

            <Link
              to="/events"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft size={17} />
              Back to events
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const availableSeats = getAvailableSeats(event);
  const soldOut = isEventSoldOut(event);

  // ---------------------------------------------------------
  // PRICE CALCULATION
  // ---------------------------------------------------------

  const totalPrice = useMemo(() => {
    return Number(event.price) * ticketCount;
  }, [event.price, ticketCount]);

  // ---------------------------------------------------------
  // DATE
  // ---------------------------------------------------------

  const formattedDate = new Date(
    event.date
  ).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // ---------------------------------------------------------
  // INPUT HANDLER
  // ---------------------------------------------------------

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ---------------------------------------------------------
  // TICKET QUANTITY
  // ---------------------------------------------------------

  const increaseTickets = () => {
    if (ticketCount < availableSeats) {
      setTicketCount((count) => count + 1);
    }
  };

  const decreaseTickets = () => {
    if (ticketCount > 1) {
      setTicketCount((count) => count - 1);
    }
  };

  // ---------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Please enter your phone number.";
    } else if (
      !/^[6-9]\d{9}$/.test(formData.phone)
    ) {
      newErrors.phone =
        "Please enter a valid 10-digit phone number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------

const handleSubmit = (submitEvent) => {
  submitEvent.preventDefault();

  if (soldOut) {
    return;
  }

  if (ticketCount > availableSeats) {
    setErrors({
      tickets: `Only ${availableSeats} seats are available.`,
    });

    return;
  }

  const isValid = validateForm();

  if (!isValid) {
    return;
  }

  const bookingId = `EVT-${Date.now()
    .toString()
    .slice(-8)}`;

  const booking = {
    bookingId,

    event,

    attendee: {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    },

    ticketCount,

    totalPrice,

    createdAt: new Date().toISOString(),
  };

  navigate("/booking-confirmation", {
    state: {
      booking,
    },
  });
};

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
            {/* Event Summary */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-32 w-full rounded-xl object-cover sm:h-28 sm:w-40"
                />

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

            {/* Attendee Details */}

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
                  We'll use these details to send your
                  booking confirmation.
                </p>
              </div>

              <div className="mt-7 space-y-5">
                {/* Name */}

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
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
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

                {/* Email */}

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
                    onChange={handleInputChange}
                    placeholder="you@example.com"
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
                </div>

                {/* Phone */}

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
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
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

              {/* Ticket Quantity */}

              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Tickets
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      ₹{event.price} per ticket
                    </p>
                  </div>

                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      onClick={decreaseTickets}
                      disabled={ticketCount <= 1}
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
                      onClick={increaseTickets}
                      disabled={
                        ticketCount >= availableSeats
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
                    {availableSeats} seats currently
                    available.
                  </p>
                )}
              </div>

              <div className="my-6 border-t border-slate-200" />

              {/* Price */}

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Ticket price
                  </span>

                  <span className="font-medium text-slate-900">
                    ₹{event.price}
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

              {/* Availability */}

              <div className="mt-6 flex items-start gap-3 rounded-xl bg-green-50 p-3.5">
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
                      Select your tickets and continue
                      to booking.
                    </p>
                  )}
                </div>
              </div>

              {/* Submit */}

              <button
                type="submit"
                form="booking-form"
                disabled={soldOut}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                {soldOut
                  ? "Sold Out"
                  : "Continue to Payment"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                Your booking information is securely
                processed.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default Booking;