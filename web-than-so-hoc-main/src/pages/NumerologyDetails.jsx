import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function NumerologyDetails() {
  const { id } = useParams();      // id = result_id được truyền từ HistoryLookup
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDetails() {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/numerology/details/${id}`);
        const data = await res.json();
        setDetails(data);
      } catch (err) {
        console.error("Lỗi tải chi tiết:", err);
      }
      setLoading(false);
    }
    loadDetails();
  }, [id]);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "80px" }}>⏳ Đang tải dữ liệu...</p>;
  }

  if (!details || !details.info) {
    return (
      <p style={{ textAlign: "center", marginTop: "80px", color: "red" }}>
        ❌ Không tìm thấy dữ liệu chi tiết.
      </p>
    );
  }

  return (
    <div style={{ padding: "60px 80px", textAlign: "center" }}>
      <h2 style={{ color: "#5b03e4" }}>🔮 Chi tiết các chỉ số</h2>

      <p style={{ marginTop: "10px" }}>
        <b>Họ tên:</b> {details.info.name} <br />
        <b>Ngày sinh:</b> {details.info.birth_date}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "25px",
          marginTop: "40px",
        }}
      >
        {details.meanings.map((m, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "15px",
              textAlign: "left",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ color: "#5b03e4", marginBottom: "10px" }}>
              {m.title} — <span style={{ color: "#5b03e4" }}>({m.number})</span>
            </h3>
            <p style={{ lineHeight: "1.6", textAlign: "justify" }}>{m.description}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/history")}
        style={{
          marginTop: "40px",
          backgroundColor: "#5b03e4",
          color: "white",
          padding: "10px 25px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        ⬅ Quay lại lịch sử
      </button>
    </div>
  );
}

export default NumerologyDetails;
