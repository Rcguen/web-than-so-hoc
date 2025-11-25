import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminCategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      axios
        .get(`http://127.0.0.1:5000/api/admin/categories`)
        .then((res) => {
          const cate = res.data.categories.find((x) => x.category_id == id);
          if (cate) setName(cate.category_name);
        });
    }
  }, [id, isEdit]);

  const save = async () => {
    if (!name.trim()) return alert("Tên danh mục không được để trống");

    try {
      if (isEdit) {
        await axios.put(
          `http://127.0.0.1:5000/api/admin/categories/${id}`,
          { category_name: name }
        );
      } else {
        await axios.post(
          "http://127.0.0.1:5000/api/admin/categories",
          { category_name: name }
        );
      }

      navigate("/admin/categories");
    } catch (err) {
      console.log(err);
      alert("Không lưu được danh mục!");
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-detail-page">
        <h1 className="page-title">
          {isEdit ? "Sửa danh mục" : "Thêm danh mục"}
        </h1>

        <div className="product-form">
          <label>Tên danh mục</label>
          <input
            type="text"
            placeholder="Nhập tên danh mục..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="form-actions">
            <button className="btn-save" onClick={save}>
              Lưu
            </button>
            <button
              className="btn-back"
              onClick={() => navigate("/admin/categories")}
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
