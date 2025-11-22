import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function OrderDetail() {
  const { order_id } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/admin/orders/${order_id}`
      );

      setOrder(res.data.order);
      setItems(res.data.items);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Không thể tải chi tiết đơn hàng!");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, []);

  const formatDate = (d) => new Date(d).toLocaleString("vi-VN");

  if (loading) return <div className="admin-loading">Đang tải dữ liệu...</div>;

  return (
    <div className="order-detail-page">
      <h1 className="page-title">Chi tiết đơn hàng #{order.order_id}</h1>

      {/* THÔNG TIN KHÁCH HÀNG */}
      <div className="order-info-box">
        <h2>Thông tin khách hàng</h2>
        <p><b>Họ tên:</b> {order.customer_name}</p>
        <p><b>SĐT:</b> {order.customer_phone}</p>
        <p><b>Địa chỉ:</b> {order.customer_address}</p>
        <p><b>Ghi chú:</b> {order.note || "Không có"}</p>
        <p><b>Ngày đặt:</b> {formatDate(order.created_at)}</p>
        <p><b>Trạng thái:</b> {order.order_status}</p>
      </div>

      {/* DANH SÁCH SẢN PHẨM */}
      <div className="order-items-box">
        <h2>Sản phẩm</h2>

        <table className="order-items-table">
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
            {items.map((i) => (
              <tr key={i.order_item_id}>
                <td>
                  <img
                    src={i.image_url}
                    alt=""
                    style={{ width: 60, borderRadius: 8 }}
                  />
                </td>
                <td>{i.product_name}</td>
                <td>{Number(i.price).toLocaleString()} đ</td>
                <td>{i.quantity}</td>
                <td>
                  {(i.price * i.quantity).toLocaleString()} đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="order-total">
          Tổng đơn: {Number(order.total_price).toLocaleString()} đ
        </h2>
      </div>
    </div>
  );
}
