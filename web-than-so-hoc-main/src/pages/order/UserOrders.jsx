import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserOrder.css";
import { Link } from "react-router-dom";

export default function UserOrders() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/orders/user/${user.user_id}`);
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadOrders();
  }, []);

  if (!user) {
    return (
      <div className="user-orders-container">
        <h2>Bạn chưa đăng nhập!</h2>
        <Link to="/login" className="btn-login">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="user-orders-container">
      <h1 className="page-title">📦 Lịch sử đơn hàng</h1>

      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.order_id}>
                <td>#{o.order_id}</td>
                <td>{new Date(o.created_at).toLocaleString("vi-VN")}</td>
                <td>{Number(o.total_price).toLocaleString()} đ</td>
                <td>{o.order_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link to="/shop" className="btn-back">
        ← Quay lại cửa hàng
      </Link>
    </div>
  );
}
