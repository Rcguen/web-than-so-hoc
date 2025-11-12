import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function NumerologyDetails() {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/numerology/details/${id}`)
      .then((res) => res.json())
      .then((data) => setDetails(data))
      .catch((err) => console.error("Lỗi tải chi tiết:", err));
  }, [id]);

  if (!details) {
    return <p style={{ textAlign: "center", marginTop: "100px" }}>⏳ Đang tải...</p>;
  }

  return (
    <div style={{ padding: "60px 80px", textAlign: "center" }}>
      <h2 style={{ color: "#5b03e4" }}>🔮 Chi tiết các chỉ số</h2>
      <p>
        <b>Họ tên:</b> {details.info.name} <br />
        <b>Ngày sinh:</b> {details.info.birth_date}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "40px",
        }}
      >
        {details.meanings.map((m, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: "15px",
              padding: "20px",
              textAlign: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ color: "#5b03e4" }}>
              {m.title} ({m.number})
            </h3>
            <p style={{ marginTop: "10px", textAlign: "justify" }}>
              {m.description}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/history")}
        style={{
          marginTop: "40px",
          backgroundColor: "#5b03e4",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
      >
        ⬅️ Quay lại lịch sử
      </button>
    </div>
  );
}

export default NumerologyDetails;
