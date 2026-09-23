const STORAGE_KEY = "eventon_bookings";

export function getStoredBookings() {
  try {
    const storedBookings = localStorage.getItem(STORAGE_KEY);

    if (!storedBookings) {
      return [];
    }

    const parsedBookings = JSON.parse(storedBookings);

    return Array.isArray(parsedBookings) ? parsedBookings : [];
  } catch (error) {
    console.error("Unable to read EventON bookings:", error);
    return [];
  }
}

export function saveBooking(booking) {
  try {
    const existingBookings = getStoredBookings();

    const updatedBookings = [
      booking,
      ...existingBookings.filter(
        (item) => item.bookingId !== booking.bookingId
      ),
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedBookings)
    );

    return booking;
  } catch (error) {
    console.error("Unable to save EventON booking:", error);
    return null;
  }
}

export function updateStoredBooking(bookingId, updates) {
  try {
    const existingBookings = getStoredBookings();

    const updatedBookings = existingBookings.map((booking) =>
      booking.bookingId === bookingId
        ? {
            ...booking,
            ...updates,
          }
        : booking
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedBookings)
    );

    return updatedBookings;
  } catch (error) {
    console.error("Unable to update EventON booking:", error);
    return [];
  }
}

export function removeStoredBooking(bookingId) {
  try {
    const existingBookings = getStoredBookings();

    const updatedBookings = existingBookings.filter(
      (booking) => booking.bookingId !== bookingId
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedBookings)
    );

    return updatedBookings;
  } catch (error) {
    console.error("Unable to remove EventON booking:", error);
    return [];
  }
}

export function clearStoredBookings() {
  localStorage.removeItem(STORAGE_KEY);
}