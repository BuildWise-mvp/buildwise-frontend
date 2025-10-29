// src/pages/ProjectsPage.js
import React, { useEffect, useState } from "react";
import { fetchProjects, createProject, deleteProject } from "../services/projectService";
import { toast } from "react-toastify";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
try {
  await createProject(name, description);
  toast.success("✅ Project created successfully!");
  setName("");
  setDescription("");
  await loadProjects();
} catch (err) {
  toast.error("❌ Failed to create project");
}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
try {
  await deleteProject(id);
  toast.info("🗑️ Project deleted");
  await loadProjects();
} catch (err) {
  toast.error("❌ Failed to delete project");
}
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h1>📂 Projects</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={name}
          placeholder="Project name"
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: 8, marginRight: 8 }}
        />
        <input
          type="text"
          value={description}
          placeholder="Description"
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
        />
        <button type="submit" style={{ padding: 8 }}>
          ➕ Add
        </button>
      </form>

      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {projects.length === 0 ? (
            <p>No projects yet</p>
          ) : (
            projects.map((p) => (
              <li
                key={p.id}
                style={{
                  marginBottom: 8,
                  borderBottom: "1px solid #ddd",
                  paddingBottom: 6,
                }}
              >
                <strong>{p.name}</strong> — {p.description || "No description"}{" "}
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{
                    marginLeft: 10,
                    color: "white",
                    background: "red",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    padding: "2px 8px",
                  }}
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
