import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import AdminPage from "./pages/AdminPage";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectsPage from "./pages/ProjectsPage";
import FilesPage from "./pages/FilesPage";
import RulesPage from "./pages/RulesPage";
import { useContext } from "react";
import { ThemeContext } from "./context/ThemeContext";
import { ToastContainer } from "react-toastify";

export default function App() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <div>
<nav
  style={{
    padding: 12,
    borderBottom: darkMode ? "1px solid #444" : "1px solid #eee",
    backgroundColor: darkMode ? "#1e1e1e" : "#f9f9f9",
  }}
>
  <Link to="/" style={{ marginRight: 12 }}>Home</Link>
  <Link to="/login" style={{ marginRight: 12 }}>Login</Link>
  <Link to="/dashboard" style={{ marginRight: 12 }}>Dashboard</Link>
  <Link to="/projects" style={{ marginRight: 12 }}>Projects</Link>
  <Link to="/files" style={{ marginRight: 12 }}>Files</Link>
  <Link to="/rules" style={{ marginRight: 12 }}>Rules</Link>
  <button
    onClick={toggleTheme}
    style={{
      float: "right",
      background: darkMode ? "#555" : "#ddd",
      color: darkMode ? "#fff" : "#000",
      border: "none",
      borderRadius: 6,
      padding: "4px 10px",
      cursor: "pointer",
    }}
  >
    {darkMode ? "☀️ Light" : "🌙 Dark"}
  </button>
</nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={["admin", "editor"]}>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/files"
          element={
            <ProtectedRoute allowedRoles={["admin", "editor", "viewer"]}>
              <FilesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rules"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RulesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
<ToastContainer
  position="top-right"
  autoClose={3000}
  theme={darkMode ? "dark" : "light"}
  newestOnTop
  pauseOnFocusLoss={false}
  pauseOnHover
/>
<footer style={{ textAlign: "center", marginTop: 40, opacity: 0.6 }}>
  © {new Date().getFullYear()} BuildWise Systems — Created by ARCHITECT MA.H. All rights reserved.
</footer>
    </div>
  );
}
