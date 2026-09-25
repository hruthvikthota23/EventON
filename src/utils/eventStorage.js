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

export function getStoredEventsByStatus(
  status
) {
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

  const bookedSeats =
    Number(event.bookedSeats) || 0;

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

  const bookedSeats =
    Number(event.bookedSeats) || 0;

  if (capacity <= 0) {
    return false;
  }

  return bookedSeats >= capacity;
}

// =========================================================
// SAVE EVENT
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

    const eventToSave = {
      ...event,

      // Never change the ID.
      id: existingEvent?.id || event.id,

      // Preserve original creation date.
      createdAt:
        existingEvent?.createdAt ||
        event.createdAt ||
        now,

      // Always update modification time.
      updatedAt: now,

      // Keep organizer information.
      organizerId:
        event.organizerId ??
        existingEvent?.organizerId ??
        null,

      // Keep sensible booking values.
      capacity:
        Number(event.capacity) || 0,

      bookedSeats:
        Number(event.bookedSeats) || 0,

      price:
        Number(event.price) || 0,

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

    const eventToCreate = {
      ...event,

      id: event.id,

      organizerId:
        event.organizerId || null,

      createdAt:
        event.createdAt || now,

      updatedAt: now,

      capacity:
        Number(event.capacity) || 0,

      bookedSeats:
        Number(event.bookedSeats) || 0,

      price:
        Number(event.price) || 0,

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
      existingEvents.map((event) => {
        if (
          normalizeId(event?.id) !==
          normalizedEventId
        ) {
          return event;
        }

        const safeUpdates = {
          ...(updates || {}),
        };

        // Event ID can NEVER be changed.
        delete safeUpdates.id;

        return {
          ...event,
          ...safeUpdates,

          id: event.id,

          updatedAt:
            new Date().toISOString(),

          capacity:
            safeUpdates.capacity !==
            undefined
              ? Number(
                  safeUpdates.capacity
                ) || 0
              : Number(event.capacity) || 0,

          bookedSeats:
            safeUpdates.bookedSeats !==
            undefined
              ? Number(
                  safeUpdates.bookedSeats
                ) || 0
              : Number(event.bookedSeats) || 0,

          price:
            safeUpdates.price !==
            undefined
              ? Number(
                  safeUpdates.price
                ) || 0
              : Number(event.price) || 0,
        };
      });

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
// =========================================================

export function updateEventSeats(
  eventId,
  bookedSeats
) {
  if (!isValidId(eventId)) {
    return null;
  }

  const event =
    getStoredEventById(eventId);

  if (!event) {
    return null;
  }

  const capacity =
    Number(event.capacity) || 0;

  const safeBookedSeats = Math.max(
    0,
    Math.min(
      Number(bookedSeats) || 0,
      capacity || Number(bookedSeats) || 0
    )
  );

  const updatedEvents =
    updateStoredEvent(eventId, {
      bookedSeats:
        safeBookedSeats,
    });

  if (!Array.isArray(updatedEvents)) {
    return null;
  }

  return getStoredEventById(eventId);
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
    Number(event.bookedSeats) || 0;

  const capacity =
    Number(event.capacity) || 0;

  const amount =
    Math.max(Number(quantity) || 0, 0);

  const newBookedSeats =
    capacity > 0
      ? Math.min(
          currentBooked + amount,
          capacity
        )
      : currentBooked + amount;

  return updateEventSeats(
    eventId,
    newBookedSeats
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
    Number(event.bookedSeats) || 0;

  const amount =
    Math.max(Number(quantity) || 0, 0);

  const newBookedSeats =
    Math.max(
      currentBooked - amount,
      0
    );

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

    const updatedEvents =
      existingEvents.filter(
        (event) =>
          normalizeId(event?.id) !==
          normalizedEventId
      );

    // Nothing was deleted.
    if (
      updatedEvents.length ===
      existingEvents.length
    ) {
      return existingEvents;
    }

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
// INITIALIZE SEED EVENTS
// =========================================================

export function initializeEvents(
  seedEvents = []
) {
  const existingEvents =
    getStoredEvents();

  // Never overwrite existing localStorage data.
  if (existingEvents.length > 0) {
    return existingEvents;
  }

  if (!Array.isArray(seedEvents)) {
    return [];
  }

  const now =
    new Date().toISOString();

  const initializedEvents =
    seedEvents.map((event) => ({
      ...event,

      // Existing seed events are system events
      // unless an organizerId already exists.
      organizerId:
        event.organizerId ||
        "system-organizer",

      createdAt:
        event.createdAt ||
        now,

      updatedAt:
        event.updatedAt ||
        now,

      capacity:
        Number(event.capacity) || 0,

      bookedSeats:
        Number(event.bookedSeats) || 0,

      price:
        Number(event.price) || 0,

      status:
        event.status || "published",

      featured:
        Boolean(event.featured),
    }));

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
    if (typeof window === "undefined") {
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