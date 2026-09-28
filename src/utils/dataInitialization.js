import { clearStoredEvents } from "./eventStorage";
import { clearStoredBookings } from "./bookingStorage";

const DATA_VERSION_KEY = "eventon_data_version";

// Increase this whenever we intentionally perform a new clean-data migration.
const CURRENT_DATA_VERSION = "2026-09-clean-foundation-v2";

const USER_STORAGE_KEY = "eventon_user";
const ACCOUNTS_STORAGE_KEY = "eventon_accounts";

// Legacy keys from the previous EventSphere/EventON versions.
const LEGACY_STORAGE_KEYS = [
  "eventBookings",
  "eventSphereUser",
  "eventSphereUsers",
  "eventon_organizer_events",
];

export function initializeCleanEventONData() {
  try {
    const currentVersion = localStorage.getItem(DATA_VERSION_KEY);

    if (currentVersion === CURRENT_DATA_VERSION) {
      return false;
    }

    // --------------------------------------------------
    // Remove current EventON user/session data
    // --------------------------------------------------
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY);

    // --------------------------------------------------
    // Remove current EventON events and bookings
    // --------------------------------------------------
    clearStoredEvents();
    clearStoredBookings();

    // --------------------------------------------------
    // Remove legacy application data
    // --------------------------------------------------
    LEGACY_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });

    // --------------------------------------------------
    // Mark this clean-data migration as completed
    // --------------------------------------------------
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);

    return true;
  } catch (error) {
    console.error("Unable to initialize EventON data:", error);
    return false;
  }
}