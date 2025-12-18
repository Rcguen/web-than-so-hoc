import axios from "axios";

const API_BASE = "http://localhost:5000";

export async function sendChatMessage(message) {
  const res = await axios.post(`${API_BASE}/api/chat`, {
    message
  });
  return res.data.reply;
}

export async function sendAdminMessage({ message, user_id }, token) {
  const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const res = await axios.post(`${API_BASE}/api/support/message`, {
    message,
    user_id,
  }, headers);
  return res.data;
}

export async function getSupportMessage(id, token, accessToken) {
  const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
  const url = `${API_BASE}/api/support/message/${id}${accessToken ? `?access_token=${encodeURIComponent(accessToken)}` : ''}`;
  const res = await axios.get(url, headers);
  return res.data;
}
