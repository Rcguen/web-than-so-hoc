import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function LifePathChart({ stats = [] }) {
  if (!stats.length) {
    return <p>Không có dữ liệu</p>;
  }

  const labels = stats.map((i) => i.life_path_number);
  const values = stats.map((i) => i.total);

  const data = {
    labels,
    datasets: [
      {
        label: "Số lượt tra cứu",
        data: values,
        backgroundColor: "#6366f1",
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 🔥 RẤT QUAN TRỌNG
    scales: {
      y: { beginAtZero: true },
    },
  };

  return <Bar data={data} options={options} />;
}
