import { useState, useEffect } from "react";
import "./Reports.css"; // ✅ Import CSS
import KeyMetrics from "../components/Reports/KeyMetrics";
import WeeklyPerformanceChart from "../components/Reports/WeeklyPerformance";
import FocusDistractionChart from "../components/Reports/FocusDistractionChart";
import TaskCompletionTrends from "../components/Reports/TaskCompletionTrends";
import AverageFocusTimeChart from "../components/Reports/AverageFocusTimeChart";
import FocusScoreGauge from "../components/Reports/FocusScoreGauge";
import StreakTracker from "../components/Reports/StreakTracker";
import SessionsTable from "../components/Reports/SessionsTable"; // ✅ Import SessionsTable
import { useAuth } from "@clerk/clerk-react";

const Reports = () => {
  const [sessions, setSessions] = useState([]);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = await getToken(); // 🔐 Get JWT token
        if (!token) {
          console.error("No token found. User may not be authenticated.");
          return;
        }
  
        const res = await fetch("http://localhost:5000/api/sessions/all", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Add token to headers
            "Content-Type": "application/json",
          },
        });
  
        if (!res.ok) {
          throw new Error("Failed to fetch sessions.");
        }
  
        const data = await res.json();
        setSessions(data); // ✅ Store fetched session data
      } catch (err) {
        console.error("Error fetching sessions:", err.message);
      }
    };
  
    fetchSessions(); // 🔥 Call fetchSessions inside useEffect
  }, [getToken]);
  

  return (
    <div className="reports-container">
      <h1 className="reports-title">📊 Focus Session Analytics</h1>

      <div className="analytics-section">
        {/* ✅ Key Metrics Section */}
        <KeyMetrics sessions={sessions} />

        {/* ✅ Weekly Performance Chart */}
        <WeeklyPerformanceChart sessions={sessions} />

        <FocusDistractionChart sessions={sessions} />;

        <TaskCompletionTrends sessions={sessions} />

        {/* ✅ Average Focus Time Chart */}
        <AverageFocusTimeChart sessions={sessions} />

        <FocusScoreGauge sessions={sessions} />


        <StreakTracker sessions={sessions} />
        <br />

        {/* ✅ Separated Sessions Table */}
        <SessionsTable sessions={sessions} />
      </div>
    </div>
  );
};

export default Reports;
