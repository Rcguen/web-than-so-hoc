import { useEffect, useRef, useState } from "react";
import { sendAdminMessage } from "./chatApi";
import "./floatingChat.css";

export default function AdminChatWindow({ onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "admin",
      text: "Admin sẽ phản hồi trong giờ hành chính 😊",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const bodyRef = useRef(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = { from: "user", text: message };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);
    setStatus(null);

    try {
      const res = await sendAdminMessage({ name, email, message });
      // show confirmation from server
      setMessages((prev) => [
        ...prev,
        { from: "admin", text: res.message || "Đã gửi tới Admin." },
      ]);
      setStatus("success");
    } catch (err) {
      console.error("sendAdminMessage error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "admin", text: "❌ Lỗi khi gửi tin nhắn. Vui lòng thử lại sau." },
      ]);
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        🤵 Chat với Admin
        <button onClick={onClose}>✖</button>
      </div>

      <div className="chat-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="msg admin">⏳ Đang gửi...</div>}
      </div>

      <div className="chat-input">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên (không bắt buộc)" 
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (để Admin phản hồi)" 
        />
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Nhập tin nhắn..."
        />
        <button onClick={handleSend} disabled={loading || !message.trim()}>
          Gửi
        </button>
      </div>

      {status === "success" && <div className="chat-note">Đã gửi. Admin sẽ liên hệ lại.</div>}
      {status === "error" && <div className="chat-note">Có lỗi khi gửi. Vui lòng thử lại.</div>}
    </div>
  );
}
