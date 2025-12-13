import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentBadge({ status, orderId }) {
  const navigate = useNavigate();

  let color = "#999";
  let text = status;
  let clickable = false;

  if (status === "PAID") {
    color = "#28a745";
    text = "Đã thanh toán";
  } else if (status === "PENDING_PAYMENT") {
    color = "#ffc107";
    text = "Chờ thanh toán";
    clickable = true;
  } else if (status === "UNPAID") {
    color = "#dc3545";
    text = "Chưa thanh toán";
    clickable = true;
  }

  const handleClick = () => {
    if (!clickable) return;
    navigate(`/payment/mock/${orderId}`);
  };

  return (
    <span
      onClick={handleClick}
      style={{
        padding: "5px 12px",
        borderRadius: "14px",
        fontSize: "13px",
        fontWeight: 600,
        backgroundColor: color,
        color: "#fff",
        cursor: clickable ? "pointer" : "default",
        opacity: clickable ? 1 : 0.7,
        userSelect: "none",
      }}
      title={clickable ? "Click để thanh toán" : "Đã thanh toán"}
    >
      {text}
    </span>
  );
}
