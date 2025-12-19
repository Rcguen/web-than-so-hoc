import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
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
      <h1>🎉 Thanh toán thành công</h1>
      <p>Cảm ơn bạn đã sử dụng dịch vụ.</p>
      <p style={{ color: "#666" }}>Đang chuyển về trang <b>Đơn hàng</b> trong <b>{Math.max(0, count)}</b> giây...</p>
      <button
        style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, border: "none", background: "#d82d8b", color: "#fff", cursor: "pointer" }}
        onClick={() => navigate("/orders")}
      >
        Về ngay
      </button>
    </div>
  );
};

export default PaymentSuccess;
