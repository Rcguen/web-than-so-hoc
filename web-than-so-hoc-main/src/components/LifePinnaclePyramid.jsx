import React, { useEffect, useMemo, useState } from "react";

/* =======================
   LOGIC TÍNH TOÁN (GIỮ NGUYÊN)
======================= */

function reduceKeepMasters(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n)
      .split("")
      .reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

function toInt(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function calcLifePath(birth) {
  const digits = (birth || "").replace(/\D/g, "");
  const sum = digits.split("").reduce((s, d) => s + Number(d), 0);
  return reduceKeepMasters(sum);
}

function computePyramid(birthDate) {
  const [yStr, mStr, dStr] = (birthDate || "").split("-");
  const y = toInt(yStr);
  const m = toInt(mStr);
  const d = toInt(dStr);

  const redM = reduceKeepMasters(m);
  const redD = reduceKeepMasters(d);
  const redY = reduceKeepMasters(
    String(y).split("").reduce((s, t) => s + Number(t), 0)
  );

  const P1 = reduceKeepMasters(redM + redD);
  const P2 = reduceKeepMasters(redD + redY);
  const P3 = reduceKeepMasters(P1 + P2);
  const P4 = reduceKeepMasters(redM + redY);

  const C1 = reduceKeepMasters(Math.abs(redM - redD));
  const C2 = reduceKeepMasters(Math.abs(redD - redY));
  const C3 = reduceKeepMasters(Math.abs(C1 - C2));
  const C4 = reduceKeepMasters(Math.abs(redM - redY));

  const lifePath = calcLifePath(birthDate);
  const baseAge = 36 - lifePath;

  const age1 = baseAge;
  const age2 = baseAge + 9;
  const age3 = baseAge + 18;
  const age4 = baseAge + 27;

  return {
    base: { redM, redD, redY },
    pinnacles: [
      { key: "P1", label: "Đỉnh 1", value: P1, age: age1, year: y + age1, challenge: C1 },
      { key: "P2", label: "Đỉnh 2", value: P2, age: age2, year: y + age2, challenge: C2 },
      { key: "P3", label: "Đỉnh 3", value: P3, age: age3, year: y + age3, challenge: C3 },
      { key: "P4", label: "Đỉnh 4", value: P4, age: age4, year: y + age4, challenge: C4 },
    ],
    challenges: [
      { key: "C1", label: "Thử thách 1", value: C1 },
      { key: "C2", label: "Thử thách 2", value: C2 },
      { key: "C3", label: "Thử thách 3", value: C3 },
      { key: "C4", label: "Thử thách 4", value: C4 },
    ],
  };
}

/* =======================
   GIẢI NGHĨA (MẪU) – DỄ THAY ĐỔI SAU
======================= */

const MEANINGS = {
  1: {
    title: "Số 1 – Khởi đầu & Lãnh đạo",
    desc:
      "Từ khóa: độc lập, tiên phong, tự chủ.\n\n" +
      "Gợi ý: Đây là giai đoạn/đề tài đòi hỏi bạn chủ động nắm quyền, quyết đoán và dám đi con đường mới. " +
      "Tránh: cái tôi quá mạnh, cô lập, nóng vội."
  },
  2: {
    title: "Số 2 – Hợp tác & Cân bằng",
    desc:
      "Từ khóa: tinh tế, ngoại giao, thấu cảm.\n\n" +
      "Gợi ý: Thành công đến từ làm việc nhóm, kết nối và lắng nghe. " +
      "Tránh: do dự, sợ mất lòng, phụ thuộc cảm xúc."
  },
  3: {
    title: "Số 3 – Sáng tạo & Biểu đạt",
    desc:
      "Từ khóa: giao tiếp, nghệ thuật, cảm hứng.\n\n" +
      "Gợi ý: Tập trung vào học – nói – viết – sáng tạo. " +
      "Tránh: lan man, thiếu kỷ luật, cảm xúc thất thường."
  },
  4: {
    title: "Số 4 – Kỷ luật & Xây nền",
    desc:
      "Từ khóa: hệ thống, bền bỉ, thực tế.\n\n" +
      "Gợi ý: Đây là “đỉnh” của xây nền tảng, cấu trúc, quy trình. " +
      "Tránh: cứng nhắc, bảo thủ, quá nguyên tắc."
  },
  5: {
    title: "Số 5 – Tự do & Trải nghiệm",
    desc:
      "Từ khóa: thay đổi, phiêu lưu, linh hoạt.\n\n" +
      "Gợi ý: Thời kỳ mở rộng trải nghiệm, đổi môi trường, học điều mới. " +
      "Tránh: bốc đồng, thiếu cam kết, sa đà cảm xúc."
  },
  6: {
    title: "Số 6 – Trách nhiệm & Gia đình",
    desc:
      "Từ khóa: chăm sóc, tình yêu, cộng đồng.\n\n" +
      "Gợi ý: Đề cao trách nhiệm, chữa lành, chăm sóc người khác. " +
      "Tránh: ôm đồm, kiểm soát, hy sinh quá mức."
  },
  7: {
    title: "Số 7 – Nội tâm & Tri thức",
    desc:
      "Từ khóa: nghiên cứu, chiêm nghiệm, tâm linh.\n\n" +
      "Gợi ý: Thời kỳ học sâu, đào sâu nội tâm, nâng cấp hiểu biết. " +
      "Tránh: tự tách biệt, nghi ngờ quá mức, bi quan."
  },
  8: {
    title: "Số 8 – Thành tựu & Tài chính",
    desc:
      "Từ khóa: quyền lực, quản trị, vật chất.\n\n" +
      "Gợi ý: Tập trung mục tiêu, quản lý tài chính/công việc, tạo thành quả. " +
      "Tránh: tham vọng quá đà, áp lực, đặt nặng vật chất."
  },
  9: {
    title: "Số 9 – Hoàn thiện & Cho đi",
    desc:
      "Từ khóa: nhân văn, kết thúc chu kỳ, chữa lành.\n\n" +
      "Gợi ý: Phù hợp tổng kết – chuyển hóa – phụng sự cộng đồng. " +
      "Tránh: cảm xúc quá tải, lưu luyến quá khứ, hy sinh mù quáng."
  },
  11: {
    title: "Số 11 – Trực giác & Truyền cảm hứng (Master)",
    desc:
      "Từ khóa: trực giác mạnh, ánh sáng, khai mở.\n\n" +
      "Gợi ý: Khi số 11 xuất hiện, bạn được kêu gọi sống đúng giá trị, dẫn dắt bằng cảm hứng. " +
      "Tránh: căng thẳng thần kinh, dễ quá tải cảm xúc."
  },
  22: {
    title: "Số 22 – Kiến tạo lớn (Master Builder)",
    desc:
      "Từ khóa: xây dựng, hiện thực hóa tầm nhìn.\n\n" +
      "Gợi ý: Đây là năng lượng “xây công trình”, biến ý tưởng thành hệ thống thật. " +
      "Tránh: áp lực quá nặng, tự ép bản thân hoàn hảo."
  },
  33: {
    title: "Số 33 – Tình yêu vô điều kiện (Master Teacher)",
    desc:
      "Từ khóa: chữa lành, phụng sự, yêu thương.\n\n" +
      "Gợi ý: Số 33 thường gắn với sứ mệnh giúp người khác bằng lòng trắc ẩn. " +
      "Tránh: hy sinh quá mức, quên nhu cầu bản thân."
  },
};

function meaningOf(n) {
  const num = Number(n);
  return (
    MEANINGS[num] || {
      title: `Số ${n}`,
      desc: "Chưa có mô tả cho con số này. Bạn có thể bổ sung nội dung trong MEANINGS."
    }
  );
}

/* =======================
   DOT COMPONENT (CLICKABLE)
======================= */

function Dot({
  x,
  y,
  r,
  color,
  text,
  onClick,
  hint,
  ring = false,
  textColor,
}) {
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {ring ? (
        <>
          <circle cx={x} cy={y} r={r + 6} fill="rgba(122,0,255,0.12)" />
          <circle cx={x} cy={y} r={r + 2} fill="#fff" opacity={0.9} />
        </>
      ) : null}

      <circle cx={x} cy={y} r={r} fill={color} opacity={0.96}>
        <title>{hint || `Giá trị: ${text}`}</title>
      </circle>

      <text
        x={x}
        y={y + 6}
        textAnchor="middle"
        fontSize={r >= 40 ? 22 : 14}
        fontWeight={900}
        fill={textColor || (color === "#ffb400" ? "#333" : "#fff")}
      >
        {text}
      </text>
    </g>
  );
}

/* =======================
   POPUP
======================= */

function Popup({ open, onClose, title, content, meta }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={ui.overlay} onClick={onClose}>
      <div style={ui.modal} onClick={(e) => e.stopPropagation()}>
        <div style={ui.modalHeader}>
          <div>
            <div style={ui.modalTitle}>{title}</div>
            {meta ? <div style={ui.modalMeta}>{meta}</div> : null}
          </div>
          <button style={ui.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div style={ui.modalBody}>
          <p style={ui.modalText}>{content}</p>
        </div>

        <div style={ui.modalFooter}>
          <button style={ui.okBtn} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/* =======================
   MAIN
======================= */

export default function LifePinnaclePyramid({ birthDate }) {
  const data = useMemo(() => computePyramid(birthDate), [birthDate]);
  const { base, pinnacles, challenges } = data;

  const [popup, setPopup] = useState(null);

  const W = 720;
  const H = 460;

  // positions
  const p1 = { x: W / 2 - 190, y: 290 };
  const p2 = { x: W / 2 + 190, y: 290 };
  const p3 = { x: W / 2, y: 120 };
  const p4 = { x: W / 2, y: 55 };

  const c1 = { x: p1.x, y: p1.y + 70 };
  const c2 = { x: p2.x, y: p2.y + 70 };
  const c3 = { x: (p1.x + p3.x) / 2, y: (p1.y + p3.y) / 2 };
  const c4 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };

  const bM = { x: W / 2 - 90, y: 390 };
  const bD = { x: W / 2, y: 390 };
  const bY = { x: W / 2 + 90, y: 390 };

  const openMeaning = (type, label, value, extraMeta) => {
    const m = meaningOf(value);
    setPopup({
      title: `${label} • Số ${value}`,
      content: m.desc,
      meta: extraMeta || m.title,
      type,
      value,
    });
  };

  return (
    <div style={ui.wrapper}>
      <div style={ui.card}>
        <div style={ui.header}>
          <h2 style={ui.title}>🏔 Kim Tự Tháp 4 Đỉnh Cao Cuộc Đời</h2>
          {birthDate ? (
            <p style={ui.sub}>
              Ngày sinh: {new Date(birthDate).toLocaleDateString("vi-VN")} • Life Path:{" "}
              <b>{calcLifePath(birthDate)}</b>
            </p>
          ) : (
            <p style={ui.sub}>Chưa có ngày sinh.</p>
          )}
        </div>

        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 920 }}>
            {/* Lines */}
            <defs>
              <linearGradient id="lineGrad" x1="0" x2="1">
                <stop offset="0%" stopColor="#7a00ff" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#aa00ff" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            <g stroke="url(#lineGrad)" strokeWidth="3" fill="none" opacity="0.9">
              <polyline points={`${p1.x},${p1.y} ${p3.x},${p3.y} ${p2.x},${p2.y}`} />
              <polyline points={`${p1.x},${p1.y} ${p4.x},${p4.y} ${p2.x},${p2.y}`} />
              <polyline points={`${p1.x},${p1.y} ${p2.x},${p2.y}`} opacity="0.4" />
            </g>

            {/* YEAR & AGE labels */}
            <g fontFamily="system-ui, Arial">
              {/* P1 */}
              <text x={p1.x} y={p1.y + 62} textAnchor="middle" fill="#c44" fontSize="13" fontWeight="700">
                {pinnacles[0].year}
              </text>
              <text x={p1.x} y={p1.y + 80} textAnchor="middle" fill="#2b7" fontSize="11" fontWeight="700">
                {pinnacles[0].age} tuổi
              </text>
              {/* P2 */}
              <text x={p2.x} y={p2.y + 62} textAnchor="middle" fill="#c44" fontSize="13" fontWeight="700">
                {pinnacles[1].year}
              </text>
              <text x={p2.x} y={p2.y + 80} textAnchor="middle" fill="#2b7" fontSize="11" fontWeight="700">
                {pinnacles[1].age} tuổi
              </text>
              {/* P3 */}
              <text x={p3.x} y={p3.y - 56} textAnchor="middle" fill="#c44" fontSize="13" fontWeight="700">
                {pinnacles[2].year}
              </text>
              <text x={p3.x} y={p3.y + 70} textAnchor="middle" fill="#2b7" fontSize="11" fontWeight="700">
                {pinnacles[2].age} tuổi
              </text>
              {/* P4 */}
              <text x={p4.x} y={p4.y - 24} textAnchor="middle" fill="#c44" fontSize="13" fontWeight="700">
                {pinnacles[3].year}
              </text>
              <text x={p4.x} y={p4.y + 56} textAnchor="middle" fill="#2b7" fontSize="11" fontWeight="700">
                {pinnacles[3].age} tuổi
              </text>
            </g>

            {/* Pinnacle dots (click) */}
            <Dot
              x={p1.x}
              y={p1.y}
              r={46}
              text={pinnacles[0].value}
              color="#5b03e4"
              hint="Click để xem ý nghĩa Đỉnh 1"
              onClick={() =>
                openMeaning(
                  "pinnacle",
                  `${pinnacles[0].label}`,
                  pinnacles[0].value,
                  `Giai đoạn đạt đỉnh khoảng ${pinnacles[0].age} tuổi • Năm ${pinnacles[0].year}`
                )
              }
            />
            <Dot
              x={p2.x}
              y={p2.y}
              r={46}
              text={pinnacles[1].value}
              color="#5b03e4"
              hint="Click để xem ý nghĩa Đỉnh 2"
              onClick={() =>
                openMeaning(
                  "pinnacle",
                  `${pinnacles[1].label}`,
                  pinnacles[1].value,
                  `Giai đoạn đạt đỉnh khoảng ${pinnacles[1].age} tuổi • Năm ${pinnacles[1].year}`
                )
              }
            />
            <Dot
              x={p3.x}
              y={p3.y}
              r={46}
              text={pinnacles[2].value}
              color="#5b03e4"
              hint="Click để xem ý nghĩa Đỉnh 3"
              onClick={() =>
                openMeaning(
                  "pinnacle",
                  `${pinnacles[2].label}`,
                  pinnacles[2].value,
                  `Giai đoạn đạt đỉnh khoảng ${pinnacles[2].age} tuổi • Năm ${pinnacles[2].year}`
                )
              }
            />
            <Dot
              x={p4.x}
              y={p4.y}
              r={20}
              ring
              text={pinnacles[3].value}
              color="#d82d8b"
              hint="Click để xem ý nghĩa Đỉnh 4"
              onClick={() =>
                openMeaning(
                  "pinnacle",
                  `${pinnacles[3].label}`,
                  pinnacles[3].value,
                  `Giai đoạn đạt đỉnh khoảng ${pinnacles[3].age} tuổi • Năm ${pinnacles[3].year}`
                )
              }
            />

            {/* Challenge dots (click) */}
            <Dot
              x={c1.x}
              y={c1.y}
              r={18}
              text={challenges[0].value}
              color="#ffb400"
              hint="Click để xem ý nghĩa Thử thách 1"
              onClick={() => openMeaning("challenge", challenges[0].label, challenges[0].value)}
            />
            <Dot
              x={c2.x}
              y={c2.y}
              r={18}
              text={challenges[1].value}
              color="#ffb400"
              hint="Click để xem ý nghĩa Thử thách 2"
              onClick={() => openMeaning("challenge", challenges[1].label, challenges[1].value)}
            />
            <Dot
              x={c3.x}
              y={c3.y}
              r={18}
              text={challenges[2].value}
              color="#ffb400"
              hint="Click để xem ý nghĩa Thử thách 3"
              onClick={() => openMeaning("challenge", challenges[2].label, challenges[2].value)}
            />
            <Dot
              x={c4.x}
              y={c4.y}
              r={18}
              text={challenges[3].value}
              color="#ffb400"
              hint="Click để xem ý nghĩa Thử thách 4"
              onClick={() => openMeaning("challenge", challenges[3].label, challenges[3].value)}
            />

            {/* Base numbers (click) */}
            <g fontFamily="system-ui, Arial">
              <circle
                cx={bM.x}
                cy={bM.y}
                r={16}
                fill="#fff"
                stroke="#bbb"
                style={{ cursor: "pointer" }}
                onClick={() => openMeaning("base", "Chân đế • Tháng (rút gọn)", base.redM)}
              >
                <title>Click để xem ý nghĩa số chân đế (Tháng)</title>
              </circle>
              <text x={bM.x} y={bM.y + 5} textAnchor="middle" fontSize="12" fontWeight={800} fill="#333">
                {base.redM}
              </text>

              <circle
                cx={bD.x}
                cy={bD.y}
                r={16}
                fill="#fff"
                stroke="#bbb"
                style={{ cursor: "pointer" }}
                onClick={() => openMeaning("base", "Chân đế • Ngày (rút gọn)", base.redD)}
              >
                <title>Click để xem ý nghĩa số chân đế (Ngày)</title>
              </circle>
              <text x={bD.x} y={bD.y + 5} textAnchor="middle" fontSize="12" fontWeight={800} fill="#333">
                {base.redD}
              </text>

              <circle
                cx={bY.x}
                cy={bY.y}
                r={16}
                fill="#fff"
                stroke="#bbb"
                style={{ cursor: "pointer" }}
                onClick={() => openMeaning("base", "Chân đế • Năm (rút gọn)", base.redY)}
              >
                <title>Click để xem ý nghĩa số chân đế (Năm)</title>
              </circle>
              <text x={bY.x} y={bY.y + 5} textAnchor="middle" fontSize="12" fontWeight={800} fill="#333">
                {base.redY}
              </text>

              <text x={W / 2} y={H - 22} textAnchor="middle" fontSize="13" fill="#555" fontWeight="700">
                Gợi ý: Bấm vào các nút để xem giải nghĩa
              </text>
            </g>
          </svg>
        </div>

        <div style={ui.legend}>
          <span style={ui.legendItem}>
            <i style={{ ...ui.dot, background: "#5b03e4" }} /> Đỉnh cao
          </span>
          <span style={ui.legendItem}>
            <i style={{ ...ui.dot, background: "#ffb400" }} /> Thử thách
          </span>
          <span style={ui.legendItem}>
            <i style={{ ...ui.dot, background: "#cfcfcf" }} /> Chân đế
          </span>
        </div>
      </div>

      <Popup
        open={!!popup}
        onClose={() => setPopup(null)}
        title={popup?.title}
        meta={popup?.meta}
        content={popup?.content}
      />
    </div>
  );
}

/* =======================
   INLINE CSS (TỰ CHỨA)
======================= */

const ui = {
  wrapper: {
    marginTop: 50,
    display: "flex",
    justifyContent: "center",
  },
  card: {
    background: "#fff",
    borderRadius: 28,
    padding: "28px 26px 22px",
    maxWidth: 1020,
    width: "100%",
    boxShadow: "0 18px 50px rgba(0,0,0,0.12)",
    border: "1px solid rgba(0,0,0,0.04)",
  },
  header: { textAlign: "center", marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 900, color: "#4b0082", margin: 0 },
  sub: { marginTop: 8, color: "#666", fontSize: 14, marginBottom: 0 },
  legend: {
    display: "flex",
    justifyContent: "center",
    gap: 22,
    marginTop: 18,
    fontSize: 14,
    color: "#444",
    flexWrap: "wrap",
  },
  legendItem: { display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    display: "inline-block",
  },

  /* popup */
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    zIndex: 9999,
  },
  modal: {
    width: "100%",
    maxWidth: 640,
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "16px 18px",
    borderBottom: "1px solid #eee",
    background: "linear-gradient(to right, #7a00ff, #aa00ff)",
    color: "#fff",
  },
  modalTitle: { fontSize: 18, fontWeight: 900, lineHeight: 1.2 },
  modalMeta: { opacity: 0.95, fontSize: 12, marginTop: 4 },
  closeBtn: {
    border: "none",
    background: "rgba(255,255,255,0.18)",
    color: "#fff",
    width: 34,
    height: 34,
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
  },
  modalBody: { padding: 18 },
  modalText: {
    margin: 0,
    color: "#444",
    lineHeight: 1.8,
    whiteSpace: "pre-line",
    fontSize: 15,
  },
  modalFooter: {
    padding: 16,
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "flex-end",
    background: "#fafafa",
  },
  okBtn: {
    border: "none",
    borderRadius: 999,
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: 800,
    color: "#fff",
    background: "linear-gradient(to right, #7a00ff, #aa00ff)",
    boxShadow: "0 8px 20px rgba(122,0,255,0.3)",
  },
};
