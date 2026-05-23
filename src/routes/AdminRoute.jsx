import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user?.role !== "ADMIN") {
    return <Navigate to="/home" />;
  }

  return children;
}