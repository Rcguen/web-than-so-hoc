import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="header-area header-sticky">
      <div className="container">
        <nav className="main-nav">
          <NavLink to="/" className="logo">
            <img src="/assets/images/logo.png" alt="logo" style={{ maxWidth: 112 }} />
          </NavLink>

          <ul className={`nav ${menuOpen ? "show" : ""}`}>
    <li><NavLink to="/" className="menu-link">Trang Chủ</NavLink></li>
    <li><NavLink to="/lookup" className="menu-link">Số Chủ Đạo</NavLink></li>
    <li><NavLink to="/services" className="menu-link">Các Chỉ Số</NavLink></li>
    <li><NavLink to="/projects" className="menu-link">Báo Cáo Mẫu</NavLink></li>
    <li><NavLink to="/infos" className="menu-link">Giới Thiệu</NavLink></li>
    <li><NavLink to="/contact" className="menu-link">Liên Hệ</NavLink></li>
    <li><NavLink to="/history" className="menu-link">Lịch Sử</NavLink></li>
    <li><NavLink to="/shop" className="menu-link">Cửa Hàng</NavLink></li>
</ul>


          <div className="right-user">
            {user ? (
              <>
                <span className="user-text">👋 Xin chào, <b>{user.full_name}</b></span>
                <button className="btn-logout" onClick={handleLogout}>Đăng Xuất</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn-login">Đăng Nhập</NavLink>
                <NavLink to="/register" className="btn-register">Đăng Ký</NavLink>
              </>
            )}
          </div>

          <div className={`menu-trigger ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
          </div>
        </nav>
      </div>
    </header>
  );
}
export default Header;
