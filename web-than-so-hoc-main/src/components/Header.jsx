import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Tăng chiều cao lên 80px để logo trông to và thoáng hơn
  const HEADER_HEIGHT = "80px"; 
  
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.paddingTop = HEADER_HEIGHT; // Đẩy nội dung xuống
    return () => { document.body.style.paddingTop = "0px"; };
  }, []);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        
        /* --- HEADER STYLE --- */
        .header-area {
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          height: ${HEADER_HEIGHT};
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex; 
          align-items: center; /* MẤU CHỐT: Canh giữa tất cả theo chiều dọc */
        }

        .header-area .container {
          max-width: 100%; /* Dùng full màn hình như YouTube (hoặc để 1400px) */
          padding: 0 30px; /* Khoảng cách lề trái phải cho thoáng */
          width: 100%;
          height: 100%;
        }

        .main-nav {
          display: flex;
          align-items: center; /* Canh giữa dọc */
          justify-content: space-between; /* Logo trái - Menu phải */
          height: 100%;
        }

        /* --- LOGO TO VÀ CANH GIỮA --- */
        .logo {
          display: flex;
          align-items: center; /* Đảm bảo ảnh nằm giữa vùng chứa */
          height: 100%;        /* Chiều cao bằng Header */
          text-decoration: none;
          flex-shrink: 0;      /* Không bị co lại khi màn hình nhỏ */
        }
        
       .logo img {
          height: 120px;
          width: auto;
          object-fit: contain;
          display: block;
          
          /* ===> THÊM DÒNG NÀY ĐỂ NHÍCH LOGO LÊN <=== */
          transform: translateY(-13px); 
          /* Chỉnh số -5 thành -8 hoặc -10 nếu muốn lên cao hơn nữa */
        }

        /* MENU BÊN PHẢI */
        .desktop-wrapper {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .nav {
          display: flex;
          list-style: none;
          margin: 0; padding: 0;
          gap: 25px;
        }
        .nav li a {
          color: #fff;
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
          text-transform: uppercase;
          transition: opacity 0.2s;
        }
        .nav li a:hover { opacity: 0.7; }

        /* USER ACTIONS */
        .right-user {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .user-text {
          color: #fff;
          font-weight: 600;
          margin-right: 5px;
          font-size: 14px;
        }
        
        .btn-auth {
          padding: 9px 22px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        
        .btn-login {
          border: 1px solid rgba(255,255,255,0.7);
          color: #fff;
          background: transparent;
        }
        .btn-login:hover {
          border-color: #fff;
          background: rgba(255,255,255,0.1);
        }

        .btn-register, .btn-logout {
          background: #fff;
          color: #7a00ff;
          border: none;
        }
        .btn-register:hover, .btn-logout:hover {
          background: #f0f0f0;
          transform: translateY(-1px);
        }

        /* MOBILE */
        .menu-trigger { display: none; cursor: pointer; }
        .menu-trigger span {
          display: block; width: 26px; height: 3px;
          background: #fff; margin-bottom: 5px;
          border-radius: 4px;
        }

        @media (max-width: 991px) {
          .menu-trigger { display: block; }
          .desktop-wrapper {
            position: fixed;
            top: ${HEADER_HEIGHT};
            right: -100%;
            width: 280px;
            height: calc(100vh - ${HEADER_HEIGHT});
            background: #fff;
            flex-direction: column;
            padding: 20px;
            transition: right 0.3s ease;
            box-shadow: -5px 0 15px rgba(0,0,0,0.1);
            align-items: flex-start;
            gap: 20px;
          }
          .desktop-wrapper.show-mobile { right: 0; }
          
          .nav { flex-direction: column; width: 100%; gap: 0; }
          .nav li a { color: #333; padding: 15px 0; display: block; border-bottom: 1px solid #eee; }
          
          .right-user { flex-direction: column; width: 100%; margin-top: 10px; }
          .user-text { color: #333; }
          .btn-login, .btn-register, .btn-logout { width: 100%; text-align: center; border: 1px solid #7a00ff; padding: 10px; margin-bottom: 10px; }
          .btn-login { color: #7a00ff; }
          .btn-register { background: #7a00ff; color: #fff; }
        }

        .react-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 900;
          opacity: 0; visibility: hidden;
          transition: all 0.3s;
        }
        .react-overlay.show { opacity: 1; visibility: visible; }
      `}</style>

      <div id="react-header-wrapper">
        <div 
          className={`react-overlay ${menuOpen ? "show" : ""}`}
          onClick={() => setMenuOpen(false)}
        ></div>

        <header className="header-area">
          <div className="container">
            <nav className="main-nav">
              
              {/* LOGO: Đã chỉnh to và canh giữa */}
              <NavLink to="/" className="logo">
                <img src="/assets/images/logo.png" alt="Logo" />
              </NavLink>
              
              <div className={`desktop-wrapper ${menuOpen ? "show-mobile" : ""}`}>
                <ul className="nav">
                  <li><NavLink to="/" onClick={() => setMenuOpen(false)}>Trang Chủ</NavLink></li>
                  <li><NavLink to="/shop" onClick={() => setMenuOpen(false)}>Cửa Hàng</NavLink></li>
                  <li><NavLink to="/cart" onClick={() => setMenuOpen(false)}>Giỏ Hàng</NavLink></li>
                  <li><NavLink to="/contact" onClick={() => setMenuOpen(false)}>Liên Hệ</NavLink></li>
                </ul>

                <div className="right-user">
                  {user ? (
                    <>
                      <span className="user-text">Chào, {user.full_name}</span>
                      <button className="btn-auth btn-logout" onClick={handleLogout}>
                        Đăng Xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink to="/login" className="btn-auth btn-login" onClick={() => setMenuOpen(false)}>
                        Đăng Nhập
                      </NavLink>
                      <NavLink to="/register" className="btn-auth btn-register" onClick={() => setMenuOpen(false)}>
                        Đăng Ký
                      </NavLink>
                    </>
                  )}
                </div>
              </div> 
              
              <div 
                className="menu-trigger"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span></span>
                <span></span>
                <span></span>
              </div>

            </nav>
          </div>
        </header>
      </div> 
    </>
  );
}

export default Header;