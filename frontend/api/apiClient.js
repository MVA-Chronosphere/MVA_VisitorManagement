import axios from "axios";

// 🧠 IMPORTANT: Replace with your backend IP
// For Android emulator use http://10.0.2.2:5000
// For iPad on Wi-Fi, replace with your computer's IP
const API_BASE_URL = "http://localhost:5000/api/visitors";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
