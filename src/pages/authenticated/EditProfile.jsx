import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Save,
  User,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    isAuthenticated,
    isLoading,
    updateUser,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.name || "",
      email: user.email || "",
    });
  }, [user]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: {
          from: location.pathname,
        },
      });
    }
  }, [
    isAuthenticated,
    isLoading,
    navigate,
    location.pathname,
  ]);

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

    setIsSaved(false);
  };

  const validateForm = () => {
    const newErrors = {};

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();

    if (!name) {
      newErrors.name = "Name is required.";
    } else if (name.length < 2) {
      newErrors.name =
        "Name must contain at least 2 characters.";
    }

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email =
        "Enter a valid email address.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    if (!validateForm()) return;

    setIsSaving(true);
    setIsSaved(false);

    const result = updateUser({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
    });

    if (result?.success === false) {
      setErrors({
        form: result.error || "Unable to update your profile.",
      });

      setIsSaving(false);
      return;
    }

    setIsSaved(true);
    setIsSaving(false);

    setTimeout(() => {
      navigate("/profile", {
        replace: true,
      });
    }, 700);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Back */}

        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to profile
        </Link>

        {/* Header */}

        <div className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Edit Profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Update your EventON account information.
          </p>
        </div>

        {/* Form Card */}

        <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Card Header */}

          <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <User size={21} />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Personal Information
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Keep your account details up to date.
                </p>
              </div>

            </div>
          </div>

          {/* Form */}

          <form onSubmit={handleSubmit}>

            <div className="space-y-5 px-5 py-6 sm:px-7">

              {/* General Error */}

              {errors.form && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-600">
                    {errors.form}
                  </p>
                </div>
              )}

              {/* Name */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>

                <div className="relative">
                  <User
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={isSaving}
                    className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                        : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                    }`}
                  />
                </div>

                {errors.name && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

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
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={isSaving}
                    className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                        : "border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">

              <Link
                to="/profile"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 size={17} />
                    Saved
                  </>
                ) : isSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save changes
                  </>
                )}
              </button>

            </div>
          </form>
        </div>

        {/* Note */}

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs leading-5 text-blue-700">
            Your profile information is currently stored locally in this
            browser. Backend account management will be connected later.
          </p>
        </div>

      </div>
    </section>
  );
}

export default EditProfile;