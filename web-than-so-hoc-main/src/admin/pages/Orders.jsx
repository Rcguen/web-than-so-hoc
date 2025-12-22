import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./admin.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/orders");
      setOrders(res.data.orders || res.data || []);
    } catch (err) {
      console.error("Load orders error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchKeyword =
      o.order_id.toString().includes(keyword) ||
      (o.customer_name || "").toLowerCase().includes(keyword.toLowerCase());

    const matchStatus = status === "all" || o.order_status === status;
    return matchKeyword && matchStatus;
  });

  if (loading) {
    return <div className="admin-loading">Đang tải đơn hàng...</div>;
  }

  return (
    <div className="admin-page">
      <h1 className="page-title">📦 Quản lý đơn hàng</h1>

      {/* ===== TOOLBAR ===== */}
      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="🔍 Mã đơn / tên khách..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* ===== TABLE ===== */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>SĐT</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Ngày đặt</th>
            <th>Chi tiết</th>
            <th>Thanh toán</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="8" className="no-data">
                Không tìm thấy đơn hàng
              </td>
            </tr>
          ) : (
            filteredOrders.map((o) => (
              <tr key={o.order_id}>
                <td>#{o.order_id}</td>
                <td>{o.customer_name}</td>
                <td>{o.customer_phone}</td>
                <td>{Number(o.total_price).toLocaleString()} đ</td>

                <td>
                  <span className={`badge badge-${o.order_status}`}>
                    {o.order_status === "pending" && "Chờ xử lý"}
                    {o.order_status === "processing" && "Đang xử lý"}
                    {o.order_status === "completed" && "Hoàn thành"}
                    {o.order_status === "cancelled" && "Đã hủy"}
                  </span>
                </td>

                <td>{o.created_at}</td>

                <td>
                  <Link
                    className="btn-view"
                    to={`/admin/orders/${o.order_id}`}
                  >
                    Xem
                  </Link>
                </td>

                <td>
                  {o.payment_status === "PAID" ? (
                    <span className="badge badge-success">Đã thanh toán</span>
                  ) : (
                    <span className="badge badge-danger">Chưa thanh toán</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
