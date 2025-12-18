import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
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
    fetchProducts();
  }, []);

  if (loading) return <div className="admin-loading">Đang tải sản phẩm...</div>;

  return (
    <div className="products-page">
      <h1 className="page-title">Sản phẩm</h1>

      <table className="products-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Danh mục</th>
            <th>Hình</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan="6" className="no-data">Không có sản phẩm nào</td></tr>
          ) : (
            products.map((p) => (
              <tr key={p.product_id}>
                <td>{p.product_id}</td>
                <td>{p.product_name}</td>
                <td>{p.price.toLocaleString()} đ</td>
                <td>{p.category_name}</td>
                <td>
                  <img src={p.image_url} alt="" width="60" />
                </td>
                <td>
                  <Link className="view-btn" to={`/admin/products/${p.product_id}`}>Sửa</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
