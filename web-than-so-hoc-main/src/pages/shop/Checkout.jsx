import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// --- SỬA LẠI ĐƯỜNG DẪN IMPORT CHO CHÍNH XÁC ---
// Giả sử Checkout.jsx nằm ở src/pages/shop/Checkout.jsx
// Thì lùi 2 cấp (../..) là ra src/pages, lùi 3 cấp (../../..) mới ra src/
// Tuy nhiên, nếu cấu trúc là src/pages/shop thì ../../context là đúng nếu context nằm ở src/context
// Nếu vẫn lỗi, hãy thử import tuyệt đối hoặc kiểm tra lại cấu trúc folder.
// Ở đây mình dùng đường dẫn an toàn phổ biến:
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import ShippingSelector from "../../components/ShippingSelector";

function Checkout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Lấy cart từ Context (nếu có)
  const cartCtx = useCart?.() || {};
  const clearCartFromCtx = cartCtx.clearCart;

  // State
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    customer_name: user?.full_name || "", // Tự điền tên nếu đã đăng nhập
    customer_phone: user?.phone || "",
    customer_address: user?.address || "",
    note: "",
  });

  const [shipping, setShipping] = useState({
    city: "",
    district: "",
    ward: "",
    shipping_fee: 0,
  });

  // --- LOGIC LOAD CART AN TOÀN ---
  useEffect(() => {
    // Ưu tiên lấy từ Context trước
    let items = cartCtx.cartItems || cartCtx.cart || [];
    
    // Nếu Context rỗng, thử lấy từ LocalStorage (backup)
    if (!items || items.length === 0) {
      try {
        const saved = JSON.parse(localStorage.getItem("cart") || "[]");
        if (Array.isArray(saved) && saved.length > 0) {
          items = saved;
        }
      } catch (e) {
        console.error("Lỗi đọc cart từ local storage", e);
      }
    }

    setCart(items);
  }, [cartCtx]); // Chạy lại khi context thay đổi

  // Tính toán tiền
  const subtotal = cart.reduce((sum, item) => {
    const qty = Number(item.qty ?? item.quantity ?? 0);
    const price = Number(item.price ?? 0);
    return sum + price * qty;
  }, 0);

  const ship = Number(shipping.shipping_fee ?? 0);
  const total = subtotal + ship;

  // Xử lý đặt hàng
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
        items: cart.map(item => ({
            // Map lại đúng cấu trúc backend cần (tuỳ vào backend của bạn)
            product_id: item.product_id || item.id,
            quantity: item.qty || item.quantity,
            price: item.price
        })),
        city: shipping.city,
        district: shipping.district,
        ward: shipping.ward,
        shipping_fee: ship,
        total_price: total
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
        throw new Error(data.message || "Đặt hàng thất bại");
      }

      // Thành công
      toast.update(loadingToast, {
        render: "🎉 Đặt hàng thành công!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      // Xóa giỏ hàng
      if (typeof clearCartFromCtx === "function") {
        clearCartFromCtx();
      }
      // Backup xóa local storage
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      setCart([]);

      // Chuyển hướng
      // Nếu backend trả về order_id, chuyển thẳng tới trang chi tiết đơn hàng thì tốt hơn
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

  return (
    <div className="checkout-page-wrapper">
      <style>{`
        .checkout-page-wrapper {
          background-color: #f8f9fa;
          min-height: 100vh;
          padding: 120px 20px 60px;
          font-family: 'Segoe UI', sans-serif;
        }

        .checkout-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-title {
          font-size: 28px;
          font-weight: 800;
          color: #333;
          margin-bottom: 30px;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1px;
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
          color: #333;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .card-header i { color: #7a00ff; }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 15px;
        }

        .input-group { margin-bottom: 15px; }
        
        .input-label {
          display: block; font-size: 14px; font-weight: 600; color: #555; margin-bottom: 8px;
        }

        .checkout-input, .checkout-textarea {
          width: 100%; padding: 12px 15px;
          border: 1px solid #e0e0e0; border-radius: 10px;
          font-size: 14px; outline: none; transition: all 0.3s;
          background: #fdfdfd;
        }

        .checkout-input:focus, .checkout-textarea:focus {
          border-color: #7a00ff; box-shadow: 0 0 0 3px rgba(122, 0, 255, 0.1); background: #fff;
        }

        .checkout-textarea { resize: vertical; min-height: 100px; }

        .summary-row {
          display: flex; justify-content: space-between;
          margin-bottom: 12px; font-size: 15px; color: #555;
        }
        
        .summary-total {
          display: flex; justify-content: space-between;
          margin-top: 20px; padding-top: 20px; border-top: 2px dashed #eee;
          font-size: 18px; font-weight: 800; color: #333;
        }
        .total-price { color: #7a00ff; font-size: 22px; }

        .checkout-btn {
          width: 100%; padding: 15px; border: none; border-radius: 50px;
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          color: #fff; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 20px; text-transform: uppercase;
        }
        .checkout-btn:hover {
          transform: translateY(-2px); box-shadow: 0 8px 20px rgba(122, 0, 255, 0.3);
        }

        .btn-back {
          display: inline-flex; align-items: center; gap: 8px;
          color: #666; text-decoration: none; font-weight: 600;
          margin-bottom: 20px; transition: color 0.2s;
        }
        .btn-back:hover { color: #7a00ff; }

        .mini-item {
          display: flex; align-items: center; gap: 15px;
          margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f5f5f5;
        }
        .mini-item:last-child { border-bottom: none; margin-bottom: 0; }
        
        .mini-img {
          width: 60px; height: 60px; object-fit: cover;
          border-radius: 10px; border: 1px solid #eee;
        }
        .mini-info { flex: 1; }
        .mini-name { font-size: 14px; font-weight: 600; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;}
        .mini-meta { font-size: 13px; color: #888; margin-top: 4px; }
        .mini-price { font-weight: 700; color: #333; font-size: 14px; }

        @media (max-width: 991px) {
          .checkout-layout { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="checkout-container">
        <Link to="/cart" className="btn-back">
          <i className="fa fa-arrow-left"></i> Quay lại giỏ hàng
        </Link>

        <h1 className="page-title">Thanh Toán <span>Đơn Hàng</span></h1>

        <div className="checkout-layout">
          
          {/* CỘT TRÁI: THÔNG TIN */}
          <div className="left-section">
            <div className="checkout-card">
              <div className="card-header">
                <i className="fa fa-user-circle"></i> Thông tin người nhận
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Họ và tên</label>
                  <input
                    type="text"
                    className="checkout-input"
                    placeholder="Nhập họ tên..."
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Số điện thoại</label>
                  <input
                    type="text"
                    className="checkout-input"
                    placeholder="Nhập số điện thoại..."
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 15 }}>
                 <label className="input-label" style={{marginBottom: 10}}>Khu vực vận chuyển</label>
                 <ShippingSelector onChange={setShipping} />
              </div>

              <div className="input-group">
                <label className="input-label">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  className="checkout-input"
                  placeholder="Ví dụ: Số 12, Ngõ 5..."
                  value={form.customer_address}
                  onChange={(e) => setForm({ ...form, customer_address: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Ghi chú (Tùy chọn)</label>
                <textarea
                  className="checkout-textarea"
                  placeholder="Ví dụ: Giao giờ hành chính..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: ĐƠN HÀNG */}
          <div className="right-section">
            <div className="checkout-card" style={{ position: 'sticky', top: 100 }}>
              <div className="card-header">
                <i className="fa fa-shopping-bag"></i> Đơn hàng ({cart.length} món)
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' }}>
                {cart.length > 0 ? (
                  cart.map((item, idx) => (
                    <div key={idx} className="mini-item">
                      <img 
                        src={item.image_url ? `http://127.0.0.1:5000${item.image_url}` : "https://via.placeholder.com/60"} 
                        alt={item.name} 
                        className="mini-img"
                        onError={(e) => e.target.src = "https://via.placeholder.com/60"}
                      />
                      <div className="mini-info">
                        <div className="mini-name">{item.product_name || item.name}</div>
                        <div className="mini-meta">SL: {item.qty || item.quantity}</div>
                      </div>
                      <div className="mini-price">
                        {(Number(item.price) * Number(item.qty || item.quantity)).toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{textAlign: 'center', color: '#999', fontStyle: 'italic'}}>Giỏ hàng trống</p>
                )}
              </div>

              <div className="summary-row">
                <span>Tạm tính</span>
                <strong>{subtotal.toLocaleString("vi-VN")} đ</strong>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <strong>{ship > 0 ? `${ship.toLocaleString("vi-VN")} đ` : "Chưa tính"}</strong>
              </div>

              <div className="summary-total">
                <span>Tổng cộng</span>
                <span className="total-price">{total.toLocaleString("vi-VN")} đ</span>
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