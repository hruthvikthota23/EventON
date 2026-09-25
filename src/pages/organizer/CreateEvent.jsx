import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Image as ImageIcon,
  IndianRupee,
  MapPin,
  Save,
  Ticket,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  createStoredEvent,
} from "../../utils/eventStorage";

// =========================================================
// INITIAL FORM
// =========================================================

const initialForm = {
  title: "",
  category: "Technology",
  description: "",
  date: "",
  time: "",
  endTime: "",
  location: "",
  city: "",
  price: "",
  capacity: "",
  image: "",
  status: "published",
  featured: false,
};

// =========================================================
// EVENT ID
// =========================================================

function generateEventId() {
  return `EVT-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;
}

// =========================================================
// DATE HELPERS
// =========================================================

function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidFutureEventDate(date, time) {
  if (!date) {
    return "Event date is required.";
  }

  const todayString = getTodayString();

  // Never allow a date before today.
  if (date < todayString) {
    return "Event date cannot be in the past.";
  }

  // If the event is today, its start time must still be ahead.
  if (date === todayString) {
    if (!time) {
      return "Start time is required.";
    }

    const [hours, minutes] = time
      .split(":")
      .map(Number);

    const eventStart = new Date();

    eventStart.setHours(
      hours,
      minutes,
      0,
      0
    );

    if (eventStart <= new Date()) {
      return "For today's event, the start time must be in the future.";
    }
  }

  return "";
}

function isValidEndTime(startTime, endTime) {
  if (!startTime || !endTime) {
    return "";
  }

  const [startHours, startMinutes] =
    startTime.split(":").map(Number);

  const [endHours, endMinutes] =
    endTime.split(":").map(Number);

  const startTotal =
    startHours * 60 + startMinutes;

  const endTotal =
    endHours * 60 + endMinutes;

  if (endTotal <= startTotal) {
    return "End time must be after start time.";
  }

  return "";
}

// =========================================================
// MAIN COMPONENT
// =========================================================

function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] =
    useState(initialForm);

  const [errors, setErrors] =
    useState({});

  const [isSaving, setIsSaving] =
    useState(false);

  // =======================================================
  // HANDLE INPUT
  // =======================================================

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  // =======================================================
  // VALIDATION
  // =======================================================

  const validateForm = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title =
        "Event title is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description =
        "Event description is required.";
    }

    if (!form.date) {
      nextErrors.date =
        "Event date is required.";
    }

    if (!form.time) {
      nextErrors.time =
        "Start time is required.";
    }

    // ---------------------------------------------------------
    // EVENT MUST BE IN THE FUTURE
    // ---------------------------------------------------------

    if (form.date && form.time) {
      const dateTimeError =
        isValidFutureEventDate(
          form.date,
          form.time
        );

      if (dateTimeError) {
        if (
          dateTimeError.includes(
            "start time"
          )
        ) {
          nextErrors.time =
            dateTimeError;
        } else {
          nextErrors.date =
            dateTimeError;
        }
      }
    }

    if (!form.location.trim()) {
      nextErrors.location =
        "Event location is required.";
    }

    if (!form.city.trim()) {
      nextErrors.city =
        "City is required.";
    }

    if (!form.capacity) {
      nextErrors.capacity =
        "Ticket capacity is required.";
    } else if (
      Number(form.capacity) <= 0
    ) {
      nextErrors.capacity =
        "Capacity must be greater than 0.";
    }

    if (
      form.price !== "" &&
      Number(form.price) < 0
    ) {
      nextErrors.price =
        "Price cannot be negative.";
    }

    if (form.endTime && form.time) {
      const endTimeError =
        isValidEndTime(
          form.time,
          form.endTime
        );

      if (endTimeError) {
        nextErrors.endTime =
          endTimeError;
      }
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Final guard immediately before creating the event.
    const finalDateError =
      isValidFutureEventDate(
        form.date,
        form.time
      );

    if (finalDateError) {
      setErrors((current) => ({
        ...current,
        ...(finalDateError.includes(
          "start time"
        )
          ? { time: finalDateError }
          : { date: finalDateError }),
      }));

      return;
    }

    const finalEndTimeError =
      isValidEndTime(
        form.time,
        form.endTime
      );

    if (finalEndTimeError) {
      setErrors((current) => ({
        ...current,
        endTime: finalEndTimeError,
      }));

      return;
    }

    if (!user?.id) {
      setErrors({
        form: "You must be logged in as an organizer.",
      });

      return;
    }

    setIsSaving(true);

    const eventData = {
      id: generateEventId(),

      organizerId: user.id,

      organizer:
        user.name || "Event Organizer",

      title: form.title.trim(),

      slug: form.title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),

      category: form.category,

      categorySlug: form.category
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-"),

      description:
        form.description.trim(),

      date: form.date,

      time: form.time,

      endTime:
        form.endTime || "",

      location:
        form.location.trim(),

      city: form.city.trim(),

      price:
        Number(form.price) || 0,

      capacity:
        Number(form.capacity),

      bookedSeats: 0,

      image:
        form.image.trim() || "",

      featured: Boolean(form.featured),

      status: form.status,
    };

    const savedEvent =
      createStoredEvent(eventData);

    setIsSaving(false);

    if (!savedEvent) {
      setErrors({
        form:
          "Unable to create the event. Please try again.",
      });

      return;
    }

    navigate("/organizer/events");
  };

  // =======================================================
  // NOT LOGGED IN
  // =======================================================

  if (!user) {
    return (
      <section className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">
              Organizer login required
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please log in before creating an
              event.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <section className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <Link
            to="/organizer/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to My Events
          </Link>

          <div className="mt-5">
            <p className="text-sm font-semibold text-orange-500">
              Event Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Create Event
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add the details below to create your
              event.
            </p>
          </div>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* =================================================
              GENERAL INFORMATION
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="font-bold text-slate-900">
                General Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Basic information attendees will see.
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:p-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Event title
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. React Developer Meetup"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                    errors.title
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                />

                {errors.title && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="Technology">
                    Technology
                  </option>

                  <option value="Business">
                    Business
                  </option>

                  <option value="Music">
                    Music
                  </option>

                  <option value="Sports">
                    Sports
                  </option>

                  <option value="Education">
                    Education
                  </option>

                  <option value="Arts">
                    Arts
                  </option>

                  <option value="Entertainment">
                    Entertainment
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe what attendees can expect from this event..."
                  className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                    errors.description
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                />

                <div className="mt-1.5 flex justify-between">
                  {errors.description ? (
                    <p className="text-xs text-red-600">
                      {errors.description}
                    </p>
                  ) : (
                    <span />
                  )}

                  <span className="text-xs text-slate-400">
                    {form.description.length}
                    /1000
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              DATE & TIME
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="font-bold text-slate-900">
                Date & Time
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Set when your event will take place.
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-3 sm:p-6">
              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Date
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    min={getTodayString()}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none focus:ring-2 ${
                      errors.date
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                </div>

                {errors.date ? (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.date}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Choose today or a future date.
                  </p>
                )}
              </div>

              {/* Start */}
              <div>
                <label
                  htmlFor="time"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Start time
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <div className="relative">
                  <Clock3
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none focus:ring-2 ${
                      errors.time
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                </div>

                {errors.time && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.time}
                  </p>
                )}
              </div>

              {/* End */}
              <div>
                <label
                  htmlFor="endTime"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  End time
                </label>

                <div className="relative">
                  <Clock3
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none focus:ring-2 ${
                      errors.endTime
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                </div>

                {errors.endTime && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.endTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              LOCATION
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="font-bold text-slate-900">
                Location
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Tell attendees where the event will
                happen.
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Venue / Location
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <div className="relative">
                  <MapPin
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. HITEC City, Hyderabad"
                    className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:ring-2 ${
                      errors.location
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                </div>

                {errors.location && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.location}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  City
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 ${
                    errors.city
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                />

                {errors.city && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.city}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              TICKETS
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="font-bold text-slate-900">
                Tickets
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Configure your event capacity and
                ticket price.
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              {/* Capacity */}
              <div>
                <label
                  htmlFor="capacity"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Ticket capacity
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <div className="relative">
                  <Users
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:ring-2 ${
                      errors.capacity
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                </div>

                {errors.capacity && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.capacity}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Ticket price
                </label>

                <div className="relative">
                  <IndianRupee
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0 for free event"
                    className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:ring-2 ${
                      errors.price
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                </div>

                {errors.price ? (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.price}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Enter 0 to make the event free.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              EVENT IMAGE
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="font-bold text-slate-900">
                Event Image
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Add a public image URL for your event.
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <label
                htmlFor="image"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Image URL
              </label>

              <div className="relative">
                <ImageIcon
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="image"
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/event-image.jpg"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {form.image && (
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={form.image}
                    alt="Event preview"
                    className="h-48 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              PUBLISHING
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="font-bold text-slate-900">
                Publishing
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Choose how your event should appear.
              </p>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Event status
                </label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:max-w-sm"
                >
                  <option value="published">
                    Published
                  </option>

                  <option value="draft">
                    Draft
                  </option>
                </select>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 accent-orange-500"
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Feature this event
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Mark this event as featured for
                    future featured-event sections.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {errors.form && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errors.form}
            </div>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/organizer/events"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default CreateEvent;