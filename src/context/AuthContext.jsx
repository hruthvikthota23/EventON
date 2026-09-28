import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const USER_STORAGE_KEY = "eventon_user";
const ACCOUNTS_STORAGE_KEY = "eventon_accounts";

const AUTH_UPDATED_EVENT = "eventon:auth-updated";

const DEFAULT_ROLE = "attendee";

const VALID_ROLES = [
  "attendee",
  "organizer",
  "admin",
];

/* =========================================================
   INTERNAL ADMIN
========================================================= */

/*
 * EventON currently uses localStorage as its demo data layer.
 *
 * This Admin account is therefore NOT production security.
 * In a real application, Admin credentials must be stored
 * and verified on a backend with hashed passwords.
 */

const INTERNAL_ADMIN = {
  id: "internal-admin",
  name: "Admin",
  mobile: "9876543210",
  email: "admin@gmail.com",
  password: "PasswordAdmin",
  role: "admin",
  createdAt: "2026-09-26T00:00:00.000Z",
};

/* =========================================================
   HELPERS
========================================================= */

function notifyAuthUpdated() {
  window.dispatchEvent(
    new Event(AUTH_UPDATED_EVENT)
  );
}

function normalizeRole(role) {
  const normalized = String(
    role || DEFAULT_ROLE
  )
    .trim()
    .toLowerCase();

  return VALID_ROLES.includes(normalized)
    ? normalized
    : DEFAULT_ROLE;
}

function normalizeMobile(mobile) {
  return String(mobile || "")
    .replace(/\D/g, "")
    .slice(0, 10);
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function isValidGmail(email) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(
    email
  );
}

function isValidIndianMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  if (!user.id || !user.email) {
    return null;
  }

  return {
    id: user.id,
    name: user.name || "",
    email: normalizeEmail(user.email),
    mobile: normalizeMobile(user.mobile),
    role: normalizeRole(user.role),
    createdAt: user.createdAt || "",
  };
}

/* =========================================================
   ACCOUNT STORAGE HELPERS
========================================================= */

function readAccountsFromStorage() {
  try {
    const storedAccounts =
      localStorage.getItem(
        ACCOUNTS_STORAGE_KEY
      );

    if (!storedAccounts) {
      return [];
    }

    const parsedAccounts =
      JSON.parse(storedAccounts);

    if (!Array.isArray(parsedAccounts)) {
      return [];
    }

    return parsedAccounts.map(
      (account) => ({
        ...account,

        email: normalizeEmail(
          account.email
        ),

        mobile: normalizeMobile(
          account.mobile
        ),

        role: normalizeRole(
          account.role
        ),

        createdAt:
          account.createdAt || "",
      })
    );
  } catch (error) {
    console.error(
      "Unable to read EventON accounts:",
      error
    );

    return [];
  }
}

function saveAccountsToStorage(accounts) {
  try {
    localStorage.setItem(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify(accounts)
    );

    return true;
  } catch (error) {
    console.error(
      "Unable to save EventON accounts:",
      error
    );

    return false;
  }
}

/* =========================================================
   INTERNAL ADMIN INITIALIZATION
========================================================= */

function ensureInternalAdminAccount() {
  try {
    const accounts =
      readAccountsFromStorage();

    /*
     * Remove every existing Admin account.
     *
     * This guarantees that EventON has exactly ONE
     * Admin account.
     */
    const nonAdminAccounts =
      accounts.filter(
        (account) =>
          normalizeRole(account.role) !==
          "admin"
      );

    const adminAccount = {
      ...INTERNAL_ADMIN,

      email: normalizeEmail(
        INTERNAL_ADMIN.email
      ),

      mobile: normalizeMobile(
        INTERNAL_ADMIN.mobile
      ),

      role: "admin",
    };

    const updatedAccounts = [
      ...nonAdminAccounts,
      adminAccount,
    ];

    saveAccountsToStorage(
      updatedAccounts
    );

    return adminAccount;
  } catch (error) {
    console.error(
      "Unable to initialize EventON Admin:",
      error
    );

    return null;
  }
}

/* =========================================================
   SESSION RESTORE
========================================================= */

function getInitialUser() {
  try {
    /*
     * Always make sure the single internal Admin exists
     * before restoring the current session.
     */
    const internalAdmin =
      ensureInternalAdminAccount();

    const storedUser =
      localStorage.getItem(
        USER_STORAGE_KEY
      );

    if (!storedUser) {
      return null;
    }

    const parsedUser =
      JSON.parse(storedUser);

    const normalizedUser =
      normalizeUser(parsedUser);

    if (!normalizedUser) {
      localStorage.removeItem(
        USER_STORAGE_KEY
      );

      return null;
    }

    /*
     * If the existing session belongs to an Admin,
     * restore it from the canonical internal Admin.
     *
     * This prevents an old/stale Admin account from
     * remaining active after initialization.
     */
    if (
      normalizeRole(
        normalizedUser.role
      ) === "admin"
    ) {
      if (!internalAdmin) {
        localStorage.removeItem(
          USER_STORAGE_KEY
        );

        return null;
      }

      const restoredAdmin = {
        id: internalAdmin.id,
        name: internalAdmin.name,
        email: internalAdmin.email,
        mobile: internalAdmin.mobile,
        role: "admin",
        createdAt:
          internalAdmin.createdAt,
      };

      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(restoredAdmin)
      );

      return restoredAdmin;
    }

    const accounts =
      readAccountsFromStorage();

    const account = accounts.find(
      (item) =>
        String(item.id) ===
        String(normalizedUser.id)
    );

    if (!account) {
      localStorage.removeItem(
        USER_STORAGE_KEY
      );

      return null;
    }

    /*
     * A normal user must never be restored as Admin
     * through a stale session.
     */
    const accountRole =
      normalizeRole(account.role);

    if (accountRole === "admin") {
      if (!internalAdmin) {
        localStorage.removeItem(
          USER_STORAGE_KEY
        );

        return null;
      }

      const restoredAdmin = {
        id: internalAdmin.id,
        name: internalAdmin.name,
        email: internalAdmin.email,
        mobile: internalAdmin.mobile,
        role: "admin",
        createdAt:
          internalAdmin.createdAt,
      };

      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(restoredAdmin)
      );

      return restoredAdmin;
    }

    const restoredUser = {
      ...normalizedUser,

      name:
        account.name ||
        normalizedUser.name,

      email:
        account.email ||
        normalizedUser.email,

      mobile:
        account.mobile ||
        normalizedUser.mobile,

      role: accountRole,

      createdAt:
        account.createdAt ||
        normalizedUser.createdAt ||
        "",
    };

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(restoredUser)
    );

    return restoredUser;
  } catch (error) {
    console.error(
      "Unable to restore EventON user:",
      error
    );

    try {
      localStorage.removeItem(
        USER_STORAGE_KEY
      );
    } catch {
      // Ignore storage cleanup errors.
    }

    return null;
  }
}

/* =========================================================
   AUTH PROVIDER
========================================================= */

export function AuthProvider({ children }) {
  /*
   * Restore the session during state initialization.
   */
  const [user, setUser] = useState(
    getInitialUser
  );

  const isLoading = false;

  /* =======================================================
     ACCOUNTS
  ======================================================= */

  function getAccounts() {
    return readAccountsFromStorage();
  }

  function saveAccounts(accounts) {
    return saveAccountsToStorage(accounts);
  }

  /* =======================================================
     CHECK REGISTRATION DETAILS

     Used by Register Step 2 and Profile.

     Only field-specific errors are returned.
  ======================================================= */

  const checkRegistrationDetails = ({
    email,
    mobile,
    excludeUserId = null,
  }) => {
    const accounts = getAccounts();

    const normalizedEmail =
      normalizeEmail(email);

    const normalizedMobile =
      normalizeMobile(mobile);

    const emailExists = accounts.some(
      (account) =>
        String(account.id) !==
          String(excludeUserId) &&
        normalizeEmail(account.email) ===
          normalizedEmail
    );

    const mobileExists =
      normalizedMobile &&
      accounts.some(
        (account) =>
          String(account.id) !==
            String(excludeUserId) &&
          normalizeMobile(account.mobile) ===
            normalizedMobile
      );

    if (!emailExists && !mobileExists) {
      return {
        success: true,
        fields: {},
      };
    }

    return {
      success: false,

      fields: {
        ...(emailExists
          ? {
              email:
                "An account with this email already exists.",
            }
          : {}),

        ...(mobileExists
          ? {
              mobile:
                "An account with this mobile number already exists.",
            }
          : {}),
      },
    };
  };

  /* =======================================================
     REGISTER
  ======================================================= */

  const register = (userData) => {
    const accounts = getAccounts();

    const normalizedName =
      String(userData.name || "").trim();

    const normalizedEmail =
      normalizeEmail(userData.email);

    const normalizedMobile =
      normalizeMobile(userData.mobile);

    /* ---------- NAME ---------- */

    if (!normalizedName) {
      return {
        success: false,
        fields: {
          name: "Name is required.",
        },
      };
    }

    if (normalizedName.length < 2) {
      return {
        success: false,
        fields: {
          name:
            "Name must contain at least 2 characters.",
        },
      };
    }

    /* ---------- MOBILE ---------- */

    if (!normalizedMobile) {
      return {
        success: false,
        fields: {
          mobile:
            "Mobile number is required.",
        },
      };
    }

    if (
      !isValidIndianMobile(
        normalizedMobile
      )
    ) {
      return {
        success: false,
        fields: {
          mobile:
            "Enter a valid 10-digit Indian mobile number.",
        },
      };
    }

    /* ---------- EMAIL ---------- */

    if (!normalizedEmail) {
      return {
        success: false,
        fields: {
          email: "Email is required.",
        },
      };
    }

    if (!isValidGmail(normalizedEmail)) {
      return {
        success: false,
        fields: {
          email:
            "Enter a valid Gmail address ending with @gmail.com.",
        },
      };
    }

    /* ---------- PASSWORD ---------- */

    if (!userData.password) {
      return {
        success: false,
        fields: {
          password:
            "Password is required.",
        },
      };
    }

    /* ---------- DUPLICATE CHECK ---------- */

    const availability =
      checkRegistrationDetails({
        email: normalizedEmail,
        mobile: normalizedMobile,
      });

    if (!availability.success) {
      return {
        success: false,
        fields: availability.fields,
      };
    }

    /* ---------- ROLE ---------- */

    const selectedRole =
      String(
        userData.role || DEFAULT_ROLE
      )
        .trim()
        .toLowerCase();

    /*
     * IMPORTANT:
     *
     * Public registration can ONLY create:
     * - attendee
     * - organizer
     *
     * Admin can NEVER be created here.
     */
    const role = [
      "attendee",
      "organizer",
    ].includes(selectedRole)
      ? selectedRole
      : DEFAULT_ROLE;

    /* ---------- CREATE ACCOUNT ---------- */

    const newAccount = {
      id: `user-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

      name: normalizedName,

      mobile: normalizedMobile,

      email: normalizedEmail,

      password: userData.password,

      role,

      createdAt:
        new Date().toISOString(),
    };

    const updatedAccounts = [
      ...accounts,
      newAccount,
    ];

    const saved =
      saveAccounts(updatedAccounts);

    if (!saved) {
      return {
        success: false,
        error:
          "Unable to create your account. Please try again.",
      };
    }

    /* ---------- CREATE SESSION ---------- */

    const loggedInUser = {
      id: newAccount.id,
      name: newAccount.name,
      mobile: newAccount.mobile,
      email: newAccount.email,
      role: newAccount.role,
      createdAt: newAccount.createdAt,
    };

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);

    notifyAuthUpdated();

    return {
      success: true,
      user: loggedInUser,
    };
  };

  /* =======================================================
     LOGIN
  ======================================================= */

  const login = (userData) => {
    const accounts = getAccounts();

    const normalizedEmail =
      normalizeEmail(userData.email);

    const account = accounts.find(
      (item) =>
        normalizeEmail(item.email) ===
        normalizedEmail
    );

    if (!account) {
      return {
        success: false,
        error:
          "No account found with this email.",
      };
    }

    if (
      account.password !==
      userData.password
    ) {
      return {
        success: false,
        error: "Incorrect password.",
      };
    }

    const selectedRole =
      String(
        userData.role || DEFAULT_ROLE
      )
        .trim()
        .toLowerCase();

    const accountRole =
      normalizeRole(account.role);

    if (selectedRole !== accountRole) {
      return {
        success: false,
        error: `This account is registered as ${accountRole}. Please select ${accountRole} to continue.`,
      };
    }

    /*
     * Admin login must always resolve to the
     * canonical internal Admin account.
     */
    const loggedInUser =
      accountRole === "admin"
        ? {
            id: INTERNAL_ADMIN.id,
            name: INTERNAL_ADMIN.name,
            mobile:
              INTERNAL_ADMIN.mobile,
            email:
              INTERNAL_ADMIN.email,
            role: "admin",
            createdAt:
              INTERNAL_ADMIN.createdAt,
          }
        : {
            id: account.id,

            name: account.name || "",

            mobile:
              normalizeMobile(
                account.mobile
              ),

            email:
              normalizeEmail(
                account.email
              ),

            role: accountRole,

            createdAt:
              account.createdAt || "",
          };

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);

    notifyAuthUpdated();

    return {
      success: true,
      user: loggedInUser,
    };
  };

  /* =======================================================
     UPDATE USER / PROFILE
  ======================================================= */

  const updateUser = (updates) => {
    if (!user) {
      return {
        success: false,
        error:
          "No authenticated user found.",
      };
    }

    const accounts = getAccounts();

    const currentAccount =
      accounts.find(
        (account) =>
          String(account.id) ===
          String(user.id)
      );

    if (!currentAccount) {
      return {
        success: false,
        error:
          "Your account could not be found. Please log in again.",
      };
    }

    /* ---------- NAME ---------- */

    const updatedName =
      updates.name !== undefined
        ? String(updates.name).trim()
        : currentAccount.name ||
          user.name;

    if (!updatedName) {
      return {
        success: false,
        fields: {
          name: "Name is required.",
        },
      };
    }

    if (updatedName.length < 2) {
      return {
        success: false,
        fields: {
          name:
            "Name must contain at least 2 characters.",
        },
      };
    }

    /* ---------- EMAIL ---------- */

    const updatedEmail =
      updates.email !== undefined
        ? normalizeEmail(updates.email)
        : normalizeEmail(
            currentAccount.email ||
              user.email
          );

    if (!updatedEmail) {
      return {
        success: false,
        fields: {
          email: "Email is required.",
        },
      };
    }

    if (!isValidGmail(updatedEmail)) {
      return {
        success: false,
        fields: {
          email:
            "Enter a valid Gmail address ending with @gmail.com.",
        },
      };
    }

    /* ---------- MOBILE ---------- */

    const updatedMobile =
      updates.mobile !== undefined
        ? normalizeMobile(updates.mobile)
        : normalizeMobile(
            currentAccount.mobile ||
              user.mobile
          );

    if (!updatedMobile) {
      return {
        success: false,
        fields: {
          mobile:
            "Mobile number is required.",
        },
      };
    }

    if (
      !isValidIndianMobile(
        updatedMobile
      )
    ) {
      return {
        success: false,
        fields: {
          mobile:
            "Enter a valid 10-digit Indian mobile number.",
        },
      };
    }

    /* ---------- DUPLICATE CHECK ---------- */

    const availability =
      checkRegistrationDetails({
        email: updatedEmail,
        mobile: updatedMobile,
        excludeUserId: user.id,
      });

    if (!availability.success) {
      return {
        success: false,
        fields: availability.fields,
      };
    }

    /* ---------- PRESERVE ROLE ---------- */

    const currentRole =
      normalizeRole(
        currentAccount.role ||
          user.role
      );

    /*
     * The Admin role can NEVER be changed
     * through profile updates.
     */
    const finalRole =
      currentRole === "admin"
        ? "admin"
        : currentRole;

    /*
     * Admin identity remains canonical.
     */
    const isAdmin =
      finalRole === "admin";

    const updatedUser = isAdmin
      ? {
          ...user,

          id: INTERNAL_ADMIN.id,

          name: updatedName,

          mobile: updatedMobile,

          email: updatedEmail,

          role: "admin",

          createdAt:
            INTERNAL_ADMIN.createdAt,
        }
      : {
          ...user,

          name: updatedName,

          mobile: updatedMobile,

          email: updatedEmail,

          role: finalRole,

          createdAt:
            currentAccount.createdAt ||
            user.createdAt ||
            "",
        };

    /* ---------- UPDATE ACCOUNT ---------- */

    const updatedAccounts =
      accounts.map((account) => {
        if (
          String(account.id) !==
          String(user.id)
        ) {
          return account;
        }

        /*
         * Never allow profile editing to
         * change an account's role.
         */
        return {
          ...account,

          id: isAdmin
            ? INTERNAL_ADMIN.id
            : account.id,

          name: updatedName,

          mobile: updatedMobile,

          email: updatedEmail,

          role: finalRole,

          createdAt:
            isAdmin
              ? INTERNAL_ADMIN.createdAt
              : account.createdAt ||
                user.createdAt ||
                new Date().toISOString(),
        };
      });

    const saved =
      saveAccounts(updatedAccounts);

    if (!saved) {
      return {
        success: false,
        error:
          "Unable to save your profile changes.",
      };
    }

    /* ---------- UPDATE SESSION ---------- */

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);

    notifyAuthUpdated();

    return {
      success: true,
      user: updatedUser,
    };
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = () => {
    localStorage.removeItem(
      USER_STORAGE_KEY
    );

    setUser(null);

    notifyAuthUpdated();

    return {
      success: true,
    };
  };

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      user,

      isAuthenticated:
        Boolean(user),

      isLoading,

      login,

      register,

      checkRegistrationDetails,

      updateUser,

      logout,
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================================
   USE AUTH

   Fast Refresh treats this as a non-component export.
========================================================= */

/* eslint-disable react-refresh/only-export-components */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

/* eslint-enable react-refresh/only-export-components */