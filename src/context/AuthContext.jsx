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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------
  // RESTORE LOGGED-IN USER
  // ---------------------------------------------------------

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
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

  // ---------------------------------------------------------
  // GET REGISTERED ACCOUNTS
  // ---------------------------------------------------------

  const getAccounts = () => {
    try {
      const storedAccounts = localStorage.getItem(
        ACCOUNTS_STORAGE_KEY
      );

      if (!storedAccounts) {
        return [];
      }

      const parsedAccounts = JSON.parse(storedAccounts);

      return Array.isArray(parsedAccounts)
        ? parsedAccounts
        : [];
    } catch (error) {
      console.error(
        "Unable to read EventON accounts:",
        error
      );

      return [];
    }
  };

  // ---------------------------------------------------------
  // SAVE REGISTERED ACCOUNTS
  // ---------------------------------------------------------

  const saveAccounts = (accounts) => {
    localStorage.setItem(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify(accounts)
    );
  };

  // ---------------------------------------------------------
  // REGISTER
  // ---------------------------------------------------------

  const register = (userData) => {
    const accounts = getAccounts();

    const normalizedEmail = userData.email
      .trim()
      .toLowerCase();

    const existingAccount = accounts.find(
      (account) =>
        account.email.toLowerCase() === normalizedEmail
    );

    if (existingAccount) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }

    const newAccount = {
      id: `user-${Date.now()}`,
      name: userData.name.trim(),
      email: normalizedEmail,
      password: userData.password,
    };

    saveAccounts([...accounts, newAccount]);

    const loggedInUser = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
    };

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);

    return {
      success: true,
      user: loggedInUser,
    };
  };

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------

  const login = (userData) => {
    const accounts = getAccounts();

    const normalizedEmail = userData.email
      .trim()
      .toLowerCase();

    const account = accounts.find(
      (item) =>
        item.email.toLowerCase() === normalizedEmail
    );

    if (!account) {
      return {
        success: false,
        error: "No account found with this email.",
      };
    }

    if (account.password !== userData.password) {
      return {
        success: false,
        error: "Incorrect password.",
      };
    }

    const loggedInUser = {
      id: account.id,
      name: account.name,
      email: account.email,
    };

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);

    return {
      success: true,
      user: loggedInUser,
    };
  };

  // ---------------------------------------------------------
  // UPDATE USER
  // ---------------------------------------------------------

  const updateUser = (updates) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const updatedUser = {
        ...currentUser,
        ...updates,
      };

      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(updatedUser)
      );

      // Keep registered account information in sync
      const accounts = getAccounts();

      const updatedAccounts = accounts.map((account) =>
        account.id === currentUser.id
          ? {
              ...account,
              ...updates,
            }
          : account
      );

      saveAccounts(updatedAccounts);

      return updatedUser;
    });
  };

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  // ---------------------------------------------------------
  // CONTEXT VALUE
  // ---------------------------------------------------------

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

// ---------------------------------------------------------
// useAuth HOOK
// ---------------------------------------------------------

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export default AuthContext;