// frontend/src/pages/ComplianceCheckPage.jsx
import React, { useMemo, useState } from "react";
import { apiFetch } from "../api/client";

/**
 * Compliance Check UI
 * Connected to structured backend payload:
 * {
 *   facts: { ... },
 *   rule_ids: [...]
 * }
 */

const initialFacts = {
  floor: 1,
  occupancy_group: "A-2",
  occupancy: "A-2",
  room_area_m2: 50,
  actual_occupant_load: 10,
  calculated_occupant_load: 10,
  occupant_load: 10,
  universal_washroom_provided: false,
  occupant_load_sign_present: true,
  panel_distance_from_entrance_m: 3,

  corridor_width_mm: [1100],
  turning_diameter_mm: [1500],
  ramp_slope_ratio: 0.0833,
  ramp_landing_length_mm: [1500],

  exits_width_mm: [900, 900],
  travel_distance_m: 30,
  dead_end_corridor_length_m: 6,
  exit_continuity_compliant: true,

  door_clear_width_mm: [900],
  exit_door_fire_rating_min: 45,
  door_hardware_compliant: true,
  door_obstruction_count: 0,
  door_swings_outward: true,

  exit_sign_present: true,
  exit_sign_illumination_lux: 50,
  exit_sign_view_distance_m: 20,
  exit_sign_emergency_power: true,
  directional_exit_sign_present: true,
  not_exit_sign_present: false,

  area_of_refuge_provided: false,
  elevator_used_as_exit: false,

  stair_fire_rating_min: 45,
  stair_guard_height_mm: 1070,

  // NBC expects NUMBER sometimes
  handrail_height_mm: 900,
  // CCQ expects LIST
  handrail_heights_mm: [900],

  handrail_extension_mm: 300,
  handrail_continuous: true,

  stair_headroom_mm: [2030],
  stair_landing_length_mm: 1100,
  stair_tread_mm: 280,
  stair_width_mm: 1100,
  stair_riser_mm: 180,

  exit_route_live_load_kpa: 4.8,
};

function Badge({ value }) {
  const style = useMemo(() => {
    const v = (value || "").toUpperCase();
    if (v === "FAIL") return { background: "#3b0d0d", border: "1px solid #7a1f1f" };
    if (v === "WARN") return { background: "#3b2a0d", border: "1px solid #7a5a1f" };
    if (v === "PASS") return { background: "#0d3b1a", border: "1px solid #1f7a3a" };
    if (v === "ERROR") return { background: "#2b0d3b", border: "1px solid #6b21a8" };
    return { background: "#111827", border: "1px solid #374151" };
  }, [value]);

  return (
    <span style={{ ...style, padding: "6px 10px", borderRadius: 999, fontWeight: 800 }}>
      {value || "—"}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ border: "1px solid #2b2f36", borderRadius: 12, padding: 10 }}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900 }}>{value ?? "—"}</div>
    </div>
  );
}

function parseNumberList(str) {
  return str
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((n) => !Number.isNaN(n));
}

function safeMin(arr, fallback = null) {
  if (!Array.isArray(arr) || arr.length === 0) return fallback;
  const nums = arr.filter((x) => typeof x === "number" && !Number.isNaN(x));
  if (!nums.length) return fallback;
  return Math.min(...nums);
}

function toErrorString(e) {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message || String(e);

  if (e.detail) return typeof e.detail === "string" ? e.detail : JSON.stringify(e.detail);
  if (e.message) return typeof e.message === "string" ? e.message : JSON.stringify(e.message);
  if (e.response) return JSON.stringify(e.response);

  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

function ListBox({ title, items, onSelect, subtitle }) {
  return (
    <div style={{ border: "1px solid #2b2f36", borderRadius: 12, padding: 12 }}>
      <div style={{ fontWeight: 900, marginBottom: 6 }}>{title}</div>
      {subtitle ? <div style={{ opacity: 0.75, marginBottom: 10 }}>{subtitle}</div> : null}

      {items.length === 0 ? (
        <div style={{ opacity: 0.75 }}>No items to show</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflow: "auto" }}>
          {items.slice(0, 50).map((v, idx) => (
            <button
              type="button"
              key={`${v.rule_id || "x"}-${v.check_id || "c"}-${idx}`}
              onClick={() => onSelect(v)}
              style={{
                textAlign: "left",
                border: "1px solid #2b2f36",
                borderRadius: 10,
                padding: 10,
                cursor: "pointer",
                background: "transparent",
                color: "inherit",
              }}
            >
              <div style={{ fontWeight: 800 }}>
                {v.rule_id || "—"}{" "}
                <span style={{ opacity: 0.7 }}>
                  ({String(v.severity || v.status || "").toUpperCase() || "—"})
                </span>
              </div>
              <div style={{ opacity: 0.85, marginTop: 4 }}>{v.message || v.title || "—"}</div>
            </button>
          ))}
          {items.length > 50 ? (
            <div style={{ marginTop: 6, opacity: 0.75 }}>Showing first 50 of {items.length}.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function ComplianceCheckPage() {
  const [facts, setFacts] = useState(initialFacts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  const [selectedViolation, setSelectedViolation] = useState(null);
  const [selectedError, setSelectedError] = useState(null);
  const [selectedMissing, setSelectedMissing] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const updateFact = (key, value) => {
    setFacts((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "handrail_height_mm") next.handrail_heights_mm = [value];
      return next;
    });
  };

  const runCheck = async () => {
    setLoading(true);
    setError("");
    setSelectedViolation(null);
    setSelectedError(null);
    setSelectedMissing(null);

    try {
      const normalizedFacts = {
        occupant_load: Number(facts.occupant_load) || 0,
        calculated_occupant_load: Number(facts.occupant_load) || 0,
        actual_occupant_load: Number(facts.occupant_load) || 0,
        universal_washroom_provided: !!facts.universal_washroom_provided,

        door_clear_width_mm: facts.door_clear_width_mm || [],
        door_clear_width_min_mm: safeMin(facts.door_clear_width_mm, null),

        handrail_height_mm: Number(facts.handrail_height_mm) || 0,
        handrail_heights_mm:
          facts.handrail_heights_mm ??
          (Array.isArray(facts.handrail_height_mm)
            ? facts.handrail_height_mm
            : [Number(facts.handrail_height_mm) || 0]),
        handrail_continuous: facts.handrail_continuous,
      };

      const payload = {
        facts: normalizedFacts,
        rule_ids: [
          "NBC-ACC-DOOR-CLEAR-WIDTH",
          "NBC-WSH-UNIVERSAL-REQ",
          "NBC-EG-STAIR-HANDRAILS",
          "CCQ-STR-HANDRAIL",
        ],
      };
      console.log("COMPLIANCE V2 PAYLOAD", payload);
      const data = await apiFetch("/compliance/check", {
        method: "POST",
        body: payload,
      });

      setReport(data);
    } catch (e) {
      setError(toErrorString(e));
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const counts = report?.counts || {};

  const missingInputsRaw = Array.isArray(report?.missing_inputs) ? report.missing_inputs : [];
  const missingInputs = missingInputsRaw.map((m) => ({
    rule_id: m.rule_id,
    title: m.title,
    category: m.category,
    status: "NEEDS_INPUT",
    severity: "NEEDS_INPUT",
    message:
      (m.missing && m.missing[0] && m.missing[0].message) ||
      "Missing required data for this rule.",
    missing: m.missing || [],
  }));

  const ruleErrors = Array.isArray(report?.errors) ? report.errors : [];

  const violationErrors = Array.isArray(report?.non_critical_violations)
    ? report.non_critical_violations.filter((v) => String(v?.severity || "").toUpperCase() === "ERROR")
    : [];

  const allErrors = [
    ...ruleErrors.map((e) => ({
      rule_id: e.rule_id,
      title: e.title,
      category: e.category,
      severity: "ERROR",
      kind: e.kind || "RULE_ERROR",
      message: e.message,
      source: "RULE_STATUS_ERROR",
    })),
    ...violationErrors.map((v) => ({
      rule_id: v.rule_id,
      title: v.title,
      category: v.category,
      severity: "ERROR",
      kind: v.kind || "VIOLATION_ERROR",
      message: v.message,
      source: "VIOLATION_SEVERITY_ERROR",
      check_id: v.check_id,
      label: v.label,
      references: v.references,
    })),
  ];

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
            Compliance Check
          </h1>  
          <div style={{ opacity: 0.75 }}>MVP mode: manual facts → run compliance → review results.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ opacity: 0.75, fontWeight: 700 }}>Result</div>
            <Badge value={report?.result} />
          </div>

          {report ? (
            <div style={{ fontSize: 13, opacity: 0.8, textAlign: "right", maxWidth: 340 }}>
              {counts.non_compliant_rules > 0
                ? `${counts.non_compliant_rules} rules failed, ${counts.compliant_rules} passed`
                : counts.needs_input > 0
                ? `${counts.compliant_rules} rules passed, ${counts.needs_input} need more input`
                : `${counts.compliant_rules} rules passed`}
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "390px 1fr", gap: 16, marginTop: 16 }}>
        <div style={{ border: "1px solid #2b2f36", borderRadius: 14, padding: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Manual Facts</h2>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 12 }}>
            This manual test checks a limited set of rules based on the facts entered below.
          </div>

          <label style={{ display: "block", marginBottom: 10 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              Universal Washroom Provided
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={!!facts.universal_washroom_provided}
              onChange={(e) => updateFact("universal_washroom_provided", e.target.checked)}
            />
            <span>Yes</span>
           </label>
          </label>

          <label style={{ display: "block", marginBottom: 10 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              Door Clear Widths in mm, comma separated if multiple doors
            </div>
            <input
              type="text"
              value={(facts.door_clear_width_mm || []).join(",")}
              onChange={(e) => updateFact("door_clear_width_mm", parseNumberList(e.target.value))}
              style={{ width: "100%", padding: 10, borderRadius: 10 }}
              placeholder="900"
            />
          </label>

          <div style={{ marginBottom: 10, fontSize: 12, opacity: 0.75 }}>
            BuildWise uses the smallest entered width where a minimum door width rule applies. Current minimum:{" "}
            <b>{safeMin(facts.door_clear_width_mm, "—")}</b> mm
          </div>

          <label style={{ display: "block", marginBottom: 10 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Handrail Height (mm)</div>
            <input
              type="number"
              min="0"
              value={facts.handrail_height_mm}
              onChange={(e) => updateFact("handrail_height_mm", Number(e.target.value))}
              style={{ width: "100%", padding: 10, borderRadius: 10 }}
            />
          </label>

          <button
            type="button"
            onClick={runCheck}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Running..." : "Run Compliance"}
          </button>

          {error ? (
            <div style={{ marginTop: 12, color: "#ff6b6b", fontWeight: 700 }}>Error: {error}</div>
          ) : null}
        </div>

        <div style={{ border: "1px solid #2b2f36", borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 18, fontWeight: 900 }}>Results</h2>

            {report ? (
              <button
                type="button"
                onClick={() => setShowRaw((s) => !s)}
                style={{
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid #2b2f36",
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 12,
                  opacity: 0.8,
                }}
              >
                {showRaw ? "Hide Raw Results" : "Show Raw Results"}
              </button>
            ) : null}
          </div>

          {!report ? (
            <div style={{ marginTop: 14, opacity: 0.8 }}>Run a check to see a structured report.</div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                <Stat label="Total rules" value={counts.total_rules || 0} />
                <Stat label="Applicable" value={counts.applicable_rules || 0} />
                <Stat label="Critical" value={counts.critical_violations || 0} />
                <Stat label="Non-critical" value={counts.non_critical_violations || 0} />
                <Stat label="Compliant" value={counts.compliant_rules || 0} />
                <Stat label="Non-compliant" value={counts.non_compliant_rules || 0} />
                <Stat label="N/A" value={counts.not_applicable || 0} />
                <Stat label="Errors" value={counts.errors || 0} />
                <Stat label="Needs input" value={counts.needs_input || 0} />
              </div>

              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <ListBox
                  title={`Errors (${allErrors.length})`}
                  items={allErrors}
                  onSelect={setSelectedError}
                  subtitle="System or rule evaluation problems only"
                />

                <div style={{ border: "1px solid #2b2f36", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Error Details</div>
                  {!selectedError ? (
                    <div style={{ opacity: 0.8 }}>Click an error on the left.</div>
                  ) : (
                    <div style={{ lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 900 }}>
                        {selectedError.rule_id} — {selectedError.title || "—"}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <b>Category:</b> {selectedError.category || "—"}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <b>Kind:</b> {selectedError.kind || "—"}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <b>Source:</b> {selectedError.source || "—"}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <b>Message:</b> {selectedError.message || "—"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <ListBox
                  title={`Missing Inputs (${missingInputs.length})`}
                  items={missingInputs}
                  onSelect={setSelectedMissing}
                  subtitle="These are not system errors, they are facts you have not provided yet."
                />

                <div style={{ border: "1px solid #2b2f36", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Missing Input Details</div>
                  {!selectedMissing ? (
                    <div style={{ opacity: 0.8 }}>Click a missing input rule on the left.</div>
                  ) : (
                    <div style={{ lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 900 }}>
                        {selectedMissing.rule_id} — {selectedMissing.title || "—"}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <b>Category:</b> {selectedMissing.category || "—"}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <b>Message:</b> {selectedMissing.message || "—"}
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <b>Missing fields:</b>
                        <div style={{ marginTop: 6, opacity: 0.9, fontSize: 13 }}>
                          {(selectedMissing.missing || []).length === 0 ? (
                            <div>—</div>
                          ) : (
                            (selectedMissing.missing || []).map((m, idx) => (
                              <div key={idx} style={{ marginBottom: 6 }}>
                                • {m.message}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <ListBox
                  title="Critical Violations"
                  items={report.critical_violations || []}
                  onSelect={setSelectedViolation}
                  subtitle="High priority compliance failures"
                />
                <ListBox
                  title="Non Critical Violations"
                  items={report.non_critical_violations || []}
                  onSelect={setSelectedViolation}
                  subtitle="Warnings and lower priority failures"
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Violation Details</div>

                {!selectedViolation ? (
                  <div style={{ opacity: 0.8 }}>Click a violation to view details.</div>
                ) : (
                  <div style={{ border: "1px solid #2b2f36", borderRadius: 12, padding: 12, lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 900 }}>
                      {selectedViolation.rule_id} — {selectedViolation.title || "—"}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <b>Category:</b> {selectedViolation.category || "—"}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <b>Severity:</b> {selectedViolation.severity || "—"}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <b>Message:</b> {selectedViolation.message || "—"}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <b>Check:</b> {selectedViolation.check_id || "—"}{" "}
                      {selectedViolation.label ? `(${selectedViolation.label})` : ""}
                    </div>
                  </div>
                )}
              </div>

              {showRaw ? (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Raw Results (Preview)</h3>
                  <div
                    style={{
                      border: "1px solid #2b2f36",
                      borderRadius: 12,
                      padding: 12,
                      maxHeight: 300,
                      overflow: "auto",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      fontSize: 12,
                      lineHeight: 1.45,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {JSON.stringify((report.raw_results || []).slice(0, 20), null, 2)}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}