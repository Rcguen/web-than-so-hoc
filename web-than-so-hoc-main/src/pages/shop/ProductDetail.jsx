import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Page.css";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/products/${id}`);
    const data = await res.json();
    setProduct(data);
  };

  if (!product) return <p style={{ padding: 40 }}>Đang tải...</p>;

  return (
    <div className="product-detail-container">
      <div className="product-detail-box">

        {/* LEFT: IMAGE */}
        <div className="product-detail-image-box">
          <img
            src={`http://127.0.0.1:5000${product.image_url}`}
            alt={product.product_name}
          />
        </div>

        {/* RIGHT: INFO */}
        <div className="product-detail-info">
          <h2>{product.product_name}</h2>

          <p className="price">
            {product.price.toLocaleString()} đ
          </p>

          <p className="category">
            Danh mục: <span>{product.category_name || "Không có"}</span>
          </p>

          <p className="description">{product.description}</p>

          <button
  className="btn-add-cart"
  onClick={() => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existed = cart.find((item) => item.product_id === product.product_id);

    const priceNumber = Number(product.price); // ÉP KIỂU TẠI ĐÂY

    if (existed) {
      existed.qty += 1;
    } else {
      cart.push({
        ...product,
        price: priceNumber,  // GHI ĐÈ GIÁ THÀNH SỐ
        qty: 1
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Đã thêm vào giỏ hàng!");
  }}
>
  Thêm vào giỏ
</button>


        </div>

      </div>
    </div>
  );
}

export default ProductDetail;
