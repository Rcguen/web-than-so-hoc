import React, { useMemo } from "react";

/** Giữ 11/22/33, còn lại rút đến 1 chữ số */
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

/** Tính Life Path từ yyyy-mm-dd */
function calcLifePath(birth) {
  const digits = (birth || "").replace(/\D/g, "");
  const sum = digits.split("").reduce((s, d) => s + Number(d), 0);
  return reduceKeepMasters(sum);
}

/** Trả về các đỉnh/ thử thách/ tuổi & năm, 3 số chân đế */
function computePyramid(birthDate) {
  // yyyy-mm-dd
  const [yStr, mStr, dStr] = (birthDate || "").split("-");
  const y = toInt(yStr);
  const m = toInt(mStr);
  const d = toInt(dStr);

  // rút gọn M/D/Y
  const redM = reduceKeepMasters(m);
  const redD = reduceKeepMasters(d);
  const redY = reduceKeepMasters(
    String(y).split("").reduce((s, t) => s + Number(t), 0)
  );

  // pinnacles
  const P1 = reduceKeepMasters(redM + redD);
  const P2 = reduceKeepMasters(redD + redY);
  const P3 = reduceKeepMasters(P1 + P2);
  const P4 = reduceKeepMasters(redM + redY);

  // challenges
  const C1 = reduceKeepMasters(Math.abs(redM - redD));
  const C2 = reduceKeepMasters(Math.abs(redD - redY));
  const C3 = reduceKeepMasters(Math.abs(C1 - C2));
  const C4 = reduceKeepMasters(Math.abs(redM - redY));

  // ages & peak years
  const lifePath = calcLifePath(birthDate);
  const baseAge = 36 - lifePath; // chuẩn Pythagoras
  const age1 = baseAge;
  const age2 = baseAge + 9;
  const age3 = baseAge + 18;
  const age4 = baseAge + 27;

  const year1 = y + age1;
  const year2 = y + age2;
  const year3 = y + age3;
  const year4 = y + age4;

  return {
    base: { redM, redD, redY },
    pinnacles: [
      { label: "Đỉnh 1", value: P1, age: age1, year: year1, challenge: C1 },
      { label: "Đỉnh 2", value: P2, age: age2, year: year2, challenge: C2 },
      { label: "Đỉnh 3", value: P3, age: age3, year: year3, challenge: C3 },
      { label: "Đỉnh 4", value: P4, age: age4, year: year4, challenge: C4 },
    ],
  };
}

/** Nút tròn để vẽ số */
const Dot = ({ x, y, r = 28, color = "#5b03e4", text, subText, subColor = "#999" }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={color} opacity={0.95} />
    <text x={x} y={y + 6} textAnchor="middle" fontSize="20" fontWeight={800} fill="#fff">
      {text}
    </text>
    {subText ? (
      <text x={x} y={y + r + 18} textAnchor="middle" fontSize="12" fill={subColor}>
        {subText}
      </text>
    ) : null}
  </g>
);

export default function LifePinnaclePyramid({ birthDate }) {
  const data = useMemo(() => computePyramid(birthDate), [birthDate]);
  const { base, pinnacles } = data;

  // Layout SVG (responsive-ish)
  // toạ độ chính: hai tam giác lồng nhau
  const W = 720;
  const H = 460;

  // đỉnh 3 (trên)
  const p3 = { x: W / 2, y: 95 };
  // nút giữa (đỉnh 3) hiển thị số + “năm / tuổi” bên dưới
  // 2 đỉnh đáy (p1, p2)
  const p1 = { x: W / 2 - 180, y: 280 };
  const p2 = { x: W / 2 + 180, y: 280 };
  // đường lên p3
  const cLeft = { x: (p1.x + p3.x) / 2, y: (p1.y + p3.y) / 2 }; // vị trí thử thách 3
  const cRight = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 }; // vị trí thử thách 4

  // đỉnh 4 (trên cùng, hơi nhô lên)
  const p4 = { x: W / 2, y: 35 };

  // 3 số chân đế theo hàng ngang
  const bM = { x: p1.x - 60, y: p1.y + 80 };
  const bD = { x: W / 2, y: p1.y + 80 };
  const bY = { x: p2.x + 60, y: p1.y + 80 };

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 860 }}>
        {/* Tiêu đề */}
        <text x={W / 2} y={24} textAnchor="middle" fontWeight={700} fontSize="22" fill="#111">
          Kim Tự Tháp 4 Đỉnh Cao Cuộc Đời
        </text>
        {birthDate ? (
          <text x={W / 2} y={44} textAnchor="middle" fontSize="12" fill="#666">
            {new Date(birthDate).toLocaleDateString("vi-VN")}
          </text>
        ) : null}

        {/* Các đường tam giác */}
        <g stroke="#1d8a84" strokeWidth="3" fill="none" opacity="0.85">
          <polyline points={`${p1.x},${p1.y} ${p3.x},${p3.y} ${p2.x},${p2.y}`} />
          <polyline points={`${p1.x},${p1.y} ${p2.x},${p2.y}`} />
          {/* tam giác lớn lên đỉnh 4 */}
          <polyline points={`${p1.x},${p1.y} ${p4.x},${p4.y} ${p2.x},${p2.y}`} />
        </g>

        {/* Năm & tuổi dưới mỗi đỉnh */}
        {/* đỉnh 3 */}
        <text x={pinnacles[2].year} style={{ display: "none" }} />
        <text x={p3.x} y={p3.y - 18} textAnchor="middle" fill="#c44" fontSize="13">
          {pinnacles[2].year}
        </text>
        <text x={p3.x} y={p3.y + 60} textAnchor="middle" fill="#2b7" fontSize="11">
          {pinnacles[2].age} tuổi
        </text>
        {/* đỉnh 1 */}
        <text x={p1.x} y={p1.y + 56} textAnchor="middle" fill="#c44" fontSize="13">
          {pinnacles[0].year}
        </text>
        <text x={p1.x} y={p1.y + 74} textAnchor="middle" fill="#2b7" fontSize="11">
          {pinnacles[0].age} tuổi
        </text>
        {/* đỉnh 2 */}
        <text x={p2.x} y={p2.y + 56} textAnchor="middle" fill="#c44" fontSize="13">
          {pinnacles[1].year}
        </text>
        <text x={p2.x} y={p2.y + 74} textAnchor="middle" fill="#2b7" fontSize="11">
          {pinnacles[1].age} tuổi
        </text>
        {/* đỉnh 4 */}
        <text x={p4.x} y={p4.y - 6} textAnchor="middle" fill="#c44" fontSize="13">
          {pinnacles[3].year}
        </text>
        <text x={p4.x} y={p4.y + 60} textAnchor="middle" fill="#2b7" fontSize="11">
          {pinnacles[3].age} tuổi
        </text>

        {/* Nút số đỉnh (tím) */}
        <Dot x={p1.x} y={p1.y} r={44} text={pinnacles[0].value} color="#5b03e4" />
        <Dot x={p2.x} y={p2.y} r={44} text={pinnacles[1].value} color="#5b03e4" />
        <Dot x={p3.x} y={p3.y} r={44} text={pinnacles[2].value} color="#5b03e4" />
        <Dot x={p4.x} y={p4.y} r={18} text={pinnacles[3].value} color="#fff" />
        {/* vòng tròn viền đỏ nhỏ cho đỉnh 4 (giống mẫu) */}
        <circle cx={p4.x} cy={p4.y} r={14} fill="#fff" stroke="#d44" strokeWidth="2" />

        {/* Nút thử thách (vàng) – đặt giữa các cạnh */}
        <Dot x={ (p1.x + p3.x)/2 } y={ (p1.y + p3.y)/2 } r={20} text={pinnacles[2].challenge} color="#ffb400" subText="Thử thách 3" />
        <Dot x={ (p2.x + p3.x)/2 } y={ (p2.y + p3.y)/2 } r={20} text={pinnacles[3].challenge} color="#ffb400" subText="Thử thách 4" />
        <Dot x={ p1.x } y={ p1.y + 16 } r={20} text={pinnacles[0].challenge} color="#ffb400" subText="Thử thách 1" />
        <Dot x={ p2.x } y={ p2.y + 16 } r={20} text={pinnacles[1].challenge} color="#ffb400" subText="Thử thách 2" />

        {/* 3 số chân đế */}
        <g>
          <circle cx={bM.x} cy={bM.y} r={14} fill="#fff" stroke="#444" />
          <text x={bM.x} y={bM.y + 4} textAnchor="middle" fontSize="12" fontWeight={700} fill="#333">
            {base.redM}
          </text>

          <circle cx={bD.x} cy={bD.y} r={14} fill="#fff" stroke="#444" />
          <text x={bD.x} y={bD.y + 4} textAnchor="middle" fontSize="12" fontWeight={700} fill="#333">
            {base.redD}
          </text>

          <circle cx={bY.x} cy={bY.y} r={14} fill="#fff" stroke="#444" />
          <text x={bY.x} y={bY.y + 4} textAnchor="middle" fontSize="12" fontWeight={700} fill="#333">
            {base.redY}
          </text>
        </g>

        {/* Chú thích */}
        <g>
          <text x={W/2} y={H - 24} textAnchor="middle" fontSize="14" fill="#444">
            Đỉnh cao (Pinnacle)
          </text>
          <text x={W/2} y={H - 6} textAnchor="middle" fontSize="14" fill="#444">
            Thử thách (Challenge)
          </text>
        </g>
      </svg>
    </div>
  );
}
