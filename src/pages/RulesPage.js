// src/pages/RulesPage.js
import React, { useEffect, useState } from "react";
import { fetchRules } from "../services/rulesService";
import { toast } from "react-toastify";

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await fetchRules();

      // Sort a bit for nicer viewing: by jurisdiction, code, category, rule_id
      const sorted = [...data].sort((a, b) => {
        const jA = (a.jurisdiction || "").localeCompare(b.jurisdiction || "");
        if (jA !== 0) return jA;
        const cA = (a.code || "").localeCompare(b.code || "");
        if (cA !== 0) return cA;
        const catA = (a.category || "").localeCompare(b.category || "");
        if (catA !== 0) return catA;
        return (a.rule_id || "").localeCompare(b.rule_id || "");
      });

      setRules(sorted);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to load AI rules");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        🧠 AI Rule Library (NBC + CCQ)
      </h1>

      <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        This view shows all structured AI rules loaded from your JSON datasets
        (NBC &amp; CCQ). Rules are <strong>read-only</strong> here.
      </p>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading rules…</p>
      ) : rules.length === 0 ? (
        <p style={{ textAlign: "center" }}>No AI rules found.</p>
      ) : (
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          {rules.map((rule) => (
            <div
              key={rule.rule_id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                {rule.jurisdiction || "—"}{" "}
                {rule.province ? `• ${rule.province}` : ""}{" "}
                {rule.code ? `• ${rule.code}` : ""}
              </div>

              <h3 style={{ margin: "0.25rem 0 0.5rem", fontSize: "1rem" }}>
                {rule.title || rule.rule_id}
              </h3>

              <div style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                <strong>ID:</strong> {rule.rule_id}
              </div>

              {rule.category && (
                <div style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                  <strong>Category:</strong> {rule.category}
                  {rule.subcategory ? ` → ${rule.subcategory}` : ""}
                </div>
              )}

              {rule.section && (
                <div style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                  <strong>Code Section:</strong> {rule.section}
                </div>
              )}

              {rule.version && (
                <div style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                  <strong>Version:</strong> {rule.version}
                </div>
              )}

              {rule.parameters && (
                <details style={{ marginTop: "0.25rem" }}>
                  <summary style={{ cursor: "pointer", fontSize: "0.8rem" }}>
                    Parameters
                  </summary>
                  <pre
                    style={{
                      fontSize: "0.75rem",
                      background: "#f7f7f7",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      overflowX: "auto",
                    }}
                  >
                    {JSON.stringify(rule.parameters, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
