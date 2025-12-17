import axios from "axios";

const API_BASE = "http://localhost:5000";

export async function sendChatMessage(message) {
  const res = await axios.post(`${API_BASE}/api/chat`, {
    message
  });
  return res.data.reply;
}

export async function sendAdminMessage({ name, email, message }) {
  const res = await axios.post(`${API_BASE}/api/support/message`, {
    name,
    email,
    message,
  });
  return res.data;
}
