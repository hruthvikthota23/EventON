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
    email: String(user.email)
      .trim()
      .toLowerCase(),
    role: normalizeRole(user.role),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem(
          USER_STORAGE_KEY
        );

      if (!storedUser) {
        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      const normalizedUser =
        normalizeUser(parsedUser);

      if (normalizedUser) {
        const accounts = getAccounts();

        const account = accounts.find(
          (item) =>
            String(item.id) ===
            String(normalizedUser.id)
        );

        const migratedUser = {
          ...normalizedUser,
          role: normalizeRole(
            account?.role ||
              normalizedUser.role
          ),
        };

        setUser(migratedUser);

        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(migratedUser)
        );
      } else {
        localStorage.removeItem(
          USER_STORAGE_KEY
        );
      }
    } catch (error) {
      console.error(
        "Unable to restore EventON user:",
        error
      );

      localStorage.removeItem(
        USER_STORAGE_KEY
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  function getAccounts() {
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
          role: normalizeRole(
            account.role
          ),
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

  function saveAccounts(accounts) {
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

  const register = (userData) => {
    const accounts = getAccounts();

    const normalizedEmail = String(
      userData.email || ""
    )
      .trim()
      .toLowerCase();

    const normalizedName = String(
      userData.name || ""
    ).trim();

    if (!normalizedName) {
      return {
        success: false,
        error: "Name is required.",
      };
    }

    if (!normalizedEmail) {
      return {
        success: false,
        error: "Email is required.",
      };
    }

    if (
      !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(
        normalizedEmail
      )
    ) {
      return {
        success: false,
        error:
          "Enter a valid Gmail address ending with @gmail.com.",
      };
    }

    if (!userData.password) {
      return {
        success: false,
        error: "Password is required.",
      };
    }

    const existingAccount =
      accounts.find(
        (account) =>
          String(account.email)
            .toLowerCase() ===
          normalizedEmail
      );

    if (existingAccount) {
      return {
        success: false,
        error:
          "An account with this email already exists.",
      };
    }

    const selectedRole =
      String(userData.role || DEFAULT_ROLE)
        .trim()
        .toLowerCase();

    const role = [
      "attendee",
      "organizer",
    ].includes(selectedRole)
      ? selectedRole
      : DEFAULT_ROLE;

    const newAccount = {
      id: `user-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      name: normalizedName,
      email: normalizedEmail,
      password: userData.password,
      role,
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

    const loggedInUser = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
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

  const login = (userData) => {
    const accounts = getAccounts();

    const normalizedEmail = String(
      userData.email || ""
    )
      .trim()
      .toLowerCase();

    const account = accounts.find(
      (item) =>
        String(item.email)
          .toLowerCase() ===
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
      String(userData.role || DEFAULT_ROLE)
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

    const loggedInUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: accountRole,
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

  const updateUser = (updates) => {
    if (!user) {
      return {
        success: false,
        error:
          "No authenticated user found.",
      };
    }

    const accounts = getAccounts();

    const updatedName =
      updates.name !== undefined
        ? String(updates.name).trim()
        : user.name;

    const updatedEmail =
      updates.email !== undefined
        ? String(updates.email)
            .trim()
            .toLowerCase()
        : user.email;

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

    if (!updatedEmail) {
      return {
        success: false,
        error: "Email is required.",
      };
    }

    if (
      !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(
        updatedEmail
      )
    ) {
      return {
        success: false,
        error:
          "Enter a valid Gmail address ending with @gmail.com.",
      };
    }

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

    const duplicateAccount =
      accounts.find(
        (account) =>
          String(account.id) !==
            String(user.id) &&
          String(account.email)
            .toLowerCase() ===
            updatedEmail
      );

    if (duplicateAccount) {
      return {
        success: false,
        error:
          "Another account already uses this email.",
      };
    }

    const currentRole =
      normalizeRole(
        currentAccount.role ||
          user.role
      );

    const updatedUser = {
      ...user,
      name: updatedName,
      email: updatedEmail,
      role: currentRole,
    };

    const updatedAccounts =
      accounts.map((account) => {
        if (
          String(account.id) !==
          String(user.id)
        ) {
          return account;
        }

        return {
          ...account,
          name: updatedName,
          email: updatedEmail,
          role: currentRole,
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

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
