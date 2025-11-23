import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeader } from "../services/authService";

export default function RulesPage() {
  const [rules, setRules] = useState({});
  const [loading, setLoading] = useState(true);

  const API_URL = "/api";

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`${API_URL}/compliance/rules`, { headers });

      // The backend returns grouped rules: { Accessibility: [...], Egress: [...], ... }
      setRules(res.data);
    } catch (err) {
      console.error(err);
      setRules({});
    }
    setLoading(false);
  };

  if (loading) {
    return <h2 style={{ textAlign: "center", marginTop: 40 }}>Loading rules…</h2>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h1 style={{ textAlign: "center" }}>📘 Compliance Rules</h1>

      {Object.keys(rules).length === 0 ? (
        <p>No rules loaded.</p>
      ) : (
        Object.keys(rules).map((category) => (
          <div key={category} style={{ marginBottom: 30 }}>
            <h2 style={{ borderBottom: "2px solid #ddd", paddingBottom: 6 }}>
              {category}
            </h2>

            {rules[category].map((rule) => (
              <div
                key={rule.rule_id}
                style={{
                  padding: 10,
                  marginBottom: 10,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              >
                <strong>{rule.title}</strong>
                <p style={{ margin: "6px 0" }}>
                  <strong>ID:</strong> {rule.rule_id}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <strong>Section:</strong> {rule.section}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <strong>Category:</strong> {rule.category}
                  {" / "}
                  {rule.subcategory}
                </p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
