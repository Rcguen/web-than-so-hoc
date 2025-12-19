import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";

function Cart() {
  const navigate = useNavigate();
  const cartCtx = useCart?.() || {};

  const [cart, setCart] = useState([]);

  /* ================= LOAD CART ================= */
  useEffect(() => {
    let items = cartCtx.cartItems || cartCtx.cart || [];

    if (!Array.isArray(items) || items.length === 0) {
      try {
        const saved = JSON.parse(localStorage.getItem("cart") || "[]");
        if (Array.isArray(saved)) items = saved;
      } catch {}
    }

    setCart(items);
  }, [cartCtx]);

  /* ================= SYNC CART ================= */
  const syncCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));

    // nếu Context có setCart thì sync luôn
    if (typeof cartCtx.setCart === "function") {
      cartCtx.setCart(newCart);
    }
  };

  /* ================= UPDATE QTY ================= */
  const updateQty = (product_id, type) => {
    const newCart = cart.map((item) => {
      if (item.product_id === product_id) {
        let qty = Number(item.qty ?? item.quantity ?? 1);
        if (type === "plus") qty++;
        if (type === "minus" && qty > 1) qty--;
        return { ...item, qty, quantity: qty };
      }
      return item;
    });

    syncCart(newCart);
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = (product_id) => {
    Swal.fire({
      title: "Xóa sản phẩm?",
      text: "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ff4d4f",
    }).then((res) => {
      if (res.isConfirmed) {
        const newCart = cart.filter(
          (item) => item.product_id !== product_id
        );
        syncCart(newCart);
        toast.success("🗑️ Đã xóa sản phẩm");
      }
    });
  };

  /* ================= TOTAL ================= */
  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.qty || item.quantity),
    0
  );

  /* ================= UI ================= */
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
          text-align: center;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 40px;
        }
        .page-title span { color: #7a00ff; }

        .cart-layout {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 30px;
        }

        .cart-items-box {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .cart-header-row,
        .cart-item {
          display: grid;
          grid-template-columns: 3fr 1fr 1fr 0.5fr;
          align-items: center;
          padding: 20px 30px;
        }

        .cart-header-row {
          font-weight: 700;
          border-bottom: 2px solid #f5f5f5;
          color: #555;
        }

        .cart-item {
          border-bottom: 1px solid #f0f0f0;
        }

        .ci-product {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .ci-img {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid #eee;
        }

        .qty-control {
          display: flex;
          gap: 10px;
          background: #f0f0f0;
          padding: 5px 10px;
          border-radius: 30px;
        }

        .qty-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
        }

        .cart-summary {
          background: #fff;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
          position: sticky;
          top: 100px;
        }

        .btn-checkout {
          width: 100%;
          padding: 15px;
          border-radius: 50px;
          border: none;
          background: linear-gradient(to right,#7a00ff,#aa00ff);
          color: #fff;
          font-weight: 700;
          margin-top: 20px;
          cursor: pointer;
        }

        @media (max-width: 991px) {
          .cart-layout { grid-template-columns: 1fr; }
          .cart-header-row { display: none; }
          .cart-item {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 15px;
          }
          .ci-product { flex-direction: column; }
        }
      `}</style>

      <div className="cart-container">
        <h1 className="page-title">
          Giỏ hàng <span>của bạn</span>
        </h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <h3>🛒 Giỏ hàng đang trống</h3>
            <Link to="/shop">
              <button className="btn-checkout" style={{ width: "auto" }}>
                Quay lại cửa hàng
              </button>
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* LEFT */}
            <div className="cart-items-box">
              <div className="cart-header-row">
                <div>Sản phẩm</div>
                <div style={{ textAlign: "center" }}>Số lượng</div>
                <div style={{ textAlign: "right" }}>Thành tiền</div>
                <div></div>
              </div>

              {cart.map((item) => (
                <div className="cart-item" key={item.product_id}>
                  <div className="ci-product">
                    <img
                      src={
                        item.image_url
                          ? `http://127.0.0.1:5000${item.image_url}`
                          : "https://via.placeholder.com/80"
                      }
                      className="ci-img"
                      alt=""
                    />
                    <div>
                      <strong>{item.product_name}</strong>
                      <div>{Number(item.price).toLocaleString()} đ</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          updateQty(item.product_id, "minus")
                        }
                      >
                        -
                      </button>
                      <strong>{item.qty || item.quantity}</strong>
                      <button
                        className="qty-btn"
                        onClick={() =>
                          updateQty(item.product_id, "plus")
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", fontWeight: 700 }}>
                    {(item.price *
                      Number(item.qty || item.quantity)).toLocaleString()}{" "}
                    đ
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <button
                      onClick={() => removeItem(item.product_id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT */}
            <div className="cart-summary">
              <h3>Tóm tắt đơn hàng</h3>
              <div>
                <span>Tạm tính</span>
                <strong>{total.toLocaleString()} đ</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  marginTop: 15,
                  fontWeight: 800,
                }}
              >
                <span>Tổng cộng</span>
                <span style={{ color: "#7a00ff" }}>
                  {total.toLocaleString()} đ
                </span>
              </div>

              <button
                className="btn-checkout"
                onClick={() => navigate("/checkout")}
              >
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
