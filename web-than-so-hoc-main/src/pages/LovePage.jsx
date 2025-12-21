// src/pages/LovePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { calcAllNumbers } from "../utils/numerology";
import { loveSummary, loveCompatibility } from "../components/api/loveApi";

export default function LovePage() {
  const [tab, setTab] = useState("single"); // "single" | "couple"
  const [loading, setLoading] = useState(false);

  // ===== SINGLE =====
  const [singleForm, setSingleForm] = useState({ name: "", birth_date: "" });
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

  // ===== auto calc numbers =====
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

  // ===== handlers =====
  const onChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((p) => ({ ...p, [name]: value }));
  };

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
    } catch (e) {
      alert(`❌ Lỗi: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (e) {
      alert(`❌ Lỗi: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setSingleForm({ name: "", birth_date: "" });
    setSingleNumbers({ life_path: "", destiny: "", soul: "", personality: "" });
    setSingleResult(null);

    setAForm({ name: "", birth_date: "" });
    setBForm({ name: "", birth_date: "" });
    setANumbers({ life_path: "", destiny: "", soul: "", personality: "" });
    setBNumbers({ life_path: "", destiny: "", soul: "", personality: "" });
    setCoupleResult(null);
  };

  return (
    <div style={{ maxWidth: 1050, margin: "30px auto", padding: "0 20px" }}>
      <h2 style={{ textAlign: "center", fontSize: 30, fontWeight: 800 }}>
        ❤️ Love <span style={{ color: "#7a00ff" }}>Numerology</span>
      </h2>
      <p style={{ textAlign: "center", color: "#666", marginBottom: 22 }}>
        Xem tình yêu cá nhân hoặc tương hợp 2 người (RAG sách + ESGOO + AI).
      </p>

      {/* TOP BAR */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <button
          onClick={() => setTab("single")}
          style={tab === "single" ? btnTabActive : btnTab}
        >
          ❤️ Tình yêu cá nhân
        </button>
        <button
          onClick={() => setTab("couple")}
          style={tab === "couple" ? btnTabActive : btnTab}
        >
          💞 Tương hợp 2 người
        </button>

        <button onClick={resetAll} style={btnOutlineSmall}>
          🔄 Làm mới
        </button>
      </div>

      {/* SETTINGS */}
      <Card>
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={useEsgoo}
                onChange={(e) => setUseEsgoo(e.target.checked)}
              />
              <span style={{ fontWeight: 700 }}>Dùng ESGOO</span>
              <Badge kind="esgoo" />
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontWeight: 700 }}>Limit sách:</span>
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
            Gợi ý: limit 6–10 sẽ “giàu dữ liệu” hơn nhưng chậm hơn chút.
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
              <Input
                label="Ngày sinh"
                type="date"
                name="birth_date"
                value={singleForm.birth_date}
                onChange={onChange(setSingleForm)}
              />
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

          <div style={{ display: "flex", justifyContent: "center", margin: "22px 0" }}>
            <button
              onClick={handleRunSingle}
              disabled={!canSingle || loading}
              style={btnPrimary}
            >
              {loading ? "🤖 Đang phân tích..." : "🔮 Xem tình yêu của tôi"}
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
                <div style={{ fontWeight: 800, marginBottom: 10 }}>Người A</div>
                <GridOne>
                  <Input label="Họ tên" name="name" value={aForm.name} onChange={onChange(setAForm)} />
                  <Input
                    label="Ngày sinh"
                    type="date"
                    name="birth_date"
                    value={aForm.birth_date}
                    onChange={onChange(setAForm)}
                  />
                </GridOne>

                <div style={{ marginTop: 14 }}>
                  <MiniGrid>
                    <MiniBox label="LP" value={aNumbers.life_path} />
                    <MiniBox label="Dest" value={aNumbers.destiny} />
                    <MiniBox label="Soul" value={aNumbers.soul} />
                    <MiniBox label="Pers" value={aNumbers.personality} />
                  </MiniGrid>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>Người B</div>
                <GridOne>
                  <Input label="Họ tên" name="name" value={bForm.name} onChange={onChange(setBForm)} />
                  <Input
                    label="Ngày sinh"
                    type="date"
                    name="birth_date"
                    value={bForm.birth_date}
                    onChange={onChange(setBForm)}
                  />
                </GridOne>

                <div style={{ marginTop: 14 }}>
                  <MiniGrid>
                    <MiniBox label="LP" value={bNumbers.life_path} />
                    <MiniBox label="Dest" value={bNumbers.destiny} />
                    <MiniBox label="Soul" value={bNumbers.soul} />
                    <MiniBox label="Pers" value={bNumbers.personality} />
                  </MiniGrid>
                </div>
              </div>
            </div>
          </Card>

          <div style={{ display: "flex", justifyContent: "center", margin: "22px 0" }}>
            <button
              onClick={handleRunCouple}
              disabled={!canCouple || loading}
              style={btnPrimary}
            >
              {loading ? "🤖 Đang phân tích..." : "💞 Xem độ tương hợp"}
            </button>
          </div>

          <ResultCard
            title="✨ Kết quả tương hợp (2 người)"
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
          <span style={metaPill}>
            📘 Book: <b>{knowledgeUsed}</b>
          </span>
          <span style={metaPill}>
            🔮 ESGOO: <b>{esgooUsed ? "ON" : "OFF"}</b>
          </span>
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
    fontWeight: 800,
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
    <div style={{ marginBottom: 6, fontWeight: 700 }}>{label}</div>
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
    <div style={{ fontSize: 12, color: "#777", marginBottom: 4, fontWeight: 800 }}>
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
  fontWeight: 800,
  cursor: "pointer",
};

const btnTab = {
  padding: "10px 16px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,.1)",
  background: "#fff",
  color: "#222",
  fontWeight: 800,
  cursor: "pointer",
};

const btnTabActive = {
  ...btnTab,
  border: "1px solid rgba(122,0,255,.35)",
  background: "#faf7ff",
  color: "#7a00ff",
};

const btnOutlineSmall = {
  padding: "10px 16px",
  borderRadius: 999,
  border: "2px solid #7a00ff",
  background: "#fff",
  color: "#7a00ff",
  fontWeight: 800,
  cursor: "pointer",
};

const metaPill = {
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  border: "1px solid rgba(0,0,0,.08)",
  background: "#fff",
  color: "#333",
};
