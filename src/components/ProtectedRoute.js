// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If not logged in, redirect to login
  if (!token) return <Navigate to="/login" replace />;

  // If role not allowed, show access denied
  if (!allowedRoles.includes(role)) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h2>🚫 Access Denied</h2>
        <p>Your role <strong>{role}</strong> does not have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
