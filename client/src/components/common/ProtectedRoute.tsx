import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Role } from "@almalink/shared";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();

  let user: { role?: Role; fullName?: string; email?: string } | null = null;
  const token = localStorage.getItem("almalink_token");

  try {
    const raw = localStorage.getItem("almalink_user");
    if (raw) user = JSON.parse(raw);
  } catch {
    user = null;
  }

  // 1. If no session or token, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If route has role restrictions and current user role is not permitted
  if (allowedRoles && allowedRoles.length > 0 && user.role) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect user safely to their role's home workspace
      if (user.role === Role.SUPER_ADMIN || user.role === Role.COLLEGE_ADMIN) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (user.role === Role.CELL_COORDINATOR) {
        return <Navigate to="/coordinator/dashboard" replace />;
      }
      if (user.role === Role.ALUMNI) {
        return <Navigate to="/alumni/home" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
