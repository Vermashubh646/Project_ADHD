import React, { useEffect, useState } from "react";

const KeyMetrics = ({ sessions }) => {
  const [metrics, setMetrics] = useState({
    totalFocusTime: 0,
    avgFocusTime: 0,
    totalTasksCompleted: 0,
    avgDistractions: 0,
    bestSession: null,
  });

  useEffect(() => {
    if (sessions.length === 0) return;

    let totalFocusTime = 0;
    let totalTasksCompleted = 0;
    let totalDistractions = 0;
    let bestSession = null;

    sessions.forEach((session) => {
      totalFocusTime += session.totalFocusDuration;
      totalTasksCompleted += session.tasksCompleted;
      totalDistractions += session.distractions;

      if (!bestSession || session.totalFocusDuration > bestSession.totalFocusDuration) {
        bestSession = session;
      }
    });

    const avgFocusTime = totalFocusTime / sessions.length || 0;
    const avgDistractions = totalDistractions / sessions.length || 0;

    setMetrics({
      totalFocusTime,
      avgFocusTime,
      totalTasksCompleted,
      avgDistractions,
      bestSession,
    });
  }, [sessions]);

  // Helper function to format time (HH:MM:SS)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60); // ✅ Fix floating-point issue by using Math.floor
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
  <div className="p-4 bg-blue-100 border border-blue-300 text-blue-900 shadow-sm hover:bg-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
    <h3 className="font-semibold text-sm">Total Focus Time</h3>
    <p className="text-lg font-bold">{formatTime(metrics.totalFocusTime)}</p>
  </div>
  <div className="p-4 bg-green-100 border border-green-300 text-green-900 shadow-sm hover:bg-green-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
    <h3 className="font-semibold text-sm">Avg Focus Time / Session</h3>
    <p className="text-lg font-bold">{formatTime(metrics.avgFocusTime)}</p>
  </div>
  <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-900 shadow-sm hover:bg-yellow-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
    <h3 className="font-semibold text-sm">Total Tasks Completed</h3>
    <p className="text-lg font-bold">{metrics.totalTasksCompleted}</p>
  </div>
  <div className="p-4 bg-red-100 border border-red-300 text-red-900 shadow-sm hover:bg-red-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
    <h3 className="font-semibold text-sm">Avg Distractions / Session</h3>
    <p className="text-lg font-bold">{metrics.avgDistractions.toFixed(2)}</p>
  </div>
  <div className="p-4 bg-purple-100 border border-purple-300 text-purple-900 shadow-sm hover:bg-purple-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
    <h3 className="font-semibold text-sm">Best Focus Session</h3>
    <p className="text-lg font-bold">{metrics.bestSession ? formatTime(metrics.bestSession.totalFocusDuration) : "N/A"}</p>
  </div>
</div>
  );
};

export default KeyMetrics;
