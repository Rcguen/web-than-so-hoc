import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import PaymentBadge from "../../components/PaymentBadge";

function OrderDetailUser() {
  const {id: order_id } = useParams();
  console.log("PARAM order_id =", order_id);

  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment method selector (COD | MOMO | VNPAY) - MUST be top-level hooks
  const [selectedMethod, setSelectedMethod] = useState("COD");
  useEffect(() => {
    if (data?.order?.payment_method) setSelectedMethod(data.order.payment_method);
  }, [data?.order?.payment_method]);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const fetchDetail = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/orders/user/${user.user_id}/${order_id}`
      );
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto refresh khi quay về từ thanh toán (order/:id?paid=1)
  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, order_id]);

  const formatMoney = (v) => Number(v || 0).toLocaleString("vi-VN") + " đ";
  const formatDate = (d) => new Date(d).toLocaleString("vi-VN");

  if (!user) {
    return (
      <div style={{ maxWidth: 900, margin: "120px auto", padding: 16 }}>
        <h2>Bạn chưa đăng nhập</h2>
        <p>Vui lòng đăng nhập để xem chi tiết đơn hàng.</p>
        <Link to="/login">Đi tới đăng nhập</Link>
      </div>
    );
  }

  if (loading) return <p style={{ marginTop: 120, textAlign: "center" }}>Đang tải...</p>;
  if (!data?.order) return <p style={{ marginTop: 120, textAlign: "center" }}>Không tìm thấy đơn hàng.</p>;

  const order = data.order;
  const items = data.items || [];

 

  // (tuỳ em) phí ship demo
  // const shippingFee = 0;
  // const grandTotal = subtotal + shippingFee;
  const shippingFee = Number(order.shipping_fee || 0);
// const subtotal = items.reduce(
//   (sum, it) => sum + it.price * it.quantity,
//   0
// );
 // ✅ Tính tạm subtotal
  const subtotal = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0);
  const grandTotal = subtotal + shippingFee;


  const canPay = order.payment_status !== "PAID";

  const payPath =
    selectedMethod === "COD"
      ? `/payment/mock/${order_id}`
      : `/payment/${selectedMethod.toLowerCase()}/${order_id}`;

 const handleVNPayPayment = async () => {
  try {
    // mark selected method so UI matches action
    setSelectedMethod("VNPAY");

    const res = await fetch("http://127.0.0.1:5000/api/vnpay/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order_id,
        amount: Math.round(grandTotal)
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("VNPay create-payment failed:", errText);
      alert("Không thể khởi tạo thanh toán VNPAY. Vui lòng thử lại sau.");
      return;
    }

    const data = await res.json();

    // 🚀 Redirect to VNPAY URL
    window.location.href = data.paymentUrl;

  } catch (error) {
    console.error("VNPay error:", error);
    alert("Lỗi kết nối thanh toán VNPAY. Vui lòng thử lại.");
  }
};


// const handleMoMoPayment = async () => {
//   const res = await fetch("http://localhost:5000/api/momo/create-payment", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       orderId,
//       amount: totalPrice
//     })
//   });

//   const data = await res.json();
//   window.location.href = data.payUrl;
// };



  return (
    <div style={{ maxWidth: 980, margin: "100px auto", padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>Chi tiết đơn #{order_id}</h1>
          <div style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span>Trạng thái:</span>
            <OrderStatusBadge status={order.order_status} orderId={order_id} />
            <span>Thanh toán:</span>
            <PaymentBadge status={order.payment_status} orderId={order_id} />
          </div>
          <p style={{ marginTop: 8, color: "#555" }}>
            Ngày đặt: <b>{formatDate(order.created_at)}</b>
          </p>
        </div>

        {/* CTA */}
        <div style={{ minWidth: 260, border: "1px solid #eee", borderRadius: 12, padding: 18, boxShadow: "0 6px 20px rgba(0,0,0,0.06)", background: "#fff" }}>
          <p style={{ margin: 0, color: "#666" }}>Tổng thanh toán</p>
          <h2 style={{ margin: "6px 0 12px", fontSize: 22 }}>{formatMoney(order.total_price ?? grandTotal)}</h2>

          {/* Payment method selector */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ marginBottom: 8, color: "#666" }}>Chọn phương thức:</div>
            <div style={{ display: "flex", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name="paymentMethod" value="COD" checked={selectedMethod === "COD"} onChange={() => setSelectedMethod("COD")} />
                <span>COD</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name="paymentMethod" value="MOMO" checked={selectedMethod === "MOMO"} onChange={() => setSelectedMethod("MOMO")} />
                <span>MoMo</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name="paymentMethod" value="VNPAY" checked={selectedMethod === "VNPAY"} onChange={() => setSelectedMethod("VNPAY")} />
                <span>VNPAY</span>
              </label>
            </div>
          </div>

          {canPay ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link to={payPath}>
                <button
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "#d82d8b",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Thanh toán ngay
                </button>
              </Link>

              <div style={{ display: "flex", gap: 10 }}>
                
                  {/* <button
                    onClick={handleMoMoPayment}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "none",
                      background: "#ff2d7a",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 10px rgba(255,45,122,0.15)",
                    }}
                  >
                    Thanh toán bằng MoMo
                  </button> */}
                

                <button
  onClick={handleVNPayPayment}
  style={{
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    background: "#0ea5a0",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(14,165,160,0.12)",
  }}
>
  Thanh toán bằng VNPAY
</button>

              </div>
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                background: "#e7f7ee",
                color: "#1e7e34",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              ✅ Đã thanh toán
            </div>
          )}
          <Link to="/orders" style={{ display: "block", marginTop: 12, textAlign: "center", color: "#666" }}>
            ← Quay lại lịch sử
          </Link>
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16, marginTop: 16 }}>
        {/* Shipping / customer */}
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16, boxShadow: "0 6px 18px rgba(0,0,0,0.04)", background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>Thông tin người nhận</h3>
          <p style={{ margin: "6px 0" }}>
            <b>Tên:</b> {order.customer_name || "—"}
          </p>
          <p style={{ margin: "6px 0" }}>
            <b>SĐT:</b> {order.customer_phone || "—"}
          </p>
          <p style={{ margin: "6px 0" }}>
            <b>Địa chỉ:</b> {order.customer_address || "—"}
          </p>
          <p style={{ margin: "6px 0" }}>
            <b>Ghi chú:</b> {order.note || "Không có"}
          </p>
        </div>

        {/* Payment summary */}
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Tóm tắt thanh toán</h3>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0" }}>
            <span>Tạm tính</span>
            <b>{formatMoney(subtotal)}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0" }}>
            <span>Phí ship</span>
            <b>{formatMoney(shippingFee)}</b>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0" }}>
            <span>Tổng cộng</span>
            <b>{formatMoney(order.total_price ?? grandTotal)}</b>
          </div>

          <p style={{ marginTop: 12, color: "#666" }}>
            <b>Phương thức:</b> {canPay ? (selectedMethod === "MOMO" ? "MoMo" : selectedMethod) : (order.payment_method || "COD")}
          </p>

          {order.transaction_id ? (
            <p style={{ marginTop: 6, color: "#666" }}>
              <b>Mã giao dịch:</b> {order.transaction_id}
            </p>
          ) : (
            <p style={{ marginTop: 6, color: "#999" }}>Chưa có mã giao dịch.</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div style={{ marginTop: 16, border: "1px solid #eee", borderRadius: 12, padding: 16, boxShadow: "0 6px 18px rgba(0,0,0,0.04)", background: "#fff" }}>
        <h3 style={{ marginTop: 0 }}>Sản phẩm</h3>

        {items.length === 0 ? (
          <p>Không có sản phẩm.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.order_item_id || `${item.product_id}-${item.product_name}`}
              style={{
                display: "flex",
                gap: 14,
                padding: "12px 0",
                borderTop: "1px solid #f1f1f1",
                alignItems: "center",
              }}
            >
              <img
                src={`http://127.0.0.1:5000${item.image_url}`}
                alt={item.product_name}
                style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, border: "1px solid #eee" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{item.product_name}</div>
                <div style={{ color: "#666", marginTop: 4 }}>
                  SL: <b>{item.quantity}</b> • Đơn giá: <b>{formatMoney(item.price)}</b>
                </div>
              </div>

              <div style={{ fontWeight: 800 }}>
                {formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OrderDetailUser;
