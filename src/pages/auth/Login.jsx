import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const registeredMessage = location.state?.message;

  // ---------------------------------------------------------
  // CLEAR ROUTER STATE
  // ---------------------------------------------------------

  useEffect(() => {
    if (location.state) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, [location.state]);

  // ---------------------------------------------------------
  // INPUT CHANGE
  // ---------------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ---------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const email = formData.email.trim();

    const name =
      email
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
      "EventON User";

    login({
      name,
      email,
    });

    navigate("/", {
      replace: true,
    });
  };

  return (
    <main className="h-full overflow-hidden bg-slate-50">
      <div className="grid h-full lg:grid-cols-2">
        {/* =================================================
            LEFT PANEL
        ================================================== */}

        <section className="relative hidden h-full overflow-hidden bg-[#070b14] lg:flex">
          <div className="absolute -right-32 top-10 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full items-center px-12 xl:px-16">
            <div className="max-w-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white shadow-lg shadow-orange-500/20">
                E
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                Welcome back
              </p>

              <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Pick up where
                <br />
                you left off.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
                Sign in to manage your bookings, discover
                upcoming events, and keep everything in one
                place.
              </p>

              <div className="mt-7 space-y-3">
                {[
                  "Manage your upcoming bookings",
                  "Discover new experiences",
                  "Keep your event plans organized",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-400">
                      <Check
                        size={12}
                        strokeWidth={3}
                      />
                    </span>

                    <span className="text-sm text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            RIGHT PANEL
        ================================================== */}

        <section className="flex h-full items-center justify-center overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Header */}

            <div className="mb-6">
              <p className="text-xs font-semibold text-orange-500">
                Welcome back
              </p>

              <h2 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">
                Sign in to EventON
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Enter your account details to continue.
              </p>
            </div>

            {/* Success message */}

            {registeredMessage && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5">
                <p className="text-xs font-medium text-green-700">
                  {registeredMessage}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              {/* Email */}

              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`h-11 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="login-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`h-11 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.password
                        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}

              <button
                type="submit"
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
              >
                Sign in

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Create account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;