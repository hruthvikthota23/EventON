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
  User,
  Users,
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
} from "../../utils/bookingStorage";

import {
  getStoredEventsByOrganizer,
} from "../../utils/eventStorage";

function OrganizerBookingDetails() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  const [attendee, setAttendee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !bookingId) {
      setLoading(false);
      return;
    }

    const organizerEvents =
      getStoredEventsByOrganizer(user.id);

    const allBookings = getStoredBookings();

    const foundBooking = allBookings.find(
      (item) =>
        String(
          item.id || item.bookingId
        ) === String(bookingId)
    );

    if (!foundBooking) {
      setLoading(false);
      return;
    }

    const organizerEvent = organizerEvents.find(
      (item) =>
        String(item.id) ===
        String(foundBooking.eventId)
    );

    if (!organizerEvent) {
      setLoading(false);
      return;
    }

    let accounts = [];

    try {
      const raw =
        localStorage.getItem("eventon_accounts");

      if (raw) {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          accounts = parsed;
        }
      }
    } catch (error) {
      console.error(
        "Unable to load accounts:",
        error
      );
    }

   const foundAttendee = {
  name:
    foundBooking.attendee?.name ||
    foundBooking.attendeeName ||
    foundBooking.userName ||
    foundBooking.name ||
    "Attendee",

  email:
    foundBooking.attendee?.email ||
    foundBooking.attendeeEmail ||
    foundBooking.userEmail ||
    foundBooking.email ||
    "No email",

  phone:
    foundBooking.attendee?.phone ||
    foundBooking.phone ||
    "No phone",
};

    setBooking(foundBooking);
    setEvent(organizerEvent);
    setAttendee(foundAttendee);
    setLoading(false);
  }, [user?.id, bookingId]);

  const status = useMemo(() => {
    if (!booking) return "confirmed";

    const value = String(
      booking.status || "confirmed"
    ).toLowerCase();

    if (
      value === "cancelled" ||
      value === "canceled"
    ) {
      return "cancelled";
    }

    if (
      value === "completed" ||
      value === "attended"
    ) {
      return "completed";
    }

    return "confirmed";
  }, [booking]);

  const quantity = Math.max(
    1,
    Number(
      booking?.quantity ??
        booking?.tickets ??
        booking?.ticketCount ??
        1
    )
  );

  const amount = Number(
    booking?.totalAmount ??
      booking?.totalPrice ??
      booking?.amount ??
      0
  );

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  const statusClasses =
    status === "confirmed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "cancelled"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-blue-200 bg-blue-50 text-blue-700";

  if (!user) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Organizer login required.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="min-h-full bg-slate-50">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 h-96 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </section>
    );
  }

  if (!booking || !event) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Ticket size={25} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Booking not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            This booking does not belong to one of your events.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/organizer/bookings")
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <ArrowLeft size={17} />
            Back to Bookings
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:px-10">

        {/* HEADER */}

        <Link
          to="/organizer/bookings"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Bookings
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-500">
              Booking Management
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Booking Details
            </h1>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusClasses}`}
          >
            {status === "confirmed" ? (
              <CheckCircle2 size={16} />
            ) : status === "cancelled" ? (
              <XCircle size={16} />
            ) : (
              <Clock3 size={16} />
            )}

            {status.charAt(0).toUpperCase() +
              status.slice(1)}
          </span>
        </div>

        {/* ATTENDEE */}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="font-bold text-slate-900">
              Attendee Information
            </h2>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <User size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Name
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {attendee?.name || "Attendee"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Mail size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-400">
                  Email
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                  {attendee?.email || "No email"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* EVENT */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="font-bold text-slate-900">
              Event Information
            </h2>
          </div>

          <div className="p-5 sm:p-6">

            <h3 className="text-lg font-bold text-slate-900">
              {event.title}
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <InfoItem
                icon={CalendarDays}
                label="Event Date"
                value={formatDate(event.date)}
              />

              <InfoItem
                icon={Clock3}
                label="Time"
                value={`${event.time || "—"}${
                  event.endTime
                    ? ` - ${event.endTime}`
                    : ""
                }`}
              />

              <InfoItem
                icon={MapPin}
                label="Location"
                value={`${event.location || "—"}${
                  event.city
                    ? `, ${event.city}`
                    : ""
                }`}
              />

              <InfoItem
                icon={Users}
                label="Tickets"
                value={`${quantity} ticket${
                  quantity !== 1 ? "s" : ""
                }`}
              />

            </div>
          </div>
        </div>

        {/* PAYMENT */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="font-bold text-slate-900">
              Payment Information
            </h2>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

            <InfoItem
              icon={Ticket}
              label="Booking ID"
              value={
                booking.id ||
                booking.bookingId ||
                "—"
              }
            />

            <InfoItem
              icon={CalendarDays}
              label="Booked On"
              value={formatDate(
                booking.createdAt ||
                  booking.bookingDate
              )}
            />

            <InfoItem
              icon={Users}
              label="Tickets"
              value={quantity}
            />

            <InfoItem
              icon={IndianRupee}
              label="Total Amount"
              value={formatCurrency(amount)}
            />

          </div>
        </div>

      </div>
    </section>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

export default OrganizerBookingDetails;