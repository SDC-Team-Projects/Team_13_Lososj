import {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [token, setToken] = useState(null);

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const savedToken =
      localStorage.getItem("token");

    const savedUser =
      localStorage.getItem("user");

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);

  }, []);

  // LOGIN
  const login = (newToken, userData) => {

    localStorage.setItem(
      "token",
      newToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setToken(newToken);

    setUser(userData);
  };

  // LOGOUT
  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setToken(null);

    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}