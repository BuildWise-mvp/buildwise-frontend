import axios from "axios";

const API_URL = "https://buildwise-systems-backend.onrender.com"; // <-- hard-wired

export const loginUser = async (username, password) => {
  try {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await axios.post(`${API_URL}/auth/login`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    const { access_token, role } = response.data;
    localStorage.setItem("token", access_token);
    localStorage.setItem("role", role);
    return { success: true, role };
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.detail || "Login failed",
    };
  }
};

export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
