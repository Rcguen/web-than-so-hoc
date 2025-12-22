import axios from "axios";

const API_BASE = "http://localhost:5000";

/* ===== AI NUMEROLOGY ===== */
export async function sendNumerologySummary({
  name,
  birth_date,
  numbers = {},
}) {
  const res = await axios.post(
    `${API_BASE}/api/ai/summary`,
    { name, birth_date, numbers },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data.text;
}

/* ===== ADMIN CHAT (SUPPORT) ===== */
export async function sendAdminMessage({ message, user_id }, token) {
  const res = await axios.post(
    `${API_BASE}/api/support/message`,
    { message, user_id },
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    }
  );
  return res.data;
}

export async function getSupportMessage(id, token) {
  const res = await axios.get(
    `${API_BASE}/api/support/message/${id}`,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    }
  );
  return res.data;
}

export async function chatFree(message) {
  const res = await fetch("http://localhost:5000/api/ai/chat/free", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return res.json();
}

export async function chatKnowledge(message) {
  const res = await fetch("http://localhost:5000/api/ai/chat/knowledge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return res.json();
}



export const sendAIMessage = async (message) => {
  const res = await axios.post("http://127.0.0.1:5000/api/ai/chat", {
    message
  });
  return res.data;
};

