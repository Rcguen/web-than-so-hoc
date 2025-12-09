import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Page.css";
import { Link, useNavigate } from "react-router-dom";

function Checkout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    note: ""
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );

  const submitOrder = async () => {
    if (!cart.length) return alert("Giỏ hàng trống!");

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/orders", {
        user_id: user?.user_id || null,
        ...form,
        items: cart,
      });

      if (res.data.status === "success") {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));

        navigate("/thank-you");
      }
    } catch (err) {
      console.error(err);
      alert("Đặt hàng thất bại!");
    }
  };

  return (
    <div className="checkout-container">
      <Link to="/cart" className="btn-back-cart">⬅ Quay lại giỏ hàng</Link>

      <h1>Thanh toán</h1>

      {/* FORM */}
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
          onChange={(e) =>
            setForm({ ...form, customer_address: e.target.value })
          }
        />
        <textarea
          placeholder="Ghi chú"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        ></textarea>

        <h2>Tổng thanh toán: {total.toLocaleString()} đ</h2>

        <button className="checkout-btn" onClick={submitOrder}>
          Xác nhận đặt hàng
        </button>
      </div>
    </div>
  );
}

export default Checkout;
