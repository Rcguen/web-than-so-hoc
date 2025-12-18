import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart() || {}; // Lấy hàm addToCart từ Context nếu có

  const loadProduct = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/products/${id}`);
      setProduct(res.data || null);
    } catch (err) {
      console.error("Load product error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    // Nếu có Context thì dùng Context, không thì dùng logic local
    if (addToCart) {
      addToCart(product);
      toast.success("🛒 Đã thêm vào giỏ hàng!");
    } else {
      // Fallback logic cũ nếu chưa setup Context hoàn chỉnh
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existed = cart.find((item) => item.product_id === product.product_id);
      if (existed) {
        existed.qty += 1;
      } else {
        cart.push({
          product_id: product.product_id,
          product_name: product.product_name,
          price: product.price,
          qty: 1,
          image_url: product.image_url
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("🛒 Đã thêm vào giỏ hàng!");
    }
  };

  if (loading) return (
    <div style={{minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <h2>Đang tải sản phẩm...</h2>
    </div>
  );

  if (!product) return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <h2>Không tìm thấy sản phẩm!</h2>
      <Link to="/shop" style={{color: '#7a00ff', textDecoration: 'none', marginTop: '10px'}}>Quay lại cửa hàng</Link>
    </div>
  );

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
          position: relative;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #666;
          text-decoration: none;
          font-weight: 600;
          margin-bottom: 30px;
          transition: color 0.2s;
        }
        .btn-back:hover { color: #7a00ff; }

        .detail-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: start;
        }

        /* Phần ảnh bên trái */
        .img-wrapper {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #eee;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .detail-img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.5s ease;
        }
        .img-wrapper:hover .detail-img {
          transform: scale(1.05);
        }

        /* Phần thông tin bên phải */
        .info-wrapper h1 {
          font-size: 32px;
          font-weight: 800;
          color: #333;
          margin-bottom: 15px;
          line-height: 1.2;
        }

        .price-tag {
          font-size: 28px;
          color: #d82d8b;
          font-weight: 700;
          margin-bottom: 25px;
          display: inline-block;
          background: #fff0f6;
          padding: 5px 15px;
          border-radius: 10px;
        }

        .description {
          font-size: 16px;
          color: #555;
          line-height: 1.8;
          margin-bottom: 30px;
          border-top: 1px solid #eee;
          padding-top: 20px;
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
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 20px rgba(122, 0, 255, 0.3);
        }

        .add-cart-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(122, 0, 255, 0.4);
        }

        .add-cart-btn i { font-size: 18px; }

        /* Responsive */
        @media (max-width: 991px) {
          .detail-content {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .detail-container { padding: 20px; }
        }
      `}</style>

      <div className="detail-container">
        <Link to="/shop" className="btn-back">
          <i className="fa fa-arrow-left"></i> Quay lại cửa hàng
        </Link>

        <div className="detail-content">
          {/* CỘT TRÁI: ẢNH SẢN PHẨM */}
          <div className="img-wrapper">
            <img
              src={`http://127.0.0.1:5000${product.image_url}`}
              alt={product.product_name}
              className="detail-img"
              onError={(e) => { e.target.src = "https://via.placeholder.com/500x500?text=No+Image"; }}
            />
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="info-wrapper">
            <h1>{product.product_name}</h1>
            <div className="price-tag">
              {Number(product.price).toLocaleString('vi-VN')} đ
            </div>

            <div className="description">
              <h4 style={{fontSize: '18px', marginBottom: '10px', color: '#333'}}>Mô tả sản phẩm:</h4>
              <p>{product.description || "Chưa có mô tả cho sản phẩm này."}</p>
            </div>

            <button onClick={handleAddToCart} className="add-cart-btn">
              <i className="fa fa-shopping-cart"></i> Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;