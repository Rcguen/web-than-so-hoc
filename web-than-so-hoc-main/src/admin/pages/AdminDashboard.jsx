import { useEffect, useState } from "react";
import axios from "axios";
import LifePathChart from "../../components/charts/LifePathChart";
import LookupChart from "../../components/charts/LookupChart";
import OrderChart from "../../components/charts/OrderChart";
import "./admindashboard.css";

/* ===== MOCK FALLBACK ===== */
const mockLookupByDate = {
  labels: ["18/12", "19/12", "20/12", "21/12", "22/12"],
  datasets: [
    {
      label: "Lượt tra cứu",
      data: [6, 9, 14, 8, 12],
      backgroundColor: "#7b2ff7",
      borderRadius: 8,
    },
  ],
};

const mockOrdersByDate = {
  labels: ["18/12", "19/12", "20/12", "21/12", "22/12"],
  datasets: [
    {
      label: "Đơn hàng",
      data: [1, 3, 5, 4, 6],
      backgroundColor: "#22c55e",
      borderRadius: 8,
    },
  ],
};

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [lookupByDay, setLookupByDay] = useState([]);
  const [ordersByDay, setOrdersByDay] = useState([]);
  const [summary, setSummary] = useState({
    total_users: 0,
    total_products: 0,
    total_categories: 0,
    total_orders: 0,
  });

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/admin/dashboard")
      .then((res) => {
        console.log("DASHBOARD API:", res.data); 
        setStats(res.data.life_path_stats || []);
        setLookupByDay(res.data.lookup_by_day || []);
        setOrdersByDay(res.data.orders_by_day || []);
        setSummary({
          total_users: res.data.total_users,
          total_products: res.data.total_products,
          total_categories: res.data.total_categories,
          total_orders: res.data.total_orders,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Đang tải dashboard...</p>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* SUMMARY */}
      <div className="stats-grid">
        <div className="stat-card purple">👤 User: {summary.total_users}</div>
        <div className="stat-card green">📦 SP: {summary.total_products}</div>
        <div className="stat-card blue">📂 DM: {summary.total_categories}</div>
        <div className="stat-card orange">🛒 Đơn: {summary.total_orders}</div>
      </div>

      {/* LIFE PATH */}
      <div className="chart-box">
  <h2>Phân bố chỉ số Đường Đời</h2>
  
  <div className="chart-container">
    <LifePathChart stats={stats} />
  </div>
</div>


      {/* LOOKUP */}
      <div className="chart-box">
        <h2>Lượt tra cứu theo ngày</h2>
        <div style={{ height: 260, position: "relative", overflow: "hidden" }}>
          <LookupChart
          data={lookupByDay.length ? lookupByDay : mockLookupByDate}
        /></div>
        
      </div>

      {/* ORDERS */}
      <div className="chart-box">
        <h2>Đơn hàng theo ngày</h2>
        <div style={{ height: 260, position: "relative", overflow: "hidden" }}>
          <OrderChart
            data={ordersByDay.length ? ordersByDay : mockOrdersByDate}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
