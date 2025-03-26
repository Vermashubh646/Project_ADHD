import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const TaskCompletionTrends = ({ sessions }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!sessions.length) return;

    // 🔹 Step 1: Group tasks completed by date
    const taskCounts = {};
    sessions.forEach((session) => {
      const date = new Date(session.createdAt).toLocaleDateString();
      taskCounts[date] = (taskCounts[date] || 0) + session.tasksCompleted;
    });

    // 🔹 Step 2: Convert into sorted arrays for Chart.js
    const sortedDates = Object.keys(taskCounts).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    const taskData = sortedDates.map((date) => taskCounts[date]);

    // 🔹 Step 3: Set chart data
    setChartData({
      labels: sortedDates,
      datasets: [
        {
          label: "Tasks Completed",
          data: taskData,
          borderColor: "#28a745",
          backgroundColor: "rgba(40, 167, 69, 0.2)",
          tension: 0.3,
        },
      ],
    });
  }, [sessions]);

  return (
    <div className="chart-container">
      <h2 className="section-title">📈 Task Completion Trends</h2>
      {chartData ? <Line data={chartData} /> : <p>Loading chart...</p>}
    </div>
  );
};

export default TaskCompletionTrends;
