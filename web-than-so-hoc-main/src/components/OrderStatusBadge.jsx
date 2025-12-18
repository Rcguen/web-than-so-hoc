import React from "react";
import { useNavigate } from "react-router-dom";

export default function OrderStatusBadge({ status, orderId }) {
  const navigate = useNavigate();

  let color = "#999";
  let text = status;

  if (status === "pending") {
    color = "#ffc107";
    text = "Chờ xử lý";
  } else if (status === "processing") {
    color = "#17a2b8";
    text = "Đang xử lý";
  } else if (status === "shipping") {
    color = "#0d6efd";
    text = "Đang giao";
  } else if (status === "completed") {
    color = "#28a745";
    text = "Hoàn thành";
  }

  return (
    <span
      onClick={() => navigate(`/order/${orderId}`)}
      style={{
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 600,
        backgroundColor: color,
        color: "#fff",
        cursor: "pointer",
        userSelect: "none",
      }}
      title="Xem chi tiết đơn hàng"
    >
      {text}
    </span>
  );
}
