import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const TaskQuickAccess = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchIncompleteTasks = async () => {
      try {
        const token = await getToken(); // ✅ Get the token
        if (!token) {
          console.error("No token found. User may not be authenticated.");
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Pass token in headers
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch tasks.");
        }

        const data = await res.json();
        // Filter out only the incomplete tasks
        const incompleteTasks = data.filter((task) => task.status !== "Completed");
        setTasks(incompleteTasks); // ✅ Update state
      } catch (err) {
        console.error("Error fetching tasks:", err.message);
      }
    };

    fetchIncompleteTasks(); // 🔥 Fetch tasks on component load
  }, [getToken]);
  const handleStartTask = () => {
    navigate("/focus");
  };

  return (
    <div className="dashboard-section">
      <h2 className="section-title">📋 Quick Access: Incomplete Tasks</h2>
      <ul className="task-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li key={task._id} className="task-item">
              <span>{task.title}</span>
              <button style={{ backgroundColor: "rgb(30, 41, 57)" }} className="start-task-btn" onClick={handleStartTask}>▶ Start</button>
            </li>
          ))
        ) : (
          <p>No incomplete tasks!</p>
        )}
      </ul>
    </div>
  );
};

export default TaskQuickAccess;
