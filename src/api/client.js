// src/api/client.js
const API_BASE =
  (process.env.REACT_APP_API_BASE || "").replace(/\/$/, "") || "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("token"); // adjust if you store it differently
}

export async function apiFetch(
  path,
  { method = "GET", body, headers = {} } = {}
) {
  const token = getToken();

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${cleanPath}`;

  const finalHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  let finalBody = body;

  // If body is a plain object, stringify it and set JSON content-type
  const isPlainObject =
    finalBody !== null &&
    typeof finalBody === "object" &&
    !(finalBody instanceof FormData) &&
    !(finalBody instanceof Blob);

  if (isPlainObject) {
    finalHeaders["Content-Type"] = finalHeaders["Content-Type"] || "application/json";
    finalBody = JSON.stringify(finalBody);
  } else if (typeof finalBody === "string") {
    // If user already passed a JSON string, keep it
    finalHeaders["Content-Type"] = finalHeaders["Content-Type"] || "application/json";
  } else if (!finalBody) {
    finalBody = undefined;
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
    const detail = data?.detail || data?.message || text || `HTTP ${res.status}`;
    const err = new Error(detail);
    err.detail = data;
    err.status = res.status;
    throw err;
  }

  return data;
}
