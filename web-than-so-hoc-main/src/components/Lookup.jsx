import React, { useState, useEffect, useRef } from "react";
import "./Lookup.css";
import LifePinnacleSection from "./LifePinnacleSection";
import LifePinnaclePyramid from "./LifePinnaclePyramid";


function Lookup() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState(null);
  const [selectedMeaning, setSelectedMeaning] = useState(null);
  const [chartResp, setChartResp] = useState(null);
  const [arrowPopup, setArrowPopup] = useState(null); // popup mũi tên mạnh/yếu
  const [hasResult, setHasResult] = useState(false);
  const resultRef = useRef(null);



  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const user_id = currentUser?.user_id ?? null;

    try {
      // Gửi yêu cầu tính 6 chỉ số
      const res = await fetch("http://127.0.0.1:5000/api/numerology/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, birth_date: birthDate, user_id }),
      });

      if (!res.ok) throw new Error("Không thể kết nối tới server.");

      const data = await res.json();
      setResult(data);
      setHasResult(true);

      setTimeout(() => {
  resultRef.current?.scrollIntoView({ behavior: "smooth" });
}, 300);


      // Gửi yêu cầu lấy Biểu đồ sinh mệnh + Mũi tên
      const chartRes = await fetch("http://127.0.0.1:5000/api/numerology/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birth_date: birthDate }),
      });

      const chartData = await chartRes.json();
      setChartResp(chartData);
    } catch (err) {
      alert("Lỗi khi tra cứu: " + err.message);
    }
  };

  //Lay chi so theo ten
  const handleNameChart = async () => {
  const res = await fetch("http://127.0.0.1:5000/api/numerology/name-chart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  setChartResp(data);
};

//Dinh cao cuoc doi


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

      {/* Hiển thị kết quả 6 chỉ số */}
      {result && (
        <div className="lookup-result" ref={resultRef}>
          <h2>Kết quả của bạn</h2>
          <div className="result-cards">
            <div className="result-card" onClick={() => handleViewMeaning("life_path", result.lifePath)}>
              <h3>🔢 Con Số Chủ Đạo</h3><p>{result.lifePath}</p>
            </div>
            <div className="result-card" onClick={() => handleViewMeaning("destiny", result.destiny)}>
              <h3>🌟 Sứ Mệnh</h3><p>{result.destiny}</p>
            </div>
            <div className="result-card" onClick={() => handleViewMeaning("soul", result.soul)}>
              <h3>💖 Linh Hồn</h3><p>{result.soul}</p>
            </div>
            <div className="result-card" onClick={() => handleViewMeaning("personality", result.personality)}>
              <h3>🧠 Nhân Cách</h3><p>{result.personality}</p>
            </div>
            <div className="result-card" onClick={() => handleViewMeaning("birthday", result.birthday)}>
              <h3>🎂 Ngày Sinh</h3><p>{result.birthday}</p>
            </div>
            <div className="result-card" onClick={() => handleViewMeaning("maturity", result.maturity)}>
              <h3>🍂 Trưởng Thành</h3><p>{result.maturity}</p>
            </div>
          </div>

          
        </div>
      )}

      {/* Biểu đồ sinh mệnh */}
      {chartResp && (
        <div className="birth-chart">
          <h2>Biểu Đồ Sinh Mệnh</h2>

          <div className="chart-grid birth">
            {[3,6,9,2,5,8,1,4,7].map((n) => (
              <div className="chart-cell" key={n}>
                <h4>{n}</h4>
                <p>{chartResp.chart[n] > 0 ? "×" + chartResp.chart[n] : "(0)"}</p>
              </div>
            ))}
          </div>

          <div className="arrows">
            <h3>🌟 Mũi tên mạnh</h3>
            {chartResp.arrows.strong.length ? (
              <ul>
                {chartResp.arrows.strong.map((a, i) => (
                  <li key={i} onClick={() => setArrowPopup({ type: "strong", text: a })}>
                    🔸 {a}
                  </li>
                ))}
              </ul>
            ) : <p>Chưa có mũi tên mạnh.</p>}

            <h3>⚠️ Mũi tên trống/yếu</h3>
            {chartResp.arrows.weak.length ? (
              <ul>
                {chartResp.arrows.weak.map((a, i) => (
                  <li key={i} onClick={() => setArrowPopup({ type: "weak", text: a })}>
                    🔹 {a}
                  </li>
                ))}
              </ul>
            ) : <p>Không có mũi tên yếu.</p>}
          </div>
        </div>
      )}

      {/* Biểu đồ tên */}
    
      {chartResp && (
        <div className="name-chart">
          <h2>Biểu Đồ Theo Tên</h2>

          <div className="chart-grid name">
            {[3,6,9,2,5,8,1,4,7].map((n) => (
              <div className="chart-cell" key={n}>
                <h4>{n}</h4>
                <p>{chartResp.chart[n] > 0 ? "×" + chartResp.chart[n] : "(0)"}</p>
              </div>
            ))}
          </div>

          <div className="arrows">
            <h3>🌟 Mũi tên mạnh</h3>
            {chartResp.arrows.strong.length ? (
              <ul>
                {chartResp.arrows.strong.map((a, i) => (
                  <li key={i} onClick={() => setArrowPopup({ type: "strong", text: a })}>
                    🔸 {a}
                  </li>
                ))}
              </ul>
            ) : <p>Chưa có mũi tên mạnh.</p>}

            <h3>⚠️ Mũi tên trống/yếu</h3>
            {chartResp.arrows.weak.length ? (
              <ul>
                {chartResp.arrows.weak.map((a, i) => (
                  <li key={i} onClick={() => setArrowPopup({ type: "weak", text: a })}>
                    🔹 {a}
                  </li>
                ))}
              </ul>
            ) : <p>Không có mũi tên yếu.</p>}
          </div>
        </div>
      )}

      

      {/* Popup ý nghĩa chỉ số */}
      {selectedMeaning && (
        <div className="popup-overlay" onClick={() => setSelectedMeaning(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedMeaning.title}</h2>
            <p style={{ whiteSpace: "pre-line" }}>{selectedMeaning.description}</p>
            <button onClick={() => setSelectedMeaning(null)}>Đóng</button>
          </div>
        </div>
      )}

      {/* Popup mũi tên */}
      {arrowPopup && (
        <div className="popup-overlay" onClick={() => setArrowPopup(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>{arrowPopup.type === "strong" ? "🌟 Mũi tên mạnh" : "⚠️ Mũi tên yếu"}</h2>
            <p style={{ fontSize: "18px" }}>{arrowPopup.text}</p>
            <button onClick={() => setArrowPopup(null)}>Đóng</button>
          </div>
        </div>
      )}

      {/* Biểu đồ Đỉnh cao & Thử thách */}
    {hasResult && birthDate && <LifePinnaclePyramid birthDate={birthDate} />}
    </div>
  );
}

export default Lookup;
