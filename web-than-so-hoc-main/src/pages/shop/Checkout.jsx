import React, { useState, useEffect } from "react";
import "./Page.css";
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
  const cartItemsFromCtx = cartCtx.cartItems || cartCtx.cart || [];
  const clearCartFromCtx = cartCtx.clearCart;

  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    note: "",
  });

  // ✅ state shipping (MỨC 2)
  const [shipping, setShipping] = useState({
    city: "",
    district: "",
    ward: "",
    shipping_fee: 0,
  });

  // load cart
  useEffect(() => {
    if (Array.isArray(cartItemsFromCtx)) {
      setCart(cartItemsFromCtx);
    } else {
      const saved = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(saved);
    }
  }, [cartItemsFromCtx]);

 const subtotal = cart.reduce((sum, item) => {
  const qty = Number(item.qty ?? item.quantity ?? 0);
  const price = Number(item.price ?? 0);
  return sum + price * qty;
}, 0);

const ship = Number(shipping.shipping_fee ?? 0);
const total = subtotal + ship;


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
      text: "Bạn có chắc chắn muốn đặt đơn hàng này không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đặt hàng",
      cancelButtonText: "Hủy",
    });

    if (!confirm.isConfirmed) return;

    const loadingToast = toast.loading("⏳ Đang xử lý đơn hàng...");

    try {
      const payload = {
        user_id: user?.user_id || null,
        ...form,
        items: cart,

        // 🔑 gửi địa chỉ để backend tính ship
        city: shipping.city,
        district: shipping.district,
        ward: shipping.ward,
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

      if (!res.ok) {
        toast.update(loadingToast, {
          render: data.message || "❌ Đặt hàng thất bại",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      toast.update(loadingToast, {
        render: "🎉 Đặt hàng thành công!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      if (typeof clearCartFromCtx === "function") {
        clearCartFromCtx();
      } else {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));
        setCart([]);
      }

      navigate("/thank-you");
    } catch (err) {
      console.error(err);
      toast.update(loadingToast, {
        render: "❌ Lỗi kết nối server",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="checkout-container">
      <Link to="/cart" className="btn-back-cart">
        ⬅ Quay lại giỏ hàng
      </Link>

      <h1>Thanh toán</h1>

      {/* 🔽 CHỌN ĐỊA CHỈ + PREVIEW SHIP */}
      <ShippingSelector onChange={setShipping} />

      <div className="checkout-form">
        <input
          type="text"
          placeholder="Họ và tên"
          value={form.customer_name}
          onChange={(e) =>
            setForm({ ...form, customer_name: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Số điện thoại"
          value={form.customer_phone}
          onChange={(e) =>
            setForm({ ...form, customer_phone: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Địa chỉ chi tiết"
          value={form.customer_address}
          onChange={(e) =>
            setForm({ ...form, customer_address: e.target.value })
          }
        />

        <textarea
          placeholder="Ghi chú"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        {/* 💰 TỔNG TIỀN */}
        <div className="checkout-summary">
          <p>Tạm tính: {subtotal.toLocaleString("vi-VN")} đ</p>
<p>Phí vận chuyển: {ship.toLocaleString("vi-VN")} đ</p>
<hr />
<h2>Tổng cộng: {total.toLocaleString("vi-VN")} đ</h2>

        </div>

        <button className="checkout-btn" onClick={handlePlaceOrder}>
          Xác nhận đặt hàng
        </button>
      </div>
    </div>
  );
}

export default Checkout;
