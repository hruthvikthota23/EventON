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
  Building2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [role, setRole] = useState("attendee");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================================
  // INPUT CHANGE
  // =========================================================

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

  // =========================================================
  // ROLE CHANGE
  // =========================================================

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);

    setErrors((previous) => ({
      ...previous,
      role: "",
      form: "",
    }));
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    // Full name
    if (!formData.name.trim()) {
      newErrors.name =
        "Please enter your full name.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name =
        "Name must contain at least 2 characters.";
    }

    // Gmail
    const email =
      formData.email.trim().toLowerCase();

    if (!email) {
      newErrors.email =
        "Please enter your Gmail address.";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(
        email
      )
    ) {
      newErrors.email =
        "Please enter a valid Gmail address ending with @gmail.com.";
    }

    // Password
    if (!formData.password) {
      newErrors.password =
        "Please create a password.";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    }

    // Confirm password
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

    // Role
    if (
      !["attendee", "organizer"].includes(role)
    ) {
      newErrors.role =
        "Please select an account type.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail =
      formData.email.trim().toLowerCase();

    const isValidGmail =
      /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(
        normalizedEmail
      );

    if (!validateForm()) {
      return;
    }

    if (!isValidGmail) {
      setErrors((previous) => ({
        ...previous,
        email:
          "Please enter a valid Gmail address ending with @gmail.com.",
      }));

      setIsSubmitting(false);

      return;
    }

    setIsSubmitting(true);

    try {
      const result = register({
        name: formData.name.trim(),
        email: normalizedEmail,
        password: formData.password,
        role,
      });

      if (!result?.success) {
        setErrors({
          form:
            result?.error ||
            "Unable to create your account.",
        });

        setIsSubmitting(false);

        return;
      }

      const registeredRole =
        result.user?.role || role;

      navigate(
        registeredRole === "organizer"
          ? "/organizer"
          : "/",
        {
          replace: true,
        }
      );
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

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="h-full min-h-0 overflow-hidden bg-slate-50">

      <div className="grid h-full min-h-0 overflow-hidden lg:grid-cols-2">

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
                Welcome to EventON
              </p>

              {/* Main heading */}

              <h1 className="mt-2 text-4xl font-bold leading-[1.08] tracking-tight text-white xl:text-[46px]">
                Your next experience
                <br />
                starts here.
              </h1>

              {/* Description */}

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
                Create your EventON account and discover
                events, book experiences, and keep your
                upcoming plans organized in one place.
              </p>

              {/* Features */}

              <div className="mt-6 space-y-2.5">

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

        {/* =====================================================
            RIGHT PANEL
        ====================================================== */}

        <section className="flex min-h-0 min-w-0 items-center justify-center overflow-hidden px-5 py-4 sm:px-8 lg:px-10 lg:py-5">

          <div className="w-full max-w-[450px]">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-3">

              <p className="text-[11px] font-semibold text-orange-500">
                Create your account
              </p>

              <h2 className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-slate-900">
                Get started with EventON
              </h2>

              <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
                Create an account to book, manage, or organize events.
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-2.5"
            >

              {/* FORM ERROR */}

              {errors.form && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium leading-4 text-red-600">
                  {errors.form}
                </div>
              )}

              {/* =================================================
                  ACCOUNT TYPE
              ================================================= */}

              <div>

                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Account type
                </label>

                <div className="grid grid-cols-2 gap-2.5">

                  {/* ATTENDEE */}

                  <button
                    type="button"
                    onClick={() =>
                      handleRoleChange("attendee")
                    }
                    className={`rounded-xl border p-2.5 text-left transition ${
                      role === "attendee"
                        ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >

                    <div className="flex items-center gap-2.5">

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          role === "attendee"
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <User size={16} />
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
                      handleRoleChange("organizer")
                    }
                    className={`rounded-xl border p-2.5 text-left transition ${
                      role === "organizer"
                        ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >

                    <div className="flex items-center gap-2.5">

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          role === "organizer"
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Building2 size={16} />
                      </span>

                      <div>

                        <p className="text-xs font-bold text-slate-900">
                          Organizer
                        </p>

                        <p className="text-[10px] text-slate-500">
                          Create events
                        </p>

                      </div>

                    </div>

                  </button>

                </div>

                {errors.role && (
                  <p className="mt-0.5 text-[10px] text-red-500">
                    {errors.role}
                  </p>
                )}

              </div>

              {/* =================================================
                  NAME
              ================================================= */}

              <div>

                <label
                  htmlFor="register-name"
                  className="mb-1 block text-xs font-semibold text-slate-700"
                >
                  Full name
                </label>

                <div className="relative">

                  <User
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className={`h-10 w-full rounded-xl border bg-white pl-10 pr-3.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.name
                        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    }`}
                  />

                </div>

                {errors.name && (
                  <p className="mt-0.5 text-[10px] text-red-500">
                    {errors.name}
                  </p>
                )}

              </div>

              {/* =================================================
                  EMAIL
              ================================================= */}

              <div>

                <label
                  htmlFor="register-email"
                  className="mb-1 block text-xs font-semibold text-slate-700"
                >
                  Gmail address
                </label>

                <div className="relative">

                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => {
                      const email =
                        formData.email
                          .trim()
                          .toLowerCase();

                      if (
                        email &&
                        !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(
                          email
                        )
                      ) {
                        setErrors((previous) => ({
                          ...previous,
                          email:
                            "Please enter a valid Gmail address ending with @gmail.com.",
                        }));
                      }
                    }}
                    placeholder="you@gmail.com"
                    autoComplete="email"
                    inputMode="email"
                    className={`h-10 w-full rounded-xl border bg-white pl-10 pr-3.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    }`}
                  />

                </div>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Only Gmail addresses ending in @gmail.com are accepted.
                </p>

                {errors.email && (
                  <p className="mt-0.5 text-[10px] text-red-500">
                    {errors.email}
                  </p>
                )}

              </div>

              {/* =================================================
                  PASSWORD
              ================================================= */}

              <div>

                <label
                  htmlFor="register-password"
                  className="mb-1 block text-xs font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                    className={`h-10 w-full rounded-xl border bg-white pl-10 pr-11 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 ${
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                </div>

                {errors.password && (
                  <p className="mt-0.5 text-[10px] text-red-500">
                    {errors.password}
                  </p>
                )}

              </div>

              {/* =================================================
                  CONFIRM PASSWORD
              ================================================= */}

              <div>

                <label
                  htmlFor="register-confirm-password"
                  className="mb-1 block text-xs font-semibold text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                    className={`h-10 w-full rounded-xl border bg-white pl-10 pr-11 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 ${
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                </div>

                {errors.confirmPassword && (
                  <p className="mt-0.5 text-[10px] text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}

              </div>

              {/* =================================================
                  CREATE ACCOUNT
              ================================================= */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Creating account..."
                  : "Create account"}

                {!isSubmitting && (
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </button>

            </form>

            {/* =================================================
                LOGIN
            ================================================= */}

            <p className="mt-3 text-center text-xs text-slate-500">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Sign in
              </Link>

            </p>

            {/* =================================================
                TERMS
            ================================================= */}

            <p className="mt-2 pb-1 text-center text-[9px] leading-4 text-slate-400">
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