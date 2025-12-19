import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import RelatedProducts from "../../components/RelatedProducts";

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart() || {};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  /* ================= LOAD PRODUCT ================= */
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:5000/api/products/${id}`
        );
        setProduct(res.data || null);
      } catch (err) {
        console.error("Load product error:", err);
        toast.error("❌ Không tải được sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);

    try {
      if (typeof addToCart === "function") {
        addToCart(product);
      } else {
        // Fallback localStorage
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existed = cart.find(
          (item) => item.product_id === product.product_id
        );

        if (existed) {
          existed.qty += 1;
        } else {
          cart.push({
            product_id: product.product_id,
            product_name: product.product_name,
            price: product.price,
            qty: 1,
            image_url: product.image_url,
          });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
      }

      toast.success("🛒 Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Thêm vào giỏ hàng thất bại");
    } finally {
      setAdding(false);
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>Đang tải sản phẩm...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>Không tìm thấy sản phẩm!</h2>
        <Link
          to="/shop"
          style={{
            color: "#7a00ff",
            textDecoration: "none",
            marginTop: 10,
            fontWeight: 600,
          }}
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <div className="product-detail-page">
      <style>{`
        .product-detail-page {
          padding: 120px 20px 60px;
          background-color: #f8f9fa;
          min-height: 100vh;
          font-family: 'Segoe UI', sans-serif;
        }

        .detail-container {
          max-width: 1100px;
          margin: 0 auto;
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
          padding: 40px;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #666;
          text-decoration: none;
          font-weight: 600;
          margin-bottom: 30px;
        }
        .btn-back:hover { color: #7a00ff; }

        .detail-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
        }

        .img-wrapper {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #eee;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }

        .detail-img {
          width: 100%;
          transition: transform 0.5s;
        }
        .img-wrapper:hover .detail-img {
          transform: scale(1.05);
        }

        .info-wrapper h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 15px;
        }

        .price-tag {
          font-size: 28px;
          font-weight: 700;
          color: #7a00ff;
          margin-bottom: 25px;
        }

        .description {
          font-size: 16px;
          line-height: 1.8;
          color: #555;
          margin-bottom: 30px;
        }

        .add-cart-btn {
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          color: #fff;
          border: none;
          padding: 15px 40px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 20px rgba(122,0,255,0.3);
          transition: all 0.3s;
        }

        .add-cart-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .add-cart-btn:hover:not(:disabled) {
          transform: translateY(-3px);
        }

        @media (max-width: 991px) {
          .detail-content {
            grid-template-columns: 1fr;
          }
          .detail-container { padding: 20px; }
        }
      `}</style>

      <div className="detail-container">
        <Link to="/shop" className="btn-back">
          ⬅ Quay lại cửa hàng
        </Link>

        <div className="detail-content">
          <RelatedProducts productId={product.product_id} />

          {/* IMAGE */}
          <div className="img-wrapper">
            <img
              src={
                product.image_url
                  ? `http://127.0.0.1:5000${product.image_url}`
                  : "https://via.placeholder.com/500x500?text=No+Image"
              }
              alt={product.product_name}
              className="detail-img"
              onError={(e) =>
                (e.target.src =
                  "https://via.placeholder.com/500x500?text=No+Image")
              }
            />
          </div>

          {/* INFO */}
          <div className="info-wrapper">
            <h1>{product.product_name}</h1>
            <div className="price-tag">
              {Number(product.price).toLocaleString("vi-VN")} đ
            </div>

            <div className="description">
              <strong>Mô tả sản phẩm:</strong>
              <p>
                {product.description ||
                  "Chưa có mô tả cho sản phẩm này."}
              </p>
            </div>

            <button
              className="add-cart-btn"
              onClick={handleAddToCart}
              disabled={adding}
            >
              🛒 {adding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
