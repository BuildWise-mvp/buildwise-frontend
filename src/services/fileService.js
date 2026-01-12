// src/services/fileService.js
import axios from "axios";
import { getAuthHeader } from "./authService";

const API_URL = "https://buildwise-systems-backend.onrender.com";

export async function fetchFiles() {
  const headers = getAuthHeader();
  const res = await axios.get(`${API_URL}/files`, { headers });
  return Array.isArray(res.data) ? res.data : res.data.files || [];
}

export async function uploadFile(projectId, file) {
  const headers = getAuthHeader();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("project_id", projectId);
  const res = await axios.post(`${API_URL}/files`, formData, { headers });
  return res.data;
}

export async function deleteFile(id) {
  const headers = getAuthHeader();
  const res = await axios.delete(`${API_URL}/files/${id}`, { headers });
  return res.data;
}
