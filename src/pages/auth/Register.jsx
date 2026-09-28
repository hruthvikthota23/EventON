import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  User,
  Building2,
  CircleCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const GMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

function Register() {
  const navigate = useNavigate();

  const {
    register,
    checkRegistrationDetails,
  } = useAuth();

  const [step, setStep] = useState(1);

  const [role, setRole] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

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
  // MOBILE CHANGE
  // =========================================================

  const handleMobileChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setFormData((previous) => ({
      ...previous,
      mobile: value,
    }));

    setErrors((previous) => ({
      ...previous,
      mobile: "",
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
  // STEP NAVIGATION
  // =========================================================

  const handleContinue = () => {
    // =======================================================
    // STEP 1
    // =======================================================

    if (step === 1) {
      if (
        !["attendee", "organizer"].includes(
          role
        )
      ) {
        setErrors((previous) => ({
          ...previous,
          role: "Please select an account type.",
        }));

        return;
      }

      setErrors({});

      setStep(2);

      return;
    }

    // =======================================================
    // STEP 2
    // =======================================================

    if (step === 2) {
      const newErrors = {};

      const name =
        formData.name.trim();

      const mobile =
        formData.mobile.trim();

      const email =
        formData.email
          .trim()
          .toLowerCase();

      // Full name
      if (!name) {
        newErrors.name =
          "Please enter your full name.";
      } else if (name.length < 2) {
        newErrors.name =
          "Name must contain at least 2 characters.";
      }

      // Mobile
      if (!mobile) {
        newErrors.mobile =
          "Please enter your mobile number.";
      } else if (
        !/^[6-9]\d{9}$/.test(mobile)
      ) {
        newErrors.mobile =
          "Please enter a valid 10-digit Indian mobile number.";
      }

      // Gmail
      if (!email) {
        newErrors.email =
          "Please enter your Gmail address.";
      } else if (!GMAIL_REGEX.test(email)) {
        newErrors.email =
          "Please enter a valid Gmail address ending with @gmail.com.";
      }

      // Stop if basic validation fails
      if (Object.keys(newErrors).length) {
        setErrors(newErrors);

        return;
      }

      // =====================================================
      // CHECK EMAIL + MOBILE AVAILABILITY
      // =====================================================

      const availability =
        checkRegistrationDetails({
          email,
          mobile,
        });

      if (!availability.success) {
        /*
          IMPORTANT:

          AuthContext now returns:

          {
            success: false,
            fields: {
              email: "...",
              mobile: "..."
            }
          }

          We only display the error under
          the corresponding field.
        */

        setErrors({
          ...(availability.fields || {}),
        });

        return;
      }

      // Details are valid and available
      setErrors({});

      setStep(3);
    }
  };

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    setErrors({});

    setStep((previous) =>
      previous === 3
        ? 2
        : 1
    );
  };

  // =========================================================
  // FINAL VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    const name =
      formData.name.trim();

    const mobile =
      formData.mobile.trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();

    // -------------------------------------------------------
    // FULL NAME
    // -------------------------------------------------------

    if (!name) {
      newErrors.name =
        "Please enter your full name.";
    } else if (name.length < 2) {
      newErrors.name =
        "Name must contain at least 2 characters.";
    }

    // -------------------------------------------------------
    // MOBILE
    // -------------------------------------------------------

    if (!mobile) {
      newErrors.mobile =
        "Please enter your mobile number.";
    } else if (
      !/^[6-9]\d{9}$/.test(mobile)
    ) {
      newErrors.mobile =
        "Please enter a valid 10-digit Indian mobile number.";
    }

    // -------------------------------------------------------
    // GMAIL
    // -------------------------------------------------------

    if (!email) {
      newErrors.email =
        "Please enter your Gmail address.";
    } else if (
      !GMAIL_REGEX.test(email)
    ) {
      newErrors.email =
        "Please enter a valid Gmail address ending with @gmail.com.";
    }

    // -------------------------------------------------------
    // PASSWORD
    // -------------------------------------------------------

    if (!formData.password) {
      newErrors.password =
        "Please create a password.";
    } else if (
      formData.password.length < 8
    ) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    }

    // -------------------------------------------------------
    // CONFIRM PASSWORD
    // -------------------------------------------------------

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

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const normalizedEmail =
      formData.email
        .trim()
        .toLowerCase();

    try {
      const result = register({
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: normalizedEmail,
        password: formData.password,
        role,
      });

      // =====================================================
      // REGISTRATION FAILED
      // =====================================================

      if (!result?.success) {
        /*
          AuthContext can return:

          fields:
          {
            name,
            mobile,
            email,
            password
          }

          or a general error.

          Field errors are displayed under
          their corresponding inputs.
        */

        setErrors(
          result?.fields || {
            form:
              result?.error ||
              "Unable to create your account.",
          }
        );

        setIsSubmitting(false);

        return;
      }

      // =====================================================
      // REGISTRATION SUCCESS
      // =====================================================

      const registeredRole =
        result.user?.role || role;

      navigate(
        registeredRole ===
          "organizer"
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
    <main className="h-[calc(100dvh-60px)] min-h-0 max-h-[calc(100dvh-60px)] overflow-hidden bg-slate-50">
      <div className="grid h-full min-h-0 overflow-hidden lg:grid-cols-[60%_40%]">

        {/* =====================================================
            LEFT PANEL
        ====================================================== */}

        <section className="relative hidden min-h-0 overflow-hidden bg-[#070b14] lg:flex">

          <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full items-center px-10 xl:px-14">

            <div className="max-w-lg">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                Welcome to EventON
              </p>

              <h1 className="mt-2 text-4xl font-bold leading-[1.08] tracking-tight text-white xl:text-[46px]">
                Your next experience
                <br />
                starts here.
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
                Create your EventON account and discover
                events, book experiences, and keep your
                upcoming plans organized in one place.
              </p>

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

        <section className="flex h-full min-h-0 min-w-0 items-start justify-center overflow-hidden px-5 py-3 sm:px-8 lg:px-10 lg:py-5">

          <div className="w-full max-w-[450px]">

            {/* =================================================
                STEP INDICATOR
            ================================================== */}

            <div className="mb-4 flex items-center gap-2">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`h-1.5 flex-1 rounded-full ${
                    step >= item
                      ? "bg-orange-500"
                      : "bg-slate-200"
                  }`}
                />
              ))}

            </div>

            {/* =================================================
                STEP 1
            ================================================== */}

            {step === 1 && (
              <div>

                <div className="mb-5">

                  <p className="text-[13px] font-bold text-orange-500">
                    Step 1 of 3
                  </p>

                  <h2 className="mt-1 text-[32px] font-bold leading-[1.05] tracking-tight text-slate-900">
                    Choose your account
                  </h2>

                  <p className="mt-2 text-[13px] leading-5 text-slate-500">
                    Select how you want to use EventON.
                  </p>

                </div>

                <div className="space-y-3">

                  {/* ATTENDEE */}

                  <button
                    type="button"
                    onClick={() =>
                      handleRoleChange(
                        "attendee"
                      )
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      role === "attendee"
                        ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >

                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        role === "attendee"
                          ? "bg-orange-500 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <User size={21} />
                    </span>

                    <span className="min-w-0 flex-1">

                      <span className="block text-[15px] font-bold text-slate-900">
                        Attendee
                      </span>

                      <span className="mt-1 block text-xs leading-4 text-slate-500">
                        Discover events, book tickets,
                        and manage your bookings.
                      </span>

                    </span>

                    {role === "attendee" && (
                      <CircleCheck
                        size={21}
                        className="shrink-0 text-orange-500"
                      />
                    )}

                  </button>

                  {/* ORGANIZER */}

                  <button
                    type="button"
                    onClick={() =>
                      handleRoleChange(
                        "organizer"
                      )
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      role === "organizer"
                        ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >

                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        role === "organizer"
                          ? "bg-orange-500 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Building2
                        size={21}
                      />
                    </span>

                    <span className="min-w-0 flex-1">

                      <span className="block text-[15px] font-bold text-slate-900">
                        Organizer
                      </span>

                      <span className="mt-1 block text-xs leading-4 text-slate-500">
                        Create events, manage bookings,
                        and grow your audience.
                      </span>

                    </span>

                    {role === "organizer" && (
                      <CircleCheck
                        size={21}
                        className="shrink-0 text-orange-500"
                      />
                    )}

                  </button>

                </div>

                <div className="min-h-[20px]">

                  {errors.role && (
                    <p className="mt-2 text-[11px] text-red-500">
                      {errors.role}
                    </p>
                  )}

                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="group mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
                >
                  Continue

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>

                <p className="mt-4 text-center text-xs text-slate-500">

                  Already have an account?{" "}

                  <Link
                    to="/login"
                    className="font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Sign in
                  </Link>

                </p>

              </div>
            )}

            {/* =================================================
                STEP 2 — BASIC DETAILS
            ================================================== */}

            {step === 2 && (
              <div>

                <div className="mb-3">

                  <button
                    type="button"
                    onClick={handleBack}
                    className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                  >
                    <ArrowLeft size={14} />

                    Change account type
                  </button>

                  <p className="text-[13px] font-bold text-orange-500">
                    Step 2 of 3
                  </p>

                  <h2 className="mt-1 text-[30px] font-bold leading-[1.05] tracking-tight text-slate-900">
                    Tell us about you
                  </h2>

                  <p className="mt-1 text-[13px] leading-5 text-slate-500">
                    Enter your name and contact details.
                  </p>

                </div>

                <div className="space-y-1">

                  {/* FULL NAME */}

                  <div>

                    <label
                      htmlFor="register-name"
                      className="mb-0 block text-[12px] font-semibold text-slate-700"
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
                        className={`h-9.5 w-full rounded-xl border bg-white pl-10 pr-3.5 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 ${
                          errors.name
                            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                            : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        }`}
                      />

                    </div>

                    <div className="min-h-[9px]">

                      {errors.name && (
                        <p className="mt-0.5 text-[9px] leading-3 text-red-500">
                          {errors.name}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* MOBILE */}

                  <div>

                    <label
                      htmlFor="register-mobile"
                      className="mb-0 block text-[12px] font-semibold text-slate-700"
                    >
                      Mobile number
                    </label>

                    <div className="relative">

                      <Phone
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="register-mobile"
                        name="mobile"
                        type="tel"
                        value={formData.mobile}
                        onChange={
                          handleMobileChange
                        }
                        placeholder="Enter your mobile number"
                        autoComplete="tel"
                        inputMode="numeric"
                        maxLength={10}
                        className={`h-9.5 w-full rounded-xl border bg-white pl-10 pr-3.5 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 ${
                          errors.mobile
                            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                            : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        }`}
                      />

                    </div>

                    <div className="min-h-[9px]">

                      {errors.mobile && (
                        <p className="mt-0.5 text-[9px] leading-3 text-red-500">
                          {errors.mobile}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label
                      htmlFor="register-email"
                      className="mb-0 block text-[12px] font-semibold text-slate-700"
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
                        placeholder="you@gmail.com"
                        autoComplete="email"
                        inputMode="email"
                        className={`h-9.5 w-full rounded-xl border bg-white pl-10 pr-3.5 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 ${
                          errors.email
                            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                            : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        }`}
                      />

                    </div>

                    <p className="mt-0.5 text-[9px] leading-3 text-slate-400">
                      Only Gmail addresses ending in @gmail.com are accepted.
                    </p>

                    <div className="min-h-[9px]">

                      {errors.email && (
                        <p className="mt-0.5 text-[9px] leading-3 text-red-500">
                          {errors.email}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* CONTINUE */}

                  <button
                    type="button"
                    onClick={handleContinue}
                    className="group mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    Continue

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>

                </div>

              </div>
            )}

            {/* =================================================
                STEP 3 — PASSWORD
            ================================================== */}

            {step === 3 && (
              <div>

                <div className="mb-3">

                  <button
                    type="button"
                    onClick={handleBack}
                    className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                  >
                    <ArrowLeft size={14} />

                    Back to details
                  </button>

                  <p className="text-[13px] font-bold text-orange-500">
                    Step 3 of 3
                  </p>

                  <h2 className="mt-1 text-[30px] font-bold leading-[1.05] tracking-tight text-slate-900">
                    Secure your account
                  </h2>

                  <p className="mt-1 text-[13px] leading-5 text-slate-500">
                    Create a password to finish your EventON account.
                  </p>

                </div>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-1"
                >

                  {/* PASSWORD */}

                  <div>

                    <label
                      htmlFor="register-password"
                      className="mb-0 block text-[12px] font-semibold text-slate-700"
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
                        value={
                          formData.password
                        }
                        onChange={handleChange}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        className={`h-9.5 w-full rounded-xl border bg-white pl-10 pr-11 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 ${
                          errors.password
                            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                            : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>

                    </div>

                    <div className="min-h-[9px]">

                      {errors.password && (
                        <p className="mt-0.5 text-[9px] leading-3 text-red-500">
                          {errors.password}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>

                    <label
                      htmlFor="register-confirm-password"
                      className="mb-0 block text-[12px] font-semibold text-slate-700"
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
                        value={
                          formData.confirmPassword
                        }
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        className={`h-9.5 w-full rounded-xl border bg-white pl-10 pr-11 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 ${
                          errors.confirmPassword
                            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                            : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (previous) =>
                              !previous
                          )
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

                    <div className="min-h-[9px]">

                      {errors.confirmPassword && (
                        <p className="mt-0.5 text-[9px] leading-3 text-red-500">
                          {errors.confirmPassword}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* FORM ERROR */}

                  <div className="min-h-[24px]">

                    {errors.form && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] leading-3 text-red-600">
                        {errors.form}
                      </div>
                    )}

                  </div>

                  {/* CREATE ACCOUNT */}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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

                <p className="mt-2 text-center text-xs text-slate-500">

                  Already have an account?{" "}

                  <Link
                    to="/login"
                    className="font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Sign in
                  </Link>

                </p>

              </div>
            )}

          </div>

        </section>

      </div>
    </main>
  );
}

export default Register;