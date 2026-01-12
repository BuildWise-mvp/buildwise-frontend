// src/api/client.js

function normalizeBaseUrl(base) {
  // remove trailing spaces + ALL trailing slashes
  return String(base || "").trim().replace(/\/+$/, "");
}

function normalizePath(path) {
  // remove leading spaces + ALL leading slashes
  const p = String(path || "").trim().replace(/^\/+/, "");
  return `/${p}`;
}

const API_BASE =
  normalizeBaseUrl(process.env.REACT_APP_API_BASE) || "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("token"); // adjust if you store it differently
}

export async function apiFetch(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();

  const url = `${API_BASE}${normalizePath(path)}`;

  const finalHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  // default JSON
  let finalBody = undefined;

  if (body !== undefined && body !== null) {
    // allow FormData uploads if needed later
    if (body instanceof FormData) {
      finalBody = body;
    } else if (typeof body === "string") {
      finalHeaders["Content-Type"] =
        finalHeaders["Content-Type"] || "application/json";
      finalBody = body;
    } else {
      finalHeaders["Content-Type"] =
        finalHeaders["Content-Type"] || "application/json";
      finalBody = JSON.stringify(body);
    }
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: finalBody,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    // keep the real server message if we have it
    const detail =
      (data && (data.detail || data.message)) ||
      text ||
      `HTTP ${res.status} ${res.statusText}`;

    const err = new Error(detail);
    err.status = res.status;
    err.url = url;
    err.payload = data;
    throw err;
  }

  return data;
}
