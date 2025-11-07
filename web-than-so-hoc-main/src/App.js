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

function App() {
  return (
    <Router>
      <Header />

      <Routes>
        {/* Trang chủ */}
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

        {/* Trang tra cứu thần số học */}
        <Route path="/lookup" element={<Lookup />} />

        {/* Trang tra cứu lịch sử xem */}
        <Route path="/history" element={<HistoryLookup />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
