import React from "react";
import WeeklyPerformanceChart from "../Reports/WeeklyPerformance";

const WeeklyFocus = ({ sessions }) => {
  return (
    <div className="dashboard-section">
      <h2 className="section-title">📅 Weekly Focus Overview</h2>
      <WeeklyPerformanceChart sessions={sessions} />
    </div>
  );
};

export default WeeklyFocus;
