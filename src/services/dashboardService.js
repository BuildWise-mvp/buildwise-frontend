// src/services/dashboardService.js
import axios from "axios";
import { getAuthHeader } from "./authService";

const API_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

export async function fetchDashboardStats() {
  const headers = getAuthHeader();

  const [projectsRes, filesRes, rulesRes] = await Promise.all([
    axios.get(`${API_URL}/projects`, { headers }),
    axios.get(`${API_URL}/files`, { headers }),
    axios.get(`${API_URL}/rules`, { headers }),
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
