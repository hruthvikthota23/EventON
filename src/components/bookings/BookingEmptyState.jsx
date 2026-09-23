import {
  CalendarDays,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

function BookingEmptyState({
  title = "No bookings found",
  description = "You don't have any bookings in this category yet.",
  showBrowseButton = true,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center sm:py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <CalendarDays size={28} />
      </div>

      <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {showBrowseButton && (
        <Link
          to="/events"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100"
        >
          <Search size={16} />
          Browse events
        </Link>
      )}
    </div>
  );
}

export default BookingEmptyState;