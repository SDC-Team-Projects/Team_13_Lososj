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
  const savedToken = localStorage.getItem("token");

  if (!savedToken) {
    setLoading(false);
    return;
  }

  setToken(savedToken);

  fetch("https://team-13-lososj.onrender.com/api/profile", {
    headers: {
      Authorization: `Bearer ${savedToken}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setUser(data);

      localStorage.setItem("user", JSON.stringify(data));
    })
    .finally(() => setLoading(false));
}, []);

  // LOGIN
  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));

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

  // ROLE HELPERS
  const getRole = () => {
    return user?.role || null;
  };

  const isAdmin = () => {
    return user?.role === "ADMIN";
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
        loading,
        getRole,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}