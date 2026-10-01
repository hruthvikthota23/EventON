import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  X,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const ACCOUNTS_STORAGE_KEY = "eventon_accounts";

function Profile() {
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();

  const [account, setAccount] = useState(user || null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // =========================================================
  // LOAD ACTUAL ACCOUNT
  // =========================================================

  useEffect(() => {
    const loadAccount = () => {
      let currentAccount = user || null;

      try {
        const rawAccounts = localStorage.getItem(
          ACCOUNTS_STORAGE_KEY
        );

        if (rawAccounts && user?.id) {
          const accounts = JSON.parse(rawAccounts);

          if (Array.isArray(accounts)) {
            const storedAccount = accounts.find(
              (item) =>
                String(item.id) === String(user.id)
            );

            if (storedAccount) {
              currentAccount = storedAccount;
            }
          }
        }
      } catch (error) {
        console.error(
          "Unable to load EventON account:",
          error
        );
      }

      setAccount(currentAccount);
    };

    loadAccount();

    const handleUpdate = () => {
      loadAccount();
    };

    window.addEventListener(
      "storage",
      handleUpdate
    );

    window.addEventListener(
      "eventon:auth-updated",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleUpdate
      );

      window.removeEventListener(
        "eventon:auth-updated",
        handleUpdate
      );
    };
  }, [user]);

  // =========================================================
  // PROFILE DATA
  // =========================================================

  const profile = useMemo(() => {
    return {
      name:
        account?.name ||
        user?.name ||
        "EventON User",

      email:
        account?.email ||
        user?.email ||
        "No email available",

      role:
        account?.role ||
        user?.role ||
        "attendee",

      id:
        account?.id ||
        user?.id ||
        "Not available",

      mobile:
        account?.mobile ||
        account?.phone ||
        user?.mobile ||
        user?.phone ||
        "Not provided",

      createdAt:
        account?.createdAt ||
        account?.registeredAt ||
        user?.createdAt ||
        user?.registeredAt ||
        null,
    };
  }, [account, user]);

  // =========================================================
  // ROLE
  // =========================================================

  const normalizedRole = String(profile.role)
    .trim()
    .toLowerCase();

  const roleLabel =
    normalizedRole === "admin"
      ? "Administrator"
      : normalizedRole === "organizer"
      ? "Organizer"
      : "Attendee";

  const roleDescription =
    normalizedRole === "admin"
      ? "Full administrative access to users, events, bookings, and platform data."
      : normalizedRole === "organizer"
      ? "Access to create, manage, and monitor your events and bookings."
      : "Access to discover events and manage your bookings.";

  // =========================================================
  // FOOTER NAVIGATION
  // =========================================================

  const footerActionLabel =
    normalizedRole === "admin"
      ? "Go to Dashboard"
      : normalizedRole === "organizer"
      ? "Go to Dashboard"
      : "Go to Home";

  const footerActionPath =
    normalizedRole === "admin"
      ? "/admin"
      : normalizedRole === "organizer"
      ? "/organizer"
      : "/";

  // =========================================================
  // INITIALS
  // =========================================================

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  // =========================================================
  // CREATED DATE
  // =========================================================

  const formattedCreatedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "Not available";

  // =========================================================
  // START EDIT
  // =========================================================

  const handleStartEdit = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      mobile:
        profile.mobile === "Not provided"
          ? ""
          : profile.mobile,
    });

    setErrors({});
    setSuccessMessage("");
    setIsEditing(true);
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const handleCancelEdit = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      mobile:
        profile.mobile === "Not provided"
          ? ""
          : profile.mobile,
    });

    setErrors({});
    setSuccessMessage("");
    setIsEditing(false);
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Mobile: allow digits only
    if (name === "mobile") {
      const digitsOnly = value
        .replace(/\D/g, "")
        .slice(0, 10);

      setFormData((previous) => ({
        ...previous,
        [name]: digitsOnly,
      }));
    } else {
      setFormData((previous) => ({
        ...previous,
        [name]: value,
      }));
    }

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      form: "",
    }));

    setSuccessMessage("");
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    const name = formData.name.trim();

    const email = formData.email
      .trim()
      .toLowerCase();

    const mobile = formData.mobile
      .replace(/\D/g, "")
      .trim();

    // NAME

    if (!name) {
      newErrors.name = "Name is required.";
    } else if (name.length < 2) {
      newErrors.name =
        "Name must contain at least 2 characters.";
    }

    // EMAIL

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(
        email
      )
    ) {
      newErrors.email =
        "Enter a valid Gmail address ending with @gmail.com.";
    }

    // MOBILE

    if (!mobile) {
      newErrors.mobile =
        "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(mobile)) {
      newErrors.mobile =
        "Enter a valid 10-digit Indian mobile number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSave = async (event) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");

    try {
      const normalizedMobile = formData.mobile
        .replace(/\D/g, "")
        .trim();

      const result = updateUser({
        name: formData.name.trim(),
        email: formData.email
          .trim()
          .toLowerCase(),
        mobile: normalizedMobile,
      });

      if (!result?.success) {
        setErrors(
          result?.fields || {
            form:
              result?.error ||
              "Unable to save your profile.",
          }
        );

        return;
      }

      setAccount(result.user);

      setSuccessMessage(
        "Profile updated successfully."
      );

      setIsEditing(false);
    } catch (error) {
      console.error(
        "Unable to update profile:",
        error
      );

      setErrors({
        form:
          "Something went wrong while updating your profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // NOT AUTHENTICATED
  // =========================================================

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
            <UserRound size={28} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Login required
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please log in to view your EventON
            profile.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="min-h-full bg-slate-50">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-500">
                Account
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Profile
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                View and manage your EventON account
                information.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition hover:bg-orange-50 hover:text-orange-600 hover:ring-orange-200"
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        {/* SUCCESS MESSAGE */}

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2
              size={18}
              className="shrink-0"
            />

            <span>{successMessage}</span>
          </div>
        )}

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* =================================================
              LEFT PROFILE CARD
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            {/* PROFILE HERO */}

            <div className="relative overflow-hidden bg-slate-900 px-6 py-8 sm:px-8">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/10 blur-2xl" />

              <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* AVATAR */}

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-2xl font-bold text-white shadow-lg">
                  {initials || "U"}
                </div>

                {/* USER */}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-white sm:text-2xl">
                      {profile.name}
                    </h2>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-orange-300">
                      <ShieldCheck size={13} />
                      {roleLabel}
                    </span>
                  </div>

                  <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-300">
                    <Mail
                      size={14}
                      className="shrink-0"
                    />

                    {profile.email}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                ACCOUNT INFORMATION
            ================================================= */}

            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Account Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Your current EventON account details.
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <UserRound size={18} />
                </div>
              </div>

              {/* =================================================
                  EDIT MODE
              ================================================= */}

              {isEditing ? (
                <form
                  onSubmit={handleSave}
                  className="mt-6"
                >
                  {errors.form && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                      {errors.form}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* NAME */}

                    <FormField
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      icon={UserRound}
                      error={errors.name}
                      placeholder="Enter your full name"
                    />

                    {/* EMAIL */}

                    <FormField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      icon={Mail}
                      error={errors.email}
                      placeholder="Enter your Gmail"
                    />

                    {/* MOBILE */}

                    <FormField
                      label="Mobile Number"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleChange}
                      icon={Phone}
                      error={errors.mobile}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>

                  {/* ROLE */}

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                        <ShieldCheck size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500">
                          Role
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {roleLabel}
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-slate-500">
                          Your account role is managed by
                          EventON and cannot be changed
                          from your profile.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BUTTONS */}

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X size={15} />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={15} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* =================================================
                   VIEW MODE
                ================================================= */

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoField
                    label="Full Name"
                    value={profile.name}
                    icon={UserRound}
                  />

                  <InfoField
                    label="Email Address"
                    value={profile.email}
                    icon={Mail}
                    breakValue
                  />

                  <InfoField
                    label="Role"
                    value={roleLabel}
                    icon={ShieldCheck}
                  />

                  <InfoField
                    label="Mobile Number"
                    value={profile.mobile}
                    icon={Phone}
                  />

                  <div className="sm:col-span-2">
                    <InfoField
                      label="User ID"
                      value={profile.id}
                      icon={UserRound}
                      breakValue
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <aside className="space-y-6">
            {/* ACCOUNT STATUS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Account Status
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Current account access
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={18} />
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Active
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Your account is currently active.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ACCESS ROLE */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Access Role
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Permissions associated with your account.
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <ShieldCheck size={18} />
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Current role
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {roleLabel}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {roleDescription}
                </p>
              </div>
            </section>

            {/* ACCOUNT CREATED */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <CalendarDays size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">
                    Account Created
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formattedCreatedDate}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* =====================================================
            FOOTER CARD
        ===================================================== */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {roleLabel} Account
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  {roleDescription}
                </p>
              </div>
            </div>

            {/* ROLE-BASED NAVIGATION */}

            <Link
              to={footerActionPath}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            >
              {footerActionLabel}

              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

// ===========================================================
// INFO FIELD
// ===========================================================

function InfoField({
  label,
  value,
  icon: Icon,
  breakValue = false,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className="shrink-0 text-slate-400"
        />

        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>
      </div>

      <p
        className={`mt-2 text-sm font-semibold text-slate-900 ${
          breakValue
            ? "break-all"
            : "truncate"
        }`}
      >
        {value || "Not available"}
      </p>
    </div>
  );
}

// ===========================================================
// FORM FIELD
// ===========================================================

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon: Icon,
  error,
  placeholder,
  maxLength,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <Icon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={
            name === "mobile"
              ? "tel"
              : name === "email"
              ? "email"
              : "name"
          }
          className={`h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
              : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
          }`}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default Profile;