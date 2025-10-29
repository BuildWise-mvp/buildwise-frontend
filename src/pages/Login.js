// src/pages/Login.js
import React, { useState } from "react";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const result = await loginUser(username, password);

if (result.success) {
  toast.success(`✅ Logged in as ${result.role}`);
  navigate("/dashboard");
} else {
  toast.error(result.message || "Login failed");
}

    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "64px auto",
        padding: 24,
        border: "1px solid #ccc",
        borderRadius: 10,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ marginBottom: 16, textAlign: "center" }}>BuildWise Systems Login</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        {error && (
  <div style={{ color: "red", marginBottom: 12, textAlign: "center" }}>
    {typeof error === "string"
      ? error
      : JSON.stringify(error.detail || error)}
  </div>
)}

        {success && (
          <div style={{ color: "green", marginBottom: 12, textAlign: "center" }}>
            Login successful!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

