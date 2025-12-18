import { useState } from "react";
import { getSummary, sendFullReport } from "../components/api/aiApi.jsx";

export default function NumerologyAI() {
  const [form, setForm] = useState({
    name: "",
    birth_date: "",
    email: "",
    life_path: "",
    destiny: "",
    soul: "",
    personality: "",
  });

  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const buildPayload = () => ({
    name: form.name,
    birth_date: form.birth_date,
    email: form.email,
    numbers: {
      life_path: Number(form.life_path),
      destiny: Number(form.destiny),
      soul: Number(form.soul),
      personality: Number(form.personality),
    },
  });

  // 🔹 XEM TÓM TẮT
  const handleSummary = async () => {
    try {
      setLoading(true);
      const res = await getSummary(buildPayload());
      setSummary(res.data.summary);
    } catch (err) {
      alert("Lỗi khi gọi AI summary");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 GỬI PDF
  const handleSendPDF = async () => {
    try {
      setLoading(true);
      await sendFullReport(buildPayload());
      alert("📧 Đã gửi báo cáo PDF qua email!");
    } catch (err) {
      alert("❌ Gửi PDF thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>🔮 AI Thần Số Học</h2>

      <input name="name" placeholder="Họ tên" onChange={handleChange} /><br />
      <input name="birth_date" type="date" onChange={handleChange} /><br />
      <input name="email" placeholder="Email nhận PDF" onChange={handleChange} /><br />

      <hr />

      <input name="life_path" placeholder="Life Path" onChange={handleChange} />
      <input name="destiny" placeholder="Destiny" onChange={handleChange} />
      <input name="soul" placeholder="Soul" onChange={handleChange} />
      <input name="personality" placeholder="Personality" onChange={handleChange} />

      <br /><br />

      <button onClick={handleSummary} disabled={loading}>
        📄 Xem tóm tắt
      </button>

      <button
        onClick={handleSendPDF}
        disabled={loading}
        style={{ marginLeft: 10 }}
      >
        📧 Gửi báo cáo PDF
      </button>

      {loading && <p>⏳ AI đang xử lý...</p>}

      {summary && (
        <div style={{ marginTop: 20 }}>
          <h3>📘 Kết quả phân tích</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{summary}</pre>
        </div>
      )}
    </div>
  );
}
