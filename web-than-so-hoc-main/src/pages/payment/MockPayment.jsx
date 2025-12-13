import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function MockPayment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(3);
  const [paying, setPaying] = useState(false);

  // countdown giả lập
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);

    try {
      await fetch(
        `http://127.0.0.1:5000/api/orders/${orderId}/mock-pay`,
        { method: "POST" }
      );

      toast.success("🎉 Thanh toán thành công!");
      navigate("/orders?paid=1"); // hoặc /admin/orders nếu admin
    } catch (err) {
      console.error(err);
      toast.error("❌ Thanh toán thất bại");
      setPaying(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 120,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 420,
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <h2>🔔 Thanh toán đơn hàng</h2>

        <p>
          Mã đơn: <b>#{orderId}</b>
        </p>

        <img
          src="/momo.png"
          alt="MoMo"
          style={{ width: 120, margin: "16px 0" }}
          onError={(e) => (e.target.style.display = "none")}
        />

        <p>Đang chuyển hướng tới cổng thanh toán…</p>
        <p>
          Hoàn tất trong <b>{seconds}</b> giây
        </p>

        <button
          onClick={handlePay}
          disabled={seconds > 0 || paying}
          style={{
            marginTop: 16,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "#d82d8b",
            color: "#fff",
            cursor: seconds > 0 ? "not-allowed" : "pointer",
            opacity: seconds > 0 ? 0.6 : 1,
          }}
        >
          Thanh toán thành công
        </button>
      </div>
    </div>
  );
}
