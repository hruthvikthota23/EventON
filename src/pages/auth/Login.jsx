import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // ---------------------------------------------------------
  // INPUT CHANGE
  // ---------------------------------------------------------

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      form: "",
    }));
  };

  // ---------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email =
        "Please enter your email.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password =
        "Please enter your password.";
    } else if (
      formData.password.length < 6
    ) {
      newErrors.password =
        "Password must be at least 6 characters.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------

  const handleSubmit = (event) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const email =
        formData.email.trim();

      /*
       * Frontend-only authentication for now.
       *
       * The actual password is not being verified
       * against a backend yet.
       */
      login({
        name:
          email
            .split("@")[0]
            .replace(/[._-]/g, " "),
        email,
      });

      /*
       * IMPORTANT:
       *
       * If the user came from a protected page,
       * return them there.
       *
       * Example:
       * /events/1/book
       *
       * Otherwise go to home.
       */
      const destination =
        location.state?.from || "/";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      setErrors({
        form:
          "Unable to login right now. Please try again.",
      });

      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-slate-50">

      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <section className="hidden flex-1 items-center justify-center bg-slate-900 px-10 lg:flex">
        <div className="max-w-md">

          <Link
            to="/"
            className="inline-flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg">
              <span className="text-lg font-bold">
                E
              </span>
            </div>

            <div className="text-2xl font-bold tracking-tight text-white">
              Event
              <span className="text-orange-500">
                ON
              </span>
            </div>
          </Link>

          <div className="mt-14">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-400">
              Welcome back
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight text-white">
              Discover events.
              <br />
              Create memories.
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-400">
              Sign in to manage your bookings,
              discover upcoming events and keep
              everything in one place.
            </p>
          </div>

        </div>
      </section>

      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <section className="flex min-w-0 flex-1 items-center justify-center overflow-y-auto px-5 py-8 sm:px-8 lg:max-w-xl">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}

          <div className="mb-8 lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                <span className="font-bold">
                  E
                </span>
              </div>

              <div className="text-xl font-bold tracking-tight text-slate-900">
                Event
                <span className="text-orange-500">
                  ON
                </span>
              </div>
            </Link>
          </div>

          {/* Heading */}

          <div>
            <p className="text-sm font-semibold text-orange-500">
              Welcome back
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Sign in to EventON
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your details to continue.
            </p>
          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            {/* General Error */}

            {errors.form && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errors.form}
              </div>
            )}

            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    errors.email
                      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                />
              </div>

              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-semibold text-orange-500 transition hover:text-orange-600"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    errors.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Signing in..."
                : "Sign in"}

              {!isSubmitting && (
                <ArrowRight size={17} />
              )}
            </button>

          </form>

          {/* Register */}

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              state={location.state}
              className="font-semibold text-orange-500 transition hover:text-orange-600"
            >
              Create account
            </Link>
          </p>

          {/* Back Home */}

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs font-medium text-slate-400 transition hover:text-slate-600"
            >
              ← Back to home
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Login;