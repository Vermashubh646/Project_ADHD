import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
};

const AverageFocusTimeChart = ({ sessions }) => {
  if (!sessions || sessions.length === 0) return <p className="no-data">No session data available</p>;

  // Compute the average focus time
  const totalFocusTime = sessions.reduce((sum, session) => sum + session.totalFocusDuration, 0);
  const avgFocusTime = totalFocusTime / sessions.length;

  // Chart data
  const data = {
    labels: ["Average Focus Time"],
    datasets: [
      {
        label: "Avg Focus Time (HH:MM)",
        data: [avgFocusTime],
        backgroundColor: "#007bff",
        borderRadius: 5,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="chart-container">
      <h2 className="section-title">⏳ Average Focus Time per Session</h2>
      <div className="chart-wrapper">
        <Bar data={data} options={options} />
      </div>
      <p className="chart-summary">Your average focus time per session: <strong>{formatTime(avgFocusTime)}</strong></p>
    </div>
  );
};

export default AverageFocusTimeChart;
