import { useState } from "react";
import { sendChatMessage } from "./chatApi";

export default function ChatbotWindow({ onClose }) {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào 👋 Tôi là AI Thần Số Học!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendChatMessage(input);
      setMessages(prev => [...prev, { from: "bot", text: reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { from: "bot", text: "❌ Lỗi khi gọi AI" }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        🤖 Chatbot Thần Số Học
        <button onClick={onClose}>✖</button>
      </div>

      <div className="chat-body">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="msg bot">⏳ AI đang trả lời...</div>}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Nhập câu hỏi..."
        />
        <button onClick={handleSend}>Gửi</button>
      </div>
    </div>
  );
}
