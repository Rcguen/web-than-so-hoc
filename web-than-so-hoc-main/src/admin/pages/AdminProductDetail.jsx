import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./admin.css";

export default function AdminProductDetail() {
  const { id } = useParams();            // id = "add" hoặc "123"
  const navigate = useNavigate();

  const isEdit = id && id !== "add";     // xác định thêm hay sửa

  const [product, setProduct] = useState({
    product_name: "",
    price: "",
    description: "",
    category_id: "",
    quantity: "",
    stock: "",
    image_url: "",
  });

  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  // ------------------------------
  // LOAD DANH MỤC + LOAD SẢN PHẨM
  // ------------------------------
  useEffect(() => {
    loadCategories();
    if (isEdit) loadProduct();
  }, [isEdit, id]);

  // Load categories
  const loadCategories = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Không tải được danh mục!");
    }
  };

  // Load product khi edit
  const loadProduct = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/admin/products/${id}`
      );
      if (res.data) setProduct(res.data);
    } catch (err) {
      console.error(err);
      alert("Không tải được sản phẩm!");
    }
  };

  // ------------------------------
  // SUBMIT FORM
  // ------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate số lượng
    if (Number(product.quantity) < 0 || Number(product.stock) < 0) {
      alert("Số lượng hoặc kho không hợp lệ!");
      return;
    }

    const formData = new FormData();
    Object.keys(product).forEach((key) => formData.append(key, product[key]));
    if (imageFile) formData.append("image", imageFile);

    try {
      if (isEdit) {
        // UPDATE
        await axios.put(
          `http://127.0.0.1:5000/api/admin/products/${id}`,
          formData
        );
        alert("Cập nhật sản phẩm thành công!");
      } else {
        // CREATE
        await axios.post("http://127.0.0.1:5000/api/admin/products", formData);
        alert("Thêm sản phẩm thành công!");
      }

      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu sản phẩm!");
    }
  };

  return (
    <div className="admin-page">
      <h1 className="page-title">
        {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
      </h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        {/* Tên sản phẩm */}
        <label>Tên sản phẩm</label>
        <input
          type="text"
          required
          value={product.product_name}
          onChange={(e) =>
            setProduct({ ...product, product_name: e.target.value })
          }
        />

        {/* Giá */}
        <label>Giá</label>
        <input
          type="number"
          required
          value={product.price}
          onChange={(e) => setProduct({ ...product, price: e.target.value })}
        />

        {/* Danh mục */}
        <label>Danh mục</label>
        <select
          required
          value={product.category_id}
          onChange={(e) =>
            setProduct({ ...product, category_id: e.target.value })
          }
        >
          <option value="">-- Chọn danh mục --</option>
          {Array.isArray(categories) &&
            categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
        </select>

        {/* Mô tả */}
        <label>Mô tả</label>
        <textarea
          rows="4"
          value={product.description}
          onChange={(e) =>
            setProduct({ ...product, description: e.target.value })
          }
        />

        {/* Số lượng đang bán */}
        <label>Số lượng hiển thị (quantity)</label>
        <input
          type="number"
          value={product.quantity}
          onChange={(e) =>
            setProduct({ ...product, quantity: Number(e.target.value) })
          }
        />

        {/* Tồn kho */}
        <label>Tồn kho (stock)</label>
        <input
          type="number"
          value={product.stock}
          onChange={(e) =>
            setProduct({ ...product, stock: Number(e.target.value) })
          }
        />

        {/* Ảnh */}
        <label>Hình ảnh</label>
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />

        {product.image_url && (
          <img
            src={`http://127.0.0.1:5000${product.image_url}`}
            alt="preview"
            className="preview-img"
          />
        )}

        <button type="submit" className="btn-save">
          {isEdit ? "Cập nhật" : "Thêm sản phẩm"}
        </button>
      </form>
    </div>
  );
}
