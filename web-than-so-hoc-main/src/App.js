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
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Orders from "./admin/pages/Orders";
import OrderDetail from "./admin/pages/OrderDetail";

function App() {
  const location = useLocation(); // ⭐ Giờ đã OK vì Router nằm ở index.js

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

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route 
              path="orders" 
              element={<Orders key={location.key} />} 
            />
            <Route 
              path="orders/:order_id" 
              element={<OrderDetail />} 
            />
          </Route>
        </Routes>

        <Footer />
      </>
    </CartProvider>
  );
}

export default App;
