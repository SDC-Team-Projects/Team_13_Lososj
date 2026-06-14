

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomeRedirect() {
  const { token, loading } = useAuth();

  if (loading) return null; // или loader

  return token
    ? <Navigate to="/home" replace />
    : <Navigate to="/landing" replace />;
}