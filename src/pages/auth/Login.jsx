import { useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
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
    role: "attendee",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      form: "",
    }));
  };

  // ---------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(
        formData.email.trim()
      )
    ) {
      newErrors.email =
        "Please enter a valid Gmail address ending with @gmail.com.";
    }

    if (!formData.password) {
      newErrors.password =
        "Please enter your password.";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
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
      const email = formData.email
        .trim()
        .toLowerCase();

      const result = login({
        email,
        password: formData.password,
        role: formData.role,
      });

      // -----------------------------------------------------
      // LOGIN FAILED
      // -----------------------------------------------------

      if (!result.success) {
        setErrors({
          form: result.error,
        });

        setIsSubmitting(false);

        return;
      }

      // -----------------------------------------------------
      // LOGIN SUCCESSFUL
      // -----------------------------------------------------

      const loggedInRole = String(
        result.user?.role || "attendee"
      )
        .trim()
        .toLowerCase();

      const requestedDestination =
        location.state?.from;

      const isOrganizerDestination =
        typeof requestedDestination === "string" &&
        (
          requestedDestination === "/organizer" ||
          requestedDestination.startsWith(
            "/organizer/"
          )
        );

      let destination = "/";

      if (loggedInRole === "organizer") {
        destination = "/";
      } else if (
        requestedDestination &&
        !isOrganizerDestination &&
        typeof requestedDestination === "string"
      ) {
        destination = requestedDestination;
      }

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
    <main className="h-full min-h-0 overflow-hidden bg-slate-50">

      <div className="grid h-full min-h-0 lg:grid-cols-2">

        {/* =====================================================
            LEFT PANEL
        ====================================================== */}

        <section className="relative hidden min-h-0 overflow-hidden bg-[#070b14] lg:flex">

          {/* Background glow */}

          <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

          {/* Content */}

          <div className="relative z-10 flex w-full items-center px-10 xl:px-14">

            <div className="max-w-lg">

              {/* Small heading */}

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                Welcome back
              </p>

              {/* Main heading */}

              <h1 className="mt-3 text-4xl font-bold leading-[1.08] tracking-tight text-white xl:text-[46px]">
                Discover events.
                <br />
                Create memories.
              </h1>

              {/* Description */}

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
                Sign in to manage your bookings,
                discover upcoming events, and keep
                everything in one place.
              </p>

              {/* Features */}

              <div className="mt-7 space-y-3">

                {[
                  "Manage all your bookings easily",
                  "Discover upcoming events",
                  "Keep everything organized in one place",
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

        {/* =====================================================
            RIGHT PANEL
        ====================================================== */}

        <section className="flex min-h-0 min-w-0 items-center justify-center overflow-hidden px-5 py-5 sm:px-8 lg:px-10">

          <div className="w-full max-w-[450px]">

            {/* =================================================
                MOBILE LOGO
            ================================================= */}

            <div className="mb-6 lg:hidden">

              <Link
                to="/"
                className="inline-flex h-10 shrink-0 items-center gap-3"
                aria-label="Go to EventON home"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
                  <span className="text-sm font-bold">
                    E
                  </span>
                </span>

                <span className="whitespace-nowrap text-[22px] font-bold leading-10 tracking-tight text-slate-900">
                  Event
                  <span className="text-orange-500">
                    ON
                  </span>
                </span>
              </Link>

            </div>

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-5">

              <p className="text-[11px] font-semibold text-orange-500">
                Welcome back
              </p>

              <h2 className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-slate-900">
                Sign in to EventON
              </h2>

              <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
                Enter your details to continue.
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >

              {/* FORM ERROR */}

              {errors.form && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium leading-5 text-red-600">
                  {errors.form}
                </div>
              )}

              {/* =================================================
                  ACCOUNT TYPE
              ================================================= */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Login as
                </label>

                <div className="grid grid-cols-2 gap-2.5">

                  {/* ATTENDEE */}

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        role: "attendee",
                      }))
                    }
                    className={`rounded-xl border p-2.5 text-left transition ${
                      formData.role === "attendee"
                        ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >

                    <div className="flex items-center gap-2.5">

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                          formData.role === "attendee"
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        👤
                      </span>

                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Attendee
                        </p>

                        <p className="text-[10px] text-slate-500">
                          Book events
                        </p>
                      </div>

                    </div>

                  </button>

                  {/* ORGANIZER */}

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        role: "organizer",
                      }))
                    }
                    className={`rounded-xl border p-2.5 text-left transition ${
                      formData.role === "organizer"
                        ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >

                    <div className="flex items-center gap-2.5">

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                          formData.role === "organizer"
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        🏢
                      </span>

                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Organizer
                        </p>

                        <p className="text-[10px] text-slate-500">
                          Manage events
                        </p>
                      </div>

                    </div>

                  </button>

                </div>

              </div>

              {/* =================================================
                  EMAIL
              ================================================= */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@gmail.com"
                    className={`h-11 w-full rounded-xl border bg-white pl-10 pr-3.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    }`}
                  />

                </div>

                {errors.email && (
                  <p className="mt-1 text-[10px] font-medium text-red-500">
                    {errors.email}
                  </p>
                )}

              </div>

              {/* =================================================
                  PASSWORD
              ================================================= */}

              <div>

                <div className="mb-1.5 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-[10px] font-semibold text-orange-500 transition hover:text-orange-600"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <LockKeyhole
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                    className={`h-11 w-full rounded-xl border bg-white pl-10 pr-11 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 ${
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                </div>

                {errors.password && (
                  <p className="mt-1 text-[10px] font-medium text-red-500">
                    {errors.password}
                  </p>
                )}

              </div>

              {/* =================================================
                  SIGN IN
              ================================================= */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Signing in..."
                  : "Sign in"}

                {!isSubmitting && (
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </button>

            </form>

            {/* =================================================
                REGISTER
            ================================================= */}

            <p className="mt-4 text-center text-xs text-slate-500">

              Don't have an account?{" "}

              <Link
                to="/register"
                state={location.state}
                className="font-semibold text-orange-600 transition hover:text-orange-700"
              >
                Create account
              </Link>

            </p>

            {/* =================================================
                RETURN HOME
            ================================================= */}

            <div className="mt-2 flex justify-center">

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-semibold text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-orange-500"
              >
                Return to EventON
              </Link>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Login;