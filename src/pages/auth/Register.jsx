import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Register() {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

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

    if (!formData.name.trim()) {
      newErrors.name =
        "Please enter your full name.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name =
        "Name must contain at least 2 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Please enter your email address.";
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
        "Please create a password.";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (
      formData.password !==
      formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
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

    setIsSubmitting(true);

    try {
      const result = register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // -----------------------------------------------------
      // REGISTRATION FAILED
      // -----------------------------------------------------

      if (!result.success) {
        setErrors({
          form: result.error,
        });

        setIsSubmitting(false);

        return;
      }

      // -----------------------------------------------------
      // REGISTRATION SUCCESSFUL
      // -----------------------------------------------------

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Registration failed:",
        error
      );

      setErrors({
        form:
          "Unable to create your account right now. Please try again.",
      });

      setIsSubmitting(false);
    }
  };

  return (
    <main className="h-full overflow-hidden bg-slate-50">
      <div className="grid h-full lg:grid-cols-2">

        {/* =================================================
            LEFT PANEL
        ================================================== */}

        <section className="relative hidden h-full overflow-hidden bg-[#070b14] lg:flex">

          <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full items-center px-12 xl:px-16">

            <div className="max-w-lg">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white shadow-lg shadow-orange-500/20">
                E
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                Welcome to EventON
              </p>

              <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Your next experience
                <br />
                starts here.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
                Create your EventON account and discover
                events, book experiences, and keep your
                upcoming plans organized in one place.
              </p>

              <div className="mt-7 space-y-3">

                {[
                  "Discover events that match your interests",
                  "Book tickets in just a few steps",
                  "Keep your bookings organized",
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

        <section className="flex h-full items-center justify-center overflow-hidden px-5 py-4 sm:px-8 lg:px-12">

          <div className="w-full max-w-md">

            {/* Header */}

            <div className="mb-4">

              <p className="text-xs font-semibold text-orange-500">
                Create your account
              </p>

              <h2 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">
                Get started with EventON
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Create an account to book and manage your
                event experiences.
              </p>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-3"
            >

              {/* General Error */}

              {errors.form && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {errors.form}
                </div>
              )}

              {/* NAME */}

              <div>

                <label
                  htmlFor="register-name"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>

                <div className="relative">

                  <User
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className={`h-10.5 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.name
                        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    }`}
                  />

                </div>

                {errors.name && (
                  <p className="mt-0.5 text-[11px] text-red-500">
                    {errors.name}
                  </p>
                )}

              </div>

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="register-email"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`h-10.5 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    }`}
                  />

                </div>

                {errors.email && (
                  <p className="mt-0.5 text-[11px] text-red-500">
                    {errors.email}
                  </p>
                )}

              </div>

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="register-password"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className={`h-10.5 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
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
                  <p className="mt-0.5 text-[11px] text-red-500">
                    {errors.password}
                  </p>
                )}

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="register-confirm-password"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className={`h-10.5 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

                {errors.confirmPassword && (
                  <p className="mt-0.5 text-[11px] text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Creating account..."
                  : "Create account"}

                {!isSubmitting && (
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </button>

            </form>

            {/* LOGIN LINK */}

            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Sign in
              </Link>
            </p>

            {/* Terms */}

            <p className="mt-3 text-center text-[11px] leading-4 text-slate-400">
              By creating an account, you agree to EventON's
              terms and privacy policy.
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;