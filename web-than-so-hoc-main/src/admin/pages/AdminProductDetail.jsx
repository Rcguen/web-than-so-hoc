import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../pages/admin.css";

export default function AdminProductDetail() {
  const { id } = useParams(); // id = "add" hoặc product_id
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    product_name: "",
    price: "",
    description: "",
    category_id: "",
    quantity: "",
    stock: "",
    image_url: "",
  });

  const [categories, setCategories] = useState([]); // FIXED
  const [imageFile, setImageFile] = useState(null);

  // ===== LOAD CATEGORY LIST =====
  const loadCategories = async () => {
    const res = await axios.get("http://127.0.0.1:5000/api/admin/categories");
    setCategories(res.data.categories || []); // FIXED
  };

  // ===== LOAD PRODUCT (ONLY WHEN EDIT) =====
  const loadProduct = async () => {
    if (id === "add") return; // tạo mới không load API

    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/admin/products/${id}`
      );
      setProduct(res.data || {});
    } catch (err) {
      console.error(err);
      alert("Không tải được sản phẩm!");
    }
  };

  useEffect(() => {
    loadCategories();
    loadProduct();
  }, []);

  // ===== SAVE PRODUCT =====
  const saveProduct = async () => {
    const form = new FormData();
    form.append("product_name", product.product_name);
    form.append("price", product.price);
    form.append("description", product.description || "");
    form.append("category_id", product.category_id);
    form.append("quantity", product.quantity);
    form.append("stock", product.stock);

    if (imageFile) form.append("image", imageFile);

    try {
      if (id === "add") {
        await axios.post("http://127.0.0.1:5000/api/admin/products", form);
      } else {
        await axios.put(
          `http://127.0.0.1:5000/api/admin/products/${id}`,
          form
        );
      }

      alert("Lưu sản phẩm thành công!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Không thể lưu sản phẩm!");
    }
  };

  return (
    <div className="admin-page">
      <h1 className="page-title">
        {id === "add" ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}
      </h1>

      <div className="form-box">

        <label>Tên sản phẩm</label>
        <input
          type="text"
          value={product.product_name}
          onChange={(e) => setProduct({ ...product, product_name: e.target.value })}
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
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
        ></textarea>

        <label>Danh mục</label>
        <select
          value={product.category_id || ""}
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

        <label>Số lượng đang bán</label>
        <input
          type="number"
          value={product.quantity}
          onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
        />

        <label>Kho hàng</label>
        <input
          type="number"
          value={product.stock}
          onChange={(e) => setProduct({ ...product, stock: e.target.value })}
        />

        <label>Hình ảnh</label>
        <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />

        {product.image_url && (
          <img
            src={`http://127.0.0.1:5000${product.image_url}`}
            alt="preview"
            className="preview-img"
          />
        )}

        <button className="btn-save" onClick={saveProduct}>
          Lưu sản phẩm
        </button>
      </div>
    </div>
  );
}
