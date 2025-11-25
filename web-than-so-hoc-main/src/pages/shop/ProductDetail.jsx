import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Page.css";
import { useCart } from "../../context/CartContext";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/products/${id}`);
      const data = await res.json();

      // API trả về {product:{...}}
      if (data.product) {
        setProduct(data.product);
      }
      // API trả về object
      else if (data && data.product_id) {
        setProduct(data);
      } 
      else {
        console.error("Dữ liệu sản phẩm không hợp lệ:", data);
        setProduct(null);
      }
    } catch (err) {
      console.error("Lỗi load sản phẩm:", err);
    }
  };

  if (!product) return <p style={{ padding: 40 }}>Đang tải...</p>;

  return (
    <div className="product-detail-container">
      <div className="product-detail-box">

        <div className="product-detail-image-box">
          <img
            src={`http://127.0.0.1:5000${product.image_url}`}
            alt={product.product_name}
          />
        </div>

        <div className="product-detail-info">
          <h2>{product.product_name}</h2>

          <p className="price">
            {product.price ? Number(product.price).toLocaleString() : "0"} đ
          </p>

          <p className="category">
            Danh mục: <span>{product.category_name || "Không có"}</span>
          </p>

          <p className="description">{product.description}</p>

          <button
            className="btn-add-cart"
            onClick={() => {
              addToCart({
                product_id: product.product_id,
                product_name: product.product_name,
                price: Number(product.price || 0),
                image_url: product.image_url
              });

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
