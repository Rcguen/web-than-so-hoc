import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`admin-layout ${collapsed ? "collapsed" : ""}`}>
      <AdminSidebar collapsed={collapsed} />

      <div className="admin-main">
        <AdminHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
