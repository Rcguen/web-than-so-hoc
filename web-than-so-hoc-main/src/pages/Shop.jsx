import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Shop.css";

function Shop() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    loadCategories();
    loadProducts(); // load all products
  }, []);

  // Load categories
  const loadCategories = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  // Load products (all or by category)
  const loadProducts = async (category_id = "all") => {
    let url = "http://127.0.0.1:5000/api/products";

    if (category_id !== "all") {
      url = `http://127.0.0.1:5000/api/products/category/${category_id}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    setProducts(data);
  };

  return (
    <div className="shop-container" style={{ padding: "80px 40px" }}>
      <h1 style={{ textAlign: "center", color: "#5b03e4" }}>🛍 Cửa Hàng</h1>

      {/* CATEGORY FILTER */}
      <div className="category-filter" style={{ display: "flex", gap: "15px", margin: "30px 0" }}>
        <button
          className={`category-btn ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => {
            setActiveCategory("all");
            loadProducts("all");
          }}
        >
          Tất cả
        </button>

        {categories.map((cat) => (
          <button
            key={cat.category_id}
            className={`category-btn ${
              activeCategory === cat.category_id ? "active" : ""
            }`}
            onClick={() => {
              setActiveCategory(cat.category_id);
              loadProducts(cat.category_id);
            }}
          >
            {cat.category_name}   {/* FIXED */}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "25px",
        }}
      >
        {products.map((prod) => (
          <div
            key={prod.product_id}
            className="product-card"
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "15px",
              textAlign: "center",
              background: "#fff",
              boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
            }}
          >
            <img
              src={`http://127.0.0.1:5000${prod.image_url}`}  // FIXED
              alt={prod.product_name}                         // FIXED
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />

            <h3 style={{ marginTop: "10px" }}>{prod.product_name}</h3> {/* FIXED */}
            <p style={{ color: "#5b03e4", fontWeight: "bold" }}>
              {prod.price.toLocaleString()} đ
            </p>

            <Link to={`/product/${prod.product_id}`}>
              <button className="btn-view">Xem chi tiết</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
