import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "eventon_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------
  // RESTORE USER
  // ---------------------------------------------------------

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem(STORAGE_KEY);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error(
        "Unable to restore EventON user:",
        error
      );

      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------

  const login = (userData) => {
    const normalizedUser = {
      id:
        userData.id ||
        `user-${Date.now()}`,

      name:
        userData.name ||
        "EventON User",

      email: userData.email,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalizedUser)
    );

    setUser(normalizedUser);

    return normalizedUser;
  };

  // ---------------------------------------------------------
  // REGISTER
  // ---------------------------------------------------------

  const register = (userData) => {
    return login({
      name: userData.name,
      email: userData.email,
    });
  };

  const updateUser = (updates) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const updatedUser = {
        ...currentUser,
        ...updates,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      return updatedUser;
    });
  };

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);

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