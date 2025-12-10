// src/services/rulesService.js
import axios from "axios";
import { getAuthHeader } from "./authService";

// Keep this — Netlify proxy usually forwards "/api" to your backend
const API_URL = "https://buildwise-systems-backend.onrender.com";

/**
 * Fetch AI rules from the compliance engine (NBC + CCQ).
 * Backend endpoint: GET /compliance/rules (proxied as /api/compliance/rules)
 */
export async function fetchRules() {
  const headers = getAuthHeader();
  const res = await axios.get(`${API_URL}/compliance/rules`, { headers });

  const data = res.data;

  // Flexible parsing — handle different possible shapes safely
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data.rules)) {
    return data.rules;
  }
  if (data.items && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

// These are no longer used for AI rules (read-only),
// but we export no-ops so other code doesn't break if it still imports them.
export async function createRule() {
  throw new Error("AI rules are read-only. Creation is disabled in this view.");
}

export async function deleteRule() {
  throw new Error("AI rules are read-only. Deletion is disabled in this view.");
}
