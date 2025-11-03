import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../services/dashboardService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

// Simple count-up animation
const animateValue = (start, end, duration, setValue) => {
  if (start === end) return;
  const range = end - start;
  let startTime = null;

  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const current = Math.floor(start + range * progress);
    setValue(current);
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

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
  const loadStats = async () => {
    try {
      const data = await fetchDashboardStats();

      // Animate each counter smoothly over 1 second
      animateValue(stats.projectsCount, data.projectsCount, 1000, (v) =>
        setStats((s) => ({ ...s, projectsCount: v }))
      );
      animateValue(stats.filesCount, data.filesCount, 1000, (v) =>
        setStats((s) => ({ ...s, filesCount: v }))
      );
      animateValue(stats.rulesCount, data.rulesCount, 1000, (v) =>
        setStats((s) => ({ ...s, rulesCount: v }))
      );
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

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

{/* ===== Enhanced Chart Section ===== */}
<div
  style={{
    marginTop: "60px",
    width: "100%",
    maxWidth: "650px",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 14,
    padding: 24,
    backgroundColor: isDark ? "#111827" : "#ffffff",
    color: isDark ? "#e5e7eb" : "#111827",
    boxShadow: isDark
      ? "0 4px 16px rgba(255,255,255,0.05)"
      : "0 4px 16px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
  }}
>
  <h3 style={{ marginBottom: 20, textAlign: "center" }}>📊 System Overview</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={[
        { name: "Projects", value: stats.projectsCount },
        { name: "Files", value: stats.filesCount },
        { name: "Rules", value: stats.rulesCount },
      ]}
      margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
    >
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={isDark ? "#60a5fa" : "#3b82f6"}
            stopOpacity={0.9}
          />
          <stop
            offset="100%"
            stopColor={isDark ? "#2563eb" : "#60a5fa"}
            stopOpacity={0.7}
          />
        </linearGradient>
      </defs>

      <CartesianGrid
        strokeDasharray="3 3"
        stroke={isDark ? "#374151" : "#e5e7eb"}
      />
      <XAxis dataKey="name" stroke={isDark ? "#9ca3af" : "#4b5563"} />
      <YAxis stroke={isDark ? "#9ca3af" : "#4b5563"} />
      <Tooltip
        contentStyle={{
          backgroundColor: isDark ? "#1f2937" : "#f9fafb",
          color: isDark ? "#f3f4f6" : "#111827",
          borderRadius: 8,
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      />
      <Bar
        dataKey="value"
        fill="url(#barGradient)"
        radius={[8, 8, 0, 0]}
        animationDuration={1200}
      />
    </BarChart>
  </ResponsiveContainer>
</div>

{/* ===== Pie Chart Section ===== */}
<div
  style={{
    marginTop: "60px",
    width: "100%",
    maxWidth: "500px",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 14,
    padding: 24,
    backgroundColor: isDark ? "#111827" : "#ffffff",
    color: isDark ? "#e5e7eb" : "#111827",
    boxShadow: isDark
      ? "0 4px 16px rgba(255,255,255,0.05)"
      : "0 4px 16px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
  }}
>
  <h3 style={{ marginBottom: 20, textAlign: "center" }}>📂 Data Composition</h3>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={[
          { name: "Projects", value: stats.projectsCount },
          { name: "Files", value: stats.filesCount },
          { name: "Rules", value: stats.rulesCount },
        ]}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        <Cell fill={isDark ? "#60a5fa" : "#3b82f6"} />
        <Cell fill={isDark ? "#34d399" : "#10b981"} />
        <Cell fill={isDark ? "#fbbf24" : "#f59e0b"} />
      </Pie>
      <Legend
        wrapperStyle={{
          color: isDark ? "#e5e7eb" : "#111827",
        }}
      />
    </PieChart>
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

const isDark = document.body.classList.contains("dark");

const cardStyle = {
  background: isDark ? "#1f2937" : "#f9fafb", // dark gray vs light gray
  color: isDark ? "#f9fafb" : "#111827", // readable contrast
  borderRadius: 12,
  padding: "24px 32px",
  width: 160,
  boxShadow: isDark
    ? "0 2px 6px rgba(255,255,255,0.1)"
    : "0 2px 8px rgba(0,0,0,0.1)",
  cursor: "pointer",
  transition: "all 0.3s ease",
};

const hoverStyle = {
  transform: "translateY(-5px)",
  boxShadow: isDark
    ? "0 4px 12px rgba(255,255,255,0.15)"
    : "0 4px 12px rgba(0,0,0,0.2)",
};


