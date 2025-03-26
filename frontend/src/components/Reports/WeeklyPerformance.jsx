import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const WeeklyPerformanceChart = ({ sessions }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (sessions.length === 0) return;

    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    const focusTimeMap = sessions.reduce((acc, session) => {
      const dateKey = session.createdAt.split("T")[0];
      acc[dateKey] = (acc[dateKey] || 0) + session.totalFocusDuration;
      return acc;
    }, {});

    const focusTimeData = last7Days.map(date => (focusTimeMap[date] || 0) / 60);

    setChartData({
      labels: last7Days,
      datasets: [
        {
          label: "Focus Time (minutes)",
          data: focusTimeData,
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          pointBackgroundColor: "#007bff",
          tension: 0.3,
          fill: true,
        },
      ],
    });
  }, [sessions]);

  if (!chartData) return <p>Loading chart...</p>;

  return (
    <div className="chart-container">
      <h2 className="chart-title">📊 Weekly Focus Time</h2>
      <div className="chart-wrapper">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false, // ✅ Prevent unwanted resizing
          }}
        />
      </div>
    </div>
  );
};

export default WeeklyPerformanceChart;
