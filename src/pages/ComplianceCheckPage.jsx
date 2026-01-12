// src/pages/ComplianceCheckPage.jsx
import React, { useMemo, useState } from "react";
import { apiFetch } from "../api/client";

/**
 * Fixes:
 * ✅ One payload only (no duplicate const payload)
 * ✅ Sends body as OBJECT (most apiFetch wrappers JSON.stringify internally)
 * ✅ Guarantees CCQ key: handrail_heights_mm always exists and is LIST
 * ✅ Derives door_clear_width_min_mm for numeric comparisons
 * ✅ Error shown as real string (no [object Object])
 * ✅ UI: shows Errors list + details
 * ✅ UI: clicking a violation shows Violation Details
 */

const initialFacts = {
  // -----------------------------
  // Occupancy
  // -----------------------------
  floor: 1,
  occupancy_group: "A-2",
  occupancy: "A-2",
  room_area_m2: 50,
  actual_occupant_load: 10,
  calculated_occupant_load: 10,
  occupant_load: 10,
  occupant_load_sign_present: true,
  panel_distance_from_entrance_m: 3,

  // -----------------------------
  // Accessibility (LISTS)
  // -----------------------------
  corridor_width_mm: [1100],
  turning_diameter_mm: [1500],
  ramp_slope_ratio: 0.0833,
  ramp_landing_length_mm: [1500],

  // -----------------------------
  // Egress
  // -----------------------------
  exits_width_mm: [900, 900],
  travel_distance_m: 30,
  dead_end_corridor_length_m: 6,
  exit_continuity_compliant: true,

  // -----------------------------
  // Doors (LIST)
  // -----------------------------
  door_clear_width_mm: [900],
  exit_door_fire_rating_min: 45,
  door_hardware_compliant: true,
  door_obstruction_count: 0,
  door_swings_outward: true,

  // -----------------------------
  // Signage
  // -----------------------------
  exit_sign_present: true,
  exit_sign_illumination_lux: 50,
  exit_sign_view_distance_m: 20,
  exit_sign_emergency_power: true,
  directional_exit_sign_present: true,
  not_exit_sign_present: false,

  // -----------------------------
  // Area of refuge / elevator
  // -----------------------------
  area_of_refuge_provided: false,
  elevator_used_as_exit: false,

  // -----------------------------
  // Stairs
  // -----------------------------
  stair_fire_rating_min: 45,
  stair_guard_height_mm: 1070,

  // NBC expects NUMBER
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

  // -----------------------------
  // Fire Alarm – General
  // -----------------------------
  fire_alarm_installed: true,
  fire_alarm_control_room_dedicated: true,
  alarm_secondary_power_hours: 24,
  fire_alarm_backup_power_min: 24,
  alarm_circuits_supervised: true,
  circuit_supervision_provided: true,
  cu_room_rating_hr: 1,

  // -----------------------------
  // Alarm Zoning / Layout
  // -----------------------------
  alarm_zone_area_m2: 2000,
  alarm_zone_storeys: 1,
  fire_alarm_zone_areas_m2: [2000],
  building_area_m2: 500,
  storeys: 1,
  building_height_m: 10,

  // -----------------------------
  // Manual Pull Stations
  // -----------------------------
  pull_stations_per_floor: 2,
  pull_station_distance_from_exit_m: [15],
  distance_to_exit_m: 15,

  // -----------------------------
  // Detectors
  // -----------------------------
  smoke_detectors_in_corridor: true,
  smoke_detector_spacing_m: [9],
  smoke_detector_distance_from_wall_m: [0.5],
  detector_in_corridor: true,
  detector_spacing_m: 9,
  heat_detector_present: false,
  stairwell_detector_present: true,
  elevator_lobby_detector_present: true,

  // -----------------------------
  // Service Rooms - Generator
  // -----------------------------
  generator_room_contains_unrelated_items: false,
  generator_room_fuel_liters: 0,
  generator_room_fire_rating_hr: 1,
  generator_room_fresh_air_area_cm2: 0,

  // -----------------------------
  // Service Rooms - General separation
  // -----------------------------
  service_room_fire_rating_hr: 1,

  // -----------------------------
  // Service Rooms - Sprinkler Room
  // -----------------------------
  sprinkler_room_distance_to_exit_m: 10,
  sprinkler_room_temperature_c: 20,
  sprinkler_room_fire_rating_hr: 1,

  // -----------------------------
  // Sprinkler system
  // -----------------------------
  sprinkler_installed: false,
  sprinkler_alarm_connected: false,
  sprinkler_clearance_mm: 450,
  sprinkler_head_clearance_mm: 450,
  sprinkler_dist_below_ceiling_mm: 100,
  sprinkler_drain_valves_present: true,
  dry_system_fill_time_s: 0,

  fire_department_connection_provided: false,
  fire_pump_monitoring_provided: false,
  floor_control_valves_present: true,

  sprinkler_head_type: "standard",
  obstruction_distance_mm: 0,

  main_pipe_diameter_mm: 50,
  branch_pipe_diameter_mm: 25,
  sprinkler_area_covered_m2: 12,
  sprinkler_valve_distance_m: 3,
  sprinkler_valve_supervised: true,
  sprinkler_water_supply_minutes: 60,
  sprinkler_zone_area_m2: 2000,

  // -----------------------------
  // Smoke / building geometry
  // -----------------------------
  room_height_m: 3,
  vestibule_pressure_Pa: 0,
  vestibule_pressure_pa: 0,

  // -----------------------------
  // Smoke Control
  // -----------------------------
  smoke_control_installed: false,
  smoke_control_provided: false,
  corridor_length_m: 20,
  smoke_control_response_time_s: 60,
  stair_pressurization_pa: 0,
  smoke_exhaust_provided: false,
  vestibule_door_closing_force_N: 50,
  smoke_control_airflow_m3_h: 0,
  smoke_control_panel_location: "main_entrance",
  non_dedicated_smoke_system: false,
  hvac_interlocks_provided: true,
  door_opening_force_n: 50,
  elevator_shaft_vented: false,
  elevator_shaft_pressurization_pa: 0,
  emergency_power_required: false,
  smoke_control_on_emergency_power: false,
  firefighter_override_required: false,
  firefighter_override_controls_present: false,
  smoke_control_fans_moisture_protected: true,
  moisture_protection_required: false,
  smoke_control_operating_minutes: 0,
  pressurization_pa: 0,

  // -----------------------------
  // Standpipe
  // -----------------------------
  standpipe_present: false,
  standpipe_class: "I",
  sprinkler_system_present: false,
  combined_standpipe_sprinkler: false,
  hose_reach_m: 30,
  max_point_distance_m: 30,
  fdc_present: false,
  design_flow_l_min: 0,
  cabinet_required: false,
  hose_cabinet_present: false,
  standpipe_locations: ["exit_stair_1"],
  standpipe_material: "steel",
  pressure_kpa: 0,
  standpipe_riser_diameter_mm: 0,
  pressure_loss_kpa: 0,
  required_pressure_kpa: 0,
  standpipe_pressure_kpa: 0,
  fire_pump_provided: false,
  exit_stair_count: 1,
  standpipe_risers_count: 0,
  standpipe_in_fire_rated_shaft: false,
  shaft_fire_resistance_rating_hr: 0,
  roof_hose_connection_present: false,
  signage_required: false,
  standpipe_valve_signage_provided: false,
  standpipe_supports_compliant: true,
  supports_required: false,
  test_outlet_count: 0,
  standpipe_travel_distance_m: 0,
  valve_height_mm: 0,
  max_zone_height_m_actual: 0,

  // -----------------------------
  // Fire resistance / separations
  // -----------------------------
  corridor_fire_rating_minutes: 0,
  major_occupancy_separation_minutes: 0,
  suite_fire_separation_min: 0,
  floor_fire_separation_min: 0,
  penetration_material_rating_minutes: 0,

  // -----------------------------
  // Alarm Signals
  // -----------------------------
  alarm_temporal_pattern: true,
  fire_alarm_sound_level_db: 75,
  visual_alarms_installed: true,
  strobe_intensity_cd: 15,
  voice_comm_installed: false,
  voice_comm_present: false,
  annunciation_provided: true,

  // -----------------------------
  // Annunciator
  // -----------------------------
  annunciator_obstructions: false,
  annunciator_room_temperature_c: 20,
  annunciator_distance_from_main_entrance_m: 3,
  annunciator_distance_from_ff_access_m: 5,
  annunciator_mounting_height_mm: 1500,
  annunciator_power_supervised: true,
  annunciator_room_fire_rating_hr: 1,
  annunciator_supervised: true,
  annunciator_clear_view_m: 3,

  // -----------------------------
  // Fire Dampers / Smoke Dampers
  // -----------------------------
  combination_damper_installed: false,
  fire_and_smoke_separation: false,
  access_panel_provided: true,
  access_panel_size_mm: 450,
  damper_closure_tested: true,
  test_required: false,
  duct_penetrates_fire_separation: false,
  fire_damper_installed: false,
  exception_applies: false,
  duct_is_metal: true,
  duct_gauge: 22,
  damper_type: "static",
  damper_fail_position: "closed",
  damper_distance_from_separation_mm: 0,
  damper_orientation: "horizontal",
  damper_label_present: true,
  damper_link_temp_c: 74,
  hazard_level: "normal",
  smoke_rated_assembly: false,
  smoke_damper_installed: false,

  // -----------------------------
  // Service Rooms - Electrical
  // -----------------------------
  electrical_room_door_width_mm: 900,
  electrical_room_contains_unrelated_items: false,
  electrical_room_fire_rating_hr: 1,

  // -----------------------------
  // Mixed use / separation
  // -----------------------------
  residential_alarm_separated: true,
  commercial_alarm_separated: true,
  mixed_use_building: false,

  // -----------------------------
  // Accessibility / misc
  // -----------------------------
  accessibility_spaces: true,
  room_type: "corridor",

  // -----------------------------
  // Structural
  // -----------------------------
  guard_height_mm: 1070,
  handrail_load_capacity_kN: 1,
  floor_live_load_kPa: 2.4,
  public_floor_live_load_kpa: 4.8,
  guard_heights_mm: [1070],

  // -----------------------------
  // Washrooms / accessibility
  // -----------------------------
  washroom_turning_diameter_mm: 1500,
  door_opening_force_N: 30,
  side_grab_bar_length_mm: 600,
  fdc_signage_provided: false,
  service_penetration_gaps_mm: [0],

  // -----------------------------
  // CCQ naming keys
  // -----------------------------
  corridor_widths_mm: [1100],
  doors_clear_width_mm: [900],
  ramp_slopes: [0.0833],
  turning_diameters_mm: [1500],

  handrails_count: 1,
  stair_riser_heights_mm: [180],
  stair_tread_depths_mm: [280],
  stairs_width_mm: [1100],

  zone_annunciation_provided: true,
  fire_alarm_panel_distance_from_ff_entry_m: 3,
  fire_alarm_backup_duration_hours: 24,
  fire_alarm_system_provided: true,
  fire_alarm_zone_device_counts: [50],
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

function ViolationList({ title, items, onSelect }) {
  return (
    <div style={{ border: "1px solid #2b2f36", borderRadius: 12, padding: 12 }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>{title}</div>
      {items.length === 0 ? (
        <div style={{ opacity: 0.75 }}>None</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.slice(0, 20).map((v, idx) => (
            <button
              key={`${v.rule_id}-${idx}`}
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
                {v.rule_id} <span style={{ opacity: 0.7 }}>({v.severity})</span>
              </div>
              <div style={{ opacity: 0.85, marginTop: 4 }}>{v.message}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BoolSelect({ value, onChange }) {
  return (
    <select
      value={value ? "true" : "false"}
      onChange={(e) => onChange(e.target.value === "true")}
      style={{ width: "100%", padding: 10, borderRadius: 10 }}
    >
      <option value="true">True</option>
      <option value="false">False</option>
    </select>
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

export default function ComplianceCheckPage() {
  const [facts, setFacts] = useState(initialFacts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  const [selectedViolation, setSelectedViolation] = useState(null);
  const [selectedError, setSelectedError] = useState(null);
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

    try {
      const payload = {
        ...facts,
        door_clear_width_min_mm: safeMin(facts.door_clear_width_mm, null),
        handrail_heights_mm:
          facts.handrail_heights_mm ??
          (Array.isArray(facts.handrail_height_mm)
            ? facts.handrail_height_mm
            : [facts.handrail_height_mm]),
      };

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

  const counts = report?.counts;

  // Collect errors from BOTH:
  // 1) report.errors (status ERROR rules)
  // 2) non_critical_violations with severity ERROR (your strict mode missing vars)
  const ruleErrors = Array.isArray(report?.errors) ? report.errors : [];
  const errorViolations = Array.isArray(report?.non_critical_violations)
    ? report.non_critical_violations.filter(
        (v) => String(v?.severity || "").toUpperCase() === "ERROR"
      )
    : [];

  const allErrors = [
    ...ruleErrors.map((e) => ({
      rule_id: e.rule_id,
      title: e.title,
      category: e.category,
      kind: e.kind || "RULE_ERROR",
      message: e.message,
      source: "RULE_STATUS_ERROR",
    })),
    ...errorViolations.map((v) => ({
      rule_id: v.rule_id,
      title: v.title,
      category: v.category,
      kind: v.kind || "VIOLATION_ERROR",
      message: v.message,
      source: "VIOLATION_SEVERITY_ERROR",
    })),
  ];

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Compliance Check</h1>
          <div style={{ opacity: 0.75 }}>
            MVP mode: manual facts (exact rule keys) → run compliance → review violations/errors.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ opacity: 0.75, fontWeight: 700 }}>Result</div>
          <Badge value={report?.result} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "390px 1fr", gap: 16, marginTop: 16 }}>
        {/* LEFT */}
        <div style={{ border: "1px solid #2b2f36", borderRadius: 14, padding: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Manual Facts</h2>

          {/* Occupancy */}
          <div style={{ fontWeight: 900, margin: "6px 0 10px", opacity: 0.85 }}>Occupancy</div>

          <label style={{ display: "block", marginBottom: 10 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Floor</div>
            <input
              type="number"
              min="0"
              value={facts.floor}
              onChange={(e) => updateFact("floor", Number(e.target.value))}
              style={{ width: "100%", padding: 10, borderRadius: 10 }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 10 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Occupancy Group</div>
            <select
              value={facts.occupancy_group}
              onChange={(e) => {
                updateFact("occupancy_group", e.target.value);
                updateFact("occupancy", e.target.value);
              }}
              style={{ width: "100%", padding: 10, borderRadius: 10 }}
            >
              <option value="A-1">A-1</option>
              <option value="A-2">A-2</option>
              <option value="A-3">A-3</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F1">F1</option>
              <option value="F2">F2</option>
              <option value="F3">F3</option>
            </select>
          </label>

          <label style={{ display: "block", marginBottom: 10 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Room Area (m²)</div>
            <input
              type="number"
              min="0"
              value={facts.room_area_m2}
              onChange={(e) => updateFact("room_area_m2", Number(e.target.value))}
              style={{ width: "100%", padding: 10, borderRadius: 10 }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 10 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Occupant Load</div>
            <input
              type="number"
              min="0"
              value={facts.occupant_load}
              onChange={(e) => {
                const n = Number(e.target.value);
                updateFact("occupant_load", n);
                updateFact("calculated_occupant_load", n);
                updateFact("actual_occupant_load", n);
              }}
              style={{ width: "100%", padding: 10, borderRadius: 10 }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 14 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              Occupant Load Sign Present
            </div>
            <BoolSelect
              value={facts.occupant_load_sign_present}
              onChange={(v) => updateFact("occupant_load_sign_present", v)}
            />
          </label>

          {/* Doors */}
          <div style={{ fontWeight: 900, margin: "6px 0 10px", opacity: 0.85 }}>Doors</div>

          <label style={{ display: "block", marginBottom: 6 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              Door Clear Widths (mm) — comma separated
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
            (Auto) Door clear width MIN used for some rules:{" "}
            <b>{safeMin(facts.door_clear_width_mm, "—")}</b> mm
          </div>

          {/* Stairs */}
          <div style={{ fontWeight: 900, margin: "6px 0 10px", opacity: 0.85 }}>Stairs</div>

          {[
            ["stair_width_mm", "Stair Width (mm)"],
            ["stair_fire_rating_min", "Stair Fire Rating (min)"],
            ["stair_guard_height_mm", "Stair Guard Height (mm)"],
            ["handrail_height_mm", "Handrail Height (mm)"],
            ["handrail_extension_mm", "Handrail Extension (mm)"],
            ["stair_landing_length_mm", "Stair Landing Length (mm)"],
            ["stair_tread_mm", "Stair Tread (mm)"],
            ["stair_riser_mm", "Stair Riser (mm)"],
          ].map(([key, label]) => (
            <label key={key} style={{ display: "block", marginBottom: 10 }}>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>{label}</div>
              <input
                type="number"
                min="0"
                value={facts[key]}
                onChange={(e) => updateFact(key, Number(e.target.value))}
                style={{ width: "100%", padding: 10, borderRadius: 10 }}
              />
            </label>
          ))}

          <label style={{ display: "block", marginBottom: 10 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              Stair Headroom (mm) — comma separated
            </div>
            <input
              type="text"
              value={(facts.stair_headroom_mm || []).join(",")}
              onChange={(e) => updateFact("stair_headroom_mm", parseNumberList(e.target.value))}
              style={{ width: "100%", padding: 10, borderRadius: 10 }}
              placeholder="2030"
            />
          </label>

          <button
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
            <div style={{ marginTop: 12, color: "#ff6b6b", fontWeight: 700 }}>
              Error: {error}
            </div>
          ) : null}
        </div>

        {/* RIGHT */}
        <div style={{ border: "1px solid #2b2f36", borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 18, fontWeight: 900 }}>Results</h2>

            {report ? (
              <button
                onClick={() => setShowRaw((s) => !s)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #2b2f36",
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                {showRaw ? "Hide Raw Results" : "Show Raw Results"}
              </button>
            ) : null}
          </div>

          {!report ? (
            <div style={{ marginTop: 14, opacity: 0.8 }}>
              Run a check to see a structured compliance report.
            </div>
          ) : (
            <>
              {/* Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                <Stat label="Total rules" value={counts?.total_rules} />
                <Stat label="Applicable" value={counts?.applicable_rules} />
                <Stat label="Critical" value={counts?.critical_violations} />
                <Stat label="Non-critical" value={counts?.non_critical_violations} />
                <Stat label="Compliant" value={counts?.compliant_rules} />
                <Stat label="Non-compliant" value={counts?.non_compliant_rules} />
                <Stat label="N/A" value={counts?.not_applicable} />
                <Stat label="Errors" value={counts?.errors} />
              </div>

              {/* Errors list + details */}
              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div style={{ border: "1px solid #2b2f36", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>
                    Rule Errors ({allErrors.length})
                  </div>

                  {allErrors.length === 0 ? (
                    <div style={{ opacity: 0.75 }}>None</div>
                  ) : (
                    <div style={{ maxHeight: 280, overflow: "auto" }}>
                      {allErrors.slice(0, 50).map((e, idx) => (
                        <button
                          key={`${e.rule_id}-${idx}`}
                          onClick={() => setSelectedError(e)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            border: "1px solid #2b2f36",
                            borderRadius: 10,
                            padding: 10,
                            cursor: "pointer",
                            marginBottom: 8,
                            background: "transparent",
                            color: "inherit",
                          }}
                        >
                          <div style={{ fontWeight: 900 }}>
                            {e.rule_id}{" "}
                            <span style={{ opacity: 0.7 }}>
                              ({e.kind || "ERROR"})
                            </span>
                          </div>
                          <div style={{ opacity: 0.85, marginTop: 4 }}>{e.message}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ border: "1px solid #2b2f36", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Error Details</div>
                  {!selectedError ? (
                    <div style={{ opacity: 0.8 }}>Click an error on the left.</div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 900 }}>
                        {selectedError.rule_id} — {selectedError.title || ""}
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

              {/* Violations lists */}
              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <ViolationList
                  title="Critical Violations"
                  items={report.critical_violations || []}
                  onSelect={(v) => setSelectedViolation(v)}
                />
                <ViolationList
                  title="Non-Critical Violations"
                  items={report.non_critical_violations || []}
                  onSelect={(v) => setSelectedViolation(v)}
                />
              </div>

              {/* Violation details (THIS is what makes clicking work) */}
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>
                  Violation Details
                </h3>

                {!selectedViolation ? (
                  <div style={{ opacity: 0.8 }}>Click a violation to view details.</div>
                ) : (
                  <div style={{ border: "1px solid #2b2f36", borderRadius: 12, padding: 12 }}>
                    <div style={{ fontWeight: 900 }}>
                      {selectedViolation.rule_id} — {selectedViolation.title}
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <b>Category:</b> {selectedViolation.category}
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <b>Severity:</b> {selectedViolation.severity}
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <b>Message:</b> {selectedViolation.message}
                    </div>

                    {selectedViolation.check_id ? (
                      <div style={{ marginTop: 8 }}>
                        <b>Check ID:</b> {selectedViolation.check_id}
                      </div>
                    ) : null}

                    {selectedViolation.label ? (
                      <div style={{ marginTop: 8 }}>
                        <b>Label:</b> {selectedViolation.label}
                      </div>
                    ) : null}

                    {Array.isArray(selectedViolation.references) &&
                    selectedViolation.references.length ? (
                      <div style={{ marginTop: 8 }}>
                        <b>References:</b>
                        <ul style={{ margin: "6px 0 0 18px" }}>
                          {selectedViolation.references.map((r, idx) => (
                            <li key={idx}>{typeof r === "string" ? r : JSON.stringify(r)}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Raw preview */}
              {showRaw ? (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>
                    Raw Results (Preview)
                  </h3>
                  <div
                    style={{
                      border: "1px solid #2b2f36",
                      borderRadius: 12,
                      padding: 12,
                      maxHeight: 300,
                      overflow: "auto",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
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
