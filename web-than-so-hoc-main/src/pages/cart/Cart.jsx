import React, { useEffect, useState } from "react";
import "./Cart.css";

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  // 👉 Cập nhật số lượng sản phẩm
  const updateQty = (product_id, type) => {
    const newCart = cart.map(item => {
      if (item.product_id === product_id) {
        let newQty = item.qty;

        if (type === "plus") newQty++;
        if (type === "minus" && newQty > 1) newQty--;

        return { ...item, qty: newQty };
      }
      return item;
    });

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // 👉 Xóa sản phẩm
  const removeItem = (product_id) => {
    const newCart = cart.filter(item => item.product_id !== product_id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // 👉 Tính tổng tiền
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );

  return (
    <div className="cart-container">
      <h1 className="cart-title">🛒 Giỏ hàng của bạn</h1>

      {cart.length === 0 && <p>Giỏ hàng trống.</p>}

      {cart.map((item) => (
        <div className="cart-item" key={item.product_id}>
          <img src={`http://127.0.0.1:5000${item.image_url}`} alt={item.name} />

          <div className="cart-info">
            <h2>{item.product_name || item.name}</h2>
            <p className="cart-price">
              {Number(item.price).toLocaleString()} đ
            </p>

            {/* Nút tăng giảm */}
            <div className="qty-box">
              <button onClick={() => updateQty(item.product_id, "minus")}>-</button>
              <span>{item.qty}</span>
              <button onClick={() => updateQty(item.product_id, "plus")}>+</button>
            </div>
          </div>

          {/* Thành tiền */}
          <p className="cart-item-total">
            {(item.price * item.qty).toLocaleString()} đ
          </p>

          <button className="remove-btn" onClick={() => removeItem(item.product_id)}>
            Xóa
          </button>
        </div>
      ))}

      {/* TỔNG TIỀN */}
      <div className="cart-total-box">
        <h2>Tổng thanh toán:</h2>
        <p className="cart-total">{total.toLocaleString()} đ</p>

        <button className="checkout-btn">Thanh toán</button>
      </div>
    </div>
  );
}

export default Cart;
