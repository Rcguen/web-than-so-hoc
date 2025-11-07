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
            <img
              src="/assets/images/logo.png"
              alt="logo"
              style={{ maxWidth: "112px" }}
            />
          </NavLink>

          {/* Menu trái */}
          <ul className={`nav ${menuOpen ? "show" : ""}`}>
            <li><NavLink to="/" className="menu-link">Trang Chủ</NavLink></li>
            <li><NavLink to="/lookup" className="menu-link">Số Chủ Đạo</NavLink></li>
            <li><a href="#services" className="menu-link">Các Chỉ Số</a></li>
            <li><a href="#projects" className="menu-link">Báo Cáo Mẫu</a></li>
            <li><a href="#infos" className="menu-link">Giới Thiệu</a></li>
            <li><a href="#contact" className="menu-link">Liên Hệ</a></li>
          </ul>

          {/* Menu người dùng bên phải */}
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


          <div
            className={`menu-trigger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
