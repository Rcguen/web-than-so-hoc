import { useEffect, useState } from "react";
import axios from "axios";
import LifePathChart from "../../components/charts/LifePathChart"; // component chart em gửi thầy
import "./admindashboard.css";
import LookupChart from "../../components/charts/LookupChart";
import OrderChart from "../../components/charts/OrderChart";


function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState({
    total_users: 0,
  total_products: 0,
  total_categories: 0,
  total_orders: 0,
  total_lookups: 0,
  });

  

  const [lookupByDay, setLookupByDay] = useState([]);
  const [ordersByDay, setOrdersByDay] = useState([]);


  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/admin/dashboard")
      .then((res) => {
        setStats(res.data.life_path_stats || []);
         setLookupByDay(res.data.lookup_by_day || []);
      setOrdersByDay(res.data.orders_by_day || []);
        setSummary({
  total_users: res.data.total_users,
  total_products: res.data.total_products,
  total_categories: res.data.total_categories,
  total_orders: res.data.total_orders,
  total_lookups: res.data.total_lookups,
});
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Đang tải dashboard...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      {/* SUMMARY CARDS */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div className="dashboard-card">
          <h3>Tổng người dùng</h3>
          <p>{summary.total_users}</p>
        </div>

        <div className="dashboard-card">
          <h3>Lượt tra cứu</h3>
          <p>{summary.total_lookups}</p>
        </div>
      </div>

      {/* CHART */}
      <div style={{ marginTop: 40, maxWidth: 800 }}>
        <h2>Phân bố chỉ số Đường Đời</h2>
        <LifePathChart stats={stats} />
      </div>

      <div style={{ marginTop: 50 }}>
  <h2>Lượt tra cứu theo ngày</h2>
  <LookupChart data={lookupByDay} />
</div>

<div style={{ marginTop: 50 }}>
  <h2>Đơn hàng theo ngày</h2>
  <OrderChart data={ordersByDay} />
</div>

    <div className="dashboard-card">
  <h3>Sản phẩm</h3>
  <p>{summary.total_products}</p>
</div>

<div className="dashboard-card">
  <h3>Danh mục</h3>
  <p>{summary.total_categories}</p>
</div>

<div className="dashboard-card">
  <h3>Đơn hàng</h3>
  <p>{summary.total_orders}</p>
</div>

    </div>
    
  );
}

export default AdminDashboard;
