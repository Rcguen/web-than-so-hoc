import Header from './components/Header';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lookup from "./components/Lookup";
import Hero from './components/Hero';
import Services from './components/Services';
import Projects from './components/Projects';
import Infos from './components/Infos';
import Contact from './components/Contact';
import Footer from './components/Footer';
import HistoryLookup from './components/HistoryLookup';
import Login from './components/Login';
import Register from './components/Register';
import NumerologyDetails from "./components/NumerologyDetails";
import BirthChart from "./components/BirthChart.jsx";
import PersonalYear from "./components/PersonalYear.jsx";
import Report from "./components/Report.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";


function App() {
  return (
    // ✅ Header phải nằm bên trong Router
    <Router>
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

        </Routes>
        <Footer />
      </>
    </Router>
  );
}

export default App;
