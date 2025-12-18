import React from "react";

export default function AdminHeader() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="admin-header">
      <span className="admin-title">Admin Panel</span>

      <div className="admin-user">
        <span>👤 {user?.full_name || "Admin"}</span>
      </div>
    </div>
  );
}
