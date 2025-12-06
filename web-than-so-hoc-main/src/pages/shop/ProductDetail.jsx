import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);

  // === LOAD PRODUCT ===
  const loadProduct = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/products/${id}`);
    const data = await res.json();
    setProduct(data);
  };

  useEffect(() => {
    loadProduct();
  }, [id]); // fix warning

  if (!product) return <p>Đang tải...</p>;

  return (
    <div style={{ padding: "80px" }}>
      <div style={{ display: "flex", gap: "40px" }}>
        <img
          src={`http://127.0.0.1:5000${product.image_url}`}
          alt={product.product_name}
          style={{ width: "400px", borderRadius: "12px" }}
        />

        <div>
          <h1>{product.product_name}</h1>
          <p style={{ fontWeight: "bold", color: "#5b03e4" }}>
            {Number(product.price).toLocaleString()} đ
          </p>

          <p>{product.description}</p>

          <button className="btn-add-cart" onClick={() => addToCart(product)}>
  Thêm vào giỏ hàng
</button>

        </div>
      </div>
    </div>
  );
}
