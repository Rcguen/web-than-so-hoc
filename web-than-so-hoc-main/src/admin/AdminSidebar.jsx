import React from "react";
import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <div className="admin-sidebar">
      <h2 className="admin-logo">🔮 ADMIN</h2>

      <ul className="admin-menu">
        <li><NavLink to="/admin/dashboard">Dashboard</NavLink></li>
        <li><NavLink to="/admin/orders">Đơn Hàng</NavLink></li>
        <li><NavLink to="/admin/products">Sản Phẩm</NavLink></li>
        <li><NavLink to="/admin/users">Người Dùng</NavLink></li>
        <li>
  <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? "active" : "")}>
    📂 Danh mục
  </NavLink>
</li>        <li>
          <NavLink to="/admin/messages">💬 Tin nhắn</NavLink>
        </li>      </ul>
    </div>
  );
}
