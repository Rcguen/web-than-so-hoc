import { useState } from "react";
import { sendNumerologySummary } from "./chatApi";

export default function ChatbotWindow() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "👋 Xin chào! Tôi là AI Thần Số Học.\n👉 Vui lòng nhập họ tên và ngày sinh để tôi phân tích cho bạn.",
    },
  ]);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!name || !birthDate) {
      setMessages((prev) => [
        ...prev,
        { role: "system", text: "⚠️ Vui lòng nhập đầy đủ họ tên và ngày sinh." },
      ]);
      return;
    }

    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: `👤 ${name}\n📅 ${birthDate}`,
      },
    ]);

    try {
      // ⚠️ Nếu em đã có sẵn các chỉ số thì truyền vào đây
      const result = await sendNumerologySummary({
        name,
        birth_date: birthDate,
        numbers: {}, // có thể bổ sung sau
      });

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: result },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "system", text: "❌ Không thể phân tích lúc này." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-window">
      <div className="chatbot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="chatbot-form">
        <input
          type="text"
          placeholder="Họ tên..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />

        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Đang phân tích..." : "🔮 Phân tích"}
        </button>
      </div>
    </div>
  );
}
