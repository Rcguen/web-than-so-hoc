import { useEffect, useRef, useState } from "react";
import "./unifiedChatWindow.css";

export default function UnifiedChatWindow({ onClose }) {
  const [tab, setTab] = useState("AI"); // AI | ADMIN
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "👋 Xin chào! Tôi là AI Thần Số Học ✨ Bạn có thể hỏi tôi bất cứ điều gì.",
    },
  ]);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    if (tab === "AI") {
      setTyping(true);

      // MOCK AI – sau này thay API thật
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text:
              "🤖 (AI) Tôi đã hiểu câu hỏi của bạn. Đây là câu trả lời mẫu để demo giao diện chat Messenger.",
          },
        ]);
        setTyping(false);
      }, 1200);
    } else {
      // Admin
      setMessages((prev) => [
        ...prev,
        {
          role: "admin",
          text: "👨‍💼 Admin đã nhận được tin nhắn của bạn.",
        },
      ]);
    }
  };

  return (
    <div className="messenger-chat">
      {/* HEADER */}
      <div className="chat-header">
        <span>💬 Chat hỗ trợ</span>
        <button onClick={onClose}>✕</button>
      </div>

      {/* TABS */}
      <div className="chat-tabs">
        <button
          className={tab === "AI" ? "active" : ""}
          onClick={() => setTab("AI")}
        >
          🤖 AI
        </button>
        <button
          className={tab === "ADMIN" ? "active" : ""}
          onClick={() => setTab("ADMIN")}
        >
          👨‍💼 Admin <span className="online-dot" />
        </button>
      </div>

      {/* BODY */}
      <div className="chat-body">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.text}
          </div>
        ))}

        {typing && (
          <div className="bubble ai typing">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
}
