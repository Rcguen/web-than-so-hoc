import React from "react";
import { Link } from "react-router-dom";
import "./ThankYou.css";

export default function ThankYou() {
  return (
    <div className="thankyou-container">
      <h1>🎉 Cảm ơn bạn đã đặt hàng!</h1>
      <p>Chúng tôi sẽ sớm liên hệ và xử lý đơn hàng của bạn.</p>

      <div className="actions">
        <Link to="/orders" className="btn-view-orders">Xem đơn hàng</Link>
        <Link to="/shop" className="btn-back-shop">Tiếp tục mua sắm</Link>
      </div>
    </div>
  );
}
