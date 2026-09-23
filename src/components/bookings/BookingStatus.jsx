function BookingStatus({ status }) {
  const statusConfig = {
    confirmed: {
      label: "Confirmed",
      className:
        "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
    },

    cancelled: {
      label: "Cancelled",
      className:
        "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    },

    pending: {
      label: "Pending",
      className:
        "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200",
    },

    completed: {
      label: "Completed",
      className:
        "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    },
  };

  const currentStatus =
    statusConfig[status?.toLowerCase()] || {
      label: status || "Unknown",
      className:
        "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200",
    };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${currentStatus.className}`}
    >
      {currentStatus.label}
    </span>
  );
}

export default BookingStatus;