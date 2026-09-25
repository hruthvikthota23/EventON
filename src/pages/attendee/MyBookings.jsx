import { useEffect, useMemo, useState } from "react";

import {
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Ticket,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import BookingCard from "../../components/bookings/BookingCard";
import BookingEmptyState from "../../components/bookings/BookingEmptyState";

import {
  getStoredBookings,
  updateStoredBooking,
} from "../../utils/bookingStorage";

import {
  getStoredEventById,
  updateStoredEvent,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

const tabs = [
  {
    id: "all",
    label: "All bookings",
  },
  {
    id: "upcoming",
    label: "Upcoming",
  },
  {
    id: "completed",
    label: "Completed",
  },
  {
    id: "cancelled",
    label: "Cancelled",
  },
];

function MyBookings() {
  const {
    user,
    isAuthenticated,
  } = useAuth();

  // =========================================================
  // STATE
  // =========================================================

  const [bookingList, setBookingList] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("all");

  // =========================================================
  // LOAD USER BOOKINGS
  // =========================================================

  useEffect(() => {
    const loadBookings = () => {
      if (
        !isAuthenticated ||
        !user?.id
      ) {
        setBookingList([]);
        return;
      }

      const allBookings =
        getStoredBookings();

      const normalizedUserId =
        String(user.id);

      const userEmail =
        user.email?.trim().toLowerCase();

      const userBookings =
        allBookings.filter((booking) => {
          const attendeeId =
            booking.attendeeId ??
            booking.attendee?.userId;

          if (
            attendeeId !== null &&
            attendeeId !== undefined &&
            String(attendeeId) ===
              normalizedUserId
          ) {
            return true;
          }

          // Legacy compatibility for older
          // bookings created before attendeeId
          // was introduced.
          return (
            Boolean(userEmail) &&
            booking.attendee?.email
              ?.trim()
              .toLowerCase() ===
              userEmail
          );
        });

      setBookingList(userBookings);
    };

    loadBookings();

    // Refresh when EventON updates
    // booking/event data.
    window.addEventListener(
      "eventon:bookings-updated",
      loadBookings
    );

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      loadBookings
    );

    // Refresh when localStorage
    // changes in another browser tab.
    window.addEventListener(
      "storage",
      loadBookings
    );

    return () => {
      window.removeEventListener(
        "eventon:bookings-updated",
        loadBookings
      );

      window.removeEventListener(
        EVENTS_UPDATED_EVENT,
        loadBookings
      );

      window.removeEventListener(
        "storage",
        loadBookings
      );
    };
  }, [
    isAuthenticated,
    user?.id,
    user?.email,
  ]);

  // =========================================================
  // BOOKING COUNTS
  // =========================================================

  const counts = useMemo(() => {
    const now = new Date();

    const upcoming =
      bookingList.filter(
        (booking) => {
          if (
            booking.status !==
            "confirmed"
          ) {
            return false;
          }

          if (
            !booking.event?.date
          ) {
            return false;
          }

          const eventDate =
            new Date(
              booking.event.date
            );

          return eventDate >= now;
        }
      ).length;

    const completed =
      bookingList.filter(
        (booking) => {
          if (
            booking.status !==
            "confirmed"
          ) {
            return false;
          }

          if (
            !booking.event?.date
          ) {
            return false;
          }

          const eventDate =
            new Date(
              booking.event.date
            );

          return eventDate < now;
        }
      ).length;

    const cancelled =
      bookingList.filter(
        (booking) =>
          booking.status ===
          "cancelled"
      ).length;

    return {
      all: bookingList.length,
      upcoming,
      completed,
      cancelled,
    };
  }, [bookingList]);

  // =========================================================
  // FILTER BOOKINGS
  // =========================================================

  const filteredBookings =
    useMemo(() => {
      const now = new Date();

      if (
        activeTab ===
        "cancelled"
      ) {
        return bookingList.filter(
          (booking) =>
            booking.status ===
            "cancelled"
        );
      }

      if (
        activeTab ===
        "completed"
      ) {
        return bookingList.filter(
          (booking) => {
            if (
              booking.status !==
              "confirmed"
            ) {
              return false;
            }

            if (
              !booking.event?.date
            ) {
              return false;
            }

            const eventDate =
              new Date(
                booking.event.date
              );

            return eventDate < now;
          }
        );
      }

      if (
        activeTab ===
        "upcoming"
      ) {
        return bookingList.filter(
          (booking) => {
            if (
              booking.status !==
              "confirmed"
            ) {
              return false;
            }

            if (
              !booking.event?.date
            ) {
              return false;
            }

            const eventDate =
              new Date(
                booking.event.date
              );

            return eventDate >= now;
          }
        );
      }

      return bookingList;
    }, [
      activeTab,
      bookingList,
    ]);

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  const handleCancelBooking = (
    booking
  ) => {
    if (
      booking.status !==
      "confirmed"
    ) {
      return;
    }

    const shouldCancel =
      window.confirm(
        `Are you sure you want to cancel booking ${booking.bookingId}?`
      );

    if (!shouldCancel) {
      return;
    }

    // =======================================================
    // GET LATEST BOOKING DATA
    // =======================================================

    const storedBookings =
      getStoredBookings();

    const currentBooking =
      storedBookings.find(
        (item) =>
          String(item.bookingId).toUpperCase() ===
          String(booking.bookingId).toUpperCase()
      );

    if (!currentBooking) {
      return;
    }

    // Never process an already-cancelled booking.
    if (
      currentBooking.status !==
      "confirmed"
    ) {
      return;
    }

    // Make sure this booking belongs to the
    // currently authenticated attendee.
    const bookingAttendeeId =
      currentBooking.attendeeId ??
      currentBooking.attendee?.userId;

    const isOwner =
      bookingAttendeeId !== null &&
      bookingAttendeeId !== undefined &&
      String(bookingAttendeeId) ===
        String(user?.id);

    if (!isOwner) {
      return;
    }

    // =======================================================
    // GET CURRENT EVENT
    // =======================================================

    const eventId =
      currentBooking.eventId ??
      currentBooking.event?.id;

    const currentEvent = eventId
      ? getStoredEventById(eventId)
      : null;

    if (!currentEvent) {
      return;
    }

    const currentBookedSeats =
      Math.max(
        Number(
          currentEvent.bookedSeats
        ) || 0,
        0
      );

    const cancelledTickets =
      Math.max(
        Number(
          currentBooking.ticketCount
        ) || 0,
        0
      );

    if (cancelledTickets < 1) {
      return;
    }

    // =======================================================
    // RESTORE EVENT SEATS
    // =======================================================
    //
    // Restore seats BEFORE marking the booking cancelled.
    // If the event update fails, the booking stays confirmed
    // and can safely be retried.
    // =======================================================

    const restoredBookedSeats =
      Math.max(
        currentBookedSeats -
          cancelledTickets,
        0
      );

    const updatedEvents =
      updateStoredEvent(
        eventId,
        {
          bookedSeats:
            restoredBookedSeats,

          status:
            currentEvent.status ===
              "sold-out"
              ? "published"
              : currentEvent.status,
        }
      );

    if (
      !Array.isArray(updatedEvents)
    ) {
      return;
    }

    // =======================================================
    // CANCEL BOOKING
    // =======================================================

    const updatedBookings =
      updateStoredBooking(
        currentBooking.bookingId,
        {
          status: "cancelled",
          cancelledAt:
            new Date().toISOString(),
        }
      );

    if (
      !Array.isArray(updatedBookings)
    ) {
      // Roll the event seats back if the
      // booking status could not be saved.
      updateStoredEvent(
        eventId,
        {
          bookedSeats:
            currentBookedSeats,
          status:
            currentEvent.status,
        }
      );

      return;
    }

    // =======================================================
    // REFRESH
    // =======================================================

    const refreshedBookings =
      getStoredBookings();

    const normalizedUserId =
      String(user.id);

    const userEmail =
      user.email?.trim().toLowerCase();

    const refreshedUserBookings =
      refreshedBookings.filter(
        (item) => {
          const attendeeId =
            item.attendeeId ??
            item.attendee?.userId;

          if (
            attendeeId !== null &&
            attendeeId !== undefined &&
            String(attendeeId) ===
              normalizedUserId
          ) {
            return true;
          }

          return (
            Boolean(userEmail) &&
            item.attendee?.email
              ?.trim()
              .toLowerCase() ===
              userEmail
          );
        }
      );

    setBookingList(
      refreshedUserBookings
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                Your activity
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                My Bookings
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                View your event tickets,
                upcoming experiences,
                completed bookings, and
                cancelled reservations.
              </p>

            </div>

            <Link
              to="/events"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold !text-white transition hover:bg-orange-600"
            >
              <CalendarDays size={17} />
              Browse Events
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* All */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Ticket size={19} />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                Total
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {counts.all}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              All bookings
            </p>

          </div>

          {/* Upcoming */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CalendarCheck2 size={19} />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                Active
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {counts.upcoming}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Upcoming
            </p>

          </div>

          {/* Completed */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CheckCircle2 size={19} />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                Finished
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {counts.completed}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Completed
            </p>

          </div>

          {/* Cancelled */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <XCircle size={19} />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                Cancelled
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {counts.cancelled}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Cancelled
            </p>

          </div>

        </div>

        {/* =================================================
            TABS
        ================================================== */}

        <div className="mt-8 overflow-x-auto">

          <div className="flex min-w-max gap-2 rounded-2xl border border-slate-200 bg-white p-2">

            {tabs.map((tab) => {
              const isActive =
                activeTab ===
                tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >

                  {tab.label}

                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {counts[tab.id]}
                  </span>

                </button>
              );
            })}

          </div>

        </div>

        {/* =================================================
            RESULTS HEADER
        ================================================== */}

        <div className="mt-8 flex items-center justify-between gap-4">

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              {
                tabs.find(
                  (tab) =>
                    tab.id ===
                    activeTab
                )?.label
              }
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredBookings.length}{" "}
              {filteredBookings.length ===
              1
                ? "booking"
                : "bookings"}{" "}
              found
            </p>

          </div>

          <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">

            <Clock3 size={16} />

            Updated from your latest
            bookings

          </div>

        </div>

        {/* =================================================
            BOOKING RESULTS
        ================================================== */}

        {filteredBookings.length ===
        0 ? (

          <div className="mt-5">

            <BookingEmptyState
              title={
                activeTab ===
                "all"
                  ? "No bookings yet"
                  : `No ${activeTab} bookings`
              }
              description={
                activeTab ===
                "all"
                  ? "You haven't booked any events yet. Explore upcoming events and find something you'll enjoy."
                  : `You don't have any ${activeTab} bookings at the moment.`
              }
              showBrowseButton={
                activeTab ===
                "all"
              }
            />

          </div>

        ) : (

          <div className="mt-5 grid gap-5 lg:grid-cols-2">

            {filteredBookings.map(
              (booking) => (
                <BookingCard
                  key={
                    booking.bookingId
                  }
                  booking={booking}
                  onCancel={
                    handleCancelBooking
                  }
                />
              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}

export default MyBookings;