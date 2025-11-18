import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* OVERLAY MENU */}
      <div 
        className={`overlay ${menuOpen ? "show" : ""}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* SIDE PANEL MENU */}
      <div className={`side-menu ${menuOpen ? "open" : ""}`}>
        <h3 className="side-title">MENU</h3>

        <ul className="side-nav">
          <li><NavLink to="/" onClick={() => setMenuOpen(false)}>Trang Chủ</NavLink></li>

          {/* Dropdown Thần số học */}
          <li className="dropdown">
            <span onClick={() => setDropdownOpen(dropdownOpen === 1 ? null : 1)}>
              🔮 Thần Số Học
            </span>
            <ul className={`dropdown-content ${dropdownOpen === 1 ? "show" : ""}`}>
              <li><NavLink to="/lookup" onClick={() => setMenuOpen(false)}>Tra Cứu</NavLink></li>
              <li><NavLink to="/services" onClick={() => setMenuOpen(false)}>Các Chỉ Số</NavLink></li>
              <li><NavLink to="/projects" onClick={() => setMenuOpen(false)}>Báo Cáo Mẫu</NavLink></li>
              <li><NavLink to="/history" onClick={() => setMenuOpen(false)}>Lịch Sử</NavLink></li>
            </ul>
          </li>

          {/* Shop */}
          <li><NavLink to="/shop" onClick={() => setMenuOpen(false)}>Cửa Hàng</NavLink></li>
          <li><NavLink to="/cart" onClick={() => setMenuOpen(false)}>Giỏ Hàng</NavLink></li>
          <li><NavLink to="/contact" onClick={() => setMenuOpen(false)}>Liên Hệ</NavLink></li>
        </ul>
      </div>

      {/* HEADER */}
      <header className="header-area header-sticky">
        <div className="container">
          <nav className="main-nav">
            <NavLink to="/" className="logo">
              <img src="/assets/images/logo.png" alt="logo" style={{ maxWidth: 112 }} />
            </NavLink>

            {/* MENU PC */}
            <ul className="nav desktop-only">
              <li className="menu-item dropdown-hover">
                <span>Thần Số Học ⌄</span>
                <ul className="dropdown-menu">
                  <li><NavLink to="/lookup">Tra Cứu</NavLink></li>
                  <li><NavLink to="/services">Các Chỉ Số</NavLink></li>
                  <li><NavLink to="/projects">Báo Cáo Mẫu</NavLink></li>
                  <li><NavLink to="/history">Lịch Sử</NavLink></li>
                </ul>
              </li>

              <li><NavLink to="/shop">Cửa Hàng</NavLink></li>
              <li><NavLink to="/cart">Giỏ Hàng</NavLink></li>
              <li><NavLink to="/contact">Liên Hệ</NavLink></li>
            </ul>

            {/* USER */}
            <div className="right-user desktop-only">
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

            {/* HAMBURGER BUTTON */}
            <div 
              className={`menu-trigger ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

export default Header;
