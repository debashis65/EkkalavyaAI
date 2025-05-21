import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

export function AuthRoutes() {
  const { isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
}

export function PublicRoutes() {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, render the child routes
  return <Outlet />;
}