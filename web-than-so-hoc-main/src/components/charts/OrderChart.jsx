import { Line } from "react-chartjs-2";
import { useMemo } from "react";

export default function LookupChart({ data }) {

  const chartData = useMemo(() => {
    if (!data || !data.length) return null;

    return {
      labels: data.map(i => i.date),
      datasets: [
        {
          label: "Lượt tra cứu",
          data: data.map(i => i.total),
          borderColor: "#7b2ff7",
          backgroundColor: "rgba(123,47,247,0.25)",
          tension: 0.4,
        },
      ],
    };
  }, [data]);

  if (!chartData) return <p>Chưa có dữ liệu</p>;

  return (
    <Line
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        animation: false,          // 👈 CHỐT LOOP
        scales: {
          y: { beginAtZero: true },
        },
      }}
    />
  );
}
