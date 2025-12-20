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

export async function callAIReport(payload) {
  const res = await fetch("http://localhost:5000/api/ai/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "AI error");
  }

  return data.text;
}


export default api;
