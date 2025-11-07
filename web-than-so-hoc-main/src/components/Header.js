import React, { useState } from "react";
import { NavLink } from "react-router-dom";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="header-area header-sticky">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <nav className="main-nav">
                <NavLink to="/" className="logo">
                  <img
                    src="/assets/images/logo.png"
                    alt="logo"
                    style={{ maxWidth: "112px" }}
                  />
                </NavLink>

                {/* Nút bật/tắt menu trên mobile */}
                <div
                  className={`menu-trigger ${menuOpen ? "active" : ""}`}
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <span></span>
                </div>

                {/* Menu chính */}
                <ul className={`nav ${menuOpen ? "show" : ""}`}>
                  <li><NavLink to="/" className="menu-link">Trang Chủ</NavLink></li>
                  <li><NavLink to="/lookup" className="menu-link">Số Chủ Đạo</NavLink></li>
                  <li><a href="#services" className="menu-link">Các Chỉ Số</a></li>
                  <li><a href="#projects" className="menu-link">Báo Cáo Mẫu</a></li>
                  <li><a href="#infos" className="menu-link">Giới Thiệu</a></li>
                  <li><a href="#contact" className="menu-link">Liên Hệ</a></li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
