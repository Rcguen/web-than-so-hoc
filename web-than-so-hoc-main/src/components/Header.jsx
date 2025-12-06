import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const HEADER_HEIGHT = "80px";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { cartCount: contextCartCount } = useCart();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 🔥 CẬP NHẬT GIỎ HÀNG REALTIME
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const total = cart.reduce((sum, i) => sum + Number(i.qty), 0);
    setCartCount(total);
  };

  // useEffect(() => {
  //   updateCartCount();

  //   // Lắng nghe event mỗi khi thêm/xóa sản phẩm
  //   window.addEventListener("cartUpdated", updateCartCount);

  //   return () => {
  //     window.removeEventListener("cartUpdated", updateCartCount);
  //   };
  // }, []);

  useEffect(() => {
  const update = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    setCartCount(totalQty);
  };

  update();
  window.addEventListener("cartUpdated", update);

  return () => window.removeEventListener("cartUpdated", update);
}, []);


  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .header-area {
          position: fixed; top: 0; left: 0; width: 100%; height: ${HEADER_HEIGHT};
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          display: flex; align-items: center;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .header-area .container {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
        }

        .logo img {
          height: 55px;
          width: auto;
          object-fit: contain;
        }

        /* DESKTOP USER INFO */
        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-info-h {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-name {
          color: #fff;
          font-weight: bold;
          font-size: 15px;
        }

        .btn-logout-h {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.7);
          color: #fff;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-logout-h:hover {
          background: rgba(255,255,255,0.2);
        }

        /* MENU TRIGGER */
        .menu-trigger {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          width: 40px;
          height: 40px;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          background: rgba(255,255,255,0.25);
          transition: 0.2s;
          z-index: 2001;
        }
        .menu-trigger:hover {
          background: rgba(255,255,255,0.35);
        }
        .menu-trigger span {
          height: 2px;
          width: 100%;
          background: #fff;
          transition: 0.3s;
        }

        /* When menu is active (X icon) */
        .menu-trigger.active span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .menu-trigger.active span:nth-child(2) {
          opacity: 0;
        }
        .menu-trigger.active span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        /* POPUP MENU */
        .popup-menu {
          position: fixed;
          top: ${HEADER_HEIGHT};
          right: 15px;
          width: 280px;
          background: #fff;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          padding-bottom: 10px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-20px) scale(0.95);
          transition: all 0.25s ease;
          z-index: 2000;
        }

        .popup-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }

        .popup-nav {
          list-style: none;
          padding: 10px;
          margin: 0;
        }

        .popup-nav a, 
        .menu-item-span {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          border-radius: 10px;
          cursor: pointer;
          text-decoration: none;
          color: #333;
          font-weight: 500;
          font-size: 15px;
        }
        
        .icon-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #eee;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 12px;
          color: #7a00ff;
        }

        .popup-nav a:hover,
        .menu-item-span:hover {
          background: #f5f4ff;
        }

        .popup-nav a.active {
          background: #f3e8ff;
          color: #7a00ff;
          font-weight: 700;
        }

        /* SUB MENU DROPDOWN */
        .sub-menu {
          display: none;
          padding-left: 45px;
          margin-top: 5px;
        }
        .sub-menu.show {
          display: block;
        }

        .sub-menu a {
          padding: 7px 0;
          font-size: 14px;
          color: #666;
        }
        .sub-menu a:hover {
          color: #7a00ff;
        }

        /* OVERLAY */
        .menu-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          display: none;
          background: rgba(0,0,0,0.15);
          z-index: 1500;
        }
        .menu-overlay.show {
          display: block;
        }
      `}</style>

      {/* Overlay */}
      <div
        className={`menu-overlay ${menuOpen ? "show" : ""}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* HEADER */}
      <header className="header-area">
        <div className="container">

          <NavLink to="/" className="logo">
            <img src="/assets/images/logo.png" />
          </NavLink>

          <div className="header-right">

            {user && (
              <div className="user-info-h">
                <span className="user-name">Hi, {user.full_name}</span>
                <button className="btn-logout-h" onClick={handleLogout}>
                  Thoát
                </button>
              </div>
            )}

            {/* 🛒 GIỎ HÀNG + BADGE */}
            <Link to="/cart" className="cart-icon" style={{ position: "relative" }}>
              <span className="icon">🛒</span>
              {contextCartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-10px",
                    background: "red",
                    color: "white",
                    fontSize: "12px",
                    padding: "2px 6px",
                    borderRadius: "50%",
                  }} className="badge"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* NÚT MENU */}
            <div
              className={`menu-trigger ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </header>

      {/* MENU POPUP */}
      <div className={`popup-menu ${menuOpen ? "show" : ""}`}>
        <ul className="popup-nav">

          <li>
            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              <div className="icon-dot">🏠</div>Trang Chủ
            </NavLink>
          </li>

          <li>
            <div className="menu-item-span" onClick={() => setSubOpen(!subOpen)}>
              <div className="icon-dot">🔮</div>
              Thần Số Học
              <span style={{ marginLeft: "auto" }}>{subOpen ? "▲" : "▼"}</span>
            </div>

            <div className={`sub-menu ${subOpen ? "show" : ""}`}>
              <NavLink to="/lookup" onClick={() => setMenuOpen(false)}>Tra Cứu</NavLink>
              <NavLink to="/services" onClick={() => setMenuOpen(false)}>Các Chỉ Số</NavLink>
              <NavLink to="/projects" onClick={() => setMenuOpen(false)}>Báo Cáo Mẫu</NavLink>
              <NavLink to="/history" onClick={() => setMenuOpen(false)}>Lịch Sử</NavLink>
            </div>
          </li>

          <li><NavLink to="/admin" onClick={() => setMenuOpen(false)}><div className="icon-dot">🎉</div>Admin Panel</NavLink></li>
          <li><NavLink to="/shop" onClick={() => setMenuOpen(false)}><div className="icon-dot">🛒</div>Cửa Hàng</NavLink></li>
          <li><NavLink to="/cart" onClick={() => setMenuOpen(false)}><div className="icon-dot">🛍️</div>Giỏ Hàng</NavLink></li>
          <li><NavLink to="/contact" onClick={() => setMenuOpen(false)}><div className="icon-dot">📞</div>Liên Hệ</NavLink></li>

        </ul>
      </div>
    </>
  );
}

export default Header;
