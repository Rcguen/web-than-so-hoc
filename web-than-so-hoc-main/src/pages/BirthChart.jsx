import React, { useState } from "react";

function BirthChart() {
  const [birthDate, setBirthDate] = useState("");
  const [chart, setChart] = useState(null);
  const [arrows, setArrows] = useState({ strong: [], weak: [] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/numerology/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birth_date: birthDate }),
      });

      const data = await res.json();
      setChart(data.chart);
      setArrows(data.arrows);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu biểu đồ:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="birth-chart-section">
      <style>{`
        .birth-chart-section {
          padding: 60px 20px;
          background-color: #f5f7fa;
          min-height: 100vh;
          display: flex;
          justify-content: center;
        }

        .chart-container {
          background: #fff;
          width: 100%;
          max-width: 800px;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(122, 0, 255, 0.1);
          padding: 40px;
        }

        .chart-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .chart-header h1 {
          font-size: 32px;
          font-weight: 800;
          color: #333;
          margin-bottom: 10px;
        }
        .chart-header h1 span { color: #7a00ff; }
        .chart-header p { color: #666; font-size: 16px; }

        /* Form nhập ngày sinh */
        .lookup-form {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .date-input {
          padding: 12px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 50px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.3s;
          color: #333;
        }
        .date-input:focus { border-color: #7a00ff; }
        
        .btn-draw {
          padding: 12px 30px;
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          color: #fff;
          border: none;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-draw:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(122, 0, 255, 0.3);
        }

        /* Grid Biểu Đồ 3x3 */
        .chart-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
        }
        .chart-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0; /* Grid liền mạch */
          border: 4px solid #333; /* Viền ngoài đậm */
          background-color: #fff;
          max-width: 300px;
          width: 100%;
        }
        
        .chart-cell {
          aspect-ratio: 1; /* Ô vuông */
          border: 1px solid #ddd; /* Viền trong mỏng */
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 800;
          color: #333;
          position: relative;
          background: #fff;
        }
        /* Kẻ khung lưới Pythagoras truyền thống (chỉ có viền ngoài và các đường kẻ dọc ngang) */
        .chart-cell:nth-child(1), .chart-cell:nth-child(2), .chart-cell:nth-child(4), .chart-cell:nth-child(5) {
            border-right: 2px solid #333;
            border-bottom: 2px solid #333;
        }
        .chart-cell:nth-child(3), .chart-cell:nth-child(6) {
            border-bottom: 2px solid #333;
        }
        .chart-cell:nth-child(7), .chart-cell:nth-child(8) {
            border-right: 2px solid #333;
        }

        /* Số trong ô */
        .cell-number {
          color: #7a00ff;
        }
        .cell-empty {
          color: #eee;
          font-size: 20px;
        }

        /* Phần Mũi Tên */
        .arrows-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        .arrow-box h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 15px;
          display: flex; align-items: center; gap: 8px;
        }
        .arrow-list {
          list-style: none; padding: 0; margin: 0;
        }
        .arrow-item {
          background: #f8f9fa;
          padding: 10px 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid #ccc;
          font-size: 14px;
          color: #555;
        }
        
        /* Style cho mũi tên mạnh */
        .strong-arrows h3 { color: #2ecc71; }
        .strong-arrows .arrow-item { border-left-color: #2ecc71; background: #e8f8f5; color: #27ae60; font-weight: 600; }

        /* Style cho mũi tên yếu */
        .weak-arrows h3 { color: #e74c3c; }
        .weak-arrows .arrow-item { border-left-color: #e74c3c; background: #fdedec; color: #c0392b; }

        @media (max-width: 768px) {
          .arrows-section { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="chart-container">
        <div className="chart-header">
          <h1>🔮 Biểu Đồ <span>Sinh Mệnh</span></h1>
          <p>Nhập ngày sinh dương lịch để xem biểu đồ năng lượng Pythagoras của bạn.</p>
        </div>

        <form className="lookup-form" onSubmit={handleSubmit}>
          <input
            type="date"
            className="date-input"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
          <button type="submit" className="btn-draw">
            {loading ? "Đang vẽ..." : "Vẽ Biểu Đồ"}
          </button>
        </form>

        {chart && (
          <div className="result-area">
            
            {/* Phần hiển thị lưới 3x3 */}
            <div className="chart-wrapper">
              <h3 style={{marginBottom: '20px', color: '#555'}}>Biểu Đồ Của Bạn</h3>
              <div className="chart-grid">
                {/* Thứ tự lưới Pythagoras: 3-6-9 (trên), 2-5-8 (giữa), 1-4-7 (dưới)
                    Tuy nhiên, logic map của bạn là 1->9. Cần map đúng vị trí CSS Grid hoặc render đúng thứ tự.
                    Cách phổ biến là render 1->9 và dùng CSS Grid để xếp đúng vị trí:
                    Lưới chuẩn:
                    3 | 6 | 9
                    2 | 5 | 8
                    1 | 4 | 7
                */}
                {/* Để đơn giản và đúng logic mảng, ta render lần lượt các ô theo vị trí hàng/cột */}
                {[3, 6, 9, 2, 5, 8, 1, 4, 7].map((num) => (
                  <div key={num} className="chart-cell">
                    {chart[num] > 0 ? (
                      <span className="cell-number">
                        {/* Lặp lại số n lần. Ví dụ chart[1] = 2 thì hiện "11" */}
                        {Array(chart[num]).fill(num).join("")}
                      </span>
                    ) : (
                      <span className="cell-empty"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Phần giải thích mũi tên */}
            <div className="arrows-section">
              
              <div className="arrow-box strong-arrows">
                <h3>🌟 Mũi tên Sức Mạnh</h3>
                {arrows.strong.length > 0 ? (
                  <ul className="arrow-list">
                    {arrows.strong.map((arrow, i) => (
                      <li key={i} className="arrow-item">{arrow}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{color: '#999', fontStyle: 'italic'}}>Không có mũi tên sức mạnh nào.</p>
                )}
              </div>

              <div className="arrow-box weak-arrows">
                <h3>⚠️ Mũi tên Hạn Chế</h3>
                {arrows.weak.length > 0 ? (
                  <ul className="arrow-list">
                    {arrows.weak.map((arrow, i) => (
                      <li key={i} className="arrow-item">{arrow}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{color: '#999', fontStyle: 'italic'}}>Tuyệt vời! Không có mũi tên hạn chế (trống).</p>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BirthChart;