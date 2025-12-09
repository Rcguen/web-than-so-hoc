import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Page.css";

function Shop() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  // ---------------------------
  // LOAD CATEGORY
  // ---------------------------
  const loadCategories = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Load categories error", err);
    }
  };

  // ---------------------------
  // LOAD PRODUCTS
  // ---------------------------
  const loadProducts = async (category_id = "all") => {
    try {
      let url = "http://127.0.0.1:5000/api/products";
      if (category_id !== "all") {
        url = `http://127.0.0.1:5000/api/products/category/${category_id}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      alert("Không tải được sản phẩm!");
      console.log(err);
    }
  };

  // ---------------------------
  // ADD TO CART
  // ---------------------------
  const addToCart = (p) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");

    let found = cart.find((item) => item.product_id === p.product_id);

    if (found) {
      found.qty += 1;
    } else {
      cart.push({
        product_id: p.product_id,
        product_name: p.product_name,
        price: p.price,
        qty: 1,
        image_url: p.image_url,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="shop-container" style={{ padding: "80px 40px" }}>
      <h1 style={{ textAlign: "center", color: "#5b03e4" }}>🛍 Cửa Hàng</h1>

      {/* CATEGORY FILTER */}
      <div
        className="category-filter"
        style={{ display: "flex", gap: "15px", margin: "30px 0" }}
      >
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
            {cat.category_name}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
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
            <Link to={`/product/${prod.product_id}`}>
              <img
                src={`http://127.0.0.1:5000${prod.image_url}`}
                alt={prod.product_name}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </Link>

            <h3 style={{ marginTop: "10px" }}>{prod.product_name}</h3>

            <p style={{ color: "#5b03e4", fontWeight: "bold" }}>
              {Number(prod.price).toLocaleString()} đ
            </p>

            {/* BUTTONS */}
            <div className="product-actions" style={{ marginTop: "10px" }}>
              <Link to={`/product/${prod.product_id}`}>
                <button className="btn-view">Xem chi tiết</button>
              </Link>

              <button
                className="btn-add"
                style={{ marginLeft: "10px" }}
                onClick={() => addToCart(prod)}
              >
                Mua ngay 🛒
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
