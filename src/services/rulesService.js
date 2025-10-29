import axios from "axios";
import { getAuthHeader } from "./authService";

const API_URL = process.env.REACT_APP_API_URL;

export async function fetchRules() {
  const headers = getAuthHeader();
  const res = await axios.get(`${API_URL}/rules`, { headers });
  return Array.isArray(res.data) ? res.data : res.data.rules || [];
}

export async function createRule(title, description) {
  const headers = getAuthHeader();
  const res = await axios.post(
    `${API_URL}/rules`,
    { title, description },
    { headers }
  );
  return res.data;
}

export async function deleteRule(id) {
  const headers = getAuthHeader();
  const res = await axios.delete(`${API_URL}/rules/${id}`, { headers });
  return res.data;
}
