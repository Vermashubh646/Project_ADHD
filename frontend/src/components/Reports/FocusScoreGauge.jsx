import React, { useMemo } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const FocusScoreGauge = ({ sessions }) => {
  // ✅ Calculate Improved Focus Score Using Sessions
  const calculateFocusScore = (sessions) => {
    if (!sessions || sessions.length === 0) return 0;

    let totalFocusTime = 0;
    let totalSessionTime = 0;
    let totalDistractions = 0;

    // Loop through all sessions to calculate cumulative data
    sessions.forEach((session) => {
      totalFocusTime += session.totalFocusDuration || 0;
      if (session.startTime && session.endTime) {
        const sessionDuration = (new Date(session.endTime) - new Date(session.startTime)) / 1000;
        totalSessionTime += isNaN(sessionDuration) ? 0 : sessionDuration;
      }
      totalDistractions += session.distractions || 0;
    });

    // Handle edge cases - Avoid division by zero
    if (totalSessionTime === 0) return 0;

    // Focus Ratio (0 - 100%)
    const focusRatio = (totalFocusTime / totalSessionTime) * 100;

    // Distraction Penalty (Penalty increases with sqrt of distractions)
    const distractionPenalty = 1 + 0.5 * Math.sqrt(totalDistractions);

    // Session Length Penalty (Penalize sessions longer than 30 min blocks)
    const sessionLengthPenalty = totalSessionTime / 1800; // Penalty per 30 min

    // Consistency Bonus (If fewer distractions, add bonus)
    const consistencyBonus = totalDistractions < 3 ? 5 : 0;

    // Calculate Final Focus Score
    let score = focusRatio - distractionPenalty - sessionLengthPenalty + consistencyBonus;

    // Cap score between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // ✅ Memoized Focus Score Calculation for Optimization
  const focusScore = useMemo(() => calculateFocusScore(sessions), [sessions]);

  // ✅ Get Session Metrics for Display (Summary)
  const getSessionMetrics = (sessions) => {
    if (!sessions || sessions.length === 0) {
      return {
        totalFocusDuration: 0,
        totalTime: 1, // Avoid division by zero
        distractions: 0,
      };
    }

    const totalFocusDuration = sessions.reduce((sum, session) => sum + (session.totalFocusDuration || 0), 0);
    const totalTime = sessions.reduce((sum, session) => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        return sum + (end - start) / 1000; // Time difference in seconds
      } else {
        return sum;
      }
    }, 0);

    const totalDistractions = sessions.reduce((sum, session) => sum + (session.distractions || 0), 0);

    return {
      totalFocusDuration,
      totalTime: totalTime || 1, // Avoid division by zero
      distractions: totalDistractions,
    };
  };

  // ✅ Get Session Summary
  const { totalFocusDuration, totalTime, distractions } = useMemo(() => getSessionMetrics(sessions), [sessions]);

  return (
    <div className="chart-container">
      {/* ✅ Styled Heading for Consistency */}
      <h2 className="chart-title">🎯 Focus Score Analysis</h2>

      {/* 🎯 Circular Progress Bar */}
      <div className="w-40 h-40 mx-auto mt-4">
        <CircularProgressbar
          value={focusScore}
          text={`${focusScore}%`}
          styles={buildStyles({
            textColor: "#4b5563", // Tailwind gray-600
            pathColor: focusScore > 70 ? "#4ade80" : focusScore > 40 ? "#facc15" : "#ef4444",
            trailColor: "#e5e7eb", // Tailwind gray-200
            textSize: "14px",
          })}
        />
      </div>

      {/* 📊 Focus Summary */}
      <div className="mt-6 text-sm text-gray-600">
        <p>
          ✅ Total Focus Time: <strong>{(totalFocusDuration / 60).toFixed(1)} mins</strong>
        </p>
        <p>
          📚 Total Session Time: <strong>{(totalTime / 60).toFixed(1)} mins</strong>
        </p>
        <p>
          ⚡ Distractions: <strong>{distractions}</strong>
        </p>
      </div>
    </div>
  );
};

export default FocusScoreGauge;
