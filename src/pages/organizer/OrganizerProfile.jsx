import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Mail,
  Save,
  X,
  ShieldCheck,
  User,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function OrganizerProfile() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      name: user.name || "",
      email: user.email || "",
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleEdit = () => {
    setSuccess("");
    setError("");
    setEditMode(true);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
    });

    setSuccess("");
    setError("");
    setEditMode(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSuccess("");
    setError("");

    const name = formData.name.trim();

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (name.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    setSaving(true);

    try {
      const result = updateUser({
        name,
      });

      if (result?.success === false) {
        setError(
          result.error ||
            "Unable to update your profile. Please try again."
        );
        return;
      }

      setSuccess("Profile updated successfully.");
      setEditMode(false);
    } catch (err) {
      console.error("Profile update failed:", err);
      setError("Unable to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  if (!user) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <UserRound size={25} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Organizer login required
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please log in to view your profile.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:px-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <div>
          <p className="text-sm font-semibold text-orange-500">
            Account Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Organizer Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your organizer account information and profile details.
          </p>
        </div>

        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="h-28 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300" />

          <div className="px-5 pb-6 sm:px-7">

            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex items-end gap-4">

                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-orange-100 text-2xl font-bold text-orange-600 shadow-md">
                  {getInitials(user.name)}
                </div>

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    {user.name || "Organizer"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {user.email}
                  </p>
                </div>

              </div>

              <div className="flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
  <ShieldCheck size={14} />

  {user.role === "organizer"
    ? "Organizer Account"
    : user.role === "admin"
    ? "Administrator Account"
    : "Attendee Account"}
</div>

            </div>
          </div>
        </div>

        {/* =================================================
            PROFILE FORM
        ================================================= */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
            <h2 className="font-bold text-slate-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the information associated with your organizer account.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-7"
          >

            <div className="grid gap-6 sm:grid-cols-2">

              {/* NAME */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-500 outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Email address cannot be changed from this page.
                </p>
              </div>

            </div>

            {/* ACCOUNT INFORMATION */}

            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">

              <h3 className="text-sm font-bold text-slate-800">
                Account Information
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-xs text-slate-400">
                    Account ID
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-slate-700">
                    {user.id || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Account Role
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <ShieldCheck
                      size={15}
                      className="text-orange-500"
                    />

                    <p className="text-sm font-semibold text-slate-700">
  {user.role === "organizer"
    ? "Organizer"
    : user.role === "admin"
    ? "Administrator"
    : "Attendee"}
</p>
                  </div>
                </div>

              </div>
            </div>

            {/* MESSAGES */}

            {success && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <CheckCircle2 size={18} />
                {success}
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* SAVE */}

            <div className="mt-7 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
}

// =========================================================
// HELPERS
// =========================================================

function getInitials(name) {
  if (!name) {
    return "O";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

export default OrganizerProfile;