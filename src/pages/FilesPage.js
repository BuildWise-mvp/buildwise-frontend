import React, { useEffect, useState } from "react";
import { fetchFiles, uploadFile, deleteFile } from "../services/fileService";

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
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h1>📁 Files</h1>

      <form onSubmit={handleUpload} style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={projectId}
          placeholder="Project ID"
          onChange={(e) => setProjectId(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
          required
        />
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          style={{ marginRight: 8 }}
          required
        />
        <button type="submit" style={{ padding: 8 }}>Upload</button>
      </form>

      {loading ? (
        <p>Loading files...</p>
      ) : files.length === 0 ? (
        <p>No files yet</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {files.map((f) => (
            <li key={f.id} style={{ marginBottom: 10 }}>
              <strong>{f.filename}</strong> ({f.project_name || "No project"})
              <div>
                <a href={`http://127.0.0.1:8000/files/${f.id}/download`} target="_blank" rel="noreferrer">
                  ⬇️ Download
                </a>{" "}
                <button
                  onClick={() => handleDelete(f.id)}
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
