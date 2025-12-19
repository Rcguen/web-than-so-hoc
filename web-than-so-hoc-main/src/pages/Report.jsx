import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { calcAllNumbers } from "../utils/numerology";
import { callGemini } from "../components/api/geminiApi.jsx";

const LS_KEY = "numerology_history_v1";

/* ================= LOCAL STORAGE ================= */
const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveHistory = (list) =>
  localStorage.setItem(LS_KEY, JSON.stringify(list));

/* ================= COMPONENT ================= */
export default function ReportAI() {
  const location = useLocation();

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

  const [history, setHistory] = useState(() => loadHistory());
  const [selectedId, setSelectedId] = useState("");

  /* ================= IMPORT TỪ HISTORY PAGE ================= */
  useEffect(() => {
    if (!location?.state) return;

    const { name, birth_date, email, numbers, summary } = location.state;
    const id = `${name}__${birth_date}`.toLowerCase();

    const item = {
      id,
      name,
      birth_date,
      email,
      numbers,
      summary: summary || "",
      updatedAt: new Date().toISOString(),
    };

    setHistory((prev) => {
      const others = prev.filter((x) => x.id !== id);
      return [item, ...others].slice(0, 20);
    });

    setSelectedId(id);
  }, [location?.state]);

  useEffect(() => saveHistory(history), [history]);

  /* ================= SELECTED ITEM = SOURCE OF TRUTH ================= */
  useEffect(() => {
    if (!selectedId) return;

    const item = history.find((h) => h.id === selectedId);
    if (!item) return;

    setForm({
      name: item.name,
      birth_date: item.birth_date,
      email: item.email || "",
    });

    setNumbers(item.numbers);
    setSummary(item.summary || "");
  }, [selectedId, history]);

  /* ================= AUTO CALC ================= */
  useEffect(() => {
    if (!form.name || !form.birth_date) return;
    setNumbers(calcAllNumbers(form));
  }, [form.name, form.birth_date]);

  const canRun = Boolean(form.name && form.birth_date);
  const canSend = Boolean(canRun && form.email);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ================= HISTORY UPSERT ================= */
  const upsertHistory = (extra = {}) => {
    const id = `${form.name}__${form.birth_date}`.toLowerCase();
    const item = {
      id,
      ...form,
      numbers,
      summary,
      updatedAt: new Date().toISOString(),
      ...extra,
    };

    setHistory((prev) => {
      const others = prev.filter((x) => x.id !== id);
      return [item, ...others].slice(0, 20);
    });
    setSelectedId(id);
  };

  /* ================= AI SUMMARY ================= */
  const handleSummary = async () => {
    if (!canRun) return alert("Nhập Họ tên + Ngày sinh trước nhé.");

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(numbers),
      });
      const data = await res.json();

      const prompt = `
Bạn là chuyên gia Thần số học Pitago người Việt.

Họ tên: ${form.name}
Ngày sinh: ${form.birth_date}

Chỉ số:
- Life Path: ${numbers.life_path}
- Destiny: ${numbers.destiny}
- Soul: ${numbers.soul}
- Personality: ${numbers.personality}

Kiến thức:
${(data.knowledge || []).map((k) => `- ${k.content}`).join("\n")}

Viết bản luận giải dễ hiểu, 3–5 đoạn.
`;

      const aiText = await callGemini(prompt);
      setSummary(aiText);
      upsertHistory({ summary: aiText });
    } catch {
      alert("❌ Lỗi khi gọi AI");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEND PDF ================= */
  const handleSendPDF = async () => {
    if (!canSend) return alert("Nhập đủ Họ tên + Ngày sinh + Email");

    try {
      setLoading(true);
      await fetch("http://localhost:5000/api/ai/full-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, numbers, summary }),
      });
      alert("📧 PDF đã được gửi!");
    } catch {
      alert("❌ Gửi PDF thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div style={{ maxWidth: 1000, margin: "30px auto", padding: "0 20px" }}>
      <h2 style={{ textAlign: "center", fontSize: 30, fontWeight: 800 }}>
        📄 Báo cáo <span style={{ color: "#7a00ff" }}>Thần số học</span>
      </h2>
      <p style={{ textAlign: "center", color: "#666", marginBottom: 30 }}>
        Nhập thông tin → hệ thống tự tính → AI luận giải / gửi PDF
      </p>

      {/* HISTORY */}
      <Card>
        <div style={{ display: "flex", gap: 12 }}>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={input}
          >
            <option value="">📂 Chọn lịch sử tra cứu</option>
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
            style={btnOutline}
          >
            + Tạo mới
          </button>
        </div>
      </Card>

      {/* FORM */}
      <Card>
        <Grid>
          <Input label="Họ tên" name="name" value={form.name} onChange={onChange} />
          <Input label="Ngày sinh" type="date" name="birth_date" value={form.birth_date} onChange={onChange} />
          <Input label="Email nhận PDF" name="email" value={form.email} onChange={onChange} full />
        </Grid>
      </Card>

      {/* NUMBERS */}
      <Card>
        <h3 style={{ marginBottom: 15 }}>🔢 Chỉ số (tự động tính)</h3>
        <Grid>
          <NumberBox label="Life Path" value={numbers.life_path} />
          <NumberBox label="Destiny" value={numbers.destiny} />
          <NumberBox label="Soul" value={numbers.soul} />
          <NumberBox label="Personality" value={numbers.personality} />
        </Grid>
      </Card>

      {/* ACTIONS */}
      <div style={{ display: "flex", gap: 15, justifyContent: "center", margin: "30px 0" }}>
        <button onClick={handleSummary} disabled={!canRun || loading} style={btnPrimary}>
          {loading ? "🤖 AI đang phân tích..." : "🔮 Xem luận giải AI"}
        </button>
        <button onClick={handleSendPDF} disabled={!canSend || loading} style={btnOutline}>
          📧 Gửi báo cáo PDF
        </button>
      </div>

      {/* SUMMARY */}
      <Card>
        <h3 style={{ marginBottom: 10 }}>✨ Kết quả luận giải</h3>
        {summary ? (
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{summary}</div>
        ) : (
          <div style={{ textAlign: "center", color: "#999", padding: 30 }}>
            🤖 Chưa có nội dung phân tích
          </div>
        )}
      </Card>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */
const Card = ({ children }) => (
  <div style={{
    background: "#fff",
    borderRadius: 18,
    padding: 25,
    marginBottom: 25,
    boxShadow: "0 10px 40px rgba(0,0,0,0.06)"
  }}>{children}</div>
);

const Grid = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
    {children}
  </div>
);

const Input = ({ label, full, ...props }) => (
  <div style={{ gridColumn: full ? "1 / span 2" : "auto" }}>
    <div style={{ marginBottom: 6, fontWeight: 600 }}>{label}</div>
    <input {...props} style={input} />
  </div>
);

const NumberBox = ({ label, value }) => (
  <div style={{
    padding: 20,
    borderRadius: 16,
    textAlign: "center",
    background: "#faf7ff",
    border: "1px solid rgba(122,0,255,.15)"
  }}>
    <div style={{ color: "#666", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: "#7a00ff" }}>
      {value || "—"}
    </div>
  </div>
);

/* ================= STYLES ================= */
const input = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  outline: "none"
};

const btnPrimary = {
  padding: "14px 28px",
  borderRadius: 50,
  border: "none",
  background: "linear-gradient(to right,#7a00ff,#aa00ff)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer"
};

const btnOutline = {
  padding: "14px 28px",
  borderRadius: 50,
  border: "2px solid #7a00ff",
  background: "#fff",
  color: "#7a00ff",
  fontWeight: 700,
  cursor: "pointer"
};
