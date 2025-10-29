import React, { useEffect, useState } from "react";
import { fetchRules, createRule, deleteRule } from "../services/rulesService";
import { toast } from "react-toastify";

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    const data = await fetchRules();
    setRules(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
try {
  await createRule(title, description);
  toast.success("✅ Rule created!");
  setTitle("");
  setDescription("");
  await loadRules();
} catch (err) {
  toast.error("❌ Failed to create rule");
}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this rule?")) return;
try {
  await deleteRule(id);
  toast.info("🗑️ Rule deleted");
  await loadRules();
} catch (err) {
  toast.error("❌ Failed to delete rule");
}
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h1>⚖️ Rules Management</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={title}
          placeholder="Rule title"
          onChange={(e) => setTitle(e.target.value)}
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
        <button type="submit" style={{ padding: 8 }}>Add Rule</button>
      </form>

      {rules.length === 0 ? (
        <p>No rules yet</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rules.map((r) => (
            <li key={r.id} style={{ marginBottom: 8 }}>
              <strong>{r.title}</strong> — {r.description}
              <button
                onClick={() => handleDelete(r.id)}
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
          ))}
        </ul>
      )}
    </div>
  );
}
