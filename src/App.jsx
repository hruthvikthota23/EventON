import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import Home from "./pages/public/Home";
import Events from "./pages/public/Events";
import EventDetails from "./pages/public/EventDetails";
import Booking from "./pages/public/Booking";
import BookingConfirmation from "./pages/public/BookingConfirmation";
import MyBookings from "./pages/attendee/MyBookings";
import BookingDetails from "./pages/attendee/BookingDetails";
import Profile from "./pages/attendee/Profile";
import EditProfile from "./pages/attendee/EditProfile";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ================================================
            PUBLIC WEBSITE
        ================================================= */}

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/:id/book" element={<Booking />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/bookings/:bookingId" element={<BookingDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
        </Route>


        {/* ================================================
            AUTHENTICATION
        ================================================= */}

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;