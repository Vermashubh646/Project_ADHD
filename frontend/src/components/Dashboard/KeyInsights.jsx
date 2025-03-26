import React from "react";
import KeyMetrics from "../Reports/KeyMetrics";

const KeyInsights = ({ sessions }) => {
  return (
    <div className="dashboard-section">
      <h2 className="section-title">📌 Key Insights</h2>
      <KeyMetrics sessions={sessions} />
    </div>
  );
};

export default KeyInsights;
