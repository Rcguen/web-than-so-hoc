import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function Shop() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("none"); // none | price_asc | price_desc

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  /* ================= LOAD CATEGORY ================= */
  const loadCategories = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load categories error", err);
    }
  };

  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = async (category_id = "all") => {
    try {
      let url = "http://127.0.0.1:5000/api/products";
      if (category_id !== "all") {
        url = `http://127.0.0.1:5000/api/products/category/${category_id}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      alert("Không tải được sản phẩm!");
    }
  };

  /* ================= ADD TO CART ================= */
  const addToCart = (p) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const found = cart.find((i) => i.product_id === p.product_id);

    if (found) found.qty += 1;
    else {
      cart.push({
        product_id: p.product_id,
        product_name: p.product_name,
        price: p.price,
        qty: 1,
        image_url: p.image_url,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    alert("🛒 Đã thêm vào giỏ hàng!");
  };

  /* ================= FILTER + SORT ================= */
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // SEARCH
    if (search.trim()) {
      const key = search.toLowerCase();
      list = list.filter((p) =>
        p.product_name.toLowerCase().includes(key)
      );
    }

    // SORT
    if (sort === "price_asc") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sort === "price_desc") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return list;
  }, [products, search, sort]);

  return (
    <div className="shop-page">
      <style>{`
        .shop-page {
          padding: 120px 30px 60px;
          background: #f8f9fa;
          min-height: 100vh;
          font-family: 'Segoe UI', sans-serif;
        }

        .shop-title {
          text-align: center;
          font-size: 34px;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .shop-title span { color: #7a00ff; }

        .shop-desc {
          text-align: center;
          color: #666;
          margin-bottom: 35px;
        }

        /* TOOLBAR */
        .shop-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .search-box {
          flex: 1;
          max-width: 320px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 50px;
          border: 1px solid #ddd;
          outline: none;
        }

        .sort-select {
          padding: 12px 18px;
          border-radius: 50px;
          border: 1px solid #ddd;
          cursor: pointer;
        }

        /* CATEGORY */
        .category-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-bottom: 35px;
        }

        .category-btn {
          padding: 10px 22px;
          border-radius: 50px;
          border: 2px solid #eee;
          background: #fff;
          font-weight: 600;
          cursor: pointer;
        }

        .category-btn.active {
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          color: #fff;
          border-color: transparent;
        }

        /* GRID */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 30px;
        }

        .product-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
          transition: 0.25s;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.12);
        }

        .product-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
        }

        .product-body {
          padding: 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-name {
          font-weight: 700;
          margin-bottom: 8px;
          flex: 1;
        }

        .product-price {
          font-size: 18px;
          font-weight: 800;
          color: #7a00ff;
          margin-bottom: 12px;
        }

        .product-actions {
          display: flex;
          gap: 10px;
        }

        .btn-view, .btn-add {
          flex: 1;
          padding: 10px;
          border-radius: 50px;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-view {
          background: #f2ecff;
          color: #7a00ff;
        }

        .btn-add {
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          color: #fff;
        }
          .badge-out {
  position: absolute;
  top: 14px;
  left: 14px;
  background: #ff4d4f;
  color: #fff;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 10px;
  z-index: 2;
}

      `}</style>

      <h1 className="shop-title">
        🛍 <span>Cửa Hàng</span>
      </h1>
      <p className="shop-desc">
        Tìm kiếm và sắp xếp sản phẩm theo nhu cầu của bạn
      </p>

      {/* TOOLBAR */}
      <div className="shop-toolbar">
        <p style={{ margin: "10px 0 25px", color: "#666" }}>
  Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm
</p>

        <div className="search-box">
          <input
            className="search-input"
            placeholder="🔍 Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="none">Sắp xếp</option>
          <option value="price_asc">Giá: Thấp → Cao</option>
          <option value="price_desc">Giá: Cao → Thấp</option>
        </select>
      </div>

      {/* CATEGORY */}
      <div style={{ display: "flex", gap: 15, justifyContent: "center", marginBottom: 30 }}>
  <select
    className="sort-select"
    value={activeCategory}
    onChange={(e) => {
      const val = e.target.value;
      setActiveCategory(val);
      loadProducts(val);
    }}
  >
    <option value="all">Tất cả danh mục</option>
    {categories.map((cat) => (
      <option key={cat.category_id} value={cat.category_id}>
        {cat.category_name}
      </option>
    ))}
  </select>
</div>


      {/* PRODUCT GRID */}
      <div className="product-grid">
        {filteredProducts.map((prod) => (
          <div className="product-card" key={prod.product_id}>
            {prod.quantity <= 0 && (
  <div className="badge-out">Hết hàng</div>
)}

            <Link to={`/product/${prod.product_id}`}>
              <img
                src={`http://127.0.0.1:5000${prod.image_url}`}
                alt={prod.product_name}
                className="product-img"
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/300x300")
                }
              />
            </Link>

            <div className="product-body">
              <div className="product-name">{prod.product_name}</div>
              <div className="product-price">
                {Number(prod.price).toLocaleString("vi-VN")} đ
              </div>
              <p
  style={{
    fontSize: "13px",
    marginBottom: "10px",
    color: prod.quantity > 0 ? "#28a745" : "#ff4d4f",
    fontWeight: 700,
  }}
>
  {prod.quantity > 0
    ? `Còn ${prod.quantity} sản phẩm`
    : "Hết hàng"}
</p>


              <div className="product-actions">
                <Link to={`/product/${prod.product_id}`} style={{ flex: 1 }}>
                  <button className="btn-view">Xem</button>
                </Link>
                <button
  className="btn-add"
  disabled={prod.quantity <= 0}
  onClick={() => addToCart(prod)}
  style={{
    opacity: prod.quantity <= 0 ? 0.6 : 1,
    cursor: prod.quantity <= 0 ? "not-allowed" : "pointer",
  }}
>
  {prod.quantity > 0 ? "Mua" : "Hết hàng"}
</button>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
