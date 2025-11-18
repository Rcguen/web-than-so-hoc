import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const navigate = useNavigate();
  
  const HEADER_HEIGHT = "80px"; 
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    setMenuOpen(false);
  };

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.paddingTop = HEADER_HEIGHT;
    return () => { document.body.style.paddingTop = "0px"; };
  }, []);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        
        /* --- 1. HEADER CHÍNH --- */
        .header-area {
          position: fixed; top: 0; left: 0; width: 100%; height: ${HEADER_HEIGHT};
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex; align-items: center;
        }
        .header-area .container {
          width: 100%; padding: 0 20px; display: flex; justify-content: space-between; align-items: center;
        }
        .logo img { height: 55px; width: auto; object-fit: contain; transform: translateY(-2px); }

        /* --- KHU VỰC PHẢI --- */
        .header-right { display: flex; align-items: center; gap: 15px; }

        /* Nút Auth trên Header */
        .header-auth { display: flex; align-items: center; gap: 10px; }
        .btn-header-auth {
          text-decoration: none; font-size: 14px; font-weight: 600; padding: 8px 16px;
          border-radius: 20px; transition: all 0.2s; white-space: nowrap;
        }
        .btn-login-h { color: #fff; background: rgba(255,255,255,0.1); }
        .btn-login-h:hover { background: rgba(255,255,255,0.2); }
        .btn-register-h { background: #fff; color: #7a00ff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .btn-register-h:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        
        /* User đã đăng nhập */
        .user-info-h { display: flex; align-items: center; gap: 10px; }
        .user-name { color: #fff; font-weight: bold; font-size: 14px; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .btn-logout-h { background: transparent; border: 1px solid rgba(255,255,255,0.5); color: #fff; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; }
        .btn-logout-h:hover { background: rgba(255,255,255,0.1); border-color: #fff; }

        /* --- TRIGGER BUTTON --- */
        .menu-trigger {
          display: flex; flex-direction: column; justify-content: space-between;
          width: 36px; height: 36px; padding: 9px; cursor: pointer; z-index: 2001; 
          background: rgba(255,255,255,0.2); border-radius: 50%; transition: background 0.2s;
        }
        .menu-trigger:hover, .menu-trigger.active { background: rgba(255,255,255,0.35); }
        .menu-trigger span { display: block; height: 2px; width: 100%; background: #fff; border-radius: 2px; transition: all 0.3s; }
        .menu-trigger.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .menu-trigger.active span:nth-child(2) { opacity: 0; }
        .menu-trigger.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -6px); }

        /* --- POPUP MENU --- */
        .popup-menu {
          position: fixed; top: 75px; right: 15px; width: 280px;
          background: #fff; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          z-index: 2000; opacity: 0; visibility: hidden;
          transform: translateY(-20px) scale(0.95);
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          padding-bottom: 10px;
        }
        .popup-menu.show { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }

        .popup-nav { list-style: none; padding: 10px; margin: 0; }
        .popup-nav li { margin-bottom: 5px; }

        .popup-nav a, .popup-nav .menu-item-span {
          display: flex; align-items: center; padding: 12px 15px;
          border-radius: 8px; color: #333; text-decoration: none;
          font-weight: 500; font-size: 15px; transition: background 0.2s; cursor: pointer;
        }
        
        /* Hiệu ứng Hover */
        .popup-nav a:hover, .popup-nav .menu-item-span:hover { background: #f0f2f5; }
        
        /* Hiệu ứng khi đang ở trang đó (Active) */
        .popup-nav a.active { background: #f3e8ff; color: #7a00ff; font-weight: 700; }
        .popup-nav a.active .icon-dot { background: #7a00ff; color: #fff; }

        .icon-dot {
          width: 30px; height: 30px; background: #eee; border-radius: 50%;
          margin-right: 12px; display: flex; align-items: center; justify-content: center;
          color: #7a00ff; font-size: 14px; transition: all 0.2s;
        }

        /* Sub Menu */
        .sub-menu { padding-left: 45px; display: none; }
        .sub-menu.show { display: block; }
        .sub-menu a { padding: 8px 0; font-size: 14px; color: #666; }
        .sub-menu a:hover { color: #7a00ff; text-decoration: underline; background: transparent; }
        .sub-menu a.active { color: #7a00ff; font-weight: bold; }

        /* Overlay */
        .menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1999; display: none; }
        .menu-overlay.show { display: block; }

        @media (max-width: 500px) {
           .btn-login-h { display: none; } 
           .btn-header-auth { padding: 6px 12px; font-size: 12px; }
        }
      `}</style>

      <div className={`menu-overlay ${menuOpen ? "show" : ""}`} onClick={() => setMenuOpen(false)}></div>

      <header className="header-area">
        <div className="container">
          <NavLink to="/" className="logo">
            <img src="/assets/images/logo.png" alt="Logo" />
          </NavLink>

          <div className="header-right">
            <div className="header-auth">
              {user ? (
                <div className="user-info-h">
                   <span className="user-name">Hi, {user.full_name.split(' ').pop()}</span>
                   <button className="btn-logout-h" onClick={handleLogout}>Thoát</button>
                </div>
              ) : (
                <>
                  <NavLink to="/login" className="btn-header-auth btn-login-h">Đăng Nhập</NavLink>
                  <NavLink to="/register" className="btn-header-auth btn-register-h">Đăng Ký</NavLink>
                </>
              )}
            </div>

            <div className={`menu-trigger ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
              <span></span><span></span><span></span>
            </div>
          </div>

          {/* --- MENU POPUP ĐÃ ĐƯỢC CẤU HÌNH LINK --- */}
          <div className={`popup-menu ${menuOpen ? "show" : ""}`}>
            <ul className="popup-nav">
              
              {/* 1. TRANG CHỦ (Bấm vào là đóng menu + chuyển trang) */}
              <li>
                <NavLink to="/" onClick={() => setMenuOpen(false)}>
                  <span className="icon-dot">🏠</span> Trang Chủ
                </NavLink>
              </li>
              
              {/* 2. THẦN SỐ HỌC (Dropdown - Chỉ mở menu con) */}
              <li>
                <div className="menu-item-span" onClick={() => setDropdownOpen(dropdownOpen === 1 ? null : 1)}>
                  <span className="icon-dot">🔮</span> 
                  <div style={{flex: 1}}>Thần Số Học</div>
                  <span style={{fontSize: '12px', color: '#999'}}>{dropdownOpen === 1 ? '▲' : '▼'}</span>
                </div>
                
                {/* MENU CON (Bấm vào là chuyển trang) */}
                <div className={`sub-menu ${dropdownOpen === 1 ? "show" : ""}`}>
                  <NavLink to="/lookup" onClick={() => setMenuOpen(false)}>Tra Cứu</NavLink>
                  <NavLink to="/services" onClick={() => setMenuOpen(false)}>Các Chỉ Số</NavLink>
                  <NavLink to="/projects" onClick={() => setMenuOpen(false)}>Báo Cáo Mẫu</NavLink>
                  <NavLink to="/history" onClick={() => setMenuOpen(false)}>Lịch Sử</NavLink>
                </div>
              </li>

              {/* 3. CỬA HÀNG */}
              <li>
                <NavLink to="/shop" onClick={() => setMenuOpen(false)}>
                  <span className="icon-dot">🛍️</span> Cửa Hàng
                </NavLink>
              </li>

              {/* 4. GIỎ HÀNG */}
              <li>
                <NavLink to="/cart" onClick={() => setMenuOpen(false)}>
                  <span className="icon-dot">🛒</span> Giỏ Hàng
                </NavLink>
              </li>

              {/* 5. LIÊN HỆ */}
              <li>
                <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
                  <span className="icon-dot">📞</span> Liên Hệ
                </NavLink>
              </li>

            </ul>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;