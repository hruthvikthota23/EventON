import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop";

// =========================================================
// LAYOUTS
// =========================================================

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import OrganizerLayout from "./layouts/OrganizerLayout";
import AdminLayout from "./layouts/AdminLayout";

// =========================================================
// PUBLIC PAGES
// =========================================================

import Home from "./pages/public/Home";
import Events from "./pages/public/Events";
import About from "./pages/public/About";
import EventDetails from "./pages/public/EventDetails";
import Booking from "./pages/public/Booking";
import BookingConfirmation from "./pages/public/BookingConfirmation";

// =========================================================
// AUTH
// =========================================================

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// =========================================================
// ATTENDEE / USER PAGES
// =========================================================

import MyBookings from "./pages/attendee/MyBookings";
import BookingDetails from "./pages/attendee/BookingDetails";
import Profile from "./pages/attendee/Profile";

// =========================================================
// ORGANIZER
// =========================================================

import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import OrganizerEvents from "./pages/organizer/OrganizerEvents";
import CreateEvent from "./pages/organizer/CreateEvent";
import OrganizerEventDetails from "./pages/organizer/OrganizerEventDetails";
import EditEvent from "./pages/organizer/EditEvent";
import OrganizerBookings from "./pages/organizer/OrganizerBookings";
import OrganizerBookingDetails from "./pages/organizer/OrganizerBookingDetails";
import OrganizerProfile from "./pages/organizer/OrganizerProfile";

// =========================================================
// ADMIN
// =========================================================

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetails from "./pages/admin/AdminUserDetails";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminEventDetails from "./pages/admin/AdminEventDetails";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBookingDetails from "./pages/admin/AdminBookingDetails";

// =========================================================
// ROLE PROTECTION
// =========================================================

import RoleRoute from "./components/common/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>

        {/* =====================================================
            PUBLIC / USER WEBSITE
            ATTENDEE + ORGANIZER + ADMIN
            ALL CAN ACCESS
        ====================================================== */}

        <Route element={<MainLayout />}>

          {/* Home */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Events */}
          <Route
            path="/events"
            element={<Events />}
          />

          {/* About */}
          <Route
            path="/about"
            element={<About />}
          />

          {/* Event Details */}
          <Route
            path="/events/:id"
            element={<EventDetails />}
          />

          {/* Book Any Event */}
          <Route
            path="/events/:id/book"
            element={<Booking />}
          />

          {/* Booking Confirmation */}
          <Route
            path="/booking-confirmation"
            element={<BookingConfirmation />}
          />

          {/* =================================================
              USER ACCOUNT
              ALL LOGGED-IN ROLES CAN ACCESS
          ================================================= */}

          {/* My Bookings */}
          <Route
            path="/bookings"
            element={<MyBookings />}
          />

          {/* Booking Details */}
          <Route
            path="/bookings/:bookingId"
            element={<BookingDetails />}
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>

        {/* =====================================================
            AUTHENTICATION
        ====================================================== */}

        <Route element={<AuthLayout />}>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

        </Route>

        {/* =====================================================
            ORGANIZER PANEL
            ONLY ORGANIZERS
        ====================================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={["organizer"]}
            />
          }
        >

          <Route element={<OrganizerLayout />}>

            {/* Dashboard */}
            <Route
              path="/organizer"
              element={<OrganizerDashboard />}
            />

            {/* Events */}
            <Route
              path="/organizer/events"
              element={<OrganizerEvents />}
            />

            {/* Create Event */}
            <Route
              path="/organizer/events/create"
              element={<CreateEvent />}
            />

            {/* Edit Event */}
            <Route
              path="/organizer/events/:id/edit"
              element={<EditEvent />}
            />

            {/* Event Details */}
            <Route
              path="/organizer/events/:id"
              element={<OrganizerEventDetails />}
            />

            {/* Bookings */}
            <Route
              path="/organizer/bookings"
              element={<OrganizerBookings />}
            />

            {/* Booking Details */}
            <Route
              path="/organizer/bookings/:bookingId"
              element={<OrganizerBookingDetails />}
            />

            {/* Profile */}
            <Route
              path="/organizer/profile"
              element={<OrganizerProfile />}
            />

          </Route>

        </Route>

        {/* =====================================================
            ADMIN PANEL
            ONLY ADMINS
        ====================================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={["admin"]}
            />
          }
        >

          <Route element={<AdminLayout />}>

            {/* Dashboard */}
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            {/* Profile */}
            <Route
              path="/admin/profile"
              element={<AdminProfile />}
            />

            {/* Users */}
            <Route
              path="/admin/users"
              element={<AdminUsers />}
            />

            {/* User Details */}
            <Route
              path="/admin/users/:userId"
              element={<AdminUserDetails />}
            />

            {/* Events */}
            <Route
              path="/admin/events"
              element={<AdminEvents />}
            />

            {/* Event Details */}
            <Route
              path="/admin/events/:id"
              element={<AdminEventDetails />}
            />

            {/* Bookings */}
            <Route
              path="/admin/bookings"
              element={<AdminBookings />}
            />

            {/* Booking Details */}
            <Route
              path="/admin/bookings/:bookingId"
              element={<AdminBookingDetails />}
            />

          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;