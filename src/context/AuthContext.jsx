

import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // INIT AUTH
  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");

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
      .then((res) => {
        if (!res.ok) throw new Error("Auth failed");
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        sessionStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // LOGIN
  const login = (newToken, userData) => {
    sessionStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  // LOGOUT
  const logout = () => {
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // ✅ ВАЖНО: auth = token, не user
  const isAuthenticated = !!token;

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser, 
        login,
        logout,
        isAuthenticated,
        loading,
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