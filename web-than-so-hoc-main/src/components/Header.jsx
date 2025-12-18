import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const HEADER_HEIGHT = "80px";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { cartCount: contextCartCount } = useCart();
  const navigate = useNavigate();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);

  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const totalQty = cart.reduce((sum, i) => sum + Number(i.qty || i.quantity || 0), 0);
      setCartCount(totalQty);
    };
    update();
    window.addEventListener("cartUpdated", update);
    return () => window.removeEventListener("cartUpdated", update);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info("🚪 Đăng xuất thành công!");
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
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 20px;
        }

        .logo img {
          height: 55px; width: auto; object-fit: contain;
        }

        /* HEADER RIGHT AREA */
        .header-right {
          display: flex; align-items: center; gap: 20px;
        }

        /* --- USER AVATAR & DROPDOWN (STYLE MỚI) --- */
        .user-info-h {
          position: relative;
          display: flex; align-items: center; gap: 10px; cursor: pointer;
        }

        .user-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: #fff;
          color: #7a00ff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          border: 2px solid rgba(255,255,255,0.8);
          transition: transform 0.2s;
        }
        .user-info-h:hover .user-avatar { transform: scale(1.05); }

        .user-details {
          display: flex; flex-direction: column; line-height: 1.2;
        }
        .user-name {
          color: #fff; font-weight: 700; font-size: 14px;
        }
        
        .admin-badge {
          display: inline-block;
          background: #ffd700; color: #333;
          font-size: 10px; font-weight: 800;
          padding: 2px 6px; border-radius: 4px;
          width: fit-content; margin-top: 2px;
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        .avatar-dropdown {
          position: absolute;
          top: 55px; right: 0;
          background: #fff;
          border-radius: 12px;
          min-width: 220px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          padding: 8px;
          z-index: 3000;
          animation: fadeInDown 0.2s ease-out;
          border: 1px solid rgba(0,0,0,0.05);
        }
        /* Mũi tên trỏ lên của dropdown */
        .avatar-dropdown::before {
          content: "";
          position: absolute; top: -6px; right: 14px;
          width: 12px; height: 12px;
          background: #fff; transform: rotate(45deg);
          border-top: 1px solid rgba(0,0,0,0.05);
          border-left: 1px solid rgba(0,0,0,0.05);
        }

        .avatar-dropdown a,
        .avatar-dropdown button {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 12px;
          border-radius: 8px;
          text-decoration: none; border: none; background: transparent;
          text-align: left; cursor: pointer;
          font-size: 14px; color: #444; font-weight: 500;
          transition: background 0.2s;
        }

        .avatar-dropdown a:hover,
        .avatar-dropdown button:hover {
          background: #f5f4ff; color: #7a00ff;
        }

        .dropdown-divider {
          height: 1px; background: #eee; margin: 6px 0;
        }

        .dropdown-logout {
          color: #ff4d4f !important;
        }
        .dropdown-logout:hover {
          background: #fff1f0 !important;
        }

        /* CART ICON */
        .cart-icon {
          position: relative; color: #fff; font-size: 24px; text-decoration: none;
          display: flex; align-items: center;
        }
        .cart-badge {
          position: absolute; top: -8px; right: -8px;
          background: #ff4d4f; color: #fff;
          font-size: 11px; font-weight: bold;
          padding: 2px 6px; border-radius: 50%;
          min-width: 18px; text-align: center;
          border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        /* MENU TRIGGER */
        .menu-trigger {
          display: flex; flex-direction: column; justify-content: center; gap: 6px;
          width: 40px; height: 40px; padding: 8px; border-radius: 50%;
          cursor: pointer; background: rgba(255,255,255,0.25); transition: 0.2s; z-index: 2001;
        }
        .menu-trigger:hover { background: rgba(255,255,255,0.35); }
        .menu-trigger span { height: 2px; width: 100%; background: #fff; transition: 0.3s; border-radius: 2px; }
        .menu-trigger.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .menu-trigger.active span:nth-child(2) { opacity: 0; }
        .menu-trigger.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        /* POPUP MENU (Mobile) */
        .popup-menu {
          position: fixed; top: ${HEADER_HEIGHT}; right: 15px; width: 280px;
          background: #fff; border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2); padding-bottom: 10px;
          opacity: 0; visibility: hidden; transform: translateY(-20px) scale(0.95);
          transition: all 0.25s ease; z-index: 2000;
          max-height: 80vh; overflow-y: auto;
        }
        .popup-menu.show { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }

        .popup-nav { list-style: none; padding: 10px; margin: 0; }
        .popup-nav a, .menu-item-span {
          display: flex; align-items: center; padding: 12px 15px;
          border-radius: 10px; cursor: pointer; text-decoration: none;
          color: #333; font-weight: 500; font-size: 15px;
        }
        .icon-dot {
          width: 32px; height: 32px; border-radius: 50%; background: #eee;
          display: flex; justify-content: center; align-items: center;
          margin-right: 12px; color: #7a00ff;
        }
        .popup-nav a:hover, .menu-item-span:hover { background: #f5f4ff; }
        .popup-nav a.active { background: #f3e8ff; color: #7a00ff; font-weight: 700; }

        .sub-menu { display: none; padding-left: 45px; margin-top: 5px; }
        .sub-menu.show { display: block; }
        .sub-menu a { padding: 7px 0; font-size: 14px; color: #666; }
        .sub-menu a:hover { color: #7a00ff; }

        .menu-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          display: none; background: rgba(0,0,0,0.3); z-index: 1500;
        }
        .menu-overlay.show { display: block; }

        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Ẩn tên user trên mobile để gọn */
        @media (max-width: 576px) {
          .user-name { display: none; }
          .admin-badge { display: none; }
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
            <img src="/assets/images/logo.png" alt="Logo" />
          </NavLink>

          <div className="header-right">

            {/* --- AVATAR & DROPDOWN --- */}
            {user ? (
              <div className="user-info-h" ref={avatarRef} onClick={() => setAvatarOpen(!avatarOpen)}>
                
                {/* Avatar Circle */}
                <div className="user-avatar">
                  {user.avatar_url ? (
                    <img 
                      src={`http://127.0.0.1:5000${user.avatar_url}`} 
                      alt="AVT" 
                      style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} 
                    />
                  ) : (
                    user.full_name?.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Name & Badge */}
                <div className="user-details">
                  <span className="user-name">{user.full_name}</span>
                  {user.role === "admin" && <span className="admin-badge">ADMIN</span>}
                </div>

                {/* Dropdown Menu */}
                {avatarOpen && (
                  <div className="avatar-dropdown">
                    {/* User Links */}
                    <Link to="/profile" onClick={() => setAvatarOpen(false)}>
                      👤 Hồ sơ của tôi
                    </Link>
                    <Link to="/orders" onClick={() => setAvatarOpen(false)}>
                      📦 Đơn hàng
                    </Link>

                    {/* Admin Link */}
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setAvatarOpen(false)}>
                        🛠️ Admin Panel
                      </Link>
                    )}

                    <div className="dropdown-divider" />

                    <button className="dropdown-logout" onClick={(e) => { e.stopPropagation(); setAvatarOpen(false); handleLogout(); }}>
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Nút Đăng nhập/Đăng ký nếu chưa login
              <div style={{display: 'flex', gap: '10px'}}>
                 <NavLink to="/login" style={{color: '#fff', textDecoration: 'none', fontWeight: 600}}>Đăng Nhập</NavLink>
                 <NavLink to="/register" style={{color: '#fff', textDecoration: 'none', fontWeight: 600}}>Đăng Ký</NavLink>
              </div>
            )}

            {/* --- CART ICON --- */}
            <Link to="/cart" className="cart-icon">
              <span>🛒</span>
              {(contextCartCount > 0 || cartCount > 0) && (
                <span className="cart-badge">
                  {contextCartCount || cartCount}
                </span>
              )}
            </Link>

            {/* --- MOBILE MENU TRIGGER --- */}
            <div 
              className={`menu-trigger ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span><span></span><span></span>
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE POPUP MENU */}
      <div className={`popup-menu ${menuOpen ? "show" : ""}`}>
        
        {/* User Info in Mobile Menu */}
        {user && (
          <div style={{ padding: "15px", background: "#f8f9fa", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: "10px", borderRadius: "15px 15px 0 0" }}>
            <div className="user-avatar" style={{width: '35px', height: '35px', fontSize: '14px', border: 'none', boxShadow: 'none', background: '#7a00ff', color: '#fff'}}>
               {user.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "14px", color: "#333" }}>{user.full_name}</div>
              {user.role === "admin" && <span className="admin-badge" style={{fontSize: '9px'}}>ADMIN</span>}
            </div>
          </div>
        )}

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
              <span style={{ marginLeft: "auto", fontSize: "12px", color: "#999" }}>{subOpen ? "▲" : "▼"}</span>
            </div>
            <div className={`sub-menu ${subOpen ? "show" : ""}`}>
              <NavLink to="/lookup" onClick={() => setMenuOpen(false)}>Tra Cứu</NavLink>
              <NavLink to="/services" onClick={() => setMenuOpen(false)}>Các Chỉ Số</NavLink>
              <NavLink to="/projects" onClick={() => setMenuOpen(false)}>Báo Cáo Mẫu</NavLink>
            </div>
          </li>

          <li>
            <NavLink to="/shop" onClick={() => setMenuOpen(false)}>
              <div className="icon-dot">🛒</div>Cửa Hàng
            </NavLink>
          </li>

          {/* Nếu chưa login thì hiện trong menu */}
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