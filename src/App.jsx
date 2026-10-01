import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import ScrollToTop from "./components/common/ScrollToTop";
import RoleRoute from "./components/common/RoleRoute";

import AppLayout from "./layouts/AppLayout";
import DashboardLayout from "./layouts/DashboardLayout";

/* =========================================================
   PUBLIC PAGES
========================================================= */

import Home from "./pages/public/Home";
import Events from "./pages/public/Events";
import About from "./pages/public/About";
import EventDetails from "./pages/public/EventDetails";
import Contact from "./pages/public/Contact";
import Careers from "./pages/public/Careers";
import HelpCenter from "./pages/public/HelpCenter";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsConditions from "./pages/public/TermsConditions";

/* =========================================================
   AUTH PAGES
========================================================= */

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

/* =========================================================
   AUTHENTICATED PAGES
========================================================= */

import Booking from "./pages/authenticated/Booking";
import BookingConfirmation from "./pages/authenticated/BookingConfirmation";
import MyBookings from "./pages/authenticated/MyBookings";
import BookingDetails from "./pages/authenticated/MyBookingDetails";
import Profile from "./pages/authenticated/Profile";
import EditProfile from "./pages/authenticated/EditProfile";

/* =========================================================
   MANAGEMENT PAGES
   Shared by Admin + Organizer
========================================================= */

import ManagementBookings from "./pages/management/ManagementBookings";
import ManagementBookingDetails from "./pages/management/ManagementBookingDetails";
import ManagementEvents from "./pages/management/ManagementEvents";
import ManagementEventDetails from "./pages/management/ManagementEventDetails";


/* =========================================================
   ORGANIZER PAGES
========================================================= */

import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import CreateEvent from "./pages/organizer/CreateEvent";

/* =========================================================
   ADMIN PAGES
========================================================= */

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetails from "./pages/admin/AdminUserDetails";

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>

      {/* =====================================================
          SCROLL TO TOP
      ===================================================== */}

      <ScrollToTop />

      <Routes>

        {/* ===================================================
            PUBLIC + AUTHENTICATED PAGES
        =================================================== */}

        <Route element={<AppLayout />}>

          {/* =================================================
              PUBLIC PAGES
          ================================================= */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/events/:id"
            element={<EventDetails />}
          />

          {/* =================================================
              AUTHENTICATED BOOKING PAGES
          ================================================= */}

          <Route
            path="/events/:id/book"
            element={<Booking />}
          />

          <Route
            path="/booking-confirmation"
            element={<BookingConfirmation />}
          />

          {/* =================================================
              COMPANY PAGES
          ================================================= */}

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/careers"
            element={<Careers />}
          />

          {/* =================================================
              SUPPORT PAGES
          ================================================= */}

          <Route
            path="/help-center"
            element={<HelpCenter />}
          />

          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/terms"
            element={<TermsConditions />}
          />

          {/* =================================================
              AUTH
          ================================================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =================================================
              AUTHENTICATED USER PAGES
          ================================================= */}

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/profile/edit"
            element={<EditProfile />}
          />

          <Route
            path="/my-bookings"
            element={<MyBookings />}
          />

          <Route
            path="/my-bookings/:bookingId"
            element={<BookingDetails />}
          />

        </Route>

        {/* ===================================================
            ORGANIZER PANEL
        =================================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={["organizer"]}
            />
          }
        >

          <Route
            element={<DashboardLayout />}
          >

            {/* =================================================
                ORGANIZER DASHBOARD
            ================================================= */}

            <Route
              path="/organizer"
              element={
                <OrganizerDashboard />
              }
            />

            {/* =================================================
                ORGANIZER EVENTS
            ================================================= */}

            <Route
              path="/organizer/events"
              element={
                <ManagementEvents />
              }
            />

            <Route
              path="/organizer/events/create"
              element={
                <CreateEvent />
              }
            />


            <Route
              path="/organizer/events/:id"
              element={
                <ManagementEventDetails />
              }
            />

            {/* =================================================
                SHARED MANAGEMENT BOOKINGS
            ================================================= */}

            <Route
              path="/organizer/bookings"
              element={
                <ManagementBookings />
              }
            />

            {/* =================================================
                SHARED BOOKING DETAILS
            ================================================= */}

            <Route
              path="/organizer/bookings/:bookingId"
              element={
                <ManagementBookingDetails />
              }
            />

            {/* =================================================
                ORGANIZER PROFILE
            ================================================= */}

            <Route
              path="/organizer/profile"
              element={
                <Profile />
              }
            />

          </Route>

        </Route>

        {/* ===================================================
            ADMIN PANEL
        =================================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={["admin"]}
            />
          }
        >

          <Route
            element={<DashboardLayout />}
          >

            {/* =================================================
                ADMIN DASHBOARD
            ================================================= */}

            <Route
              path="/admin"
              element={
                <AdminDashboard />
              }
            />

            {/* =================================================
                ADMIN USERS
            ================================================= */}

            <Route
              path="/admin/users"
              element={
                <AdminUsers />
              }
            />

            <Route
              path="/admin/users/:userId"
              element={
                <AdminUserDetails />
              }
            />

            {/* =================================================
                ADMIN EVENTS
            ================================================= */}

            <Route
              path="/admin/events"
              element={
                <ManagementEvents />
              }
            />

            <Route
              path="/admin/events/:id"
              element={
                <ManagementEventDetails />
              }
            />

            {/* =================================================
                SHARED MANAGEMENT BOOKINGS
            ================================================= */}

            <Route
              path="/admin/bookings"
              element={
                <ManagementBookings />
              }
            />

            {/* =================================================
                SHARED BOOKING DETAILS
            ================================================= */}

            <Route
              path="/admin/bookings/:bookingId"
              element={
                <ManagementBookingDetails />
              }
            />

            {/* =================================================
                ADMIN PROFILE
            ================================================= */}

            <Route
              path="/admin/profile"
              element={
                <Profile />
              }
            />

          </Route>

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;