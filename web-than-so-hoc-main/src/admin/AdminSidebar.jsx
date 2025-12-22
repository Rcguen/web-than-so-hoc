import React from "react";
import { NavLink } from "react-router-dom";
import "./adminlayout.css";

export default function AdminSidebar({ collapsed }) {
  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* LOGO */}
      <div className="admin-logo">
        <span className="logo-icon">🔮</span>
        {!collapsed && <span className="logo-text">ADMIN PANEL</span>}
      </div>

      {/* MENU */}
      <ul className="admin-menu">
        <li>
          <NavLink to="/admin/dashboard">
            📊 {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/orders">
            🧾 {!collapsed && <span>Đơn Hàng</span>}
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/products">
            🛒 {!collapsed && <span>Sản Phẩm</span>}
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/users">
            👤 {!collapsed && <span>Người Dùng</span>}
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/categories">
            📂 {!collapsed && <span>Danh Mục</span>}
          </NavLink>
        </li>
      </ul>

      <div className="admin-sidebar-footer">
        <small>© 2025 Numerology Admin</small>
      </div>
    </aside>
  );
}
