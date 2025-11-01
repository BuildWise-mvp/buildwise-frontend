import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../services/dashboardService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const visibleCards = [];

if (role === "admin") {
  visibleCards.push("projects", "files", "rules");
} else if (role === "editor") {
  visibleCards.push("projects", "files");
} else if (role === "viewer") {
  visibleCards.push("files");
}

  const brand = process.env.REACT_APP_BRAND_NAME || "BuildWise Systems";
  const [hoveredCard, setHoveredCard] = useState(null);

  const [stats, setStats] = useState({
    projectsCount: 0,
    filesCount: 0,
    rulesCount: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };
  
  return (
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <h1>🏗️ {brand} Dashboard</h1>
      <p>Welcome, <strong>{role}</strong>!</p>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "40px",
  }}
>
  {visibleCards.includes("projects") && (
    <div
      style={{
        ...cardStyle,
        ...(hoveredCard === "projects" ? hoverStyle : {}),
      }}
      onMouseEnter={() => setHoveredCard("projects")}
      onMouseLeave={() => setHoveredCard(null)}
      onClick={() => navigate("/projects")}
    >
      <h2>{stats.projectsCount}</h2>
      <p>Projects</p>
    </div>
  )}

  {visibleCards.includes("files") && (
    <div
      style={{
        ...cardStyle,
        ...(hoveredCard === "files" ? hoverStyle : {}),
      }}
      onMouseEnter={() => setHoveredCard("files")}
      onMouseLeave={() => setHoveredCard(null)}
      onClick={() => navigate("/files")}
    >
      <h2>{stats.filesCount}</h2>
      <p>Files</p>
    </div>
  )}

  {visibleCards.includes("rules") && (
    <div
      style={{
        ...cardStyle,
        ...(hoveredCard === "rules" ? hoverStyle : {}),
      }}
      onMouseEnter={() => setHoveredCard("rules")}
      onMouseLeave={() => setHoveredCard(null)}
      onClick={() => navigate("/rules")}
    >
      <h2>{stats.rulesCount}</h2>
      <p>Rules</p>
    </div>
  )}
</div>

{/* ===== Chart Section ===== */}
<div
  style={{
    marginTop: "60px",
    width: "100%",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  }}
>
  <h3 style={{ marginBottom: 20 }}>📊 System Overview</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={[
        { name: "Projects", value: stats.projectsCount },
        { name: "Files", value: stats.filesCount },
        { name: "Rules", value: stats.rulesCount },
      ]}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 50,
          padding: "10px 20px",
          backgroundColor: "#e63946",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

const cardStyle = {
  background: "#f0f0f0",
  borderRadius: 10,
  padding: "20px 30px",
  width: 150,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const hoverStyle = {
  transform: "translateY(-5px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
};


