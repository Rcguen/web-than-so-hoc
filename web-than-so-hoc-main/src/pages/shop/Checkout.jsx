import React, { useState, useEffect } from "react";
import "./Page.css";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

function Checkout() {
  const navigate = useNavigate();

  // ✅ Lấy user + logout từ AuthContext (không dùng localStorage trực tiếp)
  const { user, logout } = useAuth();

  // ✅ Lấy cart từ CartContext (nếu CartContext của em chưa có cartItems/clearCart
  // thì vẫn có fallback localStorage ở useEffect bên dưới)
  const cartCtx = useCart?.() || {};
  const cartItemsFromCtx = cartCtx.cartItems || cartCtx.cart || null;
  const clearCartFromCtx = cartCtx.clearCart || null;

  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    note: "",
  });

  // ✅ Load cart (ưu tiên CartContext, fallback localStorage để không vỡ app)
  useEffect(() => {
    if (Array.isArray(cartItemsFromCtx)) {
      setCart(cartItemsFromCtx);
      return;
    }
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, [cartItemsFromCtx]);

  // ✅ Tính tổng (hỗ trợ qty/quantity)
  const total = cart.reduce((sum, item) => {
    const qty = Number(item.qty ?? item.quantity ?? 0);
    const price = Number(item.price ?? 0);
    return sum + price * qty;
  }, 0);

  const handlePlaceOrder = async () => {
    // 0) Validate giỏ hàng + form cơ bản
    if (!cart.length) {
      toast.warning("🛒 Giỏ hàng trống!");
      return;
    }
    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.customer_address.trim()) {
      toast.warning("⚠️ Vui lòng nhập Họ tên / SĐT / Địa chỉ");
      return;
    }

    // 1) Xác nhận
    const result = await Swal.fire({
      title: "Xác nhận đặt hàng?",
      text: "Bạn có chắc chắn muốn đặt đơn hàng này không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đặt hàng",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    // 2) Toast loading
    const loadingToast = toast.loading("⏳ Đang xử lý đơn hàng...");

    try {
      // ✅ 3) Payload đúng theo submitOrder cũ của em
      // Backend của em đã từng nhận: { user_id, ...form, items: cart }
      const payload = {
        user_id: user?.user_id || null,
        ...form,
        items: cart,
        total_amount: total, // nếu backend không dùng thì cũng không sao
      };

      // Debug nếu cần:
      // console.log("ORDER PAYLOAD:", payload);

      const token = localStorage.getItem("token"); // token hiện em đang lưu ở localStorage
      const res = await fetch("http://127.0.0.1:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      // Nếu backend trả 401 → logout
      if (res.status === 401) {
        toast.update(loadingToast, {
          render: "⚠️ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        logout();
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.update(loadingToast, {
          render: data.message || "❌ Đặt hàng thất bại",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      // ✅ Thành công
      toast.update(loadingToast, {
        render: data.message || "🎉 Đặt hàng thành công!",
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });

      // ✅ Clear cart (ưu tiên CartContext)
      if (typeof clearCartFromCtx === "function") {
        clearCartFromCtx();
      } else {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));
        setCart([]);
      }

      // ✅ Điều hướng như flow cũ của em (thank-you) hoặc orders
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

      <div className="checkout-form">
        <input
          type="text"
          placeholder="Họ và tên"
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={form.customer_phone}
          onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="Địa chỉ"
          value={form.customer_address}
          onChange={(e) => setForm({ ...form, customer_address: e.target.value })}
        />
        <textarea
          placeholder="Ghi chú"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        <h2>Tổng thanh toán: {total.toLocaleString()} đ</h2>

        <button className="checkout-btn" onClick={handlePlaceOrder}>
          Xác nhận đặt hàng
        </button>
      </div>
    </div>
  );
}

export default Checkout;
