import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function AdminMessages() {
  const { token, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  const field = (m, ...names) => {
    for (const n of names) {
      if (m && typeof m[n] !== "undefined" && m[n] !== null) return m[n];
    }
    return "";
  };

  const fetchMessages = async (status = "all") => {
    setLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/admin-chat?status=${status}&limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("fetchMessages response:", res.data);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchMessages error:", err);
      if (err.response && err.response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        logout();
        return;
      }
      if (err.response && err.response.status === 403) {
        alert("Bạn không có quyền truy cập.");
        return;
      }
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages("all");
  }, []);

  const sendReply = async (id) => {
    if (!reply.trim()) return;

    // Pre-check token validity with /api/me to avoid mid-request token expiry surprises
    try {
      await axios.get("http://127.0.0.1:5000/api/me", { headers: { Authorization: `Bearer ${token}` } });
    } catch (meErr) {
      console.error('token validation failed', meErr);
      alert("Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
      logout();
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:5000/api/admin-chat/reply",
        { id, reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReply("");
      setSelected(null);
      fetchMessages();
    } catch (err) {
      console.error("sendReply error:", err);
      if (err.response && err.response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        logout();
        return;
      }
      if (err.response && err.response.status === 403) {
        alert("Bạn không có quyền trả lời tin nhắn.");
        return;
      }
      alert("Không thể gửi trả lời. Kiểm tra console.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Tin nhắn hỗ trợ</h1>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => fetchMessages("new")}>Mới</button>
        <button onClick={() => fetchMessages("replied")}>Đã trả lời</button>
        <button onClick={() => fetchMessages("all")}>Tất cả</button>
      </div>

      {loading && <div>Đang tải...</div>}

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Message</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={field(m, 'id', 'ID', 'message_id')}>
                  <td>{field(m, 'id', 'ID', 'message_id')}</td>
                  <td>{field(m, 'user_name', 'name', 'full_name') || "Khách"}</td>
                  <td>{field(m, 'email', 'user_email') || ""}</td>
                  <td style={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{field(m, 'message', 'msg', 'content', 'body')}</td>
                  <td>{field(m, 'status', 'state')}</td>
                  <td>
                    <button onClick={() => { setSelected(m); setReply(m.reply || ''); }}>Xem / Trả lời</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ width: 420 }}>
          {selected ? (
            <div>
              <h3>#{field(selected, 'id', 'ID', 'message_id')} — {field(selected, 'user_name', 'name', 'full_name') || 'Khách'}</h3>
              <p><strong>Message:</strong></p>
              <p>{field(selected, 'message', 'msg', 'content', 'body')}</p>

              <p><strong>Reply:</strong></p>
              {field(selected,'reply') ? (
                <div style={{ padding: 8, background: '#f3f3f3', marginBottom: 8 }}>{field(selected,'reply')}</div>
              ) : null}
              <textarea rows={6} value={reply} onChange={(e) => setReply(e.target.value)} style={{ width: '100%' }} />
              <div style={{ marginTop: 8 }}>
                <button onClick={() => sendReply(field(selected, 'id', 'ID', 'message_id'))}>Gửi trả lời</button>
                <button onClick={() => setSelected(null)} style={{ marginLeft: 8 }}>Đóng</button>
              </div>
            </div>
          ) : (
            <div>
              Chọn tin nhắn để xem chi tiết và trả lời.
              <div style={{ marginTop: 16 }}>
                <button onClick={() => setShowRaw(s => !s)}>{showRaw ? 'Ẩn raw' : 'Hiện raw'}</button>
                {showRaw && (
                  <pre style={{ marginTop: 8, maxHeight: 240, overflow: 'auto', background: '#f6f6f6', padding: 8 }}>{JSON.stringify(messages, null, 2)}</pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}