import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function OrderDetail() {
  const { order_id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  // ============================
  // 📌 Tải chi tiết đơn hàng
  // ============================
  const fetchOrderDetail = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/admin/orders/${order_id}`);
      setOrder(res.data.order);
      setItems(res.data.items);
      setStatus(res.data.order.order_status);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Không thể tải chi tiết đơn hàng!");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [order_id]);

  // ============================
  // 📌 Cập nhật trạng thái đơn hàng
  // ============================
  const updateStatus = async () => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/admin/orders/${order_id}/status`, {
        status,
      });

      alert("Cập nhật trạng thái thành công!");

      // ⬇ Reload lại chi tiết đơn hàng để cập nhật UI
      fetchOrderDetail();

    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  if (loading) return <div className="admin-loading">Đang tải dữ liệu...</div>;
  if (!order) return <div className="admin-loading">Không tìm thấy đơn hàng</div>;

  return (
    <div className="order-detail-page">

      {/* ============================ */}
      {/* 📌 Title */}
      {/* ============================ */}
      <h1 className="page-title">Chi tiết đơn hàng #{order.order_id}</h1>

      {/* ============================ */}
      {/* 📌 THÔNG TIN KHÁCH HÀNG */}
      {/* ============================ */}
      <section className="customer-info">
        <h2>Thông tin khách hàng</h2>

        <p><b>Họ tên:</b> {order.customer_name}</p>
        <p><b>SĐT:</b> {order.customer_phone}</p>
        <p><b>Địa chỉ:</b> {order.customer_address}</p>
        <p><b>Ghi chú:</b> {order.note || "Không có"}</p>
        <p><b>Ngày đặt:</b> {new Date(order.created_at).toLocaleString("vi-VN")}</p>

        {/* Trạng thái đơn hàng */}
        <div className="status-box">
          <label><b>Trạng thái đơn hàng:</b></label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="status-select"
          >
            <option value="pending">🕒 Chờ xử lý</option>
            <option value="processing">⚙️ Đang xử lý</option>
            <option value="shipping">🚚 Đang giao</option>
            <option value="completed">✅ Hoàn thành</option>
          </select>

          <button className="save-btn" onClick={updateStatus}>
            Lưu trạng thái
          </button>
        </div>
      </section>

      {/* ============================ */}
      {/* 📌 DANH SÁCH SẢN PHẨM */}
      {/* ============================ */}
      <section className="product-list">
        <h2>Sản phẩm</h2>

        <table className="order-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Sản phẩm</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Tổng</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <img
                    src={item.image ? `http://127.0.0.1:5000${item.image}` : "/no-image.png"}
                    alt=""
                    className="item-img"
                  />
                </td>

                <td>{item.product_name}</td>
                <td>{item.price.toLocaleString()} đ</td>
                <td>{item.quantity}</td>
                <td>{(item.price * item.quantity).toLocaleString()} đ</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="total-price">
          Tổng đơn: {order.total_price.toLocaleString()} đ
        </h2>

      </section>

      <button className="back-btn" onClick={() => navigate("/admin/orders")}>
        ← Quay lại
      </button>

    </div>
  );
}
