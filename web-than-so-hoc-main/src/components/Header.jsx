import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";




const HEADER_HEIGHT = "80px";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { cartCount: contextCartCount } = useCart();
  const [avatarOpen, setAvatarOpen] = useState(false);

  const navigate = useNavigate();
  const avatarRef = useRef(null);
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();



  /* ================= CLICK OUTSIDE (FIX MOBILE MENU) ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        e.target.closest(".menu-trigger") ||
        e.target.closest(".popup-menu")
      ) {
        return;
      }

      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= CART LOCAL (GIỮ LOGIC CŨ) ================= */
  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const totalQty = cart.reduce(
        (sum, i) => sum + Number(i.qty || i.quantity || 0),
        0
      );
      setCartCount(totalQty);
    };

    update();
    window.addEventListener("cartUpdated", update);
    return () => window.removeEventListener("cartUpdated", update);
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    logout();
    toast.info("🚪 Đăng xuất thành công!");
    navigate("/login");
  };

  return (
    <>
      {/* ================= STYLE ================= */}
      <style>{`
        * { box-sizing: border-box; }

        .header-area {
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          height: ${HEADER_HEIGHT};
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          display: flex;
          align-items: center;
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
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        /* ===== USER ===== */
        .user-info-h {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #fff;
          color: #7a00ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-name {
          color: #fff;
          font-weight: 700;
          font-size: 14px;
        }

        .admin-badge {
          background: #ffd700;
          color: #333;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 2px;
          width: fit-content;
        }

        /* ===== DROPDOWN ===== */
        .avatar-dropdown {
          position: absolute;
          top: 55px;
          right: 0;
          background: #fff;
          border-radius: 12px;
          min-width: 220px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          padding: 8px;
          z-index: 3000;
          animation: fadeInDown .2s ease;
        }

        .avatar-dropdown::before {
          content: "";
          position: absolute;
          top: -6px;
          right: 14px;
          width: 12px;
          height: 12px;
          background: #fff;
          transform: rotate(45deg);
        }

        .avatar-dropdown a,
        .avatar-dropdown button {
          width: 100%;
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 8px;
          background: transparent;
          border: none;
          text-decoration: none;
          cursor: pointer;
          font-size: 14px;
          color: #444;
        }

        .avatar-dropdown a:hover,
        .avatar-dropdown button:hover {
          background: #f5f4ff;
          color: #7a00ff;
        }

        .dropdown-divider {
          height: 1px;
          background: #eee;
          margin: 6px 0;
        }

        .dropdown-logout {
          color: #ff4d4f;
          font-weight: 600;
        }

        /* ===== CART ===== */
        .cart-icon {
          position: relative;
          color: #fff;
          font-size: 24px;
          text-decoration: none;
        }

        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff4d4f;
          color: #fff;
          font-size: 11px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 50%;
          border: 2px solid #fff;
        }

        /* ===== MENU TRIGGER ===== */
        .menu-trigger {
          width: 40px;
          height: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          cursor: pointer;
        }

        .menu-trigger span {
          height: 2px;
          background: #fff;
        }

        /* ===== OVERLAY ===== */
        .menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.25);
          display: none;
          z-index: 1500;
        }

        .menu-overlay.show {
          display: block;
        }

        /* ===== POPUP MENU ===== */
        .popup-menu {
          position: fixed;
          top: ${HEADER_HEIGHT};
          right: 15px;
          width: 280px;
          background: #fff;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-20px) scale(.95);
          transition: .25s;
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

        .sub-menu {
          display: none;
          padding-left: 45px;
        }

        .sub-menu.show {
          display: block;
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 576px) {
          .user-name, .admin-badge { display: none; }
        }
      `}</style>

      {/* OVERLAY */}
      <div
        className={`menu-overlay ${menuOpen ? "show" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* ================= HEADER ================= */}
      <header className="header-area">
        <div className="container">
          <NavLink to="/" className="logo">
            <img src="/assets/images/logo.png" alt="Logo" />
          </NavLink>

          <div className="header-right">
            {user ? (
              <div
                className="user-info-h"
                ref={avatarRef}
                onClick={() => setAvatarOpen(!avatarOpen)}
              >
                <div className="user-avatar">
                  {user.avatar_url ? (
                    <img src={`http://127.0.0.1:5000${user.avatar_url}`} />
                  ) : (
                    user.full_name?.charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <div className="user-name">{user.full_name}</div>
                  {user.role === "admin" && (
                    <div className="admin-badge">ADMIN</div>
                  )}
                </div>

                {avatarOpen && (
                  <div className="avatar-dropdown">
                    <Link to="/profile">👤 Hồ sơ</Link>
                    <Link to="/orders">📦 Đơn hàng</Link>

                    {user.role === "admin" && (
                      <Link to="/admin">🛠️ Admin Panel</Link>
                    )}

                    <div className="dropdown-divider" />

                    <button
                      className="dropdown-logout"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarOpen(false);
                        handleLogout();
                      }}
                    >
                      🚪 Đăng xuất
                    </button>
                    
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <NavLink to="/login" style={{ color: "#fff" }}>
                  Đăng Nhập
                </NavLink>
                <NavLink to="/register" style={{ color: "#fff" }}>
                  Đăng Ký
                </NavLink>
              </div>
            )}

            {/* CART */}
            <Link to="/cart" className="cart-icon">
              🛒
              {(contextCartCount > 0 || cartCount > 0) && (
                <span className="cart-badge">
                  {contextCartCount || cartCount}
                </span>
              )}
            </Link>

            {/* MENU */}
            <div
              className={`menu-trigger ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE POPUP MENU ================= */}
      <div className={`popup-menu ${menuOpen ? "show" : ""}`}>
        {user && (
          <div style={{ padding: 15, background: "#f5f4ff" }}>
            <div className="user-avatar">
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontWeight: "bold" }}>{user.full_name}</div>
            {user.role === "admin" && (
              <div className="admin-badge">ADMIN</div>
            )}
          </div>
        )}

        <ul className="popup-nav">
          <li>
            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              <div className="icon-dot">🏠</div>Trang Chủ
            </NavLink>
          </li>

          <li>
            <div
              className="menu-item-span"
              onClick={() => setSubOpen(!subOpen)}
            >
              <div className="icon-dot">🔮</div>
              Thần Số Học
              <span style={{ marginLeft: "auto" }}>
                {subOpen ? "▲" : "▼"}
              </span>
            </div>

            <div className={`sub-menu ${subOpen ? "show" : ""}`}>
              <NavLink to="/lookup" onClick={() => setMenuOpen(false)}>
                Tra Cứu
              </NavLink>
              <NavLink to="/history" onClick={() => setMenuOpen(false)}>
                Lịch Sử Tra Cứu
              </NavLink>
            </div>
          </li>

          <li>
            <NavLink to="/shop" onClick={() => setMenuOpen(false)}>
              <div className="icon-dot">🛒</div>Cửa Hàng
            </NavLink>
          </li>

          {user && (
            <>
              <li>
                <NavLink to="/cart" onClick={() => setMenuOpen(false)}>
                  <div className="icon-dot">🛍️</div>Giỏ Hàng
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
                  <div className="icon-dot">👤</div>Hồ Sơ
                </NavLink>
              </li>
              <li>
                <NavLink to="/orders" onClick={() => setMenuOpen(false)}>
                  <div className="icon-dot">📦</div>Đơn Hàng
                </NavLink>
              </li>
            </>
          )}

          {user?.role === "admin" && (
            <li>
              <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
                <div className="icon-dot">🛠️</div>Admin Panel
              </NavLink>
            </li>
          )}

          {!user && (
            <>
              <li>
                <NavLink to="/login" onClick={() => setMenuOpen(false)}>
                  <div className="icon-dot">🔐</div>Đăng Nhập
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" onClick={() => setMenuOpen(false)}>
                  <div className="icon-dot">📝</div>Đăng Ký
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
}

export default Header;
