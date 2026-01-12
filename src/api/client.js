// src/api/client.js
const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("token"); // adjust if you store it differently
}

export async function apiFetch(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const detail = data?.detail || data?.message || text || `HTTP ${res.status}`;
    throw new Error(detail);
  }

  return data;
}
