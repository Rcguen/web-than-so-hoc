import { useEffect, useRef } from "react";
import { Chart } from "chart.js";

export default function LifePathChart({ stats }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !stats || stats.length === 0) return;

    // 🔥 DESTROY chart cũ
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: stats.map(s => s.life_path_number),
        datasets: [
          {
            label: "Số lượt tra cứu",
            data: stats.map(s => s.total),
            backgroundColor: "#6366f1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [stats]);

  return <canvas ref={canvasRef} height={300}></canvas>;
}
