import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./admin.css"; // nếu có css admin

export default function AdminProductDetail() {
  const { id } = useParams();
  const isEdit = id !== "new";
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    product_name: "",
    price: "",
    description: "",
    category_id: "",
    image: null,
  });

  const [categories, setCategories] = useState([]);

  // Load danh mục
  const loadCategories = async () => {
    const res = await axios.get("http://127.0.0.1:5000/api/categories");
    setCategories(res.data.categories || []);
  };

  // Load sản phẩm nếu đang EDIT
  const loadProduct = async () => {
    if (!isEdit) return;

    const res = await axios.get(
      `http://127.0.0.1:5000/api/admin/products/${id}`
    );
    setProduct({
      product_name: res.data.product.product_name,
      price: res.data.product.price,
      description: res.data.product.description,
      category_id: res.data.product.category_id,
      image_url: res.data.product.image_url, // ảnh cũ
    });
  };

  useEffect(() => {
    loadCategories();
    loadProduct();
  }, []);

  // Xử lý chọn file
  const handleFileChange = (e) => {
    setProduct({ ...product, image: e.target.files[0] });
  };

  // LƯU SẢN PHẨM (Add hoặc Edit)
  const saveProduct = async () => {
    const formData = new FormData();

    formData.append("product_name", product.product_name);
    formData.append("price", product.price);
    formData.append("description", product.description);
    formData.append("category_id", product.category_id);

    if (product.image) formData.append("image", product.image);

    if (isEdit) {
      await axios.put(
        `http://127.0.0.1:5000/api/admin/products/${id}`,
        formData
      );
      alert("Cập nhật sản phẩm thành công!");
    } else {
      await axios.post(
        "http://127.0.0.1:5000/api/admin/products",
        formData
      );
      alert("Thêm sản phẩm thành công!");
    }

    navigate("/admin/products");
  };

  // Xóa sản phẩm
  const deleteProduct = async () => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;

    await axios.delete(`http://127.0.0.1:5000/api/admin/products/${id}`);

    alert("Đã xóa sản phẩm.");
    navigate("/admin/products");
  };

  return (
    <div className="admin-detail-page">
      <h1 className="page-title">
        {isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}
      </h1>

      <div className="product-form">

        <label>Tên sản phẩm</label>
        <input
          type="text"
          value={product.product_name}
          onChange={(e) =>
            setProduct({ ...product, product_name: e.target.value })
          }
        />

        <label>Giá</label>
        <input
          type="number"
          value={product.price}
          onChange={(e) => setProduct({ ...product, price: e.target.value })}
        />

        <label>Mô tả</label>
        <textarea
          value={product.description}
          onChange={(e) =>
            setProduct({ ...product, description: e.target.value })
          }
        />

        <label>Danh mục</label>
        <select
          value={product.category_id}
          onChange={(e) =>
            setProduct({ ...product, category_id: e.target.value })
          }
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.category_name}
            </option>
          ))}
        </select>

        <label>Hình ảnh</label>
        <input type="file" onChange={handleFileChange} />

        {product.image_url && (
          <img
            src={`http://127.0.0.1:5000/${product.image_url}`}
            alt=""
            style={{ width: 150, marginTop: 10, borderRadius: 10 }}
          />
        )}

        <div className="form-actions">
          <button className="btn-save" onClick={saveProduct}>
            {isEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </button>

          {isEdit && (
            <button className="btn-delete" onClick={deleteProduct}>
              Xóa sản phẩm
            </button>
          )}

          <button
            className="btn-back"
            onClick={() => navigate("/admin/products")}
          >
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
