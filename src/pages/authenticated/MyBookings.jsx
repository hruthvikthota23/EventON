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
  decrementEventSeats,
  incrementEventSeats,
  EVENTS_UPDATED_EVENT,
} from "../../utils/eventStorage";

/* =========================================================
   FILTER TABS
========================================================= */

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
    id: "ongoing",
    label: "Ongoing",
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

/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

/* =========================================================
   PARSE EVENT DATE + TIME
========================================================= */

/*
 * Supports:
 *
 * 10:00 AM
 * 03:00 PM
 * 12:00 AM
 * 12:00 PM
 * 14:30
 * 18:45
 *
 * Returns a Date object or null.
 */
function getEventDateTime(dateValue, timeValue) {
  if (!dateValue) {
    return null;
  }

  const date = String(dateValue).trim();

  if (!timeValue) {
    const result = new Date(`${date}T00:00:00`);

    return Number.isNaN(result.getTime())
      ? null
      : result;
  }

  const time = String(timeValue).trim();

  /* -------------------------------------------------------
     AM / PM
  ------------------------------------------------------- */

  const amPmMatch = time.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i
  );

  if (amPmMatch) {
    let hours = Number(amPmMatch[1]);
    const minutes = Number(amPmMatch[2] || 0);
    const period = amPmMatch[3].toUpperCase();

    if (
      !Number.isFinite(hours) ||
      !Number.isFinite(minutes) ||
      hours < 1 ||
      hours > 12 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    const result = new Date(`${date}T00:00:00`);

    if (Number.isNaN(result.getTime())) {
      return null;
    }

    result.setHours(hours, minutes, 0, 0);

    return result;
  }

  /* -------------------------------------------------------
     24-HOUR TIME
  ------------------------------------------------------- */

  const twentyFourHourMatch = time.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
  );

  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);
    const seconds = Number(
      twentyFourHourMatch[3] || 0
    );

    if (
      !Number.isFinite(hours) ||
      !Number.isFinite(minutes) ||
      !Number.isFinite(seconds) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return null;
    }

    const result = new Date(`${date}T00:00:00`);

    if (Number.isNaN(result.getTime())) {
      return null;
    }

    result.setHours(
      hours,
      minutes,
      seconds,
      0
    );

    return result;
  }

  return null;
}

/* =========================================================
   GET EVENT END TIME
========================================================= */

function getEventEndDateTime(event) {
  if (!event) {
    return null;
  }

  /*
   * Primary field:
   * endTime
   *
   * Legacy compatibility:
   * finishTime
   */
  const endTime =
    event.endTime ??
    event.finishTime ??
    null;

  if (!event.date || !endTime) {
    return null;
  }

  return getEventDateTime(
    event.date,
    endTime
  );
}

/* =========================================================
   GET BOOKING QUANTITY
========================================================= */

function getBookingQuantity(booking) {
  const quantity = Number(
    booking?.quantity ??
      booking?.tickets ??
      booking?.ticketCount ??
      booking?.numberOfTickets ??
      booking?.seats ??
      0
  );

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    return 0;
  }

  return quantity;
}

/* =========================================================
   GET BOOKING STATE
========================================================= */

/*
 * This is the single source of truth for:
 *
 * - filter
 * - tag
 * - cancellation availability
 *
 * States:
 *
 * upcoming
 * ongoing
 * completed
 * cancelled
 */
function getBookingState(
  booking,
  event
) {
  const bookingStatus = normalizeStatus(
    booking?.status
  );

  /* -------------------------------------------------------
     CANCELLED ALWAYS WINS
  ------------------------------------------------------- */

  if (
    bookingStatus === "cancelled" ||
    bookingStatus === "canceled"
  ) {
    return "cancelled";
  }

  /*
   * Only confirmed bookings participate
   * in event-time state.
   */
  if (
    bookingStatus !== "confirmed"
  ) {
    return "upcoming";
  }

  if (!event?.date) {
    return "upcoming";
  }

  const startDateTime =
    getEventDateTime(
      event.date,
      event.time ??
        event.startTime
    );

  if (!startDateTime) {
    return "upcoming";
  }

  const now = new Date();

  /*
   * Event hasn't started.
   */
  if (startDateTime > now) {
    return "upcoming";
  }

  /*
   * Event has started.
   *
   * If an end time exists, determine whether
   * it is still running.
   */
  const endDateTime =
    getEventEndDateTime(event);

  if (
    endDateTime &&
    now < endDateTime
  ) {
    return "ongoing";
  }

  /*
   * No end time:
   *
   * Once the event starts, we cannot safely
   * determine an ongoing period.
   *
   * Therefore treat it as completed.
   */
  return "completed";
}

/* =========================================================
   GET DISPLAY LABEL
========================================================= */

function getBookingStateLabel(state) {
  switch (state) {
    case "upcoming":
      return "Upcoming";

    case "ongoing":
      return "Ongoing";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return "Upcoming";
  }
}

/* =========================================================
   GET STATUS STYLING
========================================================= */

function getBookingStateClasses(state) {
  switch (state) {
    case "upcoming":
      return {
        badge:
          "bg-green-50 text-green-700",
      };

    case "ongoing":
      return {
        badge:
          "bg-orange-50 text-orange-700",
      };

    case "completed":
      return {
        badge:
          "bg-blue-50 text-blue-700",
      };

    case "cancelled":
      return {
        badge:
          "bg-red-50 text-red-700",
      };

    default:
      return {
        badge:
          "bg-slate-100 text-slate-600",
      };
  }
}

/* =========================================================
   GET CURRENT EVENT
========================================================= */

function getCurrentEvent(booking) {
  const eventId =
    booking?.eventId ??
    booking?.event?.id;

  if (!eventId) {
    return booking?.event || null;
  }

  return (
    getStoredEventById(eventId) ||
    booking?.event ||
    null
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function MyBookings() {
  const {
    user,
    isAuthenticated,
  } = useAuth();

  /* =======================================================
     STATE
  ======================================================= */

  const [bookingList, setBookingList] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("all");

  const [searchQuery, setSearchQuery] =
    useState("");

  /* =======================================================
     LOAD USER BOOKINGS
  ======================================================= */

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
        user.email
          ?.trim()
          .toLowerCase();

      /*
       * My Bookings means bookings created
       * by the currently authenticated user.
       *
       * This works for:
       *
       * attendee
       * organizer
       * admin
       */
      const userBookings =
        allBookings.filter(
          (booking) => {
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

            /*
             * Legacy compatibility for older
             * bookings that don't contain attendeeId.
             */
            return (
              Boolean(userEmail) &&
              booking.attendee?.email
                ?.trim()
                .toLowerCase() ===
                userEmail
            );
          }
        );

      setBookingList(
        userBookings
      );
    };

    loadBookings();

    window.addEventListener(
      "eventon:bookings-updated",
      loadBookings
    );

    window.addEventListener(
      EVENTS_UPDATED_EVENT,
      loadBookings
    );

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

  /* =======================================================
     ENRICH BOOKINGS
  ======================================================= */

  /*
   * Every booking gets its latest event and
   * calculated UI state.
   *
   * We do NOT modify localStorage here.
   */
  const enrichedBookings = useMemo(() => {
    return bookingList.map(
      (booking) => {
        const currentEvent =
          getCurrentEvent(booking);

        const state =
          getBookingState(
            booking,
            currentEvent
          );

        return {
          ...booking,

          /*
           * Latest event is used by this page.
           */
          currentEvent,

          /*
           * UI state.
           */
          bookingState: state,

          /*
           * Human-readable state.
           */
          bookingStateLabel:
            getBookingStateLabel(state),

          /*
           * Cancellation is ONLY allowed
           * for future confirmed bookings.
           */
          canCancel:
            normalizeStatus(
              booking.status
            ) === "confirmed" &&
            state === "upcoming",
        };
      }
    );
  }, [bookingList]);

  /* =======================================================
     BOOKING COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    return enrichedBookings.reduce(
      (result, booking) => {
        const state =
          booking.bookingState;

        if (
          state === "upcoming"
        ) {
          result.upcoming += 1;
        }

        if (
          state === "ongoing"
        ) {
          result.ongoing += 1;
        }

        if (
          state === "completed"
        ) {
          result.completed += 1;
        }

        if (
          state === "cancelled"
        ) {
          result.cancelled += 1;
        }

        result.all += 1;

        return result;
      },
      {
        all: 0,
        upcoming: 0,
        ongoing: 0,
        completed: 0,
        cancelled: 0,
      }
    );
  }, [enrichedBookings]);

  /* =======================================================
     FILTER BOOKINGS
  ======================================================= */

  const filteredBookings =
    useMemo(() => {
      const normalizedSearch =
        searchQuery.trim().toLowerCase();

      return enrichedBookings.filter(
        (booking) => {
          const matchesStatus =
            activeTab === "all" ||
            booking.bookingState ===
              activeTab;

          if (!matchesStatus) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          const event =
            booking.currentEvent ||
            booking.event ||
            {};

          const searchableText = [
            booking.bookingId,
            booking.id,
            event.title,
            event.name,
            event.category,
            event.location,
            event.venue,
            booking.attendee?.name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            normalizedSearch
          );
        }
      );
    }, [
      activeTab,
      enrichedBookings,
      searchQuery,
    ]);

  /* =======================================================
     CANCEL BOOKING
  ======================================================= */

  const handleCancelBooking = (
    booking
  ) => {
    /*
     * UI protection.
     *
     * Only upcoming confirmed bookings
     * can enter cancellation.
     */
    if (
      !booking?.canCancel
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

    /* =====================================================
       GET LATEST BOOKING
    ===================================================== */

    const storedBookings =
      getStoredBookings();

    const currentBooking =
      storedBookings.find(
        (item) =>
          String(
            item?.bookingId ??
              item?.id
          ).toUpperCase() ===
          String(
            booking?.bookingId ??
              booking?.id
          ).toUpperCase()
      );

    if (!currentBooking) {
      return;
    }

    /*
     * Never process an already-cancelled booking.
     */
    if (
      normalizeStatus(
        currentBooking.status
      ) !== "confirmed"
    ) {
      return;
    }

    /* =====================================================
       OWNERSHIP CHECK
    ===================================================== */

    const bookingAttendeeId =
      currentBooking.attendeeId ??
      currentBooking.attendee?.userId;

    const bookingAttendeeEmail =
      currentBooking.attendee?.email ??
      currentBooking.attendeeEmail ??
      currentBooking.userEmail ??
      currentBooking.email;

    const normalizedBookingEmail =
      bookingAttendeeEmail
        ?.trim()
        .toLowerCase();

    const normalizedUserEmail =
      user?.email
        ?.trim()
        .toLowerCase();

    const ownsById =
      bookingAttendeeId !==
        null &&
      bookingAttendeeId !==
        undefined &&
      String(
        bookingAttendeeId
      ) ===
        String(user?.id);

    const ownsByEmail =
      Boolean(
        normalizedBookingEmail
      ) &&
      Boolean(
        normalizedUserEmail
      ) &&
      normalizedBookingEmail ===
        normalizedUserEmail;

    if (
      !ownsById &&
      !ownsByEmail
    ) {
      return;
    }

    /* =====================================================
       GET CURRENT EVENT
    ===================================================== */

    const eventId =
      currentBooking.eventId ??
      currentBooking.event?.id;

    const currentEvent =
      eventId
        ? getStoredEventById(
            eventId
          )
        : null;

    if (!currentEvent) {
      return;
    }

    /* =====================================================
       RE-CALCULATE STATE
    ===================================================== */

    /*
     * This is important.
     *
     * We do not trust the card's previous state.
     * The event may have changed while the page
     * was open.
     */
    const latestState =
      getBookingState(
        currentBooking,
        currentEvent
      );

    if (
      latestState !== "upcoming"
    ) {
      return;
    }

    /* =====================================================
       GET QUANTITY
    ===================================================== */

    const cancelledTickets =
      getBookingQuantity(
        currentBooking
      );

    if (
      cancelledTickets < 1
    ) {
      return;
    }

    /* =====================================================
       REMEMBER ORIGINAL EVENT STATUS
    ===================================================== */

    const originalEventStatus =
      currentEvent.status;

    /* =====================================================
       RESTORE EVENT SEATS
    ===================================================== */

    /*
     * A booking increased bookedSeats.
     *
     * Therefore cancellation must decrease
     * bookedSeats.
     */
    const updatedEvent =
      decrementEventSeats(
        eventId,
        cancelledTickets
      );

    if (!updatedEvent) {
      return;
    }

    /* =====================================================
       REOPEN SOLD-OUT EVENT
    ===================================================== */

    const hasAvailableSeats =
      Number(
        updatedEvent.bookedSeats
      ) <
      Number(
        updatedEvent.capacity
      );

    if (
      normalizeStatus(
        originalEventStatus
      ) === "sold-out" &&
      hasAvailableSeats
    ) {
      updateStoredEvent(
        eventId,
        {
          status: "published",
        }
      );
    }

    /* =====================================================
       CANCEL BOOKING
    ===================================================== */

    const updatedBookings =
      updateStoredBooking(
        currentBooking.bookingId,
        {
          status: "cancelled",
          cancelledAt:
            new Date().toISOString(),
        }
      );

    /*
     * If booking update failed,
     * restore the event seats.
     */
    if (
      !Array.isArray(
        updatedBookings
      )
    ) {
      incrementEventSeats(
        eventId,
        cancelledTickets
      );

      /*
       * Restore original event status.
       */
      if (
        normalizeStatus(
          originalEventStatus
        ) === "sold-out"
      ) {
        updateStoredEvent(
          eventId,
          {
            status:
              originalEventStatus,
          }
        );
      }

      return;
    }

    /* =====================================================
       REFRESH USER BOOKINGS
    ===================================================== */

    const refreshedBookings =
      getStoredBookings();

    const normalizedUserId =
      String(user.id);

    const userEmail =
      user.email
        ?.trim()
        .toLowerCase();

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

    /*
     * Notify other EventON screens.
     */
    window.dispatchEvent(
      new Event(
        "eventon:bookings-updated"
      )
    );

    window.dispatchEvent(
      new Event(
        EVENTS_UPDATED_EVENT
      )
    );
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ===================================================
          HEADER
      ==================================================== */}

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
                ongoing events,
                completed bookings,
                and cancelled reservations.
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

      {/* ===================================================
          SUMMARY
      ==================================================== */}

      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* ALL */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">

            <div className="flex items-start justify-between gap-3">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  All bookings
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.all}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Ticket size={19} />
              </div>

            </div>

          </div>

          {/* UPCOMING */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">

            <div className="flex items-start justify-between gap-3">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Upcoming
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.upcoming}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CalendarCheck2 size={19} />
              </div>

            </div>

          </div>

          {/* ONGOING */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">

            <div className="flex items-start justify-between gap-3">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Ongoing
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.ongoing}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Clock3 size={19} />
              </div>

            </div>

          </div>

          {/* COMPLETED */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">

            <div className="flex items-start justify-between gap-3">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.completed}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CheckCircle2 size={19} />
              </div>

            </div>

          </div>

          {/* CANCELLED */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">

            <div className="flex items-start justify-between gap-3">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Cancelled
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.cancelled}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <XCircle size={19} />
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            STATUS FILTER BUTTONS
            =================================================
            Compact pill-style filters matching the requested
            design. Every status is shown with its live count.
        ================================================== */}

        <div className="mt-8 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-sm overflow-hidden">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* SEARCH */}
            <div className="relative w-full sm:w-[260px] lg:w-[280px] shrink-0">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search by event name, booking ID, category..."
                aria-label="Search bookings"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none text-slate-400 transition hover:text-slate-700"
                >
                  ×
                </button>
              )}
            </div>

            {/* STATUS CATEGORIES */}
            <div className="w-full overflow-hidden">
              <div className="flex flex-wrap items-center justify-end gap-2">

                {tabs.map((tab) => {
                  const isActive =
                    activeTab === tab.id;

                  const tabIcon =
                    tab.id === "all"
                      ? <Ticket size={16} />
                      : tab.id === "upcoming"
                      ? <CalendarCheck2 size={16} />
                      : tab.id === "ongoing"
                      ? <Clock3 size={16} />
                      : tab.id === "completed"
                      ? <CheckCircle2 size={16} />
                      : <XCircle size={16} />;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setActiveTab(tab.id)
                      }
                      className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold whitespace-nowrap transition ${
                        isActive
                          ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                          : "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >

                      <span className="shrink-0">
                        {tabIcon}
                      </span>

                      <span>
                        {tab.id === "all"
                          ? "All"
                          : tab.label}
                      </span>

                      <span
                        className={`min-w-[24px] rounded-full px-2 py-0.5 text-center text-xs font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-white text-slate-500"
                        }`}
                      >
                        {counts[tab.id] ?? 0}
                      </span>

                    </button>
                  );
                })}

              </div>
            </div>

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
              (booking) => {

                const state =
                  booking.bookingState;

                const statusClasses =
                  getBookingStateClasses(
                    state
                  );

                /*
                 * Pass a display booking to
                 * BookingCard.
                 *
                 * We keep the original booking ID,
                 * attendee data, etc.
                 *
                 * `status` is changed only for
                 * display purposes so the card can
                 * show the correct event state.
                 */
                const displayBooking = {
                  ...booking,

                  /*
                   * The actual stored booking remains
                   * unchanged in localStorage.
                   */
                  status:
                    state ===
                    "cancelled"
                      ? "cancelled"
                      : state,

                  /*
                   * Current event data.
                   */
                  event:
                    booking.currentEvent ||
                    booking.event,

                  /*
                   * Extra UI information.
                   */
                  bookingState:
                    state,

                  bookingStateLabel:
                    getBookingStateLabel(
                      state
                    ),

                  bookingStateClasses:
                    statusClasses,

                  /*
                   * Only upcoming confirmed bookings
                   * may be cancelled.
                   */
                  canCancel:
                    booking.canCancel,
                };

                return (
                  <BookingCard
                    key={
                      booking.bookingId
                    }
                    booking={
                      displayBooking
                    }
                    onCancel={
                      booking.canCancel
                        ? handleCancelBooking
                        : undefined
                    }
                    cancelDisabled={
                      !booking.canCancel
                    }
                  />
                );
              }
            )}

          </div>

        )}

      </section>

    </main>
  );
}

export default MyBookings;
