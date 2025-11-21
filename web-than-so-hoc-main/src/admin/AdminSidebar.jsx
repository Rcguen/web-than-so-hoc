import React from "react";
import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <div className="admin-sidebar">
      <h2 className="admin-logo">🔮 ADMIN</h2>

      <ul className="admin-menu">
        <li><NavLink to="/admin">Dashboard</NavLink></li>
        <li><NavLink to="/admin/orders">Đơn Hàng</NavLink></li>
        <li><NavLink to="/admin/products">Sản Phẩm</NavLink></li>
      </ul>
    </div>
  );
}
