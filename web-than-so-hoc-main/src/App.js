import Header from './components/Header';
import { Routes, Route, useLocation } from "react-router-dom";
import Lookup from "./components/Lookup";
import Hero from './components/Hero';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Infos from './pages/Infos';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import HistoryLookup from './components/HistoryLookup';
import Login from './components/Login';
import Register from './components/Register';
import NumerologyDetails from "./pages/NumerologyDetails";
import BirthChart from "./pages/BirthChart.jsx";
import PersonalYear from "./components/PersonalYear.jsx";
import Report from "./pages/Report.jsx";
import Shop from "./pages/shop/Shop.jsx";
import ProductDetail from "./pages/shop/ProductDetail.jsx";
import Cart from "./pages/cart/Cart";
import { CartProvider } from "./context/CartContext";
import Checkout from "./pages/shop/Checkout.jsx";
import AdminLayout from "./admin/pages/AdminLayout.jsx";
import Dashboard from "./admin/pages/Dashboard";
import Orders from "./admin/pages/Orders";
import OrderDetail from "./admin/pages/OrderDetail";
import AdminProducts from "./admin/pages/AdminProducts";
import ProductList from './admin/pages/ProductList.jsx';
import AdminProductDetail from './admin/pages/AdminProductDetail.jsx';
import AdminCategories from './admin/pages/AdminCategory.jsx';
import AdminCategoryDetail from "./admin/pages/AdminCategoryDetail";
import OrderHistory from './pages/order/OrderHistory.jsx';
import OrderDetailUser from './pages/order/OrderDetailUser.jsx';
import ThankYou from './pages/order/ThankYou.jsx';
import UserOrders from './pages/order/UserOrders.jsx';


function App() {
  const location = useLocation(); // ⭐ Giờ đã OK vì Router nằm ở index.js
  const RequireAdmin = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user || user.role !== "Admin") {
    return <h1 style={{padding: 40}}>⛔ Bạn không có quyền truy cập trang Admin.</h1>;
  }

  return children;
};

  return (
    <CartProvider>
      <>
        <Header />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Services />
                <Projects />
                <Infos />
                <Contact />
              </>
            }
          />

          <Route path="/lookup" element={<Lookup />} />
          <Route path="/history" element={<HistoryLookup />} />
          <Route path="/details/:id" element={<NumerologyDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/birth-chart" element={<BirthChart />} />
          <Route path="/personal-year" element={<PersonalYear />} />
          <Route path="/report" element={<Report />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/order/:order_id" element={<OrderDetailUser />} />
          <Route path="/orders" element={<UserOrders />} />
          <Route path="/thank-you" element={<ThankYou />} />  

          {/* Admin */}
          <Route
  path="/admin"
  element={
    <RequireAdmin>
      <AdminLayout />
    </RequireAdmin>
  }
>

    <Route index element={<Dashboard />} />

    {/* Orders */}
    <Route path="orders" element={<Orders key={location.key} />} />
    <Route path="orders/:order_id" element={<OrderDetail />} />

    {/* Products */}
    <Route path="products" element={<AdminProducts />} />
    <Route path="products/add" element={<AdminProductDetail />} />   {/* NEW */}
    <Route path="products/:id" element={<AdminProductDetail />} />

    {/* Categories */}
    <Route path="categories" element={<AdminCategories />} />
    <Route path="categories/:id" element={<AdminCategoryDetail />} />
    <Route path="categories/create" element={<AdminCategoryDetail />} />

</Route>


        </Routes>

        <Footer />
      </>
    </CartProvider>
  );
}

export default App;
