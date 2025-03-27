import React, { useState, useEffect } from "react";
import axios from "axios";
import WeeklyPerformanceChart from "../components/Reports/WeeklyPerformance";
import StreakTracker from "../components/Reports/StreakTracker";
import KeyMetrics from "../components/Reports/KeyMetrics";
import TaskQuickAccess from "../components/Dashboard/TaskQuickAccess";
import SessionsTable from "../components/Reports/SessionsTable"; // Import SessionsTable component
import "./Dashboard.css"; // Custom CSS for dashboard layout
import { useAuth } from "@clerk/clerk-react"; 
import { useUser } from "@clerk/clerk-react";


const Dashboard = ({ tasks }) => {
  const [greeting, setGreeting] = useState("");
  const [sessions, setSessions] = useState([]);
  const { getToken } = useAuth();
  const { user } = useUser();
  // console.log(user);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = await getToken(); // 🔐 Get the JWT token
        if (!token) {
          console.error("No token found. User may not be authenticated.");
          return;
        }
  
        // ✅ Axios GET request with headers
        const res = await axios.get(
          "https://mindsync-backend.up.railway.app/api/sessions/all",
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Pass token in headers
            },
          }
        );
  
        console.log("Response Status:", res.status);
  
        // ✅ Check if response is successful
        if (res.status !== 200) {
          throw new Error("Failed to fetch sessions");
        }
        const data = res.data; // Axios auto-parses JSON
        console.log(data);
        setSessions(data); // ✅ Store fetched session data
      } catch (err) {
        console.error("Error fetching sessions:", err.message);
      }
    };
  
    fetchSessions(); // 🔥 Call the function inside useEffect
  }, [getToken]);

  useEffect(() => {
    // Set Greeting based on the time of the day
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting("Good Morning");
    } else if (hours < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  // Get the last 5 sessions
  const last5Sessions = sessions.slice(-5);
  const recentSessions = sessions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort in descending order
    .slice(0, 5); // Get the first 5 sessions (most recent)

  return (
    <div className="dashboard-container">
      <div className="dashboard-left">
        <div className="greeting-container">
          <h2>{greeting}, @{user?.username || "User"}!</h2>
        </div>

        <div className="key-insights">
        <h2 className="section-title">🔑 Key Insights</h2>
          <KeyMetrics sessions={sessions} />
        </div>

        <div className="adaptive-reminders">
          <h2>Adaptive Reminder</h2>
        </div>

        {/* New div under Adaptive Reminder for Sessions Table */}
        <div className="sessions-table-container">
          <SessionsTable sessions={recentSessions} />
        </div>

        <div className="more-options">
          <h3>Explore More</h3>
          {/* Placeholder for more sections if needed */}
        </div>
      </div>

      <div className="dashboard-right">
        <div className="weekly-performance">
          <WeeklyPerformanceChart sessions={sessions} />
        </div>

        <div className="incomplete-tasks">
          <TaskQuickAccess />
        </div>

        <div className="productivity-streak">
          <StreakTracker sessions={sessions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
