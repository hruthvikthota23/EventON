import {
  createContext,
  useContext,
  useEffect,
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

// ===========================================================
// AUTH UPDATE EVENT
// ===========================================================

function notifyAuthUpdated() {
  window.dispatchEvent(
    new Event(AUTH_UPDATED_EVENT)
  );
}

// ===========================================================
// NORMALIZE ROLE
// ===========================================================

function normalizeRole(role) {
  return VALID_ROLES.includes(role)
    ? role
    : DEFAULT_ROLE;
}

// ===========================================================
// AUTH PROVIDER
// ===========================================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // =========================================================
  // RESTORE CURRENT USER
  // =========================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(
        USER_STORAGE_KEY
      );

      if (!storedUser) {
        setIsLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (
        parsedUser &&
        typeof parsedUser === "object" &&
        parsedUser.id &&
        parsedUser.email
      ) {
        const restoredUser = {
          id: parsedUser.id,
          name: parsedUser.name || "",
          email: String(parsedUser.email)
            .trim()
            .toLowerCase(),
          role: normalizeRole(parsedUser.role),
        };

        setUser(restoredUser);
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error(
        "Unable to restore EventON user:",
        error
      );

      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================================================
  // GET ACCOUNTS
  // =========================================================

  const getAccounts = () => {
    try {
      const storedAccounts = localStorage.getItem(
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

      return parsedAccounts;
    } catch (error) {
      console.error(
        "Unable to read EventON accounts:",
        error
      );

      return [];
    }
  };

  // =========================================================
  // SAVE ACCOUNTS
  // =========================================================

  const saveAccounts = (accounts) => {
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
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const register = (userData) => {
    const accounts = getAccounts();

    const normalizedName = String(
      userData?.name || ""
    ).trim();

    const normalizedEmail = String(
      userData?.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      userData?.password || ""
    );

    // -------------------------------------------------------
    // NAME VALIDATION
    // -------------------------------------------------------

    if (!normalizedName) {
      return {
        success: false,
        error: "Name is required.",
      };
    }

    if (normalizedName.length < 2) {
      return {
        success: false,
        error:
          "Name must contain at least 2 characters.",
      };
    }

    // -------------------------------------------------------
    // EMAIL VALIDATION
    // -------------------------------------------------------

    if (!normalizedEmail) {
      return {
        success: false,
        error: "Email is required.",
      };
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      return {
        success: false,
        error: "Enter a valid email address.",
      };
    }

    // -------------------------------------------------------
    // PASSWORD VALIDATION
    // -------------------------------------------------------

    if (!password) {
      return {
        success: false,
        error: "Password is required.",
      };
    }

    // Register page already validates password length,
    // but keeping this here protects the auth layer too.
    if (password.length < 8) {
      return {
        success: false,
        error:
          "Password must contain at least 8 characters.",
      };
    }

    // -------------------------------------------------------
    // DUPLICATE EMAIL CHECK
    // -------------------------------------------------------

    const existingAccount = accounts.find(
      (account) =>
        String(account.email || "")
          .trim()
          .toLowerCase() === normalizedEmail
    );

    if (existingAccount) {
      return {
        success: false,
        error:
          "An account with this email already exists.",
      };
    }

    // -------------------------------------------------------
    // CREATE ACCOUNT
    // -------------------------------------------------------

    const newAccount = {
      id: `user-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

      name: normalizedName,

      email: normalizedEmail,

      password,

      // New accounts are attendees by default.
      role: DEFAULT_ROLE,

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString(),
    };

    const updatedAccounts = [
      ...accounts,
      newAccount,
    ];

    const saved = saveAccounts(
      updatedAccounts
    );

    if (!saved) {
      return {
        success: false,
        error:
          "Unable to create your account. Please try again.",
      };
    }

    // -------------------------------------------------------
    // CREATE CURRENT SESSION
    // -------------------------------------------------------

    const loggedInUser = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
    };

    try {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(loggedInUser)
      );
    } catch (error) {
      console.error(
        "Unable to save EventON user:",
        error
      );

      return {
        success: false,
        error:
          "Account created, but login session could not be saved.",
      };
    }

    setUser(loggedInUser);

    notifyAuthUpdated();

    return {
      success: true,
      user: loggedInUser,
    };
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const login = (userData) => {
    const accounts = getAccounts();

    const normalizedEmail = String(
      userData?.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      userData?.password || ""
    );

    // -------------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------------

    if (!normalizedEmail) {
      return {
        success: false,
        error: "Email is required.",
      };
    }

    if (!password) {
      return {
        success: false,
        error: "Password is required.",
      };
    }

    // -------------------------------------------------------
    // FIND ACCOUNT
    // -------------------------------------------------------

    const account = accounts.find(
      (item) =>
        String(item.email || "")
          .trim()
          .toLowerCase() === normalizedEmail
    );

    if (!account) {
      return {
        success: false,
        error:
          "No account found with this email.",
      };
    }

    // -------------------------------------------------------
    // PASSWORD CHECK
    // -------------------------------------------------------

    if (account.password !== password) {
      return {
        success: false,
        error: "Incorrect password.",
      };
    }

    // -------------------------------------------------------
    // CURRENT SESSION
    // -------------------------------------------------------

    const loggedInUser = {
      id: account.id,
      name: account.name || "",
      email: String(account.email)
        .trim()
        .toLowerCase(),

      role: normalizeRole(account.role),
    };

    try {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(loggedInUser)
      );
    } catch (error) {
      console.error(
        "Unable to save EventON user:",
        error
      );

      return {
        success: false,
        error:
          "Login succeeded, but the session could not be saved.",
      };
    }

    setUser(loggedInUser);

    notifyAuthUpdated();

    return {
      success: true,
      user: loggedInUser,
    };
  };

  // =========================================================
  // UPDATE USER
  // =========================================================

  const updateUser = (updates = {}) => {
    if (!user) {
      return {
        success: false,
        error:
          "No authenticated user found.",
      };
    }

    const accounts = getAccounts();

    // -------------------------------------------------------
    // FIND CURRENT ACCOUNT
    // -------------------------------------------------------

    const currentAccount = accounts.find(
      (account) => account.id === user.id
    );

    if (!currentAccount) {
      return {
        success: false,
        error:
          "Your account could not be found. Please log in again.",
      };
    }

    // -------------------------------------------------------
    // NORMALIZE VALUES
    // -------------------------------------------------------

    const updatedName =
      updates.name !== undefined
        ? String(updates.name).trim()
        : currentAccount.name;

    const updatedEmail =
      updates.email !== undefined
        ? String(updates.email)
            .trim()
            .toLowerCase()
        : String(currentAccount.email)
            .trim()
            .toLowerCase();

    // -------------------------------------------------------
    // NAME VALIDATION
    // -------------------------------------------------------

    if (!updatedName) {
      return {
        success: false,
        error: "Name is required.",
      };
    }

    if (updatedName.length < 2) {
      return {
        success: false,
        error:
          "Name must contain at least 2 characters.",
      };
    }

    // -------------------------------------------------------
    // EMAIL VALIDATION
    // -------------------------------------------------------

    if (!updatedEmail) {
      return {
        success: false,
        error: "Email is required.",
      };
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        updatedEmail
      )
    ) {
      return {
        success: false,
        error:
          "Enter a valid email address.",
      };
    }

    // -------------------------------------------------------
    // DUPLICATE EMAIL CHECK
    // -------------------------------------------------------

    const duplicateAccount = accounts.find(
      (account) =>
        account.id !== user.id &&
        String(account.email || "")
          .trim()
          .toLowerCase() === updatedEmail
    );

    if (duplicateAccount) {
      return {
        success: false,
        error:
          "Another account already uses this email.",
      };
    }

    // -------------------------------------------------------
    // UPDATE ACCOUNT
    // -------------------------------------------------------

    const updatedAccounts = accounts.map(
      (account) => {
        if (account.id !== user.id) {
          return account;
        }

        return {
          ...account,

          name: updatedName,

          email: updatedEmail,

          // Never allow profile editing to
          // accidentally change the role.
          role: normalizeRole(account.role),

          updatedAt:
            new Date().toISOString(),
        };
      }
    );

    const saved = saveAccounts(
      updatedAccounts
    );

    if (!saved) {
      return {
        success: false,
        error:
          "Unable to save your profile changes.",
      };
    }

    // -------------------------------------------------------
    // UPDATE CURRENT SESSION
    // -------------------------------------------------------

    const updatedUser = {
      ...user,

      name: updatedName,

      email: updatedEmail,

      role: normalizeRole(
        currentAccount.role
      ),
    };

    try {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(updatedUser)
      );
    } catch (error) {
      console.error(
        "Unable to save EventON user:",
        error
      );

      return {
        success: false,
        error:
          "Unable to save your profile changes.",
      };
    }

    setUser(updatedUser);

    notifyAuthUpdated();

    return {
      success: true,
      user: updatedUser,
    };
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    try {
      localStorage.removeItem(
        USER_STORAGE_KEY
      );
    } catch (error) {
      console.error(
        "Unable to clear EventON session:",
        error
      );
    }

    setUser(null);

    notifyAuthUpdated();

    return {
      success: true,
    };
  };

  // =========================================================
  // CONTEXT VALUE
  // =========================================================

  const value = useMemo(
    () => ({
      user,

      isAuthenticated: Boolean(user),

      isLoading,

      login,

      register,

      updateUser,

      logout,
    }),
    [user, isLoading]
  );

  // =========================================================
  // PROVIDER
  // =========================================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ===========================================================
// useAuth HOOK
// ===========================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}