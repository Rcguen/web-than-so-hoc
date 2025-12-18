import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.log(err);
      alert("Không thể tải danh mục!");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteCategory = async (id) => {
    if (!window.confirm("Xóa danh mục này?")) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/api/admin/categories/${id}`);
      loadData();
    } catch {
      alert("Không xóa được danh mục!");
    }
  };

  if (loading) return <div>Đang tải danh mục...</div>;

  return (
    <div className="admin-content">
      <h1 className="page-title">Danh mục</h1>

      <Link className="btn-add" to="/admin/categories/create">
        + Thêm danh mục
      </Link>

      <table className="products-table" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên danh mục</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((c) => (
            <tr key={c.category_id}>
              <td>{c.category_id}</td>
              <td>{c.category_name}</td>
              <td>
                <Link
                  to={`/admin/categories/${c.category_id}`}
                  className="btn-edit"
                >
                  Sửa
                </Link>
                <button
                  onClick={() => deleteCategory(c.category_id)}
                  className="btn-delete"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
