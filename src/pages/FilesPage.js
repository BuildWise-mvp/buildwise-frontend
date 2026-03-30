import React, { useEffect, useState } from "react";
import { fetchFiles, uploadFile, deleteFile } from "../services/fileService";
import DxfUpload from "../components/DxfUpload";

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fetchFiles();
      setFiles(data);
    } catch (err) {
      console.error("Error loading files:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !projectId) return alert("Select file and project ID");
    await uploadFile(projectId, selectedFile);
    setSelectedFile(null);
    setProjectId("");
    await loadFiles();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    await deleteFile(id);
    await loadFiles();
  };

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20 }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>📁 Files</h1>

      <div style={cardStyle}>
        <h2>Upload Project Files</h2>
        <p style={sectionText}>
          Upload files and assign them to a project.
        </p>

        <form onSubmit={handleUpload} style={{ marginTop: 15 }}>
          <input
            type="text"
            value={projectId}
            placeholder="Project ID"
            onChange={(e) => setProjectId(e.target.value)}
            style={inputStyle}
            required
          />

          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={inputStyle}
            required
          />

          <button type="submit" style={buttonStyle}>
            Upload File
          </button>
        </form>
      </div>

      <div style={cardStyle}>
        <h2>DXF Analysis</h2>
        <p style={sectionText}>
          Upload and analyze a DXF file to detect drawing geometry.
        </p>
        <DxfUpload />
      </div>

      <div style={cardStyle}>
        <h2>Project Files</h2>

        {loading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p>No files uploaded yet</p>
        ) : (
          files.map((f) => (
            <div key={f.id} style={fileCard}>
              <div>
                <strong style={{ fontSize: "16px" }}>{f.filename}</strong>
                <p style={{ margin: "6px 0 0", color: "#666" }}>
                  Project: {f.project_name || "No project"}
                </p>
              </div>

              <div>
                <a
                  href={`https://buildwise-systems-backend.onrender.com/files/${f.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  style={actionLink}
                >
                  Download
                </a>

                <button onClick={() => handleDelete(f.id)} style={deleteButton}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#ffffff",
  padding: 24,
  borderRadius: 14,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  marginBottom: 25,
};

const sectionText = {
  color: "#666",
  marginTop: 6,
  marginBottom: 16,
};

const inputStyle = {
  padding: 10,
  marginRight: 10,
  marginBottom: 10,
};

const buttonStyle = {
  padding: "10px 16px",
  cursor: "pointer",
  border: "none",
  borderRadius: 8,
};

const fileCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 14,
  borderBottom: "1px solid #eee",
};

const actionLink = {
  marginRight: 10,
  textDecoration: "none",
  color: "#007bff",
  fontWeight: "500",
};

const deleteButton = {
  background: "red",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  padding: "6px 10px",
};