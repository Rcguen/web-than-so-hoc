import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
//import { getSummary, sendFullReport } from "../components/api/aiApi.jsx";
import { calcAllNumbers } from "../utils/numerology";
import {callGemini} from "../components/api/geminiApi.jsx";

const LS_KEY = "numerology_history_v1";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export default function ReportAI() {
  const [form, setForm] = useState({
    name: "",
    birth_date: "",
    email: "",
  });

  const [numbers, setNumbers] = useState({
    life_path: "",
    destiny: "",
    soul: "",
    personality: "",
  });

  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // lịch sử tra cứu (localStorage)
  const [history, setHistory] = useState(() => loadHistory());
  const [selectedId, setSelectedId] = useState("");

  // Nếu được điều hướng từ trang Lịch sử (HistoryLookup) với state, tự fill form/numbers + lưu vào lịch sử
  const location = useLocation();
  useEffect(() => {
    const s = location?.state;
    if (!s) return;
    const name = s.name || "";
    const birth_date = s.birth_date || "";
    const email = s.email || "";
    const numbersFromState = s.numbers || { life_path: "", destiny: "", soul: "", personality: "" };

    // Cập nhật form và số
    setForm({ name, birth_date, email });
    setNumbers(numbersFromState);

    // Thêm/ cập nhật vào lịch sử local và chọn item
    const id = `${name}__${birth_date}`.toLowerCase();
    const item = {
      id,
      name,
      birth_date,
      email,
      numbers: numbersFromState,
      updatedAt: new Date().toISOString(),
      summary: s.summary || "",
    };

    setHistory((prev) => {
      const others = prev.filter((x) => x.id !== id);
    
      return [item, ...others].slice(0, 20);
    });
    setSelectedId(id);
  }, [location?.state]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Tự động tính số khi thay đổi tên / ngày sinh
  useEffect(() => {
    const n = calcAllNumbers(form);
    setNumbers(n);
  }, [form.name, form.birth_date]);

  const payload = useMemo(() => {
    return {
      name: form.name,
      birth_date: form.birth_date,
      email: form.email,
      numbers,
    };
  }, [form, numbers]);

  const canRun = Boolean(form.name && form.birth_date);
  const canSend = Boolean(form.name && form.birth_date && form.email);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const upsertHistory = (extra = {}) => {
    const id = `${form.name}__${form.birth_date}`.toLowerCase();
    const item = {
      id,
      name: form.name,
      birth_date: form.birth_date,
      email: form.email,
      numbers,
      updatedAt: new Date().toISOString(),
      ...extra,
    };
    setHistory((prev) => {
      const others = prev.filter((x) => x.id !== id);
      return [item, ...others].slice(0, 20);
    });
    setSelectedId(id);
  };

  const onPickHistory = (id) => {
    setSelectedId(id);
    const item = history.find((x) => x.id === id);
    if (!item) return;
    setForm({ name: item.name || "", birth_date: item.birth_date || "", email: item.email || "" });
    setNumbers(item.numbers || { life_path: "", destiny: "", soul: "", personality: "" });
    setSummary(item.summary || "");
  };

  const showError = (err) => {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Lỗi không xác định";
    alert(`❌ Lỗi: ${msg}`);
  };

  const handleSummary = async () => {
  if (!canRun) return alert("Nhập Họ tên + Ngày sinh trước đã em nhé.");

  try {
    setLoading(true);

    // 1️⃣ LẤY KIẾN THỨC TỪ BACKEND
    const res = await fetch("http://localhost:5000/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        life_path: numbers.life_path,
        destiny: numbers.destiny,
        soul: numbers.soul,
        personality: numbers.personality,
      }),
    });

    const data = await res.json();
    const knowledge = data.knowledge || [];

    // 2️⃣ BUILD PROMPT
    const prompt = `
Bạn là chuyên gia Thần số học Pitago người Việt.

Họ tên: ${form.name}
Ngày sinh: ${form.birth_date}

Chỉ số:
- Life Path: ${numbers.life_path}
- Destiny: ${numbers.destiny}
- Soul: ${numbers.soul}
- Personality: ${numbers.personality}

Kiến thức tham khảo:
${knowledge.map(k => `- (${k.type}) ${k.content}`).join("\n")}

Hãy viết bản phân tích ngắn gọn, dễ hiểu, bằng tiếng Việt (3–5 đoạn).
`;

    // 3️⃣ GỌI GEMINI (FRONTEND)
    const aiText = await callGemini(prompt);

    setSummary(aiText);
    upsertHistory({ summary: aiText });

  } catch (err) {
    console.error(err);
    alert("❌ Lỗi khi gọi AI");
  } finally {
    setLoading(false);
  }
};


const handleSendPDF = async () => {
  if (!canSend) return alert("Nhập đủ Họ tên + Ngày sinh + Email trước đã em nhé.");

  try {
    setLoading(true);

    const res = await fetch("http://localhost:5000/api/ai/full-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        birth_date: form.birth_date,
        email: form.email,
        numbers,
        summary,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Gửi PDF thất bại");
    }

    // Cập nhật lịch sử local
    upsertHistory({});

    alert(`📩 Báo cáo PDF đã được gửi về email của bạn!\n${data.pdf_path ? `PDF: ${data.pdf_path}` : ""}`);
  } catch (err) {
    console.error(err);
    showError(err);
  } finally {
    setLoading(false);
  }
};


//   const handleSendPDF = async () => {
//   alert("Chức năng gửi PDF sẽ hoàn thiện sau.");
// };

  return (
    <div style={{ maxWidth: 900, margin: "28px auto", fontFamily: "system-ui, Arial", padding: "0 20px" }}>
      <h2 style={{ marginBottom: 6, fontSize: "28px", fontWeight: "800", color: "#333", textAlign: "center" }}>
        📄 Báo cáo tổng hợp <span style={{color: "#7a00ff"}}>Thần số học</span>
      </h2>
      <div style={{ color: "#666", marginBottom: 30, textAlign: "center", fontSize: "16px" }}>
        Nhập <b>Họ tên</b> + <b>Ngày sinh</b> → hệ thống tự tính chỉ số → AI tóm tắt / gửi PDF.
      </div>

      {/* Lịch sử */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <label style={{ minWidth: 120, fontWeight: "600", color: "#444" }}>🗂️ Lịch sử:</label>
        <select
          value={selectedId}
          onChange={(e) => onPickHistory(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" }}
        >
          <option value="">-- Chọn hồ sơ cũ --</option>
          {history.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} — {h.birth_date}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setSelectedId("");
            setForm({ name: "", birth_date: "", email: "" });
            setSummary("");
          }}
          style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #7a00ff", background: "#fff", color: "#7a00ff", cursor: "pointer", fontWeight: "600" }}
        >
          + Tạo mới
        </button>
      </div>

      {/* Form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, background: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <div>
          <div style={{ marginBottom: 8, fontWeight: "600", color: "#444" }}>Họ và Tên</div>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Ví dụ: Nguyễn Văn A"
            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", outline: "none", transition: "0.3s" }}
            onFocus={(e) => e.target.style.borderColor = "#7a00ff"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: "600", color: "#444" }}>Ngày sinh (Dương lịch)</div>
          <input
            name="birth_date"
            type="date"
            value={form.birth_date}
            onChange={onChange}
            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", outline: "none", transition: "0.3s" }}
            onFocus={(e) => e.target.style.borderColor = "#7a00ff"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />
        </div>

        <div style={{ gridColumn: "1 / span 2" }}>
          <div style={{ marginBottom: 8, fontWeight: "600", color: "#444" }}>Email nhận báo cáo (PDF)</div>
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="example@gmail.com"
            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", outline: "none", transition: "0.3s" }}
            onFocus={(e) => e.target.style.borderColor = "#7a00ff"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />
        </div>
      </div>

      {/* Numbers (readonly) */}
      <div style={{ marginTop: 30 }}>
        <h3 style={{ fontWeight: 800, marginBottom: 15, color: "#333", fontSize: "20px" }}>🔢 Các Chỉ Số Quan Trọng</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
          <NumberBox label="Số Chủ Đạo" value={numbers.life_path} />
          <NumberBox label="Số Vận Mệnh" value={numbers.destiny} />
          <NumberBox label="Số Linh Hồn" value={numbers.soul} />
          <NumberBox label="Số Nhân Cách" value={numbers.personality} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 15, marginTop: 30, justifyContent: "center" }}>
        <button
          onClick={handleSummary}
          disabled={loading || !canRun}
          style={{
            padding: "14px 24px",
            borderRadius: "50px",
            border: "none",
            background: loading || !canRun ? "#ccc" : "linear-gradient(to right, #7a00ff, #aa00ff)",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "700",
            cursor: loading || !canRun ? "not-allowed" : "pointer",
            boxShadow: "0 4px 15px rgba(122, 0, 255, 0.3)",
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => !loading && canRun && (e.target.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
        >
          {loading ? "Đang xử lý..." : "🔮 Xem Luận Giải AI"}
        </button>

        <button
          onClick={handleSendPDF}
          disabled={loading || !canSend}
          style={{
            padding: "14px 24px",
            borderRadius: "50px",
            border: "2px solid #7a00ff",
            background: "#fff",
            color: "#7a00ff",
            fontSize: "16px",
            fontWeight: "700",
            cursor: loading || !canSend ? "not-allowed" : "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => !loading && canSend && (e.target.style.background = "#f3e8ff")}
          onMouseLeave={(e) => (e.target.style.background = "#fff")}
        >
          📧 Gửi Báo Cáo PDF
        </button>
      </div>

      {/* Summary */}
      <div style={{ marginTop: 30, marginBottom: 50 }}>
        <div style={{ fontWeight: 800, marginBottom: 15, fontSize: "20px", color: "#333" }}>✨ Kết Quả Luận Giải</div>
        <div style={{ 
          padding: "30px", 
          border: "1px solid #eee", 
          borderRadius: "20px", 
          minHeight: 150, 
          background: "#fff", 
          boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
          lineHeight: "1.8",
          fontSize: "16px",
          color: "#444"
        }}>
          {summary ? (
            <div style={{ whiteSpace: "pre-wrap" }}>
                {/* Có thể dùng Markdown renderer nếu muốn đẹp hơn */}
                {summary}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
              <div style={{fontSize: "40px", marginBottom: "10px"}}>🤖</div>
              Chưa có dữ liệu phân tích. <br/>Hãy nhập thông tin và bấm <b>"Xem Luận Giải AI"</b> để bắt đầu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Thay thế component NumberBox ở cuối file bằng code này:
function NumberBox({ label, value }) {
  return (
    <div style={{
      padding: "20px",
      borderRadius: "16px",
      background: "#fff",
      boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
      border: "1px solid rgba(122, 0, 255, 0.1)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "default"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-5px)";
      e.currentTarget.style.boxShadow = "0 8px 25px rgba(122, 0, 255, 0.15)";
      e.currentTarget.style.borderColor = "#7a00ff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
      e.currentTarget.style.borderColor = "rgba(122, 0, 255, 0.1)";
    }}
    >
      <div style={{
        color: "#666",
        fontSize: "14px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "8px"
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "32px",
        fontWeight: "800",
        color: "#7a00ff", // Màu tím chủ đạo
        background: "-webkit-linear-gradient(45deg, #7a00ff, #aa00ff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        lineHeight: "1"
      }}>
        {value || "—"}
      </div>
    </div>
  );
}