const STORAGE_KEY = "eventon_bookings";

export const BOOKINGS_UPDATED_EVENT =
  "eventon:bookings-updated";

// =========================================================
// INTERNAL HELPERS
// =========================================================

function notifyBookingsUpdated() {
  window.dispatchEvent(
    new Event(BOOKINGS_UPDATED_EVENT)
  );
}

function normalizeId(value) {
  return String(value ?? "").trim();
}

function normalizeBookingId(value) {
  return normalizeId(value).toUpperCase();
}

function normalizeBooking(booking) {
  if (!booking || typeof booking !== "object") {
    return null;
  }

  const bookingId = normalizeBookingId(
    booking.bookingId
  );

  if (!bookingId) {
    return null;
  }

  const attendeeUserId =
    booking.attendeeId ??
    booking.attendee?.userId ??
    null;

  const eventId =
    booking.eventId ??
    booking.event?.id ??
    null;

  return {
    ...booking,

    // Primary booking identifier
    bookingId,

    // Primary relationships
    eventId:
      eventId !== null
        ? normalizeId(eventId)
        : null,

    attendeeId:
      attendeeUserId !== null
        ? normalizeId(attendeeUserId)
        : null,

    // Keep the existing attendee object for
    // display/details compatibility.
    attendee: booking.attendee
      ? {
          ...booking.attendee,
          userId:
            attendeeUserId !== null
              ? normalizeId(attendeeUserId)
              : null,
        }
      : {
          userId:
            attendeeUserId !== null
              ? normalizeId(attendeeUserId)
              : null,
        },

    ticketCount: Math.max(
      Number(booking.ticketCount) || 0,
      0
    ),

    totalPrice: Math.max(
      Number(booking.totalPrice) || 0,
      0
    ),

    status: booking.status || "confirmed",

    createdAt:
      booking.createdAt ||
      new Date().toISOString(),
  };
}

// =========================================================
// GET ALL STORED BOOKINGS
// =========================================================

export function getStoredBookings() {
  try {
    const storedBookings =
      localStorage.getItem(STORAGE_KEY);

    if (!storedBookings) {
      return [];
    }

    const parsedBookings =
      JSON.parse(storedBookings);

    if (!Array.isArray(parsedBookings)) {
      return [];
    }

    return parsedBookings
      .map(normalizeBooking)
      .filter(Boolean);
  } catch (error) {
    console.error(
      "Unable to read EventON bookings:",
      error
    );

    return [];
  }
}

// =========================================================
// GET BOOKING BY ID
// =========================================================

export function getStoredBookingById(
  bookingId
) {
  const normalizedBookingId =
    normalizeBookingId(bookingId);

  if (!normalizedBookingId) {
    return null;
  }

  return (
    getStoredBookings().find(
      (booking) =>
        normalizeBookingId(
          booking.bookingId
        ) === normalizedBookingId
    ) || null
  );
}

// =========================================================
// GET BOOKINGS BY USER
// =========================================================

export function getStoredBookingsByUser(
  userId
) {
  const normalizedUserId =
    normalizeId(userId);

  if (!normalizedUserId) {
    return [];
  }

  return getStoredBookings().filter(
    (booking) =>
      normalizeId(booking.attendeeId) ===
      normalizedUserId
  );
}

// =========================================================
// ALIAS — ATTENDEE
// =========================================================

export function getStoredBookingsByAttendee(
  attendeeId
) {
  return getStoredBookingsByUser(attendeeId);
}

// =========================================================
// GET BOOKINGS BY EVENT
// =========================================================

export function getStoredBookingsByEvent(
  eventId
) {
  const normalizedEventId =
    normalizeId(eventId);

  if (!normalizedEventId) {
    return [];
  }

  return getStoredBookings().filter(
    (booking) =>
      normalizeId(booking.eventId) ===
      normalizedEventId
  );
}

// =========================================================
// SAVE BOOKING
// =========================================================

export function saveBooking(booking) {
  try {
    const normalizedBooking =
      normalizeBooking(booking);

    if (!normalizedBooking) {
      console.error(
        "Unable to save EventON booking: bookingId is required."
      );

      return null;
    }

    if (!normalizedBooking.eventId) {
      console.error(
        "Unable to save EventON booking: eventId is required."
      );

      return null;
    }

    if (!normalizedBooking.attendeeId) {
      console.error(
        "Unable to save EventON booking: attendeeId is required."
      );

      return null;
    }

    if (normalizedBooking.ticketCount < 1) {
      console.error(
        "Unable to save EventON booking: ticketCount must be at least 1."
      );

      return null;
    }

    const existingBookings =
      getStoredBookings();

    const updatedBookings = [
      normalizedBooking,
      ...existingBookings.filter(
        (item) =>
          normalizeBookingId(
            item.bookingId
          ) !==
          normalizeBookingId(
            normalizedBooking.bookingId
          )
      ),
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedBookings)
    );

    notifyBookingsUpdated();

    return normalizedBooking;
  } catch (error) {
    console.error(
      "Unable to save EventON booking:",
      error
    );

    return null;
  }
}

// =========================================================
// UPDATE BOOKING
// =========================================================

export function updateStoredBooking(
  bookingId,
  updates
) {
  try {
    const normalizedBookingId =
      normalizeBookingId(bookingId);

    if (!normalizedBookingId) {
      return getStoredBookings();
    }

    const existingBookings =
      getStoredBookings();

    const bookingExists =
      existingBookings.some(
        (booking) =>
          normalizeBookingId(
            booking.bookingId
          ) === normalizedBookingId
      );

    if (!bookingExists) {
      return existingBookings;
    }

    const safeUpdates = {
      ...updates,
    };

    // Booking identity must never change.
    delete safeUpdates.bookingId;

    const updatedBookings =
      existingBookings.map((booking) =>
        normalizeBookingId(
          booking.bookingId
        ) === normalizedBookingId
          ? normalizeBooking({
              ...booking,
              ...safeUpdates,
              bookingId:
                booking.bookingId,
              updatedAt:
                new Date().toISOString(),
            })
          : booking
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedBookings)
    );

    notifyBookingsUpdated();

    return updatedBookings;
  } catch (error) {
    console.error(
      "Unable to update EventON booking:",
      error
    );

    return [];
  }
}

// =========================================================
// REMOVE BOOKING
// =========================================================

export function removeStoredBooking(
  bookingId
) {
  try {
    const normalizedBookingId =
      normalizeBookingId(bookingId);

    if (!normalizedBookingId) {
      return getStoredBookings();
    }

    const existingBookings =
      getStoredBookings();

    const updatedBookings =
      existingBookings.filter(
        (booking) =>
          normalizeBookingId(
            booking.bookingId
          ) !== normalizedBookingId
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedBookings)
    );

    notifyBookingsUpdated();

    return updatedBookings;
  } catch (error) {
    console.error(
      "Unable to remove EventON booking:",
      error
    );

    return [];
  }
}

// =========================================================
// CANCEL BOOKING
// =========================================================

export function cancelStoredBooking(
  bookingId
) {
  try {
    const normalizedBookingId =
      normalizeBookingId(bookingId);

    if (!normalizedBookingId) {
      return {
        success: false,
        error: "Booking ID is required.",
      };
    }

    const existingBookings =
      getStoredBookings();

    const booking =
      existingBookings.find(
        (item) =>
          normalizeBookingId(
            item.bookingId
          ) === normalizedBookingId
      );

    if (!booking) {
      return {
        success: false,
        error: "Booking not found.",
      };
    }

    if (booking.status === "cancelled") {
      return {
        success: false,
        error: "Booking is already cancelled.",
        booking,
      };
    }

    if (booking.status === "completed") {
      return {
        success: false,
        error:
          "Completed bookings cannot be cancelled.",
        booking,
      };
    }

    const now =
      new Date().toISOString();

    const updatedBookings =
      existingBookings.map((item) =>
        normalizeBookingId(
          item.bookingId
        ) === normalizedBookingId
          ? {
              ...item,
              status: "cancelled",
              cancelledAt: now,
              updatedAt: now,
            }
          : item
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedBookings)
    );

    notifyBookingsUpdated();

    const updatedBooking =
      updatedBookings.find(
        (item) =>
          normalizeBookingId(
            item.bookingId
          ) === normalizedBookingId
      ) || null;

    return {
      success: true,
      booking: updatedBooking,
    };
  } catch (error) {
    console.error(
      "Unable to cancel EventON booking:",
      error
    );

    return {
      success: false,
      error:
        "Unable to cancel the booking.",
    };
  }
}

// =========================================================
// CLEAR ALL BOOKINGS
// =========================================================

export function clearStoredBookings() {
  try {
    localStorage.removeItem(STORAGE_KEY);

    notifyBookingsUpdated();

    return true;
  } catch (error) {
    console.error(
      "Unable to clear EventON bookings:",
      error
    );

    return false;
  }
}
