import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/admin/orders/${id}`);
      setOrder(res.data.order);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Không thể tải chi tiết đơn hàng!");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  const updateStatus = async (newStatus) => {
    try {
      await axios.post(`http://127.0.0.1:5000/api/admin/orders/${id}/status`, {
        status: newStatus,
      });
      alert("Cập nhật trạng thái thành công!");
      fetchOrder();
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại!");
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (!order) return <p>Không tìm thấy đơn hàng.</p>;

  return (
    <div className="order-detail-page">
      <h1 className="page-title">Chi tiết đơn hàng #{order.order_id}</h1>

      <div className="order-info-card">
        <h3>Thông tin khách hàng</h3>
        <p><strong>Tên:</strong> {order.fullname}</p>
        <p><strong>SĐT:</strong> {order.phone}</p>
        <p><strong>Địa chỉ:</strong> {order.address}</p>
        <p><strong>Ghi chú:</strong> {order.notes || "Không có"}</p>
        <p><strong>Ngày đặt:</strong> {new Date(order.created_at).toLocaleString("vi-VN")}</p>
      </div>

      <h3>Sản phẩm trong đơn</h3>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Giá</th>
            <th>SL</th>
            <th>Tạm tính</th>
          </tr>
        </thead>

        <tbody>
          {order.items.map((item) => (
            <tr key={item.order_item_id}>
              <td>{item.product_name}</td>
              <td>{item.price.toLocaleString()} đ</td>
              <td>{item.quantity}</td>
              <td>{(item.price * item.quantity).toLocaleString()} đ</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="total-box">
        <h2>Tổng cộng: {order.total_price.toLocaleString()} đ</h2>
      </div>

      <h3>Trạng thái đơn hàng</h3>
      <select
        value={order.order_status}
        onChange={(e) => updateStatus(e.target.value)}
      >
        <option value="pending">Chờ xử lý</option>
        <option value="processing">Đang xử lý</option>
        <option value="shipping">Đang giao</option>
        <option value="completed">Hoàn thành</option>
      </select>
    </div>
  );
}
