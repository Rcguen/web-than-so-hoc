import React, { useEffect, useState } from "react";

function Checkout() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    fullname: "",
    phone: "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleInput = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const submitOrder = async () => {
    if (!customer.fullname || !customer.phone || !customer.address) {
      alert("Vui lòng nhập đầy đủ thông tin nhận hàng");
      return;
    }

    const res = await fetch("http://127.0.0.1:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        cart
      })
    });

    const data = await res.json();

    if (data.status === "success") {
      alert("Đặt hàng thành công!");

      // Clear cart
      localStorage.removeItem("cart");
      window.location.href = "/order-success";
    } else {
      alert("Có lỗi xảy ra khi đặt hàng!");
    }
  };

  return (
    <div style={{ padding: "80px 30px" }}>
      <h1 style={{ textAlign: "center", color: "#5b03e4" }}>
        🧾 Thanh toán
      </h1>

      <div style={{ maxWidth: "600px", margin: "30px auto" }}>
        <h3>Thông tin nhận hàng</h3>

        <input
          className="checkout-input"
          placeholder="Họ và tên"
          name="fullname"
          onChange={handleInput}
        />

        <input
          className="checkout-input"
          placeholder="Số điện thoại"
          name="phone"
          onChange={handleInput}
        />

        <input
          className="checkout-input"
          placeholder="Địa chỉ nhận hàng"
          name="address"
          onChange={handleInput}
        />

        <textarea
          className="checkout-input"
          placeholder="Ghi chú thêm"
          name="notes"
          onChange={handleInput}
        />

        <h3 style={{ marginTop: "30px" }}>Sản phẩm</h3>
        {cart.map((item, i) => (
          <div
            key={i}
            style={{
              padding: "15px",
              background: "#fff",
              marginBottom: "10px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            <div>
              <strong>{item.product_name}</strong>
              <p>
                {item.quantity} × {item.price.toLocaleString()} đ
              </p>
            </div>
            <strong style={{ color: "#5b03e4" }}>
              {(item.price * item.quantity).toLocaleString()} đ
            </strong>
          </div>
        ))}

        <h2 style={{ textAlign: "center", marginTop: "20px" }}>
          Tổng cộng:{" "}
          <span style={{ color: "#5b03e4" }}>
            {totalPrice.toLocaleString()} đ
          </span>
        </h2>

        <button
          onClick={submitOrder}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "15px",
            background: "#5b03e4",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            cursor: "pointer"
          }}
        >
          Xác nhận thanh toán
        </button>
      </div>
    </div>
  );
}

export default Checkout;
