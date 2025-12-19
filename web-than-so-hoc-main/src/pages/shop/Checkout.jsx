import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import ShippingSelector from "../../components/ShippingSelector";

function Checkout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const cartCtx = useCart?.() || {};
  const clearCartFromCtx = cartCtx.clearCart;

  /* ================= CART ================= */
  const [cart, setCart] = useState([]);

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

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    customer_name: user?.full_name || "",
    customer_phone: user?.phone || "",
    customer_address: user?.address || "",
    note: "",
  });

  /* ================= SHIPPING ================= */
  const [shipping, setShipping] = useState({
    city: "",
    district: "",
    ward: "",
    shipping_fee: 0,
  });

  /* ================= PRICE ================= */
  const subtotal = cart.reduce((sum, item) => {
    const qty = Number(item.qty ?? item.quantity ?? 0);
    const price = Number(item.price ?? 0);
    return sum + price * qty;
  }, 0);

  const ship = Number(shipping.shipping_fee ?? 0);
  const total = subtotal + ship;

  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async () => {
    if (!cart.length) {
      toast.warning("🛒 Giỏ hàng trống!");
      return;
    }

    if (
      !form.customer_name.trim() ||
      !form.customer_phone.trim() ||
      !form.customer_address.trim()
    ) {
      toast.warning("⚠️ Vui lòng nhập đầy đủ thông tin người nhận");
      return;
    }

    if (!shipping.city || !shipping.district || !shipping.ward) {
      toast.warning("📍 Vui lòng chọn đầy đủ Tỉnh / Quận / Phường");
      return;
    }

    const confirm = await Swal.fire({
      title: "Xác nhận đặt hàng?",
      text: `Tổng thanh toán: ${total.toLocaleString("vi-VN")} đ`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đặt hàng",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#7a00ff",
    });

    if (!confirm.isConfirmed) return;

    const loadingToast = toast.loading("⏳ Đang xử lý đơn hàng...");

    try {
      const payload = {
        user_id: user?.user_id || null,
        ...form,
        items: cart.map((item) => ({
          product_id: item.product_id || item.id,
          quantity: item.qty || item.quantity,
          price: item.price,
        })),
        city: shipping.city,
        district: shipping.district,
        ward: shipping.ward,
        shipping_fee: ship,
        total_price: total,
      };

      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        toast.update(loadingToast, {
          render: "⚠️ Phiên đăng nhập đã hết hạn!",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        logout();
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đặt hàng thất bại");

      toast.update(loadingToast, {
        render: "🎉 Đặt hàng thành công!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      if (typeof clearCartFromCtx === "function") {
        clearCartFromCtx();
      }
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      setCart([]);

      if (data.order_id) {
        navigate(`/order/${data.order_id}`);
      } else {
        navigate("/thank-you");
      }
    } catch (err) {
      console.error(err);
      toast.update(loadingToast, {
        render: err.message || "❌ Lỗi kết nối server",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  /* ================= UI ================= */
  return (
    <div className="checkout-page-wrapper">
      <style>{`
        .checkout-page-wrapper {
          background: #f8f9fa;
          min-height: 100vh;
          padding: 120px 20px 60px;
          font-family: 'Segoe UI', sans-serif;
        }
        .checkout-container { max-width: 1200px; margin: 0 auto; }
        .page-title {
          text-align: center;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 30px;
        }
        .page-title span { color: #7a00ff; }

        .checkout-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 30px;
        }

        .checkout-card {
          background: #fff;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
          margin-bottom: 20px;
        }

        .card-header {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .input-label { font-weight: 600; margin-bottom: 6px; display: block; }
        .checkout-input, .checkout-textarea {
          width: 100%;
          padding: 12px 15px;
          border-radius: 10px;
          border: 1px solid #ddd;
          outline: none;
        }

        .checkout-btn {
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

        .mini-item {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }
        .mini-img {
          width: 60px; height: 60px;
          border-radius: 10px; object-fit: cover;
        }
        .mini-name { font-weight: 600; font-size: 14px; }
        .mini-price { font-weight: 700; }

        @media (max-width: 991px) {
          .checkout-layout { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="checkout-container">
        <Link to="/cart" style={{ marginBottom: 20, display: "inline-block" }}>
          ⬅ Quay lại giỏ hàng
        </Link>

        <h1 className="page-title">
          Thanh toán <span>Đơn hàng</span>
        </h1>

        <div className="checkout-layout">
          {/* LEFT */}
          <div>
            <div className="checkout-card">
              <div className="card-header">Thông tin người nhận</div>

              <div className="form-row">
                <div>
                  <label className="input-label">Họ và tên</label>
                  <input
                    className="checkout-input"
                    value={form.customer_name}
                    onChange={(e) =>
                      setForm({ ...form, customer_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="input-label">Số điện thoại</label>
                  <input
                    className="checkout-input"
                    value={form.customer_phone}
                    onChange={(e) =>
                      setForm({ ...form, customer_phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <label className="input-label" style={{ marginTop: 15 }}>
                Khu vực vận chuyển
              </label>
              <ShippingSelector onChange={setShipping} />

              <label className="input-label" style={{ marginTop: 15 }}>
                Địa chỉ chi tiết
              </label>
              <input
                className="checkout-input"
                value={form.customer_address}
                onChange={(e) =>
                  setForm({ ...form, customer_address: e.target.value })
                }
              />

              <label className="input-label" style={{ marginTop: 15 }}>
                Ghi chú
              </label>
              <textarea
                className="checkout-textarea"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="checkout-card" style={{ position: "sticky", top: 100 }}>
              <div className="card-header">
                Đơn hàng ({cart.length} món)
              </div>

              {cart.map((item, idx) => (
                <div key={idx} className="mini-item">
                  <img
                    src={
                      item.image_url
                        ? `http://127.0.0.1:5000${item.image_url}`
                        : "https://via.placeholder.com/60"
                    }
                    className="mini-img"
                    alt=""
                  />
                  <div style={{ flex: 1 }}>
                    <div className="mini-name">
                      {item.product_name || item.name}
                    </div>
                    <div style={{ fontSize: 13, color: "#888" }}>
                      SL: {item.qty || item.quantity}
                    </div>
                  </div>
                  <div className="mini-price">
                    {(item.price *
                      Number(item.qty || item.quantity)).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    đ
                  </div>
                </div>
              ))}

              <hr />

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Tạm tính</span>
                <strong>{subtotal.toLocaleString("vi-VN")} đ</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Phí ship</span>
                <strong>
                  {ship > 0 ? `${ship.toLocaleString("vi-VN")} đ` : "Chưa tính"}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 800,
                  fontSize: 18,
                  marginTop: 15,
                }}
              >
                <span>Tổng cộng</span>
                <span style={{ color: "#7a00ff" }}>
                  {total.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <button className="checkout-btn" onClick={handlePlaceOrder}>
                Xác nhận đặt hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
