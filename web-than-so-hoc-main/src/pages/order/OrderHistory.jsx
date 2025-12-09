import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) return;

    fetch(`http://127.0.0.1:5000/api/orders/user/${user.user_id}`)
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []));
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleString("vi-VN");

  return (
    <div style={{ padding: "80px" }}>
      <h1>Lịch sử đơn hàng</h1>

      {orders.length === 0 && <p>Bạn chưa có đơn hàng nào.</p>}

      <table className="orders-table-user">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Xem</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.order_id}>
              <td>#{o.order_id}</td>
              <td>{formatDate(o.created_at)}</td>
              <td>{Number(o.total_price).toLocaleString()} đ</td>
              <td>{o.order_status}</td>
              <td>
                <Link to={`/order/${o.order_id}`}>Chi tiết</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/shop">
        <button className="back-btn">← Quay lại cửa hàng</button>
      </Link>
    </div>
  );
}

export default OrderHistory;
