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
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );

  const handleInput = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const submitOrder = async () => {
    if (!customer.fullname || !customer.phone || !customer.address) {
      alert("Vui lòng nhập đầy đủ thông tin nhận hàng");
      return;
    }

    if (cart.length === 0) {
      alert("Giỏ hàng trống");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          cart
        })
      });

      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Đặt hàng thất bại");
      }

      alert(`Đặt hàng thành công! Mã đơn: #${data.order_id}`);

      // Clear cart
      localStorage.removeItem("cart");
      setCart([]);
      setCustomer({
        fullname: "",
        phone: "",
        address: "",
        notes: ""
      });
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi gửi đơn hàng, vui lòng thử lại.");
    }
  };

  return (
    <div
      style={{
        padding: "40px 20px",
        background: "#f3ecff",
        minHeight: "100vh"
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Thanh toán đơn hàng
      </h1>

      <div style={{ maxWidth: "600px", margin: "30px auto" }}>
        <h3>Thông tin nhận hàng</h3>

        <input
          className="checkout-input"
          placeholder="Họ và tên"
          name="fullname"
          value={customer.fullname}
          onChange={handleInput}
        />

        <input
          className="checkout-input"
          placeholder="Số điện thoại"
          name="phone"
          value={customer.phone}
          onChange={handleInput}
        />

        <input
          className="checkout-input"
          placeholder="Địa chỉ nhận hàng"
          name="address"
          value={customer.address}
          onChange={handleInput}
        />

        <textarea
          className="checkout-input"
          placeholder="Ghi chú thêm"
          name="notes"
          value={customer.notes}
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
              <strong>{item.product_name || item.name}</strong>
              <p>
                {item.qty} × {Number(item.price).toLocaleString()} đ
              </p>
            </div>
            <strong style={{ color: "#5b03e4" }}>
              {(Number(item.price) * Number(item.qty)).toLocaleString()} đ
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
