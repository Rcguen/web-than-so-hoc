import React, { useEffect, useState } from "react";

function HistoryLookup() {
  const [history, setHistory] = useState([]);
  const [selectedMeaning, setSelectedMeaning] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/numerology/history")
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error("Lỗi tải lịch sử:", err));
  }, []);

  const viewMeaning = async (lifePath) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/numerology/meaning/${lifePath}`);
      const data = await res.json();
      setSelectedMeaning(data);
    } catch (err) {
      console.error("Lỗi tải ý nghĩa:", err);
    }
    setLoading(false);
  };

  const closeModal = () => setSelectedMeaning(null);

  return (
    <div style={{ padding: "80px 20px", textAlign: "center" }}>
      <h2>Lịch sử tra cứu</h2>

      <table
        style={{
          width: "85%",
          margin: "20px auto",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#5b03e4", color: "white" }}>
            <th>Họ Tên</th>
            <th>Ngày Sinh</th>
            <th>Con Số Chủ Đạo</th>
            <th>Ngày Tra Cứu</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
              <td>{item.name}</td>
              <td>{item.birth_date}</td>
              <td><b style={{ color: "#5b03e4" }}>{item.life_path}</b></td>
              <td>{new Date(item.created_at).toLocaleString()}</td>
              <td>
                <button
                  onClick={() => viewMeaning(item.life_path)}
                  style={{
                    backgroundColor: "#5b03e4",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  Xem lại
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup hiển thị ý nghĩa */}
      {selectedMeaning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            animation: "fadeIn 0.3s ease-in-out",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "12px",
              width: "60%",
              textAlign: "center",
              boxShadow: "0 0 20px rgba(0,0,0,0.2)",
              animation: "fadeInUp 0.5s ease",
            }}
          >
            <h2 style={{ color: "#5b03e4" }}>
              Con số chủ đạo: {selectedMeaning.number}
            </h2>
            <h3>{selectedMeaning.title}</h3>
            <p style={{ marginTop: "10px" }}>{selectedMeaning.description}</p>

            <button
              onClick={closeModal}
              style={{
                marginTop: "20px",
                backgroundColor: "#5b03e4",
                color: "#fff",
                padding: "10px 25px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {loading && <p>Đang tải dữ liệu...</p>}
    </div>
  );
}

export default HistoryLookup;
