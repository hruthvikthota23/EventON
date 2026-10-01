import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    isLoading,
    login,
  } = useAuth();

  // ---------------------------------------------------------
  // FORM DATA
  // ---------------------------------------------------------

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "attendee",
  });

  // ---------------------------------------------------------
  // ADMIN MODE
  //
  // Admin is hidden from the normal login screen.
  // It can be opened through "Admin Sign In".
  // ---------------------------------------------------------

  const [isAdminMode, setIsAdminMode] =
    useState(false);

  // ---------------------------------------------------------
  // FIELD ERRORS
  //
  // Email    -> directly below email
  // Password -> directly below password
  // ---------------------------------------------------------

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // ---------------------------------------------------------
  // ACCOUNT / LOGIN ERROR
  //
  // Appears below Sign In.
  //
  // Examples:
  //
  // No account found with this email.
  //
  // This account is registered as organizer.
  // Please select organizer to continue.
  // ---------------------------------------------------------

  const [loginError, setLoginError] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // ---------------------------------------------------------
  // REDIRECT IF ALREADY LOGGED IN
  // ---------------------------------------------------------

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    const role = String(
      user.role || "attendee"
    )
      .trim()
      .toLowerCase();

    if (role === "admin") {
      navigate("/admin", {
        replace: true,
      });

      return;
    }

    if (role === "organizer") {
      navigate("/organizer", {
        replace: true,
      });

      return;
    }

    navigate("/", {
      replace: true,
    });
  }, [
    user,
    isLoading,
    navigate,
  ]);

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
    }));

    setLoginError("");
  };

  // ---------------------------------------------------------
  // ROLE CHANGE
  // ---------------------------------------------------------

  const handleRoleChange = (role) => {
    setFormData((previous) => ({
      ...previous,
      role,
    }));

    setErrors({
      email: "",
      password: "",
    });

    setLoginError("");
  };

  // ---------------------------------------------------------
  // OPEN ADMIN LOGIN
  // ---------------------------------------------------------

  const handleAdminMode = () => {
    setIsAdminMode(true);

    setFormData((previous) => ({
      ...previous,
      role: "admin",
    }));

    setErrors({
      email: "",
      password: "",
    });

    setLoginError("");

    setShowPassword(false);
  };

  // ---------------------------------------------------------
  // RETURN TO REGULAR LOGIN
  // ---------------------------------------------------------

  const handleRegularLogin = () => {
    setIsAdminMode(false);

    setFormData((previous) => ({
      ...previous,
      role: "attendee",
    }));

    setErrors({
      email: "",
      password: "",
    });

    setLoginError("");

    setShowPassword(false);
  };

  // ---------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    const email =
      formData.email.trim();

    const password =
      formData.password;

    // -------------------------------------------------------
    // EMAIL
    // -------------------------------------------------------

    if (!email) {
      newErrors.email =
        "Please enter your Gmail address.";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email =
        "Please enter a valid Gmail address ending with @gmail.com.";
    }

    // -------------------------------------------------------
    // PASSWORD
    // -------------------------------------------------------

    if (!password) {
      newErrors.password =
        "Please enter your password.";
    } else if (password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters.";
    }

    setErrors(newErrors);

    return (
      !newErrors.email &&
      !newErrors.password
    );
  };

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------

  const handleSubmit = (event) => {
    event.preventDefault();

    setLoginError("");

    const isValid =
      validateForm();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const email =
        formData.email
          .trim()
          .toLowerCase();

      const result = login({
        email,
        password: formData.password,
        role: isAdminMode
          ? "admin"
          : formData.role,
      });

      // -----------------------------------------------------
      // LOGIN FAILED
      // -----------------------------------------------------

      if (!result.success) {
        const message =
          result.error ||
          "Unable to sign in. Please check your details.";

        const normalizedMessage =
          message.toLowerCase();

        // ---------------------------------------------------
        // ACCOUNT-LEVEL ERROR
        //
        // These appear below Sign In.
        // ---------------------------------------------------

        const isAccountError =
          normalizedMessage.includes(
            "account not found"
          ) ||
          normalizedMessage.includes(
            "no account found"
          ) ||
          normalizedMessage.includes(
            "no account"
          ) ||
          normalizedMessage.includes(
            "not registered"
          ) ||
          normalizedMessage.includes(
            "registered as"
          ) ||
          normalizedMessage.includes(
            "select organizer"
          ) ||
          normalizedMessage.includes(
            "select admin"
          ) ||
          normalizedMessage.includes(
            "account type"
          ) ||
          normalizedMessage.includes(
            "role"
          );

        if (isAccountError) {
          // -----------------------------------------------
          // NO ACCOUNT
          // -----------------------------------------------

          if (
            normalizedMessage.includes(
              "account not found"
            ) ||
            normalizedMessage.includes(
              "no account found"
            ) ||
            normalizedMessage.includes(
              "no account"
            ) ||
            normalizedMessage.includes(
              "not registered"
            )
          ) {
            setLoginError(
              "No account found with this email."
            );
          } else {
            // ---------------------------------------------
            // WRONG ACCOUNT TYPE
            // ---------------------------------------------

            setLoginError(message);
          }

          setErrors({
            email: "",
            password: "",
          });
        } else {
          // -----------------------------------------------
          // PASSWORD / AUTHENTICATION ERROR
          //
          // Directly below Password.
          // -----------------------------------------------

          setErrors({
            email: "",
            password: message,
          });

          setLoginError("");
        }

        setIsSubmitting(false);

        return;
      }

      // -----------------------------------------------------
      // LOGIN SUCCESSFUL
      // -----------------------------------------------------

      const loggedInRole = String(
        result.user?.role ||
          formData.role ||
          "attendee"
      )
        .trim()
        .toLowerCase();

      // -----------------------------------------------------
      // ADMIN
      // -----------------------------------------------------

      if (
        loggedInRole === "admin"
      ) {
        navigate("/admin", {
          replace: true,
        });

        return;
      }

      // -----------------------------------------------------
      // ORGANIZER
      // -----------------------------------------------------

      if (
        loggedInRole === "organizer"
      ) {
        navigate("/", {
          replace: true,
        });

        return;
      }

      // -----------------------------------------------------
      // ATTENDEE
      // -----------------------------------------------------

      const requestedDestination =
        location.state?.from;

      const isProtectedDestination =
        typeof requestedDestination ===
          "string" &&
        (
          requestedDestination.startsWith(
            "/admin"
          ) ||
          requestedDestination.startsWith(
            "/organizer"
          )
        );

      if (
        requestedDestination &&
        !isProtectedDestination &&
        typeof requestedDestination ===
          "string"
      ) {
        navigate(
          requestedDestination,
          {
            replace: true,
          }
        );
      } else {
        navigate("/", {
          replace: true,
        });
      }
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      setErrors({
        email: "",
        password:
          "Unable to sign in. Please try again.",
      });

      setLoginError("");

      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (
    isLoading ||
    user
  ) {
    return (
      <main className="login-page">

        <div className="login-loading">

          <div className="login-spinner" />

        </div>

      </main>
    );
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <main className="login-page">

      <div className="login-shell">

        {/* =====================================================
            LEFT BRAND PANEL
        ====================================================== */}

        <section className="login-brand-panel">

          <div className="login-brand-content">

            <div className="login-brand-message">

              <p className="login-brand-badge">

                <ShieldCheck size={15} />

                Secure Event Platform

              </p>

              <h1>

                Welcome

                <br />

                back to{" "}

                <span>
                  EventON.
                </span>

              </h1>

              <p className="login-description">

                Sign in to stay connected
                with your events, bookings,
                and experiences — all in
                one place.

              </p>

              <div className="login-features">

                {[
                  "Stay on top of your bookings",
                  "Discover events worth attending",
                  "Manage your event experience effortlessly",
                ].map((item) => (

                  <div
                    key={item}
                    className="login-feature"
                  >

                    <span className="login-check">

                      <Check
                        size={12}
                        strokeWidth={3}
                      />

                    </span>

                    <span>
                      {item}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="login-brand-footer">

              <span>
                © {new Date().getFullYear()} EventON
              </span>

              <span>
                Events. Experiences. Memories.
              </span>

            </div>

          </div>

        </section>

        {/* =====================================================
            LOGIN PANEL
        ====================================================== */}

        <section className="login-form-panel">

          <div className="login-form-wrapper">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="login-heading">

              <p className="login-welcome">
                {isAdminMode
                  ? "Administrator access"
                  : "Welcome back"}
              </p>

              <h2>
                {isAdminMode
                  ? "Admin Sign In"
                  : "Sign in to EventON"}
              </h2>

              <p className="login-subtitle">

                {isAdminMode
                  ? "Authorized EventON administrators only."
                  : "Enter your details to continue."}

              </p>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="login-form"
            >

              {/* ===============================================
                  ACCOUNT TYPE
                  
                  ONLY NORMAL LOGIN
              ================================================ */}

              {!isAdminMode && (

                <div className="login-field login-account-field">

                  <label>
                    Account type
                  </label>

                  <div className="login-role-grid">

                    {/* ATTENDEE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRoleChange(
                          "attendee"
                        )
                      }
                      className={`login-role-card ${
                        formData.role ===
                        "attendee"
                          ? "active"
                          : ""
                      }`}
                    >

                      <span
                        className={`login-role-icon ${
                          formData.role ===
                          "attendee"
                            ? "active"
                            : ""
                        }`}
                      >

                        <UserRound
                          size={17}
                        />

                      </span>

                      <span className="login-role-text">

                        <strong>
                          Attendee
                        </strong>

                        <small>
                          Book events
                        </small>

                      </span>

                    </button>

                    {/* ORGANIZER */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRoleChange(
                          "organizer"
                        )
                      }
                      className={`login-role-card ${
                        formData.role ===
                        "organizer"
                          ? "active"
                          : ""
                      }`}
                    >

                      <span
                        className={`login-role-icon ${
                          formData.role ===
                          "organizer"
                            ? "active"
                            : ""
                        }`}
                      >

                        <ShieldCheck
                          size={17}
                        />

                      </span>

                      <span className="login-role-text">

                        <strong>
                          Organizer
                        </strong>

                        <small>
                          Manage events
                        </small>

                      </span>

                    </button>

                  </div>

                </div>

              )}

              {/* ===============================================
                  ADMIN MODE INDICATOR
              ================================================ */}

              {isAdminMode && (

                <div className="admin-access-note">

                  <span className="admin-access-icon">

                    <LockKeyhole
                      size={16}
                    />

                  </span>

                  <span>
                    Restricted platform
                    administrator access
                  </span>

                </div>

              )}

              {/* ===============================================
                  EMAIL
              ================================================ */}

              <div className="login-field">

                <label htmlFor="email">
                  Gmail address
                </label>

                <div
                  className={`login-input-wrapper ${
                    errors.email
                      ? "error"
                      : ""
                  }`}
                >

                  <Mail
                    size={18}
                    className="login-input-icon"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="you@gmail.com"
                  />

                </div>

                {/* EMAIL ERROR */}

                <div className="login-field-error">

                  {errors.email && (
                    <p>
                      {errors.email}
                    </p>
                  )}

                </div>

              </div>

              {/* ===============================================
                  PASSWORD
              ================================================ */}

              <div className="login-field">

                <div className="login-password-label">

                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                  >
                    Forgot password?
                  </button>

                </div>

                <div
                  className={`login-input-wrapper ${
                    errors.password
                      ? "error"
                      : ""
                  }`}
                >

                  <LockKeyhole
                    size={18}
                    className="login-input-icon"
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
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your password"
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
                    className="password-toggle"
                  >

                    {showPassword ? (

                      <EyeOff
                        size={18}
                      />

                    ) : (

                      <Eye
                        size={18}
                      />

                    )}

                  </button>

                </div>

                {/* PASSWORD ERROR */}

                <div className="login-field-error">

                  {errors.password && (
                    <p>
                      {errors.password}
                    </p>
                  )}

                </div>

              </div>

              {/* ===============================================
                  SIGN IN
              ================================================ */}

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="login-submit"
              >

                {isSubmitting
                  ? "Signing in..."
                  : isAdminMode
                    ? "Admin Sign In"
                    : "Sign In"}

                {!isSubmitting && (

                  <ArrowRight
                    size={18}
                    className="login-arrow"
                  />

                )}

              </button>

              {/* ===============================================
                  ACCOUNT ERROR
                  
                  Fixed height.
              ================================================ */}

              <div className="login-submit-error">

                {loginError && (
                  <p>
                    {loginError}
                  </p>
                )}

              </div>

            </form>

            {/* =================================================
                CREATE ACCOUNT
            ================================================== */}

            {!isAdminMode && (

              <p className="login-register">

                <span>
                  Don't have an account?
                </span>

                <Link
                  to="/register"
                  state={
                    location.state
                  }
                >
                  Create account
                </Link>

              </p>

            )}

            {/* =================================================
                CONTINUE AS GUEST
            ================================================== */}

            {!isAdminMode && (

              <div className="login-guest">

                <Link to="/">
                  Continue as Guest
                </Link>

              </div>

            )}

            {/* =================================================
                ADMIN ACCESS
            ================================================== */}

            {!isAdminMode ? (

              <div className="admin-login-link">

                <button
                  type="button"
                  onClick={
                    handleAdminMode
                  }
                >
                  Admin Sign In
                </button>

              </div>

            ) : (

              <div className="admin-login-link admin-back-link">

                <button
                  type="button"
                  onClick={
                    handleRegularLogin
                  }
                >

                  <ArrowLeft
                    size={14}
                  />

                  Back to Login

                </button>

              </div>

            )}

            {/* =================================================
                CONTINUE AS GUEST — ADMIN MODE
            ================================================== */}

            {isAdminMode && (

              <div className="login-guest">

                <Link to="/">
                  Continue as Guest
                </Link>

              </div>

            )}

          </div>

        </section>

      </div>

      {/* =======================================================
          STYLES
      ======================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        /* =========================================
           PAGE
        ========================================= */

        .login-page {
          width: 100%;

          height: 100dvh;
          min-height: 100dvh;
          max-height: 100dvh;

          overflow: hidden;

          background: #f8fafc;
        }

        .login-shell {
          width: 100%;
          height: 100%;

          min-height: 0;

          display: grid;

          grid-template-columns:
            60% 40%;

          overflow: hidden;
        }

        /* =========================================
           LEFT PANEL
        ========================================= */

        .login-brand-panel {
          position: relative;

          width: 100%;
          height: 100%;

          min-height: 0;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 15% 20%,
              rgba(
                249,
                115,
                22,
                0.12
              ),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 85%,
              rgba(
                59,
                130,
                246,
                0.10
              ),
              transparent 32%
            ),
            linear-gradient(
              145deg,
              #070b14 0%,
              #0f172a 55%,
              #111827 100%
            );
        }

        .login-brand-content {
          position: relative;

          z-index: 2;

          width: 100%;
          height: 100%;

          min-height: 0;

          padding:
            42px 52px;

          display: flex;

          flex-direction: column;

          justify-content: center;

          overflow: hidden;
        }

        .login-brand-message {
          max-width: 500px;
        }

        .login-brand-badge {
          width: fit-content;

          margin:
            0 0 22px;

          padding:
            8px 12px;

          display: inline-flex;

          align-items: center;

          gap: 7px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.10
            );

          border-radius:
            999px;

          background:
            rgba(
              255,
              255,
              255,
              0.04
            );

          color:
            #cbd5e1;

          font-size:
            11px;

          font-weight:
            600;

          text-transform:
            uppercase;

          letter-spacing:
            0.12em;
        }

        .login-brand-message h1 {
          margin: 0;

          color:
            #ffffff;

          font-size:
            clamp(
              44px,
              4.4vw,
              64px
            );

          line-height:
            0.98;

          letter-spacing:
            -2.8px;

          font-weight:
            750;
        }

        .login-brand-message h1 span {
          color:
            #f97316;
        }

        .login-description {
          max-width:
            450px;

          margin:
            22px 0 0;

          color:
            #94a3b8;

          font-size:
            15px;

          line-height:
            1.7;
        }

        /* =========================================
           FEATURES
        ========================================= */

        .login-features {
          margin-top:
            30px;

          display:
            flex;

          flex-direction:
            column;

          gap:
            12px;
        }

        .login-feature {
          display:
            flex;

          align-items:
            center;

          gap:
            11px;

          color:
            #cbd5e1;

          font-size:
            13px;
        }

        .login-check {
          width:
            21px;

          height:
            21px;

          flex:
            0 0 21px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            50%;

          background:
            rgba(
              249,
              115,
              22,
              0.14
            );

          color:
            #fb923c;
        }

        /* =========================================
           LEFT FOOTER
        ========================================= */

        .login-brand-footer {
          position:
            absolute;

          left:
            52px;

          right:
            52px;

          bottom:
            30px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            20px;

          color:
            #64748b;

          font-size:
            11px;
        }

        /* =========================================
           RIGHT PANEL
        ========================================= */

        .login-form-panel {
          width:
            100%;

          height:
            100%;

          min-width:
            0;

          min-height:
            0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          overflow:
            hidden;

          background:
            #ffffff;
        }

        .login-form-wrapper {
          width:
            min(
              500px,
              calc(100% - 70px)
            );

          max-height:
            100%;

          display:
            flex;

          flex-direction:
            column;

          overflow:
            hidden;
              
          transform: translateY(-30px);
        }

        /* =========================================
           HEADER
        ========================================= */

        .login-heading {
          margin-bottom:
            20px;
        }

        .login-welcome {
          margin:
            0 0 6px;

          color:
            #f97316;

          font-size:
            13px;

          font-weight:
            700;
        }

        .login-heading h2 {
          margin:
            0;

          color:
            #0f172a;

          font-size:
            34px;

          line-height:
            1.1;

          letter-spacing:
            -1.2px;

          font-weight:
            750;
        }

        .login-subtitle {
          margin:
            9px 0 0;

          color:
            #64748b;

          font-size:
            14px;

          line-height:
            1.5;
        }

        /* =========================================
           FORM
        ========================================= */

        .login-form {
          width:
            100%;

          display:
            flex;

          flex-direction:
            column;
        }

        .login-field {
          margin-bottom:
            9px;
        }

        .login-field > label,
        .login-password-label label {
          display:
            block;

          color:
            #334155;

          font-size:
            13px;

          font-weight:
            650;
        }

        /* =========================================
           ACCOUNT TYPE
        ========================================= */

        .login-account-field {
          margin-bottom:
            11px;
        }

        .login-account-field > label {
          margin-bottom:
            7px;
        }

        .login-role-grid {
          display:
            grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap:
            8px;
        }

        .login-role-card {
          min-width:
            0;

          height:
            62px;

          padding:
            9px;

          display:
            flex;

          align-items:
            center;

          gap:
            8px;

          border:
            1px solid #e2e8f0;

          border-radius:
            10px;

          background:
            #ffffff;

          color:
            #334155;

          cursor:
            pointer;

          text-align:
            left;

          transition:
            border-color
              0.2s ease,
            background
              0.2s ease,
            box-shadow
              0.2s ease;
        }

        .login-role-card:hover {
          border-color:
            #cbd5e1;

          background:
            #f8fafc;
        }

        .login-role-card.active {
          border-color:
            #fb923c;

          background:
            #fff7ed;

          box-shadow:
            0 0 0 2px
            rgba(
              249,
              115,
              22,
              0.08
            );
        }

        .login-role-icon {
          width:
            32px;

          height:
            32px;

          flex:
            0 0 32px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            8px;

          background:
            #f1f5f9;

          color:
            #64748b;
        }

        .login-role-icon.active {
          background:
            #f97316;

          color:
            #ffffff;
        }

        .login-role-text {
          min-width:
            0;

          display:
            flex;

          flex-direction:
            column;
        }

        .login-role-text strong {
          overflow:
            hidden;

          color:
            #1e293b;

          font-size:
            12px;

          font-weight:
            700;

          white-space:
            nowrap;

          text-overflow:
            ellipsis;
        }

        .login-role-text small {
          margin-top:
            3px;

          overflow:
            hidden;

          color:
            #94a3b8;

          font-size:
            10px;

          white-space:
            nowrap;

          text-overflow:
            ellipsis;
        }

        /* =========================================
           ADMIN ACCESS NOTE
        ========================================= */

        .admin-access-note {
          height:
            42px;

          margin-bottom:
            11px;

          padding:
            0 12px;

          display:
            flex;

          align-items:
            center;

          gap:
            9px;

          border:
            1px solid #e2e8f0;

          border-radius:
            10px;

          background:
            #f8fafc;

          color:
            #64748b;

          font-size:
            12px;

          font-weight:
            550;
        }

        .admin-access-icon {
          width:
            28px;

          height:
            28px;

          flex:
            0 0 28px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            7px;

          background:
            #fff7ed;

          color:
            #f97316;
        }

        /* =========================================
           INPUT
        ========================================= */

        .login-input-wrapper {
          position:
            relative;

          width:
            100%;

          height:
            44px;

          display:
            flex;

          align-items:
            center;

          border:
            1px solid #e2e8f0;

          border-radius:
            10px;

          background:
            #ffffff;

          transition:
            border-color
              0.2s ease,
            box-shadow
              0.2s ease;
        }

        .login-input-wrapper:focus-within {
          border-color:
            #fb923c;

          box-shadow:
            0 0 0 3px
            rgba(
              249,
              115,
              22,
              0.10
            );
        }

        .login-input-wrapper.error {
          border-color:
            #fca5a5;
        }

        .login-input-wrapper input {
          width:
            100%;

          height:
            100%;

          min-width:
            0;

          padding:
            0 13px 0 41px;

          border:
            none;

          outline:
            none;

          background:
            transparent;

          color:
            #0f172a;

          font-family:
            inherit;

          font-size:
            14px;
        }

        .login-input-wrapper input::placeholder {
          color:
            #94a3b8;

          font-size:
            13px;
        }

        .login-input-icon {
          position:
            absolute;

          left:
            13px;

          top:
            50%;

          transform:
            translateY(-50%);

          pointer-events:
            none;

          color:
            #94a3b8;
        }

        /* =========================================
           PASSWORD
        ========================================= */

        .login-password-label {
          margin-bottom:
            7px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;
        }

        .forgot-password {
          padding:
            0;

          border:
            none;

          background:
            transparent;

          color:
            #f97316;

          font-family:
            inherit;

          font-size:
            11px;

          font-weight:
            650;

          cursor:
            pointer;
        }

        .forgot-password:hover {
          color:
            #ea580c;
        }

        .password-toggle {
          position:
            absolute;

          right:
            7px;

          top:
            50%;

          width:
            30px;

          height:
            30px;

          transform:
            translateY(-50%);

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border:
            none;

          border-radius:
            7px;

          background:
            transparent;

          color:
            #94a3b8;

          cursor:
            pointer;
        }

        .password-toggle:hover {
          background:
            #f1f5f9;

          color:
            #475569;
        }

        .login-input-wrapper
          input[name="password"] {
          padding-right:
            44px;
        }

        /* =========================================
           FIELD ERROR
        ========================================= */

        .login-field-error {
          height:
            20px;

          display:
            flex;

          align-items:
            flex-start;

          overflow:
            hidden;
        }

        .login-field-error p {
          width:
            100%;

          margin:
            4px 0 0;

          color:
            #ef4444;

          font-size:
            11px;

          line-height:
            14px;

          font-weight:
            500;

          white-space:
            nowrap;

          overflow:
            hidden;

          text-overflow:
            ellipsis;
        }

        /* =========================================
           SIGN IN BUTTON
        ========================================= */

        .login-submit {
          width:
            100%;

          height:
            45px;

          margin-top:
            1px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            8px;

          border:
            none;

          border-radius:
            10px;

          background:
            #f97316;

          color:
            #ffffff;

          font-family:
            inherit;

          font-size:
            14px;

          font-weight:
            650;

          cursor:
            pointer;

          box-shadow:
            0 3px 7px
            rgba(
              249,
              115,
              22,
              0.18
            );

          transition:
            background
              0.2s ease,
            transform
              0.2s ease,
            box-shadow
              0.2s ease;
        }

        .login-submit:hover:not(:disabled) {
          background:
            #ea580c;

          box-shadow:
            0 6px 14px
            rgba(
              249,
              115,
              22,
              0.24
            );
        }

        .login-submit:active:not(:disabled) {
          transform:
            translateY(1px);
        }

        .login-submit:disabled {
          opacity:
            0.65;

          cursor:
            not-allowed;
        }

        .login-arrow {
          transition:
            transform
              0.2s ease;
        }

        .login-submit:hover
          .login-arrow {
          transform:
            translateX(2px);
        }

        /* =========================================
           ACCOUNT ERROR
        ========================================= */

        .login-submit-error {
          height:
            31px;

          display:
            flex;

          align-items:
            flex-start;

          justify-content:
            center;

          overflow:
            hidden;
        }

        .login-submit-error p {
          width:
            100%;

          margin:
            5px 0 0;

          color:
            #ef4444;

          font-size:
            11px;

          line-height:
            14px;

          font-weight:
            500;

          text-align:
            center;

          overflow:
            hidden;

          text-overflow:
            ellipsis;
        }

        /* =========================================
           ADMIN LOGIN LINK
        ========================================= */

        .admin-login-link {
          min-height:
            24px;

          margin:
            0 0 4px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            5px;

          color:
            #64748b;

          font-size:
            12px;
        }

        .admin-login-link button {
          padding:
            0;

          border:
            none;

          background:
            transparent;

          color:
            #ea580c;

          font-family:
            inherit;

          font-size:
            12px;

          font-weight:
            650;

          cursor:
            pointer;
        }

        .admin-login-link button:hover {
          color:
            #c2410c;

          text-decoration:
            underline;
        }

        .admin-back-link button {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            5px;
        }

        /* =========================================
           CREATE ACCOUNT
        ========================================= */

        .login-register {
          margin:
            4px 0 0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            5px;

          color:
            #64748b;

          font-size:
            12px;
        }

        .login-register a {
          color:
            #ea580c;

          font-weight:
            650;

          text-decoration:
            none;
        }

        .login-register a:hover {
          text-decoration:
            underline;
        }

        /* =========================================
           CONTINUE AS GUEST
        ========================================= */

        .login-guest {
          margin-top:
            3px;

          display:
            flex;

          justify-content:
            center;
        }

        .login-guest a {
          padding:
            6px 10px;

          border-radius:
            7px;

          color:
            #94a3b8;

          font-size:
            11px;

          font-weight:
            600;

          text-decoration:
            none;

          transition:
            background
              0.2s ease,
            color
              0.2s ease;
        }

        .login-guest a:hover {
          background:
            #fff7ed;

          color:
            #f97316;
        }

        /* =========================================
           LOADING
        ========================================= */

        .login-loading {
          width:
            100%;

          height:
            100%;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;
        }

        .login-spinner {
          width:
            28px;

          height:
            28px;

          border:
            3px solid #e2e8f0;

          border-top-color:
            #f97316;

          border-radius:
            50%;

          animation:
            login-spin
            0.8s linear infinite;
        }

        @keyframes login-spin {

          to {
            transform:
              rotate(360deg);
          }

        }

        /* =========================================
           TABLET
        ========================================= */

        @media (max-width: 950px) {

          .login-shell {
            grid-template-columns:
              55% 45%;
          }

          .login-brand-content {
            padding:
              32px;
          }

          .login-brand-footer {
            left:
              32px;

            right:
              32px;
          }

          .login-form-wrapper {
            width:
              min(
                500px,
                calc(100% - 40px)
              );
          }

          .login-brand-message h1 {
            font-size:
              44px;
          }

        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 720px) {

          .login-page {
            height:
              100dvh;

            min-height:
              100dvh;

            max-height:
              100dvh;

            overflow:
              hidden;
          }

          .login-shell {
            display:
              block;

            width:
              100%;

            height:
              100%;

            overflow:
              hidden;
          }

          .login-brand-panel {
            display:
              none;
          }

          .login-form-panel {
            width:
              100%;

            height:
              100%;

            overflow:
              hidden;
          }

          .login-form-wrapper {
            width:
              min(
                500px,
                calc(100% - 32px)
              );

            height:
              100%;

            max-height:
              100%;

            margin:
              0 auto;

            justify-content:
              center;

            overflow:
              hidden;
          }

          .login-heading {
            margin-bottom:
              16px;
          }

          .login-welcome {
            font-size:
              12px;
          }

          .login-heading h2 {
            font-size:
              29px;
          }

          .login-subtitle {
            font-size:
              13px;
          }

          .login-role-grid {
            gap:
              6px;
          }

          .login-role-card {
            height:
              59px;

            padding:
              7px;
          }

          .login-role-icon {
            width:
              29px;

            height:
              29px;

            flex-basis:
              29px;
          }

          .login-role-text strong {
            font-size:
              10px;
          }

          .login-role-text small {
            font-size:
              8px;
          }

          .login-input-wrapper {
            height:
              43px;
          }

          .login-input-wrapper input {
            font-size:
              13px;
          }

        }

        /* =========================================
           SMALL MOBILE
        ========================================= */

        @media (max-width: 390px) {

          .login-form-wrapper {
            width:
              calc(100% - 24px);
          }

          .login-heading {
            margin-bottom:
              11px;
          }

          .login-heading h2 {
            font-size:
              25px;
          }

          .login-subtitle {
            font-size:
              11px;
          }

          .login-role-card {
            height:
              54px;

            padding:
              6px;
          }

          .login-role-text small {
            display:
              none;
          }

          .login-field {
            margin-bottom:
              5px;
          }

          .login-field-error {
            height:
              17px;
          }

          .login-submit {
            height:
              42px;
          }

          .login-submit-error {
            height:
              27px;
          }

          .admin-access-note {
            height:
              38px;

            font-size:
              10px;
          }

          .admin-login-link {
            font-size:
              10px;
          }

          .admin-login-link button {
            font-size:
              10px;
          }

          .login-register {
            font-size:
              10px;
          }

          .login-guest a {
            font-size:
              10px;
          }

        }

      `}</style>

    </main>
  );
}

export default Login;