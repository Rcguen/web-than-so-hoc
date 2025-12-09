import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./Page.css";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  const loadProduct = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/products/${id}`);
      setProduct(res.data || null);
    } catch (err) {
      console.error("Load product error:", err);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  // Add to cart
  const addToCart = () => {
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

    alert("Đã thêm vào giỏ hàng!");
  };

  if (!product) return <h2>Đang tải...</h2>;

  return (
    <div className="product-detail-container">
      <Link to="/shop" className="btn-back-shop">⬅ Quay lại cửa hàng</Link>

      <div className="detail-box">
        <img
          src={`http://127.0.0.1:5000${product.image_url}`}
          alt={product.product_name}
          className="detail-img"
        />

        <div className="detail-info">
          <h1>{product.product_name}</h1>
          <p className="detail-price">{Number(product.price).toLocaleString()} đ</p>

          <p className="detail-desc">{product.description}</p>

          <button onClick={addToCart} className="btn-add-cart">
            Thêm vào giỏ hàng 🛒
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
