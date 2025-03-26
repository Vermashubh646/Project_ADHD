import React, { useContext, useEffect, useState } from "react";
import { TaskContext } from "../../context/TaskContext";
import "./Timer.css";

function Timer() {
  const { timeLeft, extendTimer } = useContext(TaskContext);
  const [hasExtended, setHasExtended] = useState(false);
  const [prevTimeLeft, setPrevTimeLeft] = useState(timeLeft); // Store previous timeLeft
  const [showToast, setShowToast] = useState(false);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // useEffect(() => {
  //   // 🔹 Check if we've just reached exactly 300 seconds (5 minutes left)
  //   if (prevTimeLeft > 300 && timeLeft === 300 && !hasExtended) {
  //     const now = Math.floor(Date.now() / 1000);
      
  //     // ✅ Fetch stored distractions
  //     const distractions = JSON.parse(localStorage.getItem("distractions")) || [];
      
  //     // ✅ Check for distractions in the last 5 minutes
  //     const last5MinDistractions = distractions.filter((d) => {
  //       const distractionTime = Math.floor(new Date(d.timestamp).getTime() / 1000);
  //       return now - distractionTime < 300;
  //     });

  //     if (last5MinDistractions.length === 0) {
  //       console.log("✅ No distractions in the last 5 minutes! Extending session by 10 minutes...");
  //       onExtend();
  //       setHasExtended(true);
  //       // Show toast notification
  //     setShowToast(true);
  //     setTimeout(() => setShowToast(false), 5000);
  //     }
  //   }
  //   setPrevTimeLeft(timeLeft); // Update previous timeLeft for next check
  // }, [timeLeft, prevTimeLeft, onExtend, hasExtended]);

  return (
    <div className="timer-container">
      {/* ⏳ Timer Display */}
      <div className="timer-display">{formatTime(timeLeft)}</div>

      {/* ✅ Toast Notification on Time Extension */}
      {showToast && (
        <div className="timer-toast">
          ✅ Extra {Math.floor((timeLeft - prevTimeLeft) / 60)} minutes added. Stay focused!
        </div>
      )}
    </div>
  );
}

export default Timer;
