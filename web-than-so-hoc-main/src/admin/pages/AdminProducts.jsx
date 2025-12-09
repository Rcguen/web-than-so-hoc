import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./admin.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/products");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.products || [];
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert("Không thể tải danh sách sản phẩm!");
    } finally {
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
            <th>Số lượng</th>
            <th>Kho hàng</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan="9" style={{ textAlign: "center", padding: 20 }}>
                Chưa có sản phẩm nào.
              </td>
            </tr>
          )}

          {products.map((p) => (
            <tr key={p.product_id}>
              <td>{p.product_id}</td>

              <td>
                {p.image_url ? (
                  <img
                    src={`http://127.0.0.1:5000${p.image_url}`}
                    alt={p.product_name}
                    className="product-thumb"
                  />
                ) : (
                  <span className="no-image">No image</span>
                )}
              </td>

              <td>{p.product_name}</td>
              <td>{Number(p.price).toLocaleString()} đ</td>
              <td>{p.category_name || "—"}</td>

              <td>
                <button
                  className={`status-btn ${p.is_active ? "active" : "inactive"}`}
                  onClick={() => toggleStatus(p.product_id)}
                >
                  {p.is_active ? "Hiện" : "Ẩn"}
                </button>
              </td>

              <td>{p.quantity}</td>
              <td>{p.stock}</td>

              <td>
                <Link
                  className="btn-edit"
                  to={`/admin/products/${p.product_id}`}
                >
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
