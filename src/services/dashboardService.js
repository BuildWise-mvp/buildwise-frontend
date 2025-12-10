// src/services/dashboardService.js
import axios from "axios";
import { getAuthHeader } from "./authService";

const API_URL = "https://buildwise-systems-backend.onrender.com";

// Fetch all projects
export const getProjects = async () => {
  const response = await axios.get(`${API_URL}/projects`, { withCredentials: true });
  return response.data;
};

// Fetch all files
export const getFiles = async () => {
  const response = await axios.get(`${API_URL}/files`, { withCredentials: true });
  return response.data;
};

// Fetch all rules
export const getRules = async () => {
  const response = await axios.get(`${API_URL}/rules`, { withCredentials: true });
  return response.data;
};

export async function fetchDashboardStats() {
  const headers = getAuthHeader();

  const [projectsRes, filesRes, rulesRes] = await Promise.all([
    axios.get(`${API_URL}/projects`, { headers, withCredentials: true }),
    axios.get(`${API_URL}/files`, { headers, withCredentials: true }),
    axios.get(`${API_URL}/rules`, { headers, withCredentials: true }),
  ]);

  const projectsCount = Array.isArray(projectsRes.data)
    ? projectsRes.data.length
    : projectsRes.data.projects?.length || 0;

  const filesCount = Array.isArray(filesRes.data)
    ? filesRes.data.length
    : filesRes.data.files?.length || 0;

  const rulesCount = Array.isArray(rulesRes.data)
    ? rulesRes.data.length
    : rulesRes.data.rules?.length || 0;

  return { projectsCount, filesCount, rulesCount };
}
