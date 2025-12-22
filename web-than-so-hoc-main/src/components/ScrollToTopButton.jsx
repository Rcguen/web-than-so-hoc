import { useEffect, useState } from "react";
import "./Lookup.css"; // CSS chung cho các trang tra cứu

export default function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 300); // cuộn > 300px thì hiện
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!show) return null;

  return (
    <button onClick={scrollToTop} className="scroll-to-top">
      ↑
    </button>
  );

  
}

