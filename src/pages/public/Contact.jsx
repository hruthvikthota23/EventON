import {
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  // =========================================================
  // FORM HANDLERS
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="min-h-full bg-white text-slate-900">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden bg-[#070b14]">
        {/* Background glow */}
        <div className="absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="absolute right-[20%] top-[20%] h-32 w-32 rounded-full bg-orange-500/5 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3.5 py-2 text-xs font-semibold text-orange-400">
              <MessageCircle size={14} />
              Contact EventON
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Let&apos;s start a
              <br />
              <span className="text-orange-500">conversation.</span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              Have a question, need help with a booking, or want to know
              more about EventON? We&apos;re here to help.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT CONTENT
      ====================================================== */}

      <section className="min-h-[calc(100vh-64px)] bg-white">
        <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            {/* =================================================
                LEFT - CONTACT INFORMATION
            ================================================== */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                Get in Touch
              </p>

              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                How can we help?
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                Whether you&apos;re attending an event, organizing one, or
                simply have a question, our team is here to help.
              </p>

              {/* Contact cards */}
              <div className="mt-5 grid gap-3">
                {/* Email */}
                <a
                  href="mailto:support@eventon.com"
                  className="
                    group
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-4
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-orange-200
                    hover:bg-white
                    hover:shadow-md
                  "
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                    <Mail size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Email us
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      support@eventon.com
                    </p>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href="tel:9876543210"
                  className="
                    group
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-4
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-orange-200
                    hover:bg-white
                    hover:shadow-md
                  "
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                    <Phone size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Call us
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      +91 9876543210
                    </p>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Our location
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Hyderabad, Telangana, India
                    </p>
                  </div>
                </div>

                {/* Support hours */}
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Clock3 size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Support hours
                    </h3>

                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      Monday – Saturday · 9:00 AM – 6:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Help note */}
              <div className="mt-4 rounded-2xl bg-[#070b14] px-5 py-4">
                <p className="text-xs font-semibold text-white">
                  Need help with a booking?
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Include your booking ID in your message so our team can
                  help you faster.
                </p>
              </div>
            </div>

            {/* =================================================
                RIGHT - CONTACT FORM
            ================================================== */}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6 lg:p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                  Send a Message
                </p>

                <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
                  Tell us what&apos;s on your mind
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Fill out the form below and our team will get back to you.
                </p>
              </div>

              {/* Success message */}
              {submitted && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-green-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Message sent successfully!
                    </p>

                    <p className="mt-0.5 text-xs text-green-700">
                      Thank you for contacting EventON. We&apos;ll get back
                      to you soon.
                    </p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="mt-5 space-y-4"
              >
                {/* Name + Email */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-xs font-semibold text-slate-800"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3.5
                        py-2.5
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-orange-500
                        focus:ring-2
                        focus:ring-orange-500/10
                      "
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold text-slate-800"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3.5
                        py-2.5
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-orange-500
                        focus:ring-2
                        focus:ring-orange-500/10
                      "
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-1.5 block text-xs font-semibold text-slate-800"
                  >
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3.5
                      py-2.5
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-orange-500
                      focus:ring-2
                      focus:ring-orange-500/10
                    "
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-xs font-semibold text-slate-800"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    rows={4}
                    required
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3.5
                      py-2.5
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-orange-500
                      focus:ring-2
                      focus:ring-orange-500/10
                    "
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="
                    group
                    inline-flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-orange-500
                    px-6
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-orange-500/20
                    transition-all
                    duration-200
                    hover:bg-orange-600
                    hover:shadow-orange-500/30
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-500
                    focus:ring-offset-2
                  "
                >
                  Send Message

                  <Send
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>

                <p className="text-center text-[11px] text-slate-400">
                  We&apos;ll use your information only to respond to your
                  request.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT / EVENTS CTA
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#070b14] px-6 py-10 text-center sm:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              Explore EventON
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-2xl font-bold leading-tight text-white sm:text-3xl">
              Ready to discover your next event?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Explore upcoming events and find experiences worth
              remembering.
            </p>

            <Link
              to="/events"
              className="
                group
                mt-6
                inline-flex
                h-11
                items-center
                gap-2
                rounded-xl
                bg-orange-500
                px-6
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-orange-500/20
                transition-all
                duration-200
                hover:bg-orange-600
              "
            >
              Browse Events

              <Send
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;