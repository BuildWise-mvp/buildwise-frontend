// src/services/projectService.js
import axios from "axios";
import { getAuthHeader } from "./authService";

const API_URL = "http://127.0.0.1:8000";

export async function fetchProjects() {
  const headers = getAuthHeader();
  const res = await axios.get(`${API_URL}/projects`, { headers });
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.projects)) return data.projects;
  return [];
}

export async function createProject(name, description = "") {
  const headers = getAuthHeader();
  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  const res = await axios.post(`${API_URL}/projects`, formData, { headers });
  return res.data;
}

export async function deleteProject(id) {
  const headers = getAuthHeader();
  const res = await axios.delete(`${API_URL}/projects/${id}`, { headers });
  return res.data;
}
