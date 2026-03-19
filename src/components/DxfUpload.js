import React, { useState } from "react";
import { analyzeDxf } from "../services/fileService";

export default function DxfUpload() {
  const [selectedDxf, setSelectedDxf] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!selectedDxf) {
      setError("Please choose a DXF file.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzeDxf(selectedDxf);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "DXF analysis failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "30px auto",
        padding: 20,
        borderRadius: 12,
        background: "#f8f9fa",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        textAlign: "left",
      }}
    >
      <h2 style={{ marginTop: 0 }}>DXF Analysis</h2>
      <p>Upload a DXF file and analyze its entities.</p>

      <form onSubmit={handleAnalyze}>
        <input
          type="file"
          accept=".dxf"
          onChange={(e) => setSelectedDxf(e.target.files[0])}
          style={{ marginBottom: 12 }}
        />
        <br />
        <button type="submit" style={{ padding: "8px 14px", cursor: "pointer" }}>
          {loading ? "Analyzing..." : "Upload and Analyze DXF"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: 12 }}>
          {error}
        </p>
      )}

      {result && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: "#ffffff",
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        >
          <p><strong>Status:</strong> {result.status}</p>
          <p><strong>Filename:</strong> {result.filename}</p>
          <p><strong>Message:</strong> {result.message}</p>

          {result.entity_counts && (
            <>
              <p><strong>Entity Counts:</strong></p>
              <pre
                style={{
                  background: "#f1f1f1",
                  padding: 12,
                  borderRadius: 8,
                  overflowX: "auto",
                }}
              >
                {JSON.stringify(result.entity_counts, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}