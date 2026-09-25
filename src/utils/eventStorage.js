const STORAGE_KEY = "eventon_events";

export const EVENTS_UPDATED_EVENT =
  "eventon:events-updated";

// =========================================================
// NOTIFY EVENT UPDATES
// =========================================================

function notifyEventsUpdated() {
  window.dispatchEvent(
    new Event(EVENTS_UPDATED_EVENT)
  );
}

// =========================================================
// GET ALL STORED EVENTS
// =========================================================

export function getStoredEvents() {
  try {
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
  if (
    eventId === undefined ||
    eventId === null ||
    eventId === ""
  ) {
    return null;
  }

  const events = getStoredEvents();

  return (
    events.find(
      (event) =>
        String(event.id) ===
        String(eventId)
    ) || null
  );
}

// =========================================================
// GET EVENTS BY ORGANIZER
// =========================================================

export function getStoredEventsByOrganizer(
  organizerId
) {
  if (
    organizerId === undefined ||
    organizerId === null ||
    organizerId === ""
  ) {
    return [];
  }

  const events = getStoredEvents();

  return events.filter(
    (event) =>
      String(event.organizerId) ===
      String(organizerId)
  );
}

// =========================================================
// SAVE EVENT
// =========================================================

export function saveEvent(event) {
  try {
    if (
      !event ||
      event.id === undefined ||
      event.id === null ||
      event.id === ""
    ) {
      console.error(
        "Unable to save EventON event: event ID is required."
      );

      return null;
    }

    const existingEvents =
      getStoredEvents();

    const eventToSave = {
      ...event,

      updatedAt:
        event.updatedAt ||
        new Date().toISOString(),

      createdAt:
        event.createdAt ||
        new Date().toISOString(),
    };

    const updatedEvents = [
      eventToSave,

      ...existingEvents.filter(
        (item) =>
          String(item.id) !==
          String(eventToSave.id)
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
// UPDATE EVENT
// =========================================================

export function updateStoredEvent(
  eventId,
  updates
) {
  try {
    if (
      eventId === undefined ||
      eventId === null ||
      eventId === ""
    ) {
      return getStoredEvents();
    }

    const existingEvents =
      getStoredEvents();

    const eventExists =
      existingEvents.some(
        (event) =>
          String(event.id) ===
          String(eventId)
      );

    if (!eventExists) {
      return existingEvents;
    }

    const updatedEvents =
      existingEvents.map((event) => {
        if (
          String(event.id) !==
          String(eventId)
        ) {
          return event;
        }

        return {
          ...event,
          ...updates,

          // Event ID should never change
          // through an update operation.
          id: event.id,

          updatedAt:
            new Date().toISOString(),
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
// DELETE EVENT
// =========================================================

export function deleteStoredEvent(eventId) {
  try {
    if (
      eventId === undefined ||
      eventId === null ||
      eventId === ""
    ) {
      return getStoredEvents();
    }

    const existingEvents =
      getStoredEvents();

    const updatedEvents =
      existingEvents.filter(
        (event) =>
          String(event.id) !==
          String(eventId)
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

  const initializedEvents =
    seedEvents.map((event) => ({
      ...event,

      createdAt:
        event.createdAt ||
        new Date().toISOString(),

      updatedAt:
        event.updatedAt ||
        new Date().toISOString(),
    }));

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(initializedEvents)
  );

  notifyEventsUpdated();

  return initializedEvents;
}

// =========================================================
// CLEAR ALL EVENTS
// =========================================================

export function clearStoredEvents() {
  try {
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