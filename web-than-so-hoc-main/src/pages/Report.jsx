import { useEffect, useMemo, useState } from "react";
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


  // const handleSendPDF = async () => {
  //   if (!canSend) return alert("Nhập đủ Họ tên + Ngày sinh + Email trước đã em nhé.");
  //   try {
  //     setLoading(true);
  //     const res = await sendFullReport(payload);
  //     upsertHistory();
  //     alert(`✅ ${res.data?.message || "Đã gửi báo cáo PDF"}\n${res.data?.pdf_path ? `PDF: ${res.data.pdf_path}` : ""}`);
  //   } catch (err) {
  //     showError(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSendPDF = async () => {
  alert("Chức năng gửi PDF sẽ hoàn thiện sau.");
};

  return (
    <div style={{ maxWidth: 900, margin: "28px auto", fontFamily: "system-ui, Arial" }}>
      <h2 style={{ marginBottom: 6 }}>📄 Báo cáo tổng hợp Thần số học</h2>
      <div style={{ color: "#666", marginBottom: 16 }}>
        Nhập <b>Họ tên</b> + <b>Ngày sinh</b> → hệ thống tự tính chỉ số → AI tóm tắt / gửi PDF.
      </div>

      {/* Lịch sử */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <label style={{ minWidth: 120 }}>🗂️ Lịch sử tra cứu</label>
        <select
          value={selectedId}
          onChange={(e) => onPickHistory(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        >
          <option value="">-- Chọn lịch sử --</option>
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
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
        >
          Tạo mới
        </button>
      </div>

      {/* Form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={{ marginBottom: 6 }}>Họ tên</div>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Ví dụ: Nguyễn Văn A"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          />
        </div>

        <div>
          <div style={{ marginBottom: 6 }}>Ngày sinh</div>
          <input
            name="birth_date"
            type="date"
            value={form.birth_date}
            onChange={onChange}
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ gridColumn: "1 / span 2" }}>
          <div style={{ marginBottom: 6 }}>Email nhận PDF</div>
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="example@gmail.com"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          />
        </div>
      </div>

      {/* Numbers (readonly) */}
      <div style={{ marginTop: 18, padding: 16, border: "1px solid #eee", borderRadius: 16, background: "#fafafa" }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>🔢 Chỉ số (tự động tính)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <NumberBox label="Life Path" value={numbers.life_path} />
          <NumberBox label="Destiny" value={numbers.destiny} />
          <NumberBox label="Soul" value={numbers.soul} />
          <NumberBox label="Personality" value={numbers.personality} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center" }}>
        <button
          onClick={handleSummary}
          disabled={loading || !canRun}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: loading || !canRun ? "#f2f2f2" : "#fff",
            cursor: loading || !canRun ? "not-allowed" : "pointer",
          }}
        >
          📌 Xem tóm tắt
        </button>

        <button
          onClick={handleSendPDF}
          disabled={loading || !canSend}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: loading || !canSend ? "#f2f2f2" : "#fff",
            cursor: loading || !canSend ? "not-allowed" : "pointer",
          }}
        >
          📧 Gửi báo cáo PDF
        </button>

        {loading && <span style={{ color: "#666" }}>⏳ AI đang xử lý…</span>}
      </div>

      {/* Summary */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>✨ Kết quả tóm tắt</div>
        <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 16, minHeight: 120 }}>
          {summary ? (
            <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>{summary}</pre>
          ) : (
            <span style={{ color: "#888" }}>Chưa có nội dung. Bấm “Xem tóm tắt” để tạo.</span>
          )}
        </div>
      </div>
    </div>
  );
}

function NumberBox({ label, value }) {
  return (
    <div style={{ padding: 12, borderRadius: 14, border: "1px solid #e8e8e8", background: "#fff" }}>
      <div style={{ color: "#666", fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{value || "—"}</div>
    </div>
  );
}


