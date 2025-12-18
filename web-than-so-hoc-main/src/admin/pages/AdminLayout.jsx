import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../AdminSidebar";
import AdminHeader from "../AdminHeader";
import "./admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
