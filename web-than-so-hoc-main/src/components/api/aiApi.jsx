import axios from "axios";

const API_BASE = "http://localhost:5000"; // 👈 THÊM DÒNG NÀY

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

export const getSummary = (payload) =>
  api.post("/api/ai/summary", payload);

export const sendFullReport = (payload) =>
  api.post("/api/ai/full-report", payload);

export default api;
