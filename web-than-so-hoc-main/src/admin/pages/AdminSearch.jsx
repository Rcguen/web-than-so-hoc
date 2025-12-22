import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

export default function AdminSearch() {
  const [params] = useSearchParams();
  const q = params.get("q");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!q) return;
    axios.get(`http://127.0.0.1:5000/api/admin/search?q=${q}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }).then(res => setData(res.data));
  }, [q]);

  if (!data) return <p>Đang tìm kiếm...</p>;

  return (
    <div>
      <h2>Kết quả tìm kiếm: "{q}"</h2>

      <h3>🛒 Sản phẩm</h3>
      {data.products.map(p => (
        <div key={p.product_id}>
          <Link to={`/admin/products/${p.product_id}`}>
            {p.product_name}
          </Link>
        </div>
      ))}

      <h3>📦 Đơn hàng</h3>
      {data.orders.map(o => (
        <div key={o.order_id}>
          <Link to={`/admin/orders/${o.order_id}`}>
            Đơn #{o.order_id} – {o.total_price}đ
          </Link>
        </div>
      ))}

      <h3>👤 Người dùng</h3>
      {data.users.map(u => (
        <div key={u.user_id}>{u.email}</div>
      ))}
    </div>
  );
}
