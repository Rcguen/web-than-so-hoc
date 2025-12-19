import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentFail = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(5);

  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => c - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      navigate("/orders");
    }, 5000);

    return () => {
      clearInterval(t);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <h1>❌ Thanh toán thất bại</h1>
      <p>Vui lòng thử lại hoặc chọn phương thức khác.</p>
      <p style={{ color: "#666" }}>Đang chuyển về trang <b>Đơn hàng</b> trong <b>{Math.max(0, count)}</b> giây...</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
        <button
          style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#d82d8b", color: "#fff", cursor: "pointer" }}
          onClick={() => navigate("/orders")}
        >
          Về ngay
        </button>
        <button
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    </div>
  );
};

export default PaymentFail;
