import {
  Clock3,
  PlayCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* =========================================================
   BOOKING STATUS TAG
========================================================= */

function BookingStatus({ status }) {
  const normalizedStatus = String(
    status || ""
  )
    .trim()
    .toLowerCase();

  const statusConfig = {
    upcoming: {
      label: "Upcoming",
      icon: Clock3,
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    ongoing: {
      label: "Ongoing",
      icon: PlayCircle,
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },

    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  };

  const config =
    statusConfig[normalizedStatus] ||
    statusConfig.upcoming;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-sm ${config.className}`}
    >
      <Icon size={14} strokeWidth={2.5} />

      <span>
        {config.label}
      </span>
    </span>
  );
}

export default BookingStatus;
