import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Image as ImageIcon,
  IndianRupee,
  MapPin,
  Save,
  Users,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getStoredEventById,
  updateStoredEvent,
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
// FORM DATE HELPERS
// =========================================================

function normalizeDateForInput(value) {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =========================================================
// EDIT EVENT DATE/TIME HELPERS
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

function parseTimeToMinutes(value) {
  if (!value) {
    return null;
  }

  const match = String(value)
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    minutes > 59 ||
    hours < 1 ||
    hours > 12
  ) {
    return null;
  }

  if (period === "AM") {
    if (hours === 12) hours = 0;
  } else if (hours !== 12) {
    hours += 12;
  }

  return hours * 60 + minutes;
}

function getTimeMinutes(value) {
  if (!value) return null;

  if (/AM|PM/i.test(String(value))) {
    return parseTimeToMinutes(value);
  }

  const match = String(value)
    .trim()
    .match(/^(\d{2}):(\d{2})$/);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    hours > 23 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

// =========================================================
// MAIN
// =========================================================

function EditEvent() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  // =======================================================
  // LOAD EVENT
  // =======================================================

  const loadEvent = useCallback(() => {
    if (!id || !user?.id) {
      setEvent(null);
      setLoading(false);
      return;
    }

    const storedEvent =
      getStoredEventById(id);

    if (!storedEvent) {
      setEvent(null);
      setLoading(false);
      return;
    }

    // Organizer ownership check
    if (
      String(storedEvent.organizerId) !==
      String(user.id)
    ) {
      setEvent(null);
      setLoading(false);
      return;
    }

    setEvent(storedEvent);

    setForm({
      title: storedEvent.title || "",

      category:
        storedEvent.category ||
        "Technology",

      description:
        storedEvent.description || "",

      date: normalizeDateForInput(
        storedEvent.date
      ),

      time: storedEvent.time || "",

      endTime:
        storedEvent.endTime || "",

      location:
        storedEvent.location || "",

      city: storedEvent.city || "",

      price:
        storedEvent.price !== undefined &&
        storedEvent.price !== null
          ? String(storedEvent.price)
          : "",

      capacity:
        storedEvent.capacity !== undefined &&
        storedEvent.capacity !== null
          ? String(storedEvent.capacity)
          : "",

      image:
        storedEvent.image || "",

      status:
        storedEvent.status ||
        "published",

      featured:
        Boolean(storedEvent.featured),
    });

    setLoading(false);
  }, [id, user?.id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  // =======================================================
  // INPUT HANDLER
  // =======================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

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
      form: "",
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

    // Event date cannot be in the past.
    // If the event is today, its start time must
    // still be in the future.
    if (form.date) {
      const today = getTodayString();

      if (form.date < today) {
        nextErrors.date =
          "Event date cannot be in the past.";
      } else if (
        form.date === today &&
        form.time
      ) {
        const startMinutes =
          getTimeMinutes(form.time);

        const now = new Date();

        const currentMinutes =
          now.getHours() * 60 +
          now.getMinutes();

        if (
          startMinutes !== null &&
          startMinutes <= currentMinutes
        ) {
          nextErrors.time =
            "Start time must be later than the current time.";
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

    if (
      form.endTime &&
      form.time
    ) {
      const startMinutes =
        getTimeMinutes(form.time);

      const endMinutes =
        getTimeMinutes(form.endTime);

      if (
        startMinutes !== null &&
        endMinutes !== null &&
        endMinutes <= startMinutes
      ) {
        nextErrors.endTime =
          "End time must be after start time.";
      }
    }

    // Do not allow capacity below already sold tickets.
    if (
      event &&
      Number(form.capacity) <
        Number(event.bookedSeats || 0)
    ) {
      nextErrors.capacity = `Capacity cannot be lower than the ${event.bookedSeats} tickets already sold.`;
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = (submitEvent) => {
    submitEvent.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!event || !user?.id) {
      setErrors({
        form:
          "Unable to update this event.",
      });

      return;
    }

    // Final same-day guard immediately before persistence.
    if (form.date === getTodayString()) {
      const startMinutes =
        getTimeMinutes(form.time);

      const now = new Date();

      const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

      if (
        startMinutes !== null &&
        startMinutes <= currentMinutes
      ) {
        setErrors({
          time:
            "Start time must be later than the current time.",
        });

        return;
      }
    }

    setIsSaving(true);

    const updates = {
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

      city:
        form.city.trim(),

      price:
        Number(form.price) || 0,

      capacity:
        Number(form.capacity),

      image:
        form.image.trim() || "",

      status: form.status,

      featured:
        Boolean(form.featured),

      // Deliberately NOT changing:
      // id
      // organizerId
      // bookedSeats
    };

    const updatedEvents =
      updateStoredEvent(
        event.id,
        updates
      );

    setIsSaving(false);

    if (!Array.isArray(updatedEvents)) {
      setErrors({
        form:
          "Unable to update the event. Please try again.",
      });

      return;
    }

    navigate(
      `/organizer/events/${event.id}`
    );
  };

  // =======================================================
  // NOT LOGGED IN
  // =======================================================

  if (!user) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Organizer login required
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please log in to edit events.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <section className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-6 h-96 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </section>
    );
  }

  // =======================================================
  // NOT FOUND / NOT OWNER
  // =======================================================

  if (!event) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-5">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <CalendarDays size={25} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Event not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This event does not exist or you do
            not have permission to edit it.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/organizer/events")
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <ArrowLeft size={17} />
            Back to My Events
          </button>
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
            to={`/organizer/events/${event.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to Event
          </Link>

          <div className="mt-5">
            <p className="text-sm font-semibold text-orange-500">
              Event Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Edit Event
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Update the details of{" "}
              <span className="font-semibold text-slate-700">
                {event.title}
              </span>
              .
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
              GENERAL
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="font-bold text-slate-900">
                General Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Update the basic event information.
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
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 ${
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
                  className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:ring-2 ${
                    errors.description
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                />

                {errors.description && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.description}
                  </p>
                )}
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
                min={getTodayString()}
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none focus:ring-2 ${
                      errors.date
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                </div>

                {errors.date && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.date}
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
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
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
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
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
                    min={event.bookedSeats || 1}
                    value={form.capacity}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:ring-2 ${
                      errors.capacity
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Current tickets sold:{" "}
                  {Number(
                    event.bookedSeats || 0
                  )}
                </p>

                {errors.capacity && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.capacity}
                  </p>
                )}
              </div>

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
                    className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:ring-2 ${
                      errors.price
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                    }`}
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Use 0 for a free event.
                </p>

                {errors.price && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.price}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              IMAGE
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="font-bold text-slate-900">
                Event Image
              </h2>
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
                    onError={(imageEvent) => {
                      imageEvent.currentTarget.style.display =
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

                  <option value="cancelled">
                    Cancelled
                  </option>

                  <option value="completed">
                    Completed
                  </option>
                </select>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
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
                    Keep this event marked as
                    featured.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* =================================================
              EXISTING BOOKING WARNING
          ================================================= */}

          {Number(event.bookedSeats || 0) >
            0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <Ticket
                  size={19}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    This event already has bookings
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    {event.bookedSeats} ticket
                    {event.bookedSeats !== 1
                      ? "s"
                      : ""}{" "}
                    have already been booked.
                    The existing booking count will
                    not be changed when you edit the
                    event.
                  </p>
                </div>
              </div>
            </div>
          )}

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

          <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
            <Link
              to={`/organizer/events/${event.id}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default EditEvent;