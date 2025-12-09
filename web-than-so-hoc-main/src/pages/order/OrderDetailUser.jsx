import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function OrderDetailUser() {
  const { order_id } = useParams();
  const [data, setData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch(
      `http://127.0.0.1:5000/api/orders/user/${user.user_id}/${order_id}`
    )
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) return <p>Đang tải...</p>;

  return (
    <div style={{ padding: "80px" }}>
      <h1>Chi tiết đơn #{order_id}</h1>

      <p>Trạng thái: {data.order.order_status}</p>
      <p>Tổng tiền: {Number(data.order.total_price).toLocaleString()} đ</p>

      <h2>Sản phẩm</h2>

      {data.items.map((item) => (
        <div key={item.order_item_id} className="order-item">
          <img
            src={`http://127.0.0.1:5000${item.image_url}`}
            alt=""
            style={{ width: "80px" }}
          />
          <div>
            <p>{item.product_name}</p>
            <p>Số lượng: {item.quantity}</p>
            <p>Giá: {Number(item.price).toLocaleString()} đ</p>
          </div>
        </div>
      ))}

      <Link to="/orders">
        <button className="back-btn">← Quay lại lịch sử đơn</button>
      </Link>
    </div>
  );
}

export default OrderDetailUser;
