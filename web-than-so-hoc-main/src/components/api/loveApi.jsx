// src/api/loveApi.js
const BASE_URL = "http://localhost:5000";

async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: "Server trả về dữ liệu không phải JSON", raw: text };
  }
}

export async function loveSummary(payload) {
  const res = await fetch(`${BASE_URL}/api/love/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || "Gọi /api/love/summary thất bại");
  return data;
}

export async function loveCompatibility(payload) {
  const res = await fetch(`${BASE_URL}/api/love/compatibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || "Gọi /api/love/compatibility thất bại");
  return data;
}
