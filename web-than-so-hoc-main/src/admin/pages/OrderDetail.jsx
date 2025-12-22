import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./orderDetail.css";

export default function OrderDetail() {
  const { order_id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  // =========================
  // FETCH ORDER DETAIL
  // =========================
  const fetchOrderDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://127.0.0.1:5000/api/admin/orders/${order_id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setOrder(res.data.order);
      setItems(res.data.items);
      setStatus(res.data.order.order_status);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Không thể tải chi tiết đơn hàng");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [order_id]);

  // =========================
  // UPDATE STATUS
  // =========================
  const updateStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://127.0.0.1:5000/api/admin/orders/${order_id}/status`,
        { status },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      alert("Cập nhật trạng thái thành công");
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật trạng thái");
    }
  };

  if (loading) {
    return <div className="admin-loading">Đang tải chi tiết đơn hàng...</div>;
  }

  if (!order) {
    return <div className="admin-loading">Không tìm thấy đơn hàng</div>;
  }

  return (
    <div className="order-detail-wrapper">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      <h1 className="page-title">📦 Chi tiết đơn hàng #{order.order_id}</h1>

      {/* ================= CUSTOMER INFO ================= */}
      <section className="card">
        <h2>👤 Thông tin khách hàng</h2>

        <div className="info-grid">
          <p>
            <b>Họ tên:</b> {order.customer_name}
          </p>
          <p>
            <b>SĐT:</b> {order.customer_phone}
          </p>
          <p>
            <b>Địa chỉ:</b> {order.customer_address}
          </p>
          <p>
            <b>Ngày đặt:</b>{" "}
            {new Date(order.created_at).toLocaleString("vi-VN")}
          </p>
        </div>

        <p className="note">
          <b>Ghi chú:</b> {order.note || "Không có"}
        </p>

        <div className="status-box">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="status-select"
          >
            <option value="pending">🕒 Chờ xử lý</option>
            <option value="processing">⚙️ Đang xử lý</option>
            <option value="shipping">🚚 Đang giao</option>
            <option value="completed">✅ Hoàn thành</option>
            <option value="cancelled">❌ Đã hủy</option>
          </select>

          <button className="save-btn" onClick={updateStatus}>
            💾 Lưu trạng thái
          </button>
        </div>
      </section>

      {/* ================= ORDER ITEMS ================= */}
      <section className="card">
        <h2>🛒 Sản phẩm trong đơn</h2>

        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index}>
                <td>{index + 1}</td>
                <td>{item.product_name}</td>
                <td>{Number(item.price).toLocaleString()} đ</td>
                <td>{item.quantity}</td>
                <td>
                  {(item.price * item.quantity).toLocaleString()} đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ================= TOTAL ================= */}
      <section className="card total-card">
        <h2 className="total-price">
          💰 Tổng đơn: {Number(order.total_price).toLocaleString()} đ
        </h2>

        <p>
          <b>Phương thức thanh toán:</b>{" "}
          {order.payment_method || "COD"}
        </p>

        <p>
          <b>Trạng thái thanh toán:</b>{" "}
          {order.payment_status === "PAID"
            ? "Đã thanh toán"
            : "Chưa thanh toán"}
        </p>
      </section>
    </div>
  );
}
