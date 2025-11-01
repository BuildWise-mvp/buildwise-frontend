import axios from "axios";
const API_URL = "/api";

export const getDashboardStats = async () => {
  const response = await axios.get(`${API_URL}/dashboard/stats`, { withCredentials: true });
  return response.data;
};
