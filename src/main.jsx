import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { events } from "./data/events";
import { initializeEvents } from "./utils/eventStorage";
import {
  initializeCleanEventONData,
} from "./utils/dataInitialization";

/*
 * Run the EventON data migration/reset once.
 *
 * This removes old demo/test data and prevents
 * the old fake bookings from remaining in
 * localStorage.
 */
initializeCleanEventONData();

/*
 * After the clean reset, initialize the
 * original EventON seed events.
 *
 * eventStorage now guarantees that every
 * seed event starts with bookedSeats = 0.
 */
initializeEvents(events);

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);