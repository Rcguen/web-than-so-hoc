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
import Dashboard from "./components/charts/LifePathChart.jsx";
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
import { AuthProvider } from "./context/AuthContext";
import RequireAdmin from "./routes/RequireAdmin";
import ProtectedRoute from "./routes/ProtectedRoute";
import Profile from './pages/Profile.jsx';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MockPayment from './pages/payment/MockPayment.jsx';
import ShippingSelector from './components/ShippingSelector.jsx';
import AdminDashboard from './admin/pages/AdminDashboard.jsx';
import AdminUsers from './admin/pages/AdminUser.jsx';
import AdminMessages from './admin/pages/AdminMessages.jsx';
import NumerologyAI from './pages/NumerologyAI.jsx';
import FloatingChat from './components/chatbot/FloatingChat.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import PaymentFail from './pages/PaymentFail.jsx';
import VNPayReturnProxy from './pages/VNPayReturnProxy.jsx';
import LovePage from './pages/LovePage.jsx';

function App() {
  const location = useLocation(); // ⭐ Giờ đã OK vì Router nằm ở index.js
  

  return (
    <CartProvider>
      
      <>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover /> 
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
          <Route path="/love-page" element={<LovePage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={<Checkout />} />
          <Route
  path="/orders"
  element={
    <ProtectedRoute>
      <OrderHistory />
    </ProtectedRoute>
  }
/>

          <Route path="/order/:id" element={<OrderDetailUser />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/thank-you" element={<ThankYou />} />  
          <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
          <Route path="/payment/mock/:orderId" element={<MockPayment />} />
          <Route path="/shipping-selector" element={<ShippingSelector />} />
          <Route path="/numerology-ai" element={<NumerologyAI />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-fail" element={<PaymentFail />} />
          <Route path="/api/vnpay/return" element={<VNPayReturnProxy />} />

          <Route
  path="/admin"
  element={
    <ProtectedRoute role="admin">
      <AdminLayout />
    </ProtectedRoute>
  }
>
  {/* /admin */}
  <Route index element={<Dashboard />} />

  {/* /admin/dashboard */}
  <Route path="dashboard" element={<AdminDashboard />} />

  {/* Orders */}
  <Route path="orders" element={<Orders />} />
  <Route path="orders/:order_id" element={<OrderDetail />} />

  {/* Products */}
  <Route path="products" element={<AdminProducts />} />
  <Route path="products/add" element={<AdminProductDetail />} />
  <Route path="products/:id" element={<AdminProductDetail />} />

  {/* Categories */}
  <Route path="categories" element={<AdminCategories />} />
  <Route path="categories/create" element={<AdminCategoryDetail />} />
  <Route path="categories/:id" element={<AdminCategoryDetail />} />

  <Route path="users" element={<AdminUsers />} />
  <Route path="messages" element={<AdminMessages />} />

</Route>



        </Routes>
        <FloatingChat />  
        <Footer />
      </>
    </CartProvider>
  );
}

export default App;
