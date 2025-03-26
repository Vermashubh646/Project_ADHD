import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./FocusDistractionChart.css"; 

ChartJS.register(ArcElement, Tooltip, Legend);

const FocusDistractionChart = ({ sessions }) => {
  // 📌 Calculate total focus time & estimated lost time
  const totalFocus = sessions.reduce((sum, session) => sum + session.totalFocusDuration, 0);
  const estimatedLostTime = sessions.reduce((sum, session) => sum + session.distractions * 60, 0); // Assuming 1 min lost per distraction

  const data = {
    labels: ["Effective Focus Time", "Lost Time due to Distractions"],
    datasets: [
      {
        data: [totalFocus, estimatedLostTime],
        backgroundColor: ["#28a745", "#dc3545"],
        hoverBackgroundColor: ["#218838", "#c82333"],
      },
    ],
  };

  return (
    <div className="focus-distraction-container">
      <h2 className="chart-title">🎯 Effective Focus vs. Lost Time</h2>
      <Pie data={data} />
    </div>
  );
};

export default FocusDistractionChart;
