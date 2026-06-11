import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomeRedirect() {
  const { token } = useAuth();

  return token
    ? <Navigate to="/home" replace />
    : <Navigate to="/landing" replace />;
}