import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import PaymentBadge from "../../components/PaymentBadge";
import AdminOrderStatusBadge from "../pages/AdminOrderStatusBadge";


export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const location = useLocation();

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/orders");
      console.log("Orders:", res.data.orders); // DEBUG
      setOrders(res.data.orders || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Không thể tải danh sách đơn hàng!");
    }
  };

  useEffect(() => {
  fetchOrders();

  const params = new URLSearchParams(location.search);
  if (params.get("paid") === "1") {
    // optional: toast cho admin
    // toast.success("Đơn hàng đã được thanh toán!");
  }
}, [location.search]);


  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  const filteredOrders = orders.filter((o) =>
    statusFilter === "all" ? true : o.order_status === statusFilter
  );

  if (loading) return <div className="admin-loading">Đang tải đơn hàng...</div>;

  return (
    <div className="orders-page">
      <h1 className="page-title">Đơn Hàng</h1>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Hoàn thành</option>
        </select>
      </div>

      {/* Bảng đơn hàng */}
      <table className="orders-table">
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
              <td colSpan="7" className="no-data">Không có đơn hàng nào.</td>
            </tr>
          ) : (
            filteredOrders.map((order) => (
              <tr key={order.order_id}>
                <td># {order.order_id}</td>
                <td>{order.customer_name}</td>
                <td>{order.customer_phone}</td>
                <td>{order.total_price.toLocaleString()} đ</td>

                {/* TRẠNG THÁI — ALWAYS SHOW */}
                <td>
  <AdminOrderStatusBadge
    status={order.order_status}
    orderId={order.order_id}
    onUpdated={(newStatus) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === order.order_id
            ? { ...o, order_status: newStatus }
            : o
        )
      );
    }}
  />
</td>


                <td>{formatDate(order.created_at)}</td>
                <td>
                  <Link className="view-btn" to={`/admin/orders/${order.order_id}`}>
                    Xem
                  </Link>
                </td>
                {/* Thanh toán trạng thái */}
                <td>
  <PaymentBadge
    status={order.payment_status}
    orderId={order.order_id}
  />
</td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
