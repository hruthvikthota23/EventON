const STORAGE_KEY = "eventon_bookings";

export const BOOKINGS_UPDATED_EVENT =
  "eventon:bookings-updated";

// =========================================================
// NOTIFY BOOKING UPDATES
// =========================================================

function notifyBookingsUpdated() {
  window.dispatchEvent(
    new Event(BOOKINGS_UPDATED_EVENT)
  );
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

    return Array.isArray(parsedBookings)
      ? parsedBookings
      : [];
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

export function getStoredBookingById(bookingId) {
  if (!bookingId) {
    return null;
  }

  const normalizedBookingId = String(bookingId)
    .trim()
    .toUpperCase();

  const bookings = getStoredBookings();

  return (
    bookings.find(
      (booking) =>
        String(booking?.bookingId || "")
          .trim()
          .toUpperCase() === normalizedBookingId
    ) || null
  );
}

// =========================================================
// GET BOOKINGS BY USER
// =========================================================

export function getStoredBookingsByUser(
  userId
) {
  if (!userId) {
    return [];
  }

  const bookings = getStoredBookings();

  return bookings.filter(
    (booking) =>
      String(booking?.attendee?.userId) ===
      String(userId)
  );
}

// =========================================================
// GET BOOKINGS BY EVENT
// =========================================================

export function getStoredBookingsByEvent(
  eventId
) {
  if (!eventId) {
    return [];
  }

  const bookings = getStoredBookings();

  return bookings.filter(
    (booking) =>
      String(booking.eventId) ===
      String(eventId)
  );
}

// =========================================================
// SAVE BOOKING
// =========================================================

export function saveBooking(booking) {
  try {
    if (!booking?.bookingId) {
      console.error(
        "Unable to save EventON booking: bookingId is required."
      );

      return null;
    }

    const existingBookings =
      getStoredBookings();

    const bookingToSave = {
      ...booking,

      bookingId: String(
        booking.bookingId
      ),

      eventId:
        booking.eventId ??
        booking.event?.id ??
        null,

      createdAt:
        booking.createdAt ||
        new Date().toISOString(),
    };

    const updatedBookings = [
      bookingToSave,
      ...existingBookings.filter(
        (item) =>
          String(item.bookingId) !==
          String(bookingToSave.bookingId)
      ),
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedBookings)
    );

    notifyBookingsUpdated();

    return bookingToSave;
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
    if (!bookingId) {
      return getStoredBookings();
    }

    const existingBookings =
      getStoredBookings();

    const bookingExists =
      existingBookings.some(
        (booking) =>
          String(booking.bookingId) ===
          String(bookingId)
      );

    if (!bookingExists) {
      return existingBookings;
    }

    const updatedBookings =
      existingBookings.map(
        (booking) =>
          String(booking.bookingId) ===
          String(bookingId)
            ? {
                ...booking,
                ...updates,
                updatedAt:
                  new Date().toISOString(),
              }
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
    if (!bookingId) {
      return getStoredBookings();
    }

    const existingBookings =
      getStoredBookings();

    const updatedBookings =
      existingBookings.filter(
        (booking) =>
          String(booking.bookingId) !==
          String(bookingId)
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
    if (!bookingId) {
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
          String(item.bookingId) ===
          String(bookingId)
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
      };
    }

    if (booking.status === "completed") {
      return {
        success: false,
        error:
          "Completed bookings cannot be cancelled.",
      };
    }

    const updatedBookings =
      existingBookings.map(
        (item) =>
          String(item.bookingId) ===
          String(bookingId)
            ? {
                ...item,
                status: "cancelled",
                cancelledAt:
                  new Date().toISOString(),
                updatedAt:
                  new Date().toISOString(),
              }
            : item
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedBookings)
    );

    notifyBookingsUpdated();

    return {
      success: true,
      booking:
        updatedBookings.find(
          (item) =>
            String(item.bookingId) ===
            String(bookingId)
        ) || null,
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