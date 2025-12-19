import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function RelatedProducts({ productId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!productId) return;

    axios
      .get(`http://127.0.0.1:5000/api/products/${productId}/related`)
      .then((res) => setItems(res.data || []))
      .catch((err) => console.error("Related products error:", err));
  }, [productId]);

  if (!items.length) return null;

  return (
    <div style={{ marginTop: 60 }}>
      <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 25 }}>
        🔗 Sản phẩm liên quan
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 25,
        }}
      >
        {items.map((p) => (
          <Link
            key={p.product_id}
            to={`/product/${p.product_id}`}
            style={{
              textDecoration: "none",
              color: "#333",
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
              transition: "transform 0.2s",
            }}
          >
            <img
              src={
                p.image_url
                  ? `http://127.0.0.1:5000${p.image_url}`
                  : "https://via.placeholder.com/300x300"
              }
              alt={p.product_name}
              style={{
                width: "100%",
                height: 220,
                objectFit: "cover",
              }}
            />
            <div style={{ padding: 15 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: 6,
                  lineHeight: 1.3,
                }}
              >
                {p.product_name}
              </div>
              <div style={{ color: "#7a00ff", fontWeight: 800 }}>
                {Number(p.price).toLocaleString("vi-VN")} đ
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
