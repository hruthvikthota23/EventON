import { events } from "./events";

/*
|--------------------------------------------------------------------------
| Mock Bookings
|--------------------------------------------------------------------------
| Temporary frontend data for the My Bookings page.
|
| Later this will be replaced by bookings stored in the backend/database.
|--------------------------------------------------------------------------
*/

export const bookings = [
  {
    bookingId: "EVT-48291357",

    event: events[0],

    attendee: {
      name: "Hruthvik Thota",
      email: "hruthvik@example.com",
      phone: "9876543210",
    },

    ticketCount: 2,

    totalPrice: Number(events[0].price) * 2,

    status: "confirmed",

    createdAt: "2026-09-18T10:30:00.000Z",
  },

  {
    bookingId: "EVT-73162548",

    event: events[2],

    attendee: {
      name: "Hruthvik Thota",
      email: "hruthvik@example.com",
      phone: "9876543210",
    },

    ticketCount: 1,

    totalPrice: Number(events[2].price),

    status: "confirmed",

    createdAt: "2026-09-15T14:20:00.000Z",
  },

  {
    bookingId: "EVT-29481635",

    event: events[4],

    attendee: {
      name: "Hruthvik Thota",
      email: "hruthvik@example.com",
      phone: "9876543210",
    },

    ticketCount: 3,

    totalPrice: Number(events[4].price) * 3,

    status: "cancelled",

    createdAt: "2026-09-10T09:15:00.000Z",
  },
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

export function getBookingById(bookingId) {
  return bookings.find(
    (booking) => booking.bookingId === bookingId
  );
}

export function getBookingsByStatus(status) {
  return bookings.filter(
    (booking) => booking.status === status
  );
}

export function getUpcomingBookings() {
  const today = new Date();

  return bookings.filter((booking) => {
    const eventDate = new Date(booking.event.date);

    return (
      eventDate >= today &&
      booking.status === "confirmed"
    );
  });
}

export function getCompletedBookings() {
  const today = new Date();

  return bookings.filter((booking) => {
    const eventDate = new Date(booking.event.date);

    return (
      eventDate < today &&
      booking.status === "confirmed"
    );
  });
}

export function getCancelledBookings() {
  return bookings.filter(
    (booking) => booking.status === "cancelled"
  );
}