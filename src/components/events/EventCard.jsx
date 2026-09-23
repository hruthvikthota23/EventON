import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return {
    month: date.toLocaleDateString("en-US", {
      month: "short",
    }),
    day: date.toLocaleDateString("en-US", {
      day: "numeric",
    }),
    full: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function EventCard({ event }) {
  const date = formatDate(event.date);

  const availableSeats = Math.max(
    event.capacity - event.bookedSeats,
    0
  );

  const isSoldOut = availableSeats === 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl">

      {/* Image */}
      <Link
        to={`/events/${event.id}`}
        className="relative block aspect-[16/10] overflow-hidden bg-gray-100"
      >
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Category */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-sm backdrop-blur">
            {event.category}
          </span>
        </div>

        {/* Date Badge */}
        <div className="absolute right-4 top-4 flex min-w-14 flex-col items-center rounded-xl bg-white px-3 py-2 shadow-md">
          <span className="text-xs font-bold uppercase text-orange-500">
            {date.month}
          </span>

          <span className="text-xl font-bold leading-6 text-gray-900">
            {date.day}
          </span>
        </div>

        {/* Sold Out */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <span className="rounded-full bg-gray-950 px-4 py-2 text-sm font-bold text-white">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5">

        {/* Title */}
        <Link to={`/events/${event.id}`}>
          <h3 className="line-clamp-2 text-lg font-bold leading-6 text-gray-900 transition group-hover:text-orange-500">
            {event.title}
          </h3>
        </Link>

        {/* Organizer */}
        <p className="mt-2 text-sm text-gray-500">
          By {event.organizer}
        </p>

        {/* Event Information */}
        <div className="mt-5 space-y-3">

          {/* Date */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CalendarDays
              size={17}
              className="shrink-0 text-gray-400"
            />

            <span>{date.full}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock3
              size={17}
              className="shrink-0 text-gray-400"
            />

            <span>
              {event.time} – {event.endTime}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <MapPin
              size={17}
              className="shrink-0 text-gray-400"
            />

            <span className="truncate">
              {event.location}
            </span>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-5">

          {/* Price */}
          <div>
            <p className="text-xs text-gray-400">
              Ticket from
            </p>

            <p className="mt-1 text-lg font-bold text-gray-900">
              {event.price === 0
                ? "Free"
                : `₹${event.price.toLocaleString("en-IN")}`}
            </p>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-1.5 text-right">
            <Users
              size={15}
              className={
                isSoldOut
                  ? "text-red-500"
                  : "text-gray-400"
              }
            />

            <span
              className={`text-xs font-medium ${
                isSoldOut
                  ? "text-red-500"
                  : availableSeats < 30
                    ? "text-orange-500"
                    : "text-gray-500"
              }`}
            >
              {isSoldOut
                ? "Sold out"
                : `${availableSeats} seats left`}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default EventCard;