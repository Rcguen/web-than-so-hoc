import React, { useEffect, useState } from "react";
import { useParams, Link , useLocation} from "react-router-dom";
import PaymentBadge from "../../components/PaymentBadge";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import "./OrderHistory.css";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const location = useLocation();
const { id: order_id } = useParams();


  useEffect(() => {
  if (!user) return;

  fetch(`http://127.0.0.1:5000/api/orders/user/${user.user_id}`)
    .then((res) => res.json())
    .then((data) => setOrders(data.orders || []));

  const params = new URLSearchParams(location.search);
  if (params.get("paid") === "1") {
    // optional toast
    // toast.success("Thanh toán thành công!");
  }
}, [location.search]);


  const formatDate = (date) =>
    new Date(date).toLocaleString("vi-VN");

  return (
  <div className="order-history-container">
    <h1 className="order-history-title">📦 Lịch sử đơn hàng</h1>

    {orders.length === 0 && (
      <p className="empty-text">Bạn chưa có đơn hàng nào.</p>
    )}

    <div className="order-list">
      {orders.map((o) => (
        <div className="order-card" key={o.order_id}>
          <div className="order-card-header">
            <div>
              <strong>Mã đơn:</strong> #{o.order_id}
              <div className="order-date">
                {formatDate(o.created_at)}
              </div>
            </div>

            <div className="order-total">
              {Number(o.total_price).toLocaleString()} đ
            </div>
          </div>

          <div className="order-card-body">
            <div className="order-badges">
              <OrderStatusBadge
                status={o.order_status}
                orderId={o.order_id}
              />
              <PaymentBadge
                status={o.payment_status}
                orderId={o.order_id}
              />
            </div>

            <Link
              to={`/order/${o.order_id}`}
              className="order-detail-link"
            >
              Xem chi tiết →
            </Link>
          </div>
        </div>
      ))}
    </div>

    <Link to="/shop">
      <button className="back-btn">← Quay lại cửa hàng</button>
    </Link>
  </div>
);

}

export default OrderHistory;
