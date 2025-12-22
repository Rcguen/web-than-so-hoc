// src/pages/LovePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { calcAllNumbers } from "../utils/numerology";
import { loveSummary, loveCompatibility } from "../components/api/loveApi";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const LS_KEY = "love_history_v1";
const API_BASE = "http://localhost:5000";



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

function clamp(n, a = 0, b = 100) {
  n = Number(n || 0);
  if (Number.isNaN(n)) n = 0;
  return Math.max(a, Math.min(b, n));
}

// Score local (để FE có chart ngay cả khi backend chưa trả scores)
function scorePair(a = {}, b = {}) {
  const normDiff = (x, y) => {
    const xi = Number(x);
    const yi = Number(y);
    if (Number.isNaN(xi) || Number.isNaN(yi)) return 50;
    const d = Math.abs(xi - yi);
    return clamp(100 - d * 12);
  };

  const lp = normDiff(a.life_path, b.life_path);
  const soul = normDiff(a.soul, b.soul);
  const dest = normDiff(a.destiny, b.destiny);
  const pers = normDiff(a.personality, b.personality);

  const emotional = Math.round(soul * 0.65 + pers * 0.35);
  const communication = Math.round(dest * 0.55 + pers * 0.45);
  const stability = Math.round(lp * 0.6 + dest * 0.4);
  const chemistry = Math.round(soul * 0.45 + lp * 0.35 + pers * 0.2);
  const overall = Math.round((emotional + communication + stability + chemistry) / 4);

  // “Love + Life Path chồng chéo”
  const overlapLoveLifePath = Math.round(lp * 0.55 + soul * 0.45);

  return {
    overall,
    emotional,
    communication,
    stability,
    chemistry,
    overlapLoveLifePath,
  };
}

async function _downloadBlobAsFile(res, defaultFilename = "love_report.pdf") {
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  // Try to parse filename from header
  const cd = res.headers.get("content-disposition") || "";
  let filename = defaultFilename;
  const m = cd.match(/filename="?([^"]+)"?/i);
  if (m?.[1]) filename = m[1];

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// ✅ Export PDF Love - SINGLE: /api/love/export-pdf
async function downloadLovePdfSingle({ person_a, limit, use_esgoo, email }) {
  const res = await fetch(`${API_BASE}/api/love/export-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // payload mềm dẻo: backend bắt field nào thì dùng field đó
    body: JSON.stringify({
      person_a,
      limit,
      use_esgoo,
      email, // optional
      to_email: email, // optional
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Export PDF failed");
  }

  await _downloadBlobAsFile(res, "love_single_report.pdf");
}

// ✅ Export PDF Love - COUPLE: /api/love/pdf
async function downloadLovePdfCouple({ person_a, person_b, limit, use_esgoo, email }) {
  const res = await fetch(`${API_BASE}/api/love/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      person_a,
      person_b,
      limit,
      use_esgoo,
      email, // optional
      to_email: email, // optional
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Export PDF failed");
  }

  await _downloadBlobAsFile(res, "love_couple_report.pdf");
}

export default function LovePage() {
  const [tab, setTab] = useState("single"); // single | couple
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState(() => loadHistory());
  const [selectedId, setSelectedId] = useState("");
//   const data = await res.json();

// setResultText(data.text || "");
// setScoresA(data.scores_a || null);
// setScoresB(data.scores_b || null);
// setCompatScores(data.compatibility_scores || null);
  // ===== SINGLE =====
  const [singleForm, setSingleForm] = useState({ name: "", birth_date: "", email: "" }); // ✅ thêm email
  const [singleNumbers, setSingleNumbers] = useState({
    life_path: "",
    destiny: "",
    soul: "",
    personality: "",
  });
  const [singleResult, setSingleResult] = useState(null);

  // ===== COUPLE =====
  const [aForm, setAForm] = useState({ name: "", birth_date: "" });
  const [bForm, setBForm] = useState({ name: "", birth_date: "" });

  // ✅ email receiver cho couple (1 email nhận file)
  const [coupleEmail, setCoupleEmail] = useState("");

  const [aNumbers, setANumbers] = useState({
    life_path: "",
    destiny: "",
    soul: "",
    personality: "",
  });
  const [bNumbers, setBNumbers] = useState({
    life_path: "",
    destiny: "",
    soul: "",
    personality: "",
  });

  const [coupleResult, setCoupleResult] = useState(null);

  // ===== OPTIONS =====
  const [useEsgoo, setUseEsgoo] = useState(true);
  const [limit, setLimit] = useState(6);

  // persist history
  useEffect(() => saveHistory(history), [history]);

  // auto calc
  useEffect(() => {
    if (!singleForm.name || !singleForm.birth_date) return;
    setSingleNumbers(calcAllNumbers(singleForm));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleForm.name, singleForm.birth_date]);

  useEffect(() => {
    if (!aForm.name || !aForm.birth_date) return;
    setANumbers(calcAllNumbers(aForm));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aForm.name, aForm.birth_date]);

  useEffect(() => {
    if (!bForm.name || !bForm.birth_date) return;
    setBNumbers(calcAllNumbers(bForm));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bForm.name, bForm.birth_date]);

  const canSingle = Boolean(singleForm.name && singleForm.birth_date);
  const canCouple = Boolean(aForm.name && aForm.birth_date && bForm.name && bForm.birth_date);

  const onChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((p) => ({ ...p, [name]: value }));
  };

  const upsertHistory = (item) => {
    setHistory((prev) => {
      const others = prev.filter((x) => x.id !== item.id);
      return [item, ...others].slice(0, 30);
    });
    setSelectedId(item.id);
  };

  const resetAll = () => {
    setSingleForm({ name: "", birth_date: "", email: "" });
    setSingleResult(null);

    setAForm({ name: "", birth_date: "" });
    setBForm({ name: "", birth_date: "" });
    setCoupleEmail("");
    setCoupleResult(null);

    setSelectedId("");
  };

  // ===== Run Single =====
  const handleRunSingle = async () => {
    if (!canSingle) return alert("Nhập Họ tên + Ngày sinh trước nhé.");

    try {
      setLoading(true);
      setSingleResult(null);

      const data = await loveSummary({
        name: singleForm.name,
        birth_date: singleForm.birth_date,
        numbers: singleNumbers,
        limit,
        use_esgoo: useEsgoo,
      });

      setSingleResult(data);

      const id = `single__${singleForm.name}__${singleForm.birth_date}`.toLowerCase();
      upsertHistory({
        id,
        type: "single",
        name: singleForm.name,
        birth_date: singleForm.birth_date,
        email: singleForm.email || "",
        numbers: singleNumbers,
        result_text: data.text,
        knowledge_used: data.knowledge_used,
        esgoo_used: data.esgoo_used,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      alert(`❌ Lỗi: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== Run Couple =====
  const handleRunCouple = async () => {
    if (!canCouple) return alert("Nhập đủ thông tin 2 người (Họ tên + Ngày sinh).");

    try {
      setLoading(true);
      setCoupleResult(null);

      const data = await loveCompatibility({
        person_a: { name: aForm.name, birth_date: aForm.birth_date, numbers: aNumbers },
        person_b: { name: bForm.name, birth_date: bForm.birth_date, numbers: bNumbers },
        limit,
        use_esgoo: useEsgoo,
      });

      setCoupleResult(data);

      const id = `couple__${aForm.name}__${aForm.birth_date}__${bForm.name}__${bForm.birth_date}`.toLowerCase();
      upsertHistory({
        id,
        type: "couple",
        person_a: { ...aForm, numbers: aNumbers },
        person_b: { ...bForm, numbers: bNumbers },
        email: coupleEmail || "",
        result_text: data.text,
        knowledge_used: data.knowledge_used,
        esgoo_used: data.esgoo_used,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      alert(`❌ Lỗi: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== Export PDF Single =====
  const handleExportPdfSingle = async () => {
    if (!canSingle) return alert("Nhập đủ Họ tên + Ngày sinh trước nhé.");
    if (!singleForm.email) return alert("Nhập Email để nhận/ghi vào báo cáo PDF nhé.");

    try {
      setLoading(true);
      await downloadLovePdfSingle({
        person_a: {
          name: singleForm.name,
          birth_date: singleForm.birth_date,
          numbers: singleNumbers,
          email: singleForm.email,
        },
        limit,
        use_esgoo: useEsgoo,
        email: singleForm.email,
      });

      alert("📄 Export PDF (1 người) thành công!");
    } catch (e) {
      alert(`❌ Export PDF lỗi: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== Export PDF Couple =====
  const handleExportPdfCouple = async () => {
    if (!canCouple) return alert("Nhập đủ thông tin 2 người trước nhé.");
    if (!coupleEmail) return alert("Nhập Email để nhận/ghi vào báo cáo PDF nhé.");

    try {
      setLoading(true);
      await downloadLovePdfCouple({
        person_a: { name: aForm.name, birth_date: aForm.birth_date, numbers: aNumbers },
        person_b: { name: bForm.name, birth_date: bForm.birth_date, numbers: bNumbers },
        limit,
        use_esgoo: useEsgoo,
        email: coupleEmail,
      });

      alert("📄 Export PDF (2 người) thành công!");
    } catch (e) {
      alert(`❌ Export PDF lỗi: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== chart + overlap (couple) =====
  const coupleScores = useMemo(() => scorePair(aNumbers, bNumbers), [aNumbers, bNumbers]);

  const radarData = useMemo(
    () => [
      { key: "Cảm xúc", value: coupleScores.emotional },
      { key: "Giao tiếp", value: coupleScores.communication },
      { key: "Ổn định", value: coupleScores.stability },
      { key: "Thu hút", value: coupleScores.chemistry },
    ],
    [coupleScores]
  );

  const barData = useMemo(
    () => [
      { name: "Tổng quan", v: coupleScores.overall },
      { name: "Chồng chéo Love+LP", v: coupleScores.overlapLoveLifePath },
    ],
    [coupleScores]
  );

  // ===== history select =====
  const handleSelectHistory = (id) => {
    setSelectedId(id);
    const item = history.find((h) => h.id === id);
    if (!item) return;

    if (item.type === "single") {
      setTab("single");
      setSingleForm({ name: item.name, birth_date: item.birth_date, email: item.email || "" });
      setSingleResult({
        text: item.result_text,
        knowledge_used: item.knowledge_used,
        esgoo_used: item.esgoo_used,
      });
    } else {
      setTab("couple");
      setAForm({ name: item.person_a.name, birth_date: item.person_a.birth_date });
      setBForm({ name: item.person_b.name, birth_date: item.person_b.birth_date });
      setCoupleEmail(item.email || "");
      setCoupleResult({
        text: item.result_text,
        knowledge_used: item.knowledge_used,
        esgoo_used: item.esgoo_used,
      });
    }
  };

  return (
    <div style={{ maxWidth: 1050, margin: "30px auto", padding: "0 20px" }}>
      <h2 style={{ textAlign: "center", fontSize: 30, fontWeight: 900 }}>
        ❤️ Love <span style={{ color: "#7a00ff" }}>Numerology</span>
      </h2>

      {/* HISTORY */}
      <Card>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <select value={selectedId} onChange={(e) => handleSelectHistory(e.target.value)} style={input}>
            <option value="">📂 Chọn lịch sử tình yêu</option>
            {history.map((h) => (
              <option key={h.id} value={h.id}>
                {h.type === "single"
                  ? `❤️ ${h.name} — ${h.birth_date}`
                  : `💞 ${h.person_a.name} & ${h.person_b.name}`}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setHistory([]);
              setSelectedId("");
              localStorage.removeItem(LS_KEY);
            }}
            style={btnOutlineSmall}
          >
            🗑 Xóa lịch sử
          </button>

          <button onClick={resetAll} style={btnOutlineSmall}>
            🔄 Làm mới
          </button>
        </div>
      </Card>

      <p style={{ textAlign: "center", color: "#666", marginBottom: 18 }}>
        RAG sách + ESGOO + AI. Có biểu đồ, có “chồng chéo Love + Life Path”, có Export PDF.
      </p>

      {/* TABS */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setTab("single")} style={tab === "single" ? btnTabActive : btnTab}>
          ❤️ Tình yêu cá nhân
        </button>
        <button onClick={() => setTab("couple")} style={tab === "couple" ? btnTabActive : btnTab}>
          💞 Tương hợp 2 người
        </button>
      </div>

      {/* SETTINGS */}
      <Card>
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={useEsgoo} onChange={(e) => setUseEsgoo(e.target.checked)} />
              <span style={{ fontWeight: 900 }}>Dùng ESGOO</span>
              <Badge kind="esgoo" />
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontWeight: 900 }}>Limit sách:</span>
              <input
                type="number"
                min={1}
                max={12}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value || 6))}
                style={{ ...input, width: 90 }}
              />
              <Badge kind="book" />
            </div>
          </div>

          <div style={{ color: "#666", fontSize: 13 }}>
            Gợi ý: limit 6–10 “giàu evidence” hơn nhưng chậm hơn.
          </div>
        </div>
      </Card>

      {/* TAB CONTENT */}
      {tab === "single" ? (
        <>
          <Card>
            <h3 style={h3}>👤 Thông tin người xem</h3>
            <Grid>
              <Input label="Họ tên" name="name" value={singleForm.name} onChange={onChange(setSingleForm)} />
              <Input label="Ngày sinh" type="date" name="birth_date" value={singleForm.birth_date} onChange={onChange(setSingleForm)} />
              {/* <Input
                label="Email nhận PDF"
                type="email"
                name="email"
                value={singleForm.email}
                onChange={onChange(setSingleForm)}
                full
              /> */}
            </Grid>
          </Card>

          <Card>
            <h3 style={h3}>🔢 Chỉ số (tự động tính)</h3>
            <Grid>
              <NumberBox label="Life Path" value={singleNumbers.life_path} />
              <NumberBox label="Destiny" value={singleNumbers.destiny} />
              <NumberBox label="Soul" value={singleNumbers.soul} />
              <NumberBox label="Personality" value={singleNumbers.personality} />
            </Grid>
          </Card>

          <div style={{ display: "flex", justifyContent: "center", margin: "18px 0", gap: 12, flexWrap: "wrap" }}>
            <button onClick={handleRunSingle} disabled={!canSingle || loading} style={btnPrimary}>
              {loading ? "🤖 Đang phân tích..." : "🔮 Xem tình yêu của tôi"}
            </button>

            <button onClick={handleExportPdfSingle} disabled={!canSingle || loading} style={btnOutline}>
              📄 Export PDF Love
            </button>
          </div>

          <ResultCard
            title="✨ Kết quả tình yêu (1 người)"
            result={singleResult}
            emptyText="Chưa có kết quả. Nhấn nút để xem phân tích tình yêu."
          />
        </>
      ) : (
        <>
          <Card>
            <h3 style={h3}>👥 Thông tin 2 người</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Người A</div>
                <GridOne>
                  <Input label="Họ tên" name="name" value={aForm.name} onChange={onChange(setAForm)} />
                  <Input label="Ngày sinh" type="date" name="birth_date" value={aForm.birth_date} onChange={onChange(setAForm)} />
                </GridOne>

                <div style={{ marginTop: 12 }}>
                  <MiniGrid>
                    <MiniBox label="LP" value={aNumbers.life_path} />
                    <MiniBox label="Dest" value={aNumbers.destiny} />
                    <MiniBox label="Soul" value={aNumbers.soul} />
                    <MiniBox label="Pers" value={aNumbers.personality} />
                  </MiniGrid>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Người B</div>
                <GridOne>
                  <Input label="Họ tên" name="name" value={bForm.name} onChange={onChange(setBForm)} />
                  <Input label="Ngày sinh" type="date" name="birth_date" value={bForm.birth_date} onChange={onChange(setBForm)} />
                </GridOne>

                <div style={{ marginTop: 12 }}>
                  <MiniGrid>
                    <MiniBox label="LP" value={bNumbers.life_path} />
                    <MiniBox label="Dest" value={bNumbers.destiny} />
                    <MiniBox label="Soul" value={bNumbers.soul} />
                    <MiniBox label="Pers" value={bNumbers.personality} />
                  </MiniGrid>
                </div>
              </div>
            </div>

            {/* ✅ Email receiver for couple */}
            {/* <div style={{ marginTop: 18 }}>
              <Input
                label="Email nhận PDF"
                type="email"
                name="coupleEmail"
                value={coupleEmail}
                onChange={(e) => setCoupleEmail(e.target.value)}
                full
              />
            </div> */}
          </Card>

          {/* Charts + overlap */}
          <Card>
            <h3 style={h3}>📊 Biểu đồ tương hợp + chồng chéo Love & Life Path</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16 }}>
              <div style={{ height: 320, borderRadius: 16, border: "1px solid rgba(0,0,0,.06)", padding: 10 }}>
                <div style={{ fontWeight: 900, margin: "6px 8px 12px" }}>Radar (4 trục)</div>
                <ResponsiveContainer width="100%" height="90%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="key" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar dataKey="value" stroke="#7a00ff" fill="#7a00ff" fillOpacity={0.25} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ height: 320, borderRadius: 16, border: "1px solid rgba(0,0,0,.06)", padding: 10 }}>
                <div style={{ fontWeight: 900, margin: "6px 8px 12px" }}>Bar (tổng quan + chồng chéo)</div>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="v" fill="#7a00ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ marginTop: 10, color: "#444", lineHeight: 1.7 }}>
              <b>Chồng chéo Love + Life Path</b> là điểm “giao nhau” giữa xu hướng yêu (Soul) và định hướng sống (Life Path).
              Điểm cao → dễ đồng pha cách yêu + nhịp sống. Điểm thấp → cần thỏa thuận/nhường nhịn rõ hơn.
            </div>

            {/* ✅ hiển thị score cụ thể để “giải thích vì sao hợp/không hợp” rõ hơn */}
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span style={metaPill}>Overall: <b>{coupleScores.overall}</b></span>
              <span style={metaPill}>Cảm xúc: <b>{coupleScores.emotional}</b></span>
              <span style={metaPill}>Giao tiếp: <b>{coupleScores.communication}</b></span>
              <span style={metaPill}>Ổn định: <b>{coupleScores.stability}</b></span>
              <span style={metaPill}>Thu hút: <b>{coupleScores.chemistry}</b></span>
              <span style={metaPill}>Chồng chéo: <b>{coupleScores.overlapLoveLifePath}</b></span>
            </div>
          </Card>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, margin: "18px 0", flexWrap: "wrap" }}>
            <button onClick={handleRunCouple} disabled={!canCouple || loading} style={btnPrimary}>
              {loading ? "🤖 Đang phân tích..." : "💞 Xem độ tương hợp"}
            </button>

            <button onClick={handleExportPdfCouple} disabled={!canCouple || loading} style={btnOutline}>
              📄 Export PDF Love
            </button>
          </div>

          <ResultCard
            title="🧠 AI giải thích vì sao hợp / không hợp (2 người)"
            result={coupleResult}
            emptyText="Chưa có kết quả. Nhấn nút để xem phân tích tương hợp."
          />
        </>
      )}
    </div>
  );
}

/* ================= UI BLOCKS ================= */

function ResultCard({ title, result, emptyText }) {
  const text = result?.text || "";
  const knowledgeUsed = result?.knowledge_used ?? 0;
  const esgooUsed = result?.esgoo_used ?? false;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h3 style={{ ...h3, marginBottom: 0 }}>{title}</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#666", fontSize: 13 }}>Nguồn:</span>
          <span style={metaPill}>📘 Book: <b>{knowledgeUsed}</b></span>
          <span style={metaPill}>🔮 ESGOO: <b>{esgooUsed ? "ON" : "OFF"}</b></span>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {text ? (
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.9, fontSize: 15 }}>
            {text}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#999", padding: 28 }}>
            {emptyText}
          </div>
        )}
      </div>
    </Card>
  );
}

function Badge({ kind }) {
  const style = {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    border: "1px solid rgba(122,0,255,.18)",
    background: "#faf7ff",
    color: "#7a00ff",
    lineHeight: 1,
  };
  if (kind === "book") return <span style={style}>📘 BOOK</span>;
  if (kind === "esgoo") return <span style={style}>🔮 ESGOO</span>;
  return null;
}

/* ================= UI COMPONENTS ================= */

const Card = ({ children }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 18,
      padding: 25,
      marginBottom: 22,
      boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
    }}
  >
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
    {children}
  </div>
);

const GridOne = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
    {children}
  </div>
);

const Input = ({ label, full, ...props }) => (
  <div style={{ gridColumn: full ? "1 / span 2" : "auto" }}>
    <div style={{ marginBottom: 6, fontWeight: 800 }}>{label}</div>
    <input {...props} style={input} />
  </div>
);

const NumberBox = ({ label, value }) => (
  <div
    style={{
      padding: 18,
      borderRadius: 16,
      textAlign: "center",
      background: "#faf7ff",
      border: "1px solid rgba(122,0,255,.15)",
    }}
  >
    <div style={{ color: "#666", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 30, fontWeight: 900, color: "#7a00ff" }}>
      {value || "—"}
    </div>
  </div>
);

const MiniGrid = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
    {children}
  </div>
);

const MiniBox = ({ label, value }) => (
  <div
    style={{
      padding: "10px 12px",
      borderRadius: 14,
      textAlign: "center",
      background: "#fff",
      border: "1px solid rgba(0,0,0,.08)",
    }}
  >
    <div style={{ fontSize: 12, color: "#777", marginBottom: 4, fontWeight: 900 }}>
      {label}
    </div>
    <div style={{ fontSize: 16, fontWeight: 900, color: "#222" }}>
      {value || "—"}
    </div>
  </div>
);

/* ================= STYLES ================= */

const h3 = { marginBottom: 14, fontSize: 18, fontWeight: 900 };

const input = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  outline: "none",
};

const btnPrimary = {
  padding: "14px 28px",
  borderRadius: 50,
  border: "none",
  background: "linear-gradient(to right,#7a00ff,#ff4fd8)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const btnOutlineSmall = {
  padding: "10px 16px",
  borderRadius: 999,
  border: "2px solid #7a00ff",
  background: "#fff",
  color: "#7a00ff",
  fontWeight: 900,
  cursor: "pointer",
};

const btnOutline = {
  padding: "14px 22px",
  borderRadius: 50,
  border: "2px solid #7a00ff",
  background: "#fff",
  color: "#7a00ff",
  fontWeight: 900,
  cursor: "pointer",
};

const btnTab = {
  padding: "10px 16px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,.1)",
  background: "#fff",
  color: "#222",
  fontWeight: 900,
  cursor: "pointer",
};

const btnTabActive = {
  ...btnTab,
  border: "1px solid rgba(122,0,255,.35)",
  background: "#faf7ff",
  color: "#7a00ff",
};

const metaPill = {
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  border: "1px solid rgba(0,0,0,.08)",
  background: "#fff",
  color: "#333",
};
