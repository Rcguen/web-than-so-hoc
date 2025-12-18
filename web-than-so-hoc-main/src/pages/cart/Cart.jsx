import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
// Sửa đường dẫn import nếu cần thiết, dựa trên các file trước đó
import { useAuth } from "../../context/AuthContext"; 
import { useCart } from "../../context/CartContext"; 

function Cart() {
  // Lấy cart từ context nếu có, hoặc dùng state local
  const cartCtx = useCart?.() || {};
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  // Load cart từ localStorage lúc đầu
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  const syncCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
    // Nếu có context thì update luôn context (tuỳ logic app bạn)
    if (cartCtx.setCart) cartCtx.setCart(newCart);
  };

  const updateQty = (product_id, type) => {
    const newCart = cart.map((item) => {
      if (item.product_id === product_id) {
        let newQty = Number(item.qty || item.quantity);
        if (type === "plus") newQty++;
        if (type === "minus" && newQty > 1) newQty--;
        return { ...item, qty: newQty, quantity: newQty }; // Update cả 2 trường cho chắc
      }
      return item;
    });
    syncCart(newCart);
  };

  const removeItem = (product_id) => {
    Swal.fire({
      title: "Xóa sản phẩm?",
      text: "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    }).then((result) => {
      if (result.isConfirmed) {
        const newCart = cart.filter((item) => item.product_id !== product_id);
        syncCart(newCart);
        toast.success("Đã xóa sản phẩm!");
      }
    });
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty || item.quantity),
    0
  );

  return (
    <div className="cart-page-wrapper">
      <style>{`
        .cart-page-wrapper {
          background-color: #f8f9fa;
          min-height: 100vh;
          padding: 120px 20px 60px;
          font-family: 'Segoe UI', sans-serif;
        }
        .cart-container { max-width: 1200px; margin: 0 auto; }
        
        .page-title {
          text-align: center; font-size: 32px; font-weight: 800; color: #333; margin-bottom: 40px;
        }
        .page-title span { color: #7a00ff; }

        .cart-layout {
          display: grid; grid-template-columns: 1.8fr 1fr; gap: 30px;
        }

        /* LEFT COLUMN */
        .cart-items-box {
          background: #fff; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        
        .cart-header-row {
          display: grid; grid-template-columns: 3fr 1fr 1fr 0.5fr;
          padding: 20px 30px; border-bottom: 2px solid #f5f5f5;
          font-weight: 700; color: #555;
        }

        .cart-item {
          display: grid; grid-template-columns: 3fr 1fr 1fr 0.5fr;
          align-items: center; padding: 25px 30px;
          border-bottom: 1px solid #f0f0f0; transition: background 0.2s;
        }
        .cart-item:last-child { border-bottom: none; }
        .cart-item:hover { background-color: #fafafa; }

        .ci-product { display: flex; align-items: center; gap: 15px; }
        .ci-img {
          width: 80px; height: 80px; border-radius: 12px; object-fit: cover;
          border: 1px solid #eee;
        }
        .ci-info h4 {
          font-size: 16px; font-weight: 700; color: #333; margin: 0 0 5px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .ci-price { color: #666; font-size: 14px; }

        /* QTY BTNS */
        .qty-control {
          display: flex; align-items: center; gap: 10px;
          background: #f0f0f0; padding: 5px 10px; border-radius: 30px; width: fit-content;
        }
        .qty-btn {
          width: 25px; height: 25px; border-radius: 50%; border: none;
          background: #fff; cursor: pointer; font-weight: 700; color: #333;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1); transition: 0.2s;
        }
        .qty-btn:hover { background: #7a00ff; color: #fff; }
        .qty-val { font-weight: 600; min-width: 20px; text-align: center; }

        .ci-total { font-weight: 700; color: #7a00ff; font-size: 16px; }

        .btn-remove {
          background: none; border: none; color: #ccc; cursor: pointer; font-size: 18px; transition: 0.2s;
        }
        .btn-remove:hover { color: #ff4d4f; transform: scale(1.1); }

        /* RIGHT COLUMN */
        .cart-summary {
          background: #fff; border-radius: 20px; padding: 30px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05); height: fit-content;
          position: sticky; top: 100px;
        }
        .summary-title { font-size: 20px; font-weight: 800; color: #333; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
        
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 15px; color: #666; }
        .summary-total {
          display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 2px dashed #eee;
          font-size: 18px; font-weight: 800; color: #333;
        }
        .total-price { color: #d82d8b; font-size: 24px; }

        .btn-checkout {
          width: 100%; padding: 15px; border: none; border-radius: 50px;
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          color: #fff; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: 0.3s; margin-top: 25px;
          text-transform: uppercase; letter-spacing: 1px;
          box-shadow: 0 10px 20px rgba(122, 0, 255, 0.3);
        }
        .btn-checkout:hover {
          transform: translateY(-2px); box-shadow: 0 15px 30px rgba(122, 0, 255, 0.4);
        }

        .btn-back-shop {
          display: inline-block; margin-top: 20px; color: #666; text-decoration: none; font-weight: 600;
        }
        .btn-back-shop:hover { color: #7a00ff; }

        /* EMPTY CART */
        .empty-cart {
          text-align: center; padding: 50px; background: #fff; border-radius: 20px;
        }
        .empty-cart i { font-size: 60px; color: #ddd; margin-bottom: 20px; }
        .empty-cart h3 { margin-bottom: 20px; color: #333; }

        @media (max-width: 991px) {
          .cart-layout { grid-template-columns: 1fr; }
          .cart-header-row { display: none; } /* Ẩn header bảng trên mobile */
          .cart-item {
            grid-template-columns: 1fr; gap: 15px; text-align: center;
            justify-items: center; /* Căn giữa các phần tử */
          }
          .ci-product { flex-direction: column; text-align: center; }
          .summary-box { position: static; }
        }
      `}</style>

      <div className="cart-container">
        <h1 className="page-title">Giỏ Hàng <span>Của Bạn</span></h1>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <i className="fa fa-shopping-cart"></i>
            <h3>Giỏ hàng của bạn đang trống</h3>
            <Link to="/shop">
              <button className="btn-checkout" style={{width: 'auto', padding: '12px 30px'}}>
                Quay lại cửa hàng
              </button>
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            
            {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
            <div className="left-col">
              <div className="cart-items-box">
                {/* Header Row (Desktop only) */}
                <div className="cart-header-row">
                  <div>Sản phẩm</div>
                  <div style={{textAlign: 'center'}}>Số lượng</div>
                  <div style={{textAlign: 'right'}}>Thành tiền</div>
                  <div style={{textAlign: 'right'}}></div>
                </div>

                {/* Items List */}
                {cart.map((item) => (
                  <div className="cart-item" key={item.product_id}>
                    
                    {/* Product Info */}
                    <div className="ci-product">
                      <img 
                        src={item.image_url ? `http://127.0.0.1:5000${item.image_url}` : "https://via.placeholder.com/80"} 
                        alt={item.product_name} 
                        className="ci-img"
                        onError={(e) => e.target.src = "https://via.placeholder.com/80"}
                      />
                      <div className="ci-info">
                        <h4>{item.product_name}</h4>
                        <span className="ci-price">{Number(item.price).toLocaleString()} đ</span>
                      </div>
                    </div>

                    {/* Qty Control */}
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQty(item.product_id, "minus")}>-</button>
                        <span className="qty-val">{item.qty || item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.product_id, "plus")}>+</button>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div style={{textAlign: 'right'}} className="ci-total">
                      {(Number(item.price) * Number(item.qty || item.quantity)).toLocaleString()} đ
                    </div>

                    {/* Remove Btn */}
                    <div style={{textAlign: 'right'}}>
                      <button className="btn-remove" onClick={() => removeItem(item.product_id)} title="Xóa">
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              <Link to="/shop" className="btn-back-shop">
                <i className="fa fa-arrow-left"></i> Tiếp tục mua sắm
              </Link>
            </div>

            {/* CỘT PHẢI: TỔNG TIỀN */}
            <div className="right-col">
              <div className="cart-summary">
                <div className="summary-title">Tóm Tắt Đơn Hàng</div>
                
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <strong>{total.toLocaleString()} đ</strong>
                </div>
                <div className="summary-row">
                  <span>Giảm giá</span>
                  <strong>0 đ</strong>
                </div>

                <div className="summary-total">
                  <span>Tổng cộng</span>
                  <span className="total-price">{total.toLocaleString()} đ</span>
                </div>

                <button className="btn-checkout" onClick={() => navigate('/checkout')}>
                  Tiến Hành Thanh Toán
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;