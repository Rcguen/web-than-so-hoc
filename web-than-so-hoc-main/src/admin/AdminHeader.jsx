import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminlayout.css";

export default function AdminHeader({ onToggle }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/admin/search?q=${encodeURIComponent(q)}`);
    setQ("");
  };

  return (
    <header className="admin-header">
      {/* NÚT THỤT SIDEBAR */}
      <button className="sidebar-toggle" onClick={onToggle}>
        ☰
      </button>

      <div className="admin-title">Admin Dashboard</div>

      <form className="admin-search" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="🔍 Tìm sản phẩm, đơn hàng, user..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>

      <div className="admin-user">👤 Admin</div>
    </header>
  );
}
