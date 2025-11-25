import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../pages/admin.css";   // FIX

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/products");
      setProducts(res.data.products || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Không thể tải danh sách sản phẩm!");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const toggleStatus = async (product_id) => {
    try {
      await axios.put(
        `http://127.0.0.1:5000/api/admin/products/${product_id}/toggle`
      );
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Không thể thay đổi trạng thái!");
    }
  };

  if (loading)
    return <div className="admin-loading">Đang tải sản phẩm...</div>;

  return (
    <div className="admin-page">
      <h1 className="page-title">Sản phẩm</h1>

      <div className="top-actions">
        <Link to="/admin/products/add" className="btn-add">
          + Thêm sản phẩm
        </Link>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Hình</th>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Danh mục</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.product_id}>
              <td>{p.product_id}</td>
              <td><img src={p.image_url} alt={p.product_name} className="product-thumb" /></td>
              <td>{p.product_name}</td>
              <td>{Number(p.price).toLocaleString()} đ</td>
              <td>{p.category_name}</td>

              <td>
                <button
                  className={`status-btn ${p.is_active ? "active" : "inactive"}`}
                  onClick={() => toggleStatus(p.product_id)}
                >
                  {p.is_active ? "Hiện" : "Ẩn"}
                </button>
              </td>

              <td>
                <Link className="btn-edit" to={`/admin/products/${p.product_id}`}>
                  Sửa
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
