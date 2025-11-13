import React, { useState } from "react";
import "./LifePinnacleSection.css";

/**
 * Hàm rút gọn số về 1 chữ số hoặc Master Number (11,22,33)
 */
function reduceNumber(num) {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = num.toString().split("").reduce((a, b) => a + parseInt(b), 0);
  }
  return num;
}

/**
 * Tính 4 đỉnh cao & 4 thử thách
 * Theo trường phái Pythagoras (Western Numerology)
 */
function calculatePinnacles(day, month, year) {
  const birthDay = reduceNumber(day);
  const birthMonth = reduceNumber(month);
  const birthYear = reduceNumber(year);

  // 4 đỉnh (Pinnacles)
  const pinnacle1 = reduceNumber(birthMonth + birthDay);
  const pinnacle2 = reduceNumber(birthDay + birthYear);
  const pinnacle3 = reduceNumber(pinnacle1 + pinnacle2);
  const pinnacle4 = reduceNumber(birthMonth + birthYear);

  // 4 thử thách (Challenges)
  const challenge1 = Math.abs(birthMonth - birthDay);
  const challenge2 = Math.abs(birthDay - birthYear);
  const challenge3 = Math.abs(challenge1 - challenge2);
  const challenge4 = Math.abs(birthMonth - birthYear);

  return {
    pinnacles: [pinnacle1, pinnacle2, pinnacle3, pinnacle4],
    challenges: [challenge1, challenge2, challenge3, challenge4],
  };
}

export default function LifePinnaclePyramid() {
  const [birthDate, setBirthDate] = useState("");
  const [data, setData] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!birthDate) return;

    const [year, month, day] = birthDate.split("-").map(Number);
    const result = calculatePinnacles(day, month, year);
    setData(result);
  };

  return (
    <div className="lookup-section">
      <div className="lookup-header">
        <h1>🔺 Biểu đồ Đỉnh Cao & Thử Thách</h1>
        <p>
          Biểu đồ hiển thị 4 giai đoạn phát triển và các thử thách lớn trong cuộc đời bạn theo Thần Số Học.
        </p>
      </div>

      <form className="lookup-form" onSubmit={handleSubmit}>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
        <button type="submit">Xem Biểu Đồ</button>
      </form>

      {data && (
        <div className="pinnacle-chart">
          <h2>Kim Tự Tháp 4 Đỉnh Cao Cuộc Đời</h2>

          <div className="pyramid">
            {/* Đỉnh cao 3 */}
            <div className="level top">
              <div className="pinnacle">
                <div className="circle purple">{data.pinnacles[2]}</div>
                <div className="label">Đỉnh 3</div>
                <div className="challenge orange">{data.challenges[3]}</div>
                <div className="label-small">Thử thách 4</div>
              </div>
            </div>

            {/* Đỉnh 1 - 2 */}
            <div className="level middle">
              <div className="pinnacle">
                <div className="circle purple">{data.pinnacles[0]}</div>
                <div className="label">Đỉnh 1</div>
                <div className="challenge orange">{data.challenges[0]}</div>
                <div className="label-small">Thử thách 1</div>
              </div>

              <div className="pinnacle">
                <div className="circle purple">{data.pinnacles[1]}</div>
                <div className="label">Đỉnh 2</div>
                <div className="challenge orange">{data.challenges[1]}</div>
                <div className="label-small">Thử thách 2</div>
              </div>
            </div>

            {/* Đỉnh cuối cùng */}
            <div className="level bottom">
              <div className="pinnacle">
                <div className="circle purple">{data.pinnacles[3]}</div>
                <div className="label">Đỉnh 4</div>
                <div className="challenge orange">{data.challenges[2]}</div>
                <div className="label-small">Thử thách 3</div>
              </div>
            </div>
          </div>

          <p style={{ marginTop: "30px", color: "#555" }}>
            🔮 <b>Đỉnh cao</b> biểu thị năng lượng phát triển mạnh nhất ở từng giai đoạn.  
            ⚡ <b>Thử thách</b> biểu thị những bài học cuộc sống cần vượt qua.
          </p>
        </div>
      )}
    </div>
  );
}
