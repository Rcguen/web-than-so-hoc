import React, { useState } from "react";
import "./Lookup.css";

function BirthChart() {
  const [birthDate, setBirthDate] = useState("");
  const [chart, setChart] = useState(null);
  const [arrows, setArrows] = useState({ strong: [], weak: [] });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:5000/api/numerology/birth-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birth_date: birthDate }),
    });

    const data = await res.json();
    setChart(data.chart);
    setArrows(data.arrows);
  };

  return (
    <div className="lookup-section">
      <div className="lookup-header">
        <h1>🔮 Biểu Đồ Sinh Mệnh (Pythagoras)</h1>
        <p>Nhập ngày sinh để xem biểu đồ năng lượng và các mũi tên mạnh/yếu.</p>
      </div>

      <form className="lookup-form" onSubmit={handleSubmit}>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
        <button type="submit">Vẽ Biểu Đồ</button>
      </form>

      {chart && (
        <div className="birth-chart">
          <h2>Biểu Đồ Ngày Sinh</h2>
          <div className="chart-grid birth">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <div key={n} className="chart-cell">
                <h4>{n}</h4>
                <p>{chart[n] > 0 ? "×" + chart[n] : "(0)"}</p>
              </div>
            ))}
          </div>

          <div className="arrows">
            <h3>🌟 Mũi tên mạnh</h3>
            {arrows.strong.length ? (
              <ul>{arrows.strong.map((a, i) => <li key={i}>{a}</li>)}</ul>
            ) : <p>Chưa có mũi tên mạnh.</p>}

            <h3>⚠️ Mũi tên trống / yếu</h3>
            {arrows.weak.length ? (
              <ul>{arrows.weak.map((a, i) => <li key={i}>{a}</li>)}</ul>
            ) : <p>Không có mũi tên yếu.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default BirthChart;
