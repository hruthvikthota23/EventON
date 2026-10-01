const STORAGE_KEY = "eventon_events";

export const EVENTS_UPDATED_EVENT =
  "eventon:events-updated";

// =========================================================
// NOTIFY EVENT UPDATES
// =========================================================

function notifyEventsUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event(EVENTS_UPDATED_EVENT)
  );
}

// =========================================================
// VALIDATE ID
// =========================================================

function isValidId(value) {
  return !(
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  );
}

// =========================================================
// NORMALIZE ID
// =========================================================

function normalizeId(value) {
  return String(value)
    .trim()
    .toUpperCase();
}

// =========================================================
// GET ALL STORED EVENTS
// =========================================================

export function getStoredEvents() {
  try {
    if (typeof window === "undefined") {
      return [];
    }

    const storedEvents =
      localStorage.getItem(STORAGE_KEY);

    if (!storedEvents) {
      return [];
    }

    const parsedEvents =
      JSON.parse(storedEvents);

    return Array.isArray(parsedEvents)
      ? parsedEvents
      : [];
  } catch (error) {
    console.error(
      "Unable to read EventON events:",
      error
    );

    return [];
  }
}

// =========================================================
// GET EVENT BY ID
// =========================================================

export function getStoredEventById(eventId) {
  if (!isValidId(eventId)) {
    return null;
  }

  const normalizedEventId =
    normalizeId(eventId);

  const events = getStoredEvents();

  return (
    events.find(
      (event) =>
        normalizeId(event?.id) ===
        normalizedEventId
    ) || null
  );
}

// =========================================================
// GET EVENTS BY ORGANIZER
// =========================================================

export function getStoredEventsByOrganizer(
  organizerId
) {
  if (!isValidId(organizerId)) {
    return [];
  }

  const normalizedOrganizerId =
    normalizeId(organizerId);

  const events = getStoredEvents();

  return events.filter(
    (event) =>
      isValidId(event?.organizerId) &&
      normalizeId(event.organizerId) ===
        normalizedOrganizerId
  );
}

// =========================================================
// GET EVENTS BY STATUS
// =========================================================

export function getStoredEventsByStatus(status) {
  if (!status) {
    return getStoredEvents();
  }

  const normalizedStatus = String(status)
    .trim()
    .toLowerCase();

  return getStoredEvents().filter(
    (event) =>
      String(event?.status || "")
        .trim()
        .toLowerCase() ===
      normalizedStatus
  );
}

// =========================================================
// GET FEATURED EVENTS
// =========================================================

export function getStoredFeaturedEvents() {
  return getStoredEvents().filter(
    (event) => event?.featured === true
  );
}

// =========================================================
// GET AVAILABLE SEATS
// =========================================================

export function getAvailableSeats(event) {
  if (!event) {
    return 0;
  }

  const capacity =
    Number(event.capacity) || 0;

  const bookedSeats = Math.max(
    Number(event.bookedSeats) || 0,
    0
  );

  return Math.max(
    capacity - bookedSeats,
    0
  );
}

// =========================================================
// CHECK SOLD OUT
// =========================================================

export function isStoredEventSoldOut(event) {
  if (!event) {
    return false;
  }

  const capacity =
    Number(event.capacity) || 0;

  const bookedSeats = Math.max(
    Number(event.bookedSeats) || 0,
    0
  );

  if (capacity <= 0) {
    return false;
  }

  return bookedSeats >= capacity;
}

// =========================================================
// SAVE EVENT
//
// IMPORTANT:
//
// This function protects:
// - event ID
// - organizer ownership
// - booked seat count
//
// Booking count must only be changed through the
// dedicated seat functions below.
// =========================================================

export function saveEvent(event) {
  try {
    if (!event || !isValidId(event.id)) {
      console.error(
        "Unable to save EventON event: event ID is required."
      );

      return null;
    }

    const existingEvents =
      getStoredEvents();

    const existingEvent =
      existingEvents.find(
        (item) =>
          normalizeId(item?.id) ===
          normalizeId(event.id)
      );

    const now =
      new Date().toISOString();

    const existingBookedSeats =
      Number(
        existingEvent?.bookedSeats
      ) || 0;

    const requestedCapacity =
      Number(event.capacity);

    const safeCapacity =
      Number.isFinite(requestedCapacity) &&
      requestedCapacity >= 0
        ? Math.max(
            requestedCapacity,
            existingBookedSeats
          )
        : Number(
            existingEvent?.capacity
          ) || 0;

    const eventToSave = {
      ...event,

      // ID can never change.
      id:
        existingEvent?.id ||
        event.id,

      // Preserve creation date.
      createdAt:
        existingEvent?.createdAt ||
        event.createdAt ||
        now,

      updatedAt: now,

      // Organizer ownership is immutable.
      //
      // For a new event, use supplied organizerId.
      // For existing event, preserve original organizer.
      organizerId:
        existingEvent
          ? existingEvent.organizerId ?? null
          : event.organizerId ?? null,

      capacity: safeCapacity,

      // NEVER trust bookedSeats from normal event save.
      //
      // Existing booking count is preserved.
      // New events start with zero.
      bookedSeats:
        existingEvent
          ? Math.min(
              Math.max(
                existingBookedSeats,
                0
              ),
              safeCapacity
            )
          : 0,

      price:
        Number(event.price) >= 0
          ? Number(event.price)
          : Number(
              existingEvent?.price
            ) || 0,

      status:
        event.status ||
        existingEvent?.status ||
        "published",

      featured:
        Boolean(event.featured),
    };

    const updatedEvents = [
      eventToSave,

      ...existingEvents.filter(
        (item) =>
          normalizeId(item?.id) !==
          normalizeId(eventToSave.id)
      ),
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedEvents)
    );

    notifyEventsUpdated();

    return eventToSave;
  } catch (error) {
    console.error(
      "Unable to save EventON event:",
      error
    );

    return null;
  }
}

// =========================================================
// CREATE EVENT
//
// Every newly-created event starts with:
// bookedSeats = 0
// =========================================================

export function createStoredEvent(event) {
  try {
    if (!event) {
      console.error(
        "Unable to create EventON event: event data is required."
      );

      return null;
    }

    if (!isValidId(event.id)) {
      console.error(
        "Unable to create EventON event: event ID is required."
      );

      return null;
    }

    const existingEvent =
      getStoredEventById(event.id);

    if (existingEvent) {
      console.error(
        "Unable to create EventON event: event ID already exists."
      );

      return null;
    }

    const now =
      new Date().toISOString();

    const capacity =
      Math.max(
        Number(event.capacity) || 0,
        0
      );

    const eventToCreate = {
      ...event,

      id: event.id,

      organizerId:
        event.organizerId || null,

      createdAt:
        event.createdAt || now,

      updatedAt: now,

      capacity,

      // CRITICAL:
      // New events NEVER have bookings.
      bookedSeats: 0,

      price:
        Math.max(
          Number(event.price) || 0,
          0
        ),

      status:
        event.status || "published",

      featured:
        Boolean(event.featured),
    };

    const events =
      getStoredEvents();

    const updatedEvents = [
      eventToCreate,
      ...events,
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedEvents)
    );

    notifyEventsUpdated();

    return eventToCreate;
  } catch (error) {
    console.error(
      "Unable to create EventON event:",
      error
    );

    return null;
  }
}

// =========================================================
// UPDATE EVENT
//
// General event editing CANNOT:
// - change ID
// - change organizer
// - change booked seats
//
// Booking count is controlled only by the booking
// functions below.
// =========================================================

export function updateStoredEvent(
  eventId,
  updates
) {
  try {
    if (!isValidId(eventId)) {
      return getStoredEvents();
    }

    const normalizedEventId =
      normalizeId(eventId);

    const existingEvents =
      getStoredEvents();

    const existingEvent =
      existingEvents.find(
        (event) =>
          normalizeId(event?.id) ===
          normalizedEventId
      );

    if (!existingEvent) {
      return existingEvents;
    }

    const safeUpdates = {
      ...(updates || {}),
    };

    // These fields cannot be changed through
    // normal event update.
    delete safeUpdates.id;
    delete safeUpdates.organizerId;
    delete safeUpdates.bookedSeats;
    delete safeUpdates.createdAt;

    const currentBookedSeats =
      Math.max(
        Number(
          existingEvent.bookedSeats
        ) || 0,
        0
      );

    const requestedCapacity =
      safeUpdates.capacity !== undefined
        ? Number(safeUpdates.capacity)
        : Number(existingEvent.capacity);

    /*
     * Capacity can never become lower than
     * the number of already-booked seats.
     */
    const safeCapacity =
      Number.isFinite(requestedCapacity)
        ? Math.max(
            requestedCapacity,
            currentBookedSeats
          )
        : Math.max(
            Number(
              existingEvent.capacity
            ) || 0,
            currentBookedSeats
          );

    delete safeUpdates.capacity;

    const updatedEvent = {
      ...existingEvent,
      ...safeUpdates,

      id: existingEvent.id,

      organizerId:
        existingEvent.organizerId ?? null,

      createdAt:
        existingEvent.createdAt || "",

      updatedAt:
        new Date().toISOString(),

      capacity: safeCapacity,

      bookedSeats:
        Math.min(
          currentBookedSeats,
          safeCapacity
        ),

      price:
        safeUpdates.price !== undefined
          ? Math.max(
              Number(
                safeUpdates.price
              ) || 0,
              0
            )
          : Math.max(
              Number(
                existingEvent.price
              ) || 0,
              0
            ),
    };

    const updatedEvents =
      existingEvents.map(
        (event) =>
          normalizeId(event?.id) ===
          normalizedEventId
            ? updatedEvent
            : event
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedEvents)
    );

    notifyEventsUpdated();

    return updatedEvents;
  } catch (error) {
    console.error(
      "Unable to update EventON event:",
      error
    );

    return [];
  }
}

// =========================================================
// UPDATE EVENT SEATS
//
// ONLY this function changes bookedSeats.
//
// It guarantees:
// 0 <= bookedSeats <= capacity
// =========================================================

export function updateEventSeats(
  eventId,
  bookedSeats
) {
  try {
    if (!isValidId(eventId)) {
      return null;
    }

    const event =
      getStoredEventById(eventId);

    if (!event) {
      return null;
    }

    const capacity =
      Math.max(
        Number(event.capacity) || 0,
        0
      );

    const requestedSeats =
      Number(bookedSeats);

    const safeRequestedSeats =
      Number.isFinite(requestedSeats)
        ? Math.max(
            requestedSeats,
            0
          )
        : Number(event.bookedSeats) || 0;

    const safeBookedSeats =
      Math.min(
        safeRequestedSeats,
        capacity
      );

    const updatedEvents =
      getStoredEvents().map(
        (storedEvent) => {
          if (
            normalizeId(
              storedEvent?.id
            ) !==
            normalizeId(eventId)
          ) {
            return storedEvent;
          }

          return {
            ...storedEvent,

            bookedSeats:
              safeBookedSeats,

            updatedAt:
              new Date().toISOString(),
          };
        }
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedEvents)
    );

    notifyEventsUpdated();

    return getStoredEventById(
      eventId
    );
  } catch (error) {
    console.error(
      "Unable to update EventON event seats:",
      error
    );

    return null;
  }
}

// =========================================================
// INCREMENT BOOKED SEATS
// =========================================================

export function incrementEventSeats(
  eventId,
  quantity = 1
) {
  const event =
    getStoredEventById(eventId);

  if (!event) {
    return null;
  }

  const currentBooked =
    Math.max(
      Number(event.bookedSeats) || 0,
      0
    );

  const capacity =
    Math.max(
      Number(event.capacity) || 0,
      0
    );

  const amount =
    Math.floor(
      Number(quantity) || 0
    );

  if (amount <= 0) {
    return event;
  }

  /*
   * Never allow booking beyond capacity.
   */
  if (
    currentBooked + amount >
    capacity
  ) {
    return null;
  }

  return updateEventSeats(
    eventId,
    currentBooked + amount
  );
}

// =========================================================
// DECREMENT BOOKED SEATS
// =========================================================

export function decrementEventSeats(
  eventId,
  quantity = 1
) {
  const event =
    getStoredEventById(eventId);

  if (!event) {
    return null;
  }

  const currentBooked =
    Math.max(
      Number(event.bookedSeats) || 0,
      0
    );

  const amount =
    Math.floor(
      Number(quantity) || 0
    );

  if (amount <= 0) {
    return event;
  }

  // A cancellation can never restore more seats
  // than are currently recorded as booked.
  if (amount > currentBooked) {
    return null;
  }

  const newBookedSeats =
    currentBooked - amount;

  return updateEventSeats(
    eventId,
    newBookedSeats
  );
}

// =========================================================
// DELETE EVENT
// =========================================================

export function deleteStoredEvent(eventId) {
  try {
    if (!isValidId(eventId)) {
      return getStoredEvents();
    }

    const normalizedEventId =
      normalizeId(eventId);

    const existingEvents =
      getStoredEvents();

    const eventExists =
      existingEvents.some(
        (event) =>
          normalizeId(event?.id) ===
          normalizedEventId
      );

    if (!eventExists) {
      return existingEvents;
    }

    const updatedEvents =
      existingEvents.filter(
        (event) =>
          normalizeId(event?.id) !==
          normalizedEventId
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedEvents)
    );

    notifyEventsUpdated();

    return updatedEvents;
  } catch (error) {
    console.error(
      "Unable to delete EventON event:",
      error
    );

    return [];
  }
}

// =========================================================
// INITIALIZE / REFRESH SEED EVENTS
//
// IMPORTANT:
//
// - System/demo events are refreshed every initialization.
// - Their dates come from the dynamic events.js.
// - Existing bookedSeats are preserved.
// - Organizer-created events are NEVER overwritten.
// - Cancelled seed events remain cancelled.
// - Other seed events remain published.
// =========================================================

export function initializeEvents(
  seedEvents = []
) {
  const existingEvents =
    getStoredEvents();

  if (!Array.isArray(seedEvents)) {
    return existingEvents;
  }

  const now =
    new Date().toISOString();

  // ---------------------------------------------------------
  // Keep real organizer-created events untouched.
  // ---------------------------------------------------------

  const existingOrganizerEvents =
    existingEvents.filter(
      (event) =>
        event?.organizerId !==
        "system-organizer"
    );

  // ---------------------------------------------------------
  // Existing system/demo events.
  // ---------------------------------------------------------

  const existingSystemEvents =
    existingEvents.filter(
      (event) =>
        event?.organizerId ===
        "system-organizer"
    );

  // ---------------------------------------------------------
  // Rebuild dynamic system events.
  // ---------------------------------------------------------

  const initializedSystemEvents =
    seedEvents.map(
      (seedEvent) => {
        const existingSystemEvent =
          existingSystemEvents.find(
            (event) =>
              String(event?.id) ===
              String(seedEvent?.id)
          );

        const capacity =
          Math.max(
            Number(seedEvent.capacity) || 0,
            0
          );

        /*
         * Preserve existing bookings.
         *
         * This is important because changing the
         * demo date must not destroy booking counts.
         */
        const previousBookedSeats =
          Number(
            existingSystemEvent?.bookedSeats ??
              0
          );

        const bookedSeats =
          Math.min(
            Math.max(
              previousBookedSeats,
              0
            ),
            capacity
          );

        return {
          ...seedEvent,

          organizerId:
            seedEvent.organizerId ||
            "system-organizer",

          // -------------------------------------------------
          // DYNAMIC DATE / TIME
          // -------------------------------------------------

          date: seedEvent.date,

          time: seedEvent.time,

          endTime: seedEvent.endTime,

          // -------------------------------------------------
          // EVENT DATA
          // -------------------------------------------------

          capacity,

          bookedSeats,

          price:
            Math.max(
              Number(seedEvent.price) || 0,
              0
            ),

          /*
           * Cancelled events stay cancelled.
           *
           * Other lifecycle states are calculated from
           * date/time by the UI.
           */
          status:
            String(
              seedEvent.status || ""
            ).toLowerCase() ===
            "cancelled"
              ? "cancelled"
              : "published",

          featured:
            Boolean(
              seedEvent.featured
            ),

          // Preserve original creation date.
          createdAt:
            existingSystemEvent?.createdAt ||
            seedEvent.createdAt ||
            now,

          updatedAt: now,
        };
      }
    );

  // ---------------------------------------------------------
  // Final event collection
  //
  // Dynamic system events first.
  // Organizer-created events remain untouched.
  // ---------------------------------------------------------

  const initializedEvents = [
    ...initializedSystemEvents,
    ...existingOrganizerEvents,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      initializedEvents
    )
  );

  notifyEventsUpdated();

  return initializedEvents;
}

// =========================================================
// CLEAR ALL EVENTS
// =========================================================

export function clearStoredEvents() {
  try {
    if (
      typeof window ===
      "undefined"
    ) {
      return false;
    }

    localStorage.removeItem(
      STORAGE_KEY
    );

    notifyEventsUpdated();

    return true;
  } catch (error) {
    console.error(
      "Unable to clear EventON events:",
      error
    );

    return false;
  }
}