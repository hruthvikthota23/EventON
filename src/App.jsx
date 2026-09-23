import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import Home from "./pages/public/Home";
import Events from "./pages/public/Events";
import EventDetails from "./pages/public/EventDetails";
import Booking from "./pages/public/Booking";
import BookingConfirmation from "./pages/public/BookingConfirmation";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================================================
            PUBLIC WEBSITE
        ================================================= */}

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/events/:id"
            element={<EventDetails />}
          />

          <Route
            path="/events/:id/book"
            element={<Booking />}
          />

          <Route
            path="/booking-confirmation"
            element={<BookingConfirmation />}
          />
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