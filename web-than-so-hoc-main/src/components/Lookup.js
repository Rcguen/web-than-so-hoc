import React, { useState } from "react";
import "./Lookup.css";

function Lookup() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState(null);
  const [selectedMeaning, setSelectedMeaning] = useState(null);
  const [chart, setChart] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const user_id = currentUser?.user_id ?? null;

    try {
      const res = await fetch("http://127.0.0.1:5000/api/numerology/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, birth_date: birthDate, user_id }),
      });

      if (!res.ok) throw new Error("Không thể kết nối tới server.");

      const data = await res.json();
      setResult(data);

      // Vẽ biểu đồ ngày sinh
      const chartRes = await fetch("http://127.0.0.1:5000/api/numerology/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birth_date: birthDate }),
      });
      const chartData = await chartRes.json();
      setChart(chartData.chart);
    } catch (err) {
      alert("Lỗi khi tra cứu: " + err.message);
    }
  };

  // Lấy ý nghĩa từng chỉ số
  const handleViewMeaning = async (category, number) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/numerology/meaning/${category}/${number}`);
      const data = await res.json();
      setSelectedMeaning(data);
    } catch {
      alert("Không thể tải ý nghĩa con số.");
    }
  };

  return (
    <div className="lookup-section">
      <div className="lookup-header">
        <h1>🔮 Tra cứu Thần Số Học miễn phí</h1>
        <p>
          Nhập họ tên và ngày sinh của bạn để khám phá 6 chỉ số chính: 
          Con số chủ đạo, Sứ mệnh, Linh hồn, Nhân cách, Ngày sinh và Trưởng thành.
        </p>
      </div>

      <form className="lookup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nhập họ tên..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
        <button type="submit">Tra cứu ngay</button>
      </form>

      {result && (
        <div className="lookup-result">
          <h2>Kết quả của bạn</h2>
          <div className="result-cards">
            <div
              className="result-card"
              onClick={() => handleViewMeaning("life_path", result.lifePath)}
            >
              <h3>🔢 Con Số Chủ Đạo</h3>
              <p>{result.lifePath}</p>
            </div>
            <div
              className="result-card"
              onClick={() => handleViewMeaning("destiny", result.destiny)}
            >
              <h3>🌟 Sứ Mệnh</h3>
              <p>{result.destiny}</p>
            </div>
            <div
              className="result-card"
              onClick={() => handleViewMeaning("soul", result.soul)}
            >
              <h3>💖 Linh Hồn</h3>
              <p>{result.soul}</p>
            </div>
            <div
              className="result-card"
              onClick={() => handleViewMeaning("personality", result.personality)}
            >
              <h3>🧠 Nhân Cách</h3>
              <p>{result.personality}</p>
            </div>
            <div
              className="result-card"
              onClick={() => handleViewMeaning("birthday", result.birthday)}
            >
              <h3>🎂 Ngày Sinh</h3>
              <p>{result.birthday}</p>
            </div>
            <div
              className="result-card"
              onClick={() => handleViewMeaning("maturity", result.maturity)}
            >
              <h3>🍂 Trưởng Thành</h3>
              <p>{result.maturity}</p>
            </div>
          </div>
        </div>
      )}

      {chart && (
        <div className="birth-chart">
          <h2>🔷 Biểu Đồ Ngày Sinh</h2>
          <div className="chart-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <div className="chart-cell" key={n}>
                <h4>{n}</h4>
                <p>{chart[n] > 0 ? "×" + chart[n] : "-"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popup ý nghĩa */}
      {selectedMeaning && (
        <div className="popup-overlay" onClick={() => setSelectedMeaning(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedMeaning.title}</h2>
            <p style={{ whiteSpace: "pre-line" }}>{selectedMeaning.description}</p>
            <button onClick={() => setSelectedMeaning(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lookup;
