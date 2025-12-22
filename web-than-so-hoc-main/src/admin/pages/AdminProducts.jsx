import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./admin.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({}); // { product_id: true }
  const [editVals, setEditVals] = useState({}); // { product_id: { quantity, stock } }
  const [keyword, setKeyword] = useState("");

  const loadProducts = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/products");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.products || [];
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(p =>
    p.product_name.toLowerCase().includes(keyword.toLowerCase())
  );
  const toggleStatus = async (product_id) => {
    try {
      await axios.put(
        `http://127.0.0.1:5000/api/admin/products/${product_id}/toggle`
      );
      loadProducts();
      toast.success("Đã thay đổi trạng thái");
    } catch (err) {
      console.error(err);
      toast.error("Không thể thay đổi trạng thái!");
    }
  };

  const startEdit = (p) => {
    setEditing((s) => ({ ...s, [p.product_id]: true }));
    setEditVals((s) => ({ ...s, [p.product_id]: { quantity: p.quantity ?? 0, stock: p.stock ?? 0 } }));
  };

  const cancelEdit = (product_id) => {
    setEditing((s) => ({ ...s, [product_id]: false }));
    setEditVals((s) => {
      const ns = { ...s };
      delete ns[product_id];
      return ns;
    });
  };

  const onChangeVal = (product_id, field, value) => {
    setEditVals((s) => ({ ...s, [product_id]: { ...(s[product_id] || {}), [field]: value } }));
  };

  const saveInventory = async (product_id) => {
    const vals = editVals[product_id];
    if (!vals) return;
    const qty = parseInt(vals.quantity || 0, 10);
    const stock = parseInt(vals.stock || 0, 10);

    if (isNaN(qty) || isNaN(stock) || qty < 0 || stock < 0) {
      toast.error("Số lượng/tồn kho phải là số nguyên không âm");
      return;
    }
    if (stock > 0 && qty > stock) {
      toast.error("Số lượng không được lớn hơn tồn kho");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://127.0.0.1:5000/api/admin/products/${product_id}/inventory`,
        { quantity: qty, stock },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      toast.success("Cập nhật thành công");
      cancelEdit(product_id);
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  if (loading)
    return <div className="admin-loading">Đang tải sản phẩm...</div>;

  return (
    <div className="admin-page">
      <h1 className="page-title">Sản phẩm</h1>
      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="🔍 Tìm sản phẩm theo tên..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
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
          {filtered.length === 0 && (
            <tr>
              <td colSpan="9" style={{ textAlign: "center", padding: 20 }}>
                Chưa có sản phẩm nào.
              </td>
            </tr>
          )}

          {filtered.map((p) => (
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

              <td>
                {editing[p.product_id] ? (
                  <input
                    type="number"
                    min={0}
                    value={editVals[p.product_id]?.quantity ?? 0}
                    onChange={(e) => onChangeVal(p.product_id, "quantity", e.target.value)}
                    className="small-input"
                  />
                ) : (
                  p.quantity
                )}
              </td>

              <td>
                {editing[p.product_id] ? (
                  <input
                    type="number"
                    min={0}
                    value={editVals[p.product_id]?.stock ?? 0}
                    onChange={(e) => onChangeVal(p.product_id, "stock", e.target.value)}
                    className="small-input"
                  />
                ) : (
                  p.stock
                )}
              </td>

              <td>
                {editing[p.product_id] ? (
                  <>
                    <button className="btn-save" onClick={() => saveInventory(p.product_id)}>Lưu</button>
                    <button className="btn-cancel" onClick={() => cancelEdit(p.product_id)}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button className="btn-edit" onClick={() => startEdit(p)}>Sửa số lượng</button>
                    <Link className="btn-edit" to={`/admin/products/${p.product_id}`}>Sửa</Link>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
