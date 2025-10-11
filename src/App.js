import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Projects from './components/Projects';
import Infos from './components/Infos';
import Contact from './components/Contact';
import Footer from './components/Footer'; // <-- 1. Import Footer vào

function App() {
  return (
    <div>
      <Header />
      <Hero />
      <Services />
      <Projects />
      <Infos />
      <Contact />
      <Footer /> {/* <-- 2. Đặt Footer vào đây */}
    </div>
  );
}

export default App;