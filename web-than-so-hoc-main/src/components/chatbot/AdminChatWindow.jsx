import { useEffect, useRef, useState } from "react";
import { sendAdminMessage, getSupportMessage } from "./chatApi";
import { useAuth } from "../../context/AuthContext";
import "./floatingChat.css";

export default function AdminChatWindow({ onClose }) {
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
  const pollingRef = useRef(null);
  const lastSentIdRef = useRef(null);
  const { token, user } = useAuth();

  // Auto-scroll when messages update
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = { from: "user", text: message };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);
    setStatus(null);

    try {
      const res = await sendAdminMessage({ message, user_id: user?.user_id }, token);
      // show confirmation from server
      setMessages((prev) => [
        ...prev,
        { from: "admin", text: res.message || "Đã gửi tới Admin." },
      ]);
      setStatus("success");

      // if server returned an id, start polling for reply
      if (res && res.id) {
        lastSentIdRef.current = res.id;
        // store owner_secret if server returned it so we can poll even if token expires
        const ownerSecret = res.owner_secret || null;
        if (ownerSecret) lastSentIdRef.current_owner = ownerSecret;

        // if user not logged in and no ownerSecret, tell them to log in
        if (!token && !ownerSecret) {
          setMessages((prev) => [
            ...prev,
            { from: "admin", text: "Tin đã được gửi. Để nhận phản hồi trực tiếp trong chat, vui lòng đăng nhập vào tài khoản." },
          ]);
          lastSentIdRef.current = null;
        } else {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = setInterval(async () => {
            try {
              const data = await getSupportMessage(res.id, token, ownerSecret);
              if (data && data.reply) {
                setMessages((prev) => [
                  ...prev,
                  { from: "admin", text: data.reply },
                ]);
                setStatus("replied");
                clearInterval(pollingRef.current);
                pollingRef.current = null;
                lastSentIdRef.current = null;
                lastSentIdRef.current_owner = null;
              }
            } catch (pollErr) {
              // if user token is missing/expired and no ownerSecret, notify and stop polling
              if ((!ownerSecret) && pollErr && pollErr.response && pollErr.response.status === 401) {
                setMessages((prev) => [
                  ...prev,
                  { from: "admin", text: "Phiên đã hết hạn hoặc cần đăng nhập để nhận phản hồi. Vui lòng đăng nhập." },
                ]);
                if (pollingRef.current) clearInterval(pollingRef.current);
                pollingRef.current = null;
                lastSentIdRef.current = null;
                setStatus("login_required");
                return;
              }
              // otherwise log silently
              console.error('polling error', pollErr);
            }
          }, 4000);
        }
      }

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
        {/* Name & Email are automatic from authenticated user; we only show message box */}        <input
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
