

// import { createContext, useState, useEffect, useContext } from "react";
// import { apiFetch } from "../api/apiClient";

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [token, setToken] = useState(null);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

// // INIT AUTH
// useEffect(() => {
//   const savedToken = localStorage.getItem("token");

//   if (!savedToken) {
//     setLoading(false);
//     return;
//   }

//   setToken(savedToken);

//   // fetch("https://team-13-lososj.onrender.com/api/profile", {
//   //   headers: {
//   //     Authorization: `Bearer ${savedToken}`,
//   //   },
//   // })

//   apiFetch("https://team-13-lososj.onrender.com/api/profile")
//     .then((res) => {
//       if (!res.ok) throw new Error("Auth failed");
//       return res.json();
//     })
//     .then((data) => {
//       setUser(data);
//     })
//     .catch(() => {
//       localStorage.removeItem("token");
//       setToken(null);
//       setUser(null);
//     })
//     .finally(() => {
//       setLoading(false);
//     });
// }, []);

// const login = (newToken, userData) => {
//   localStorage.setItem("token", newToken);
//   setToken(newToken);
//   setUser(userData);
// };

// const logout = () => {
//   localStorage.removeItem("token");
//   setToken(null);
//   setUser(null);
// };

//   // ✅ ВАЖНО: auth = token, не user
//   const isAuthenticated = !!token;

//   const isAdmin = user?.role === "ADMIN";

//   return (
//     <AuthContext.Provider
//       value={{
//         token,
//         user,
//         setUser, 
//         login,
//         logout,
//         isAuthenticated,
//         loading,
//         isAdmin,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }




import { createContext, useState, useEffect, useContext } from "react";
import { apiFetch } from "../api/apiClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // INIT AUTH
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);

    apiFetch("https://team-13-lososj.onrender.com/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Auth failed");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
        isAdmin: user?.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}