import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../providers/AuthProvider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/logowanie?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}

export function RequireGuest({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/logowanie?redirect=${redirect}`} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
