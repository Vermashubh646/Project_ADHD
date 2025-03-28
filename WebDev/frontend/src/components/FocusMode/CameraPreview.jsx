import { useState, useRef, useContext } from "react";
import Webcam from "react-webcam";
import { TaskContext } from "../../context/TaskContext";
import WebSocketManager from "../../utils/WebSocketManager";
import "./CameraPreview.css";

function CameraPreview() {
  const {
    distractions,
    setDistractions,
    handleDistraction,
    triggerReminder,
    focusedTask,
    lastReminderType,
    setLastReminderType,
    lastReminderTime,
    setLastReminderTime
  } = useContext(TaskContext);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [focusStatus, setFocusStatus] = useState("");
  const [focusHistory, setFocusHistory] = useState([]);
  const [reminderCount, setReminderCount] = useState(0);
  const webcamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const lastReminderTimeRef = useRef(0); // ⏳ Holds last reminder time
  const lastReminderTypeRef = useRef(""); // 🚨 Holds last reminder type


  // 📡 Initialize WebSocketManager once and pass onMessage callback
  const wsManager = useRef(
    new WebSocketManager(import.meta.env.VITE_WS_URL, (status) => {
      setFocusStatus(status);
      console.log("Received status:", status);
      updateFocusHistory(status);

      // 🎯 Handle distraction if "Not Focused"
      if (status === "Not Focused") {
        const distractionData = {
          timestamp: new Date().toISOString(),
          status: "Not Focused",
        };

        handleDistraction(focusedTask);
        // triggerReminder(
        //   `Distraction detected! Refocus on "${focusedTask?.title || "your task"}".`,
        //   "rgb(208, 135, 0)"
        // );

        const updatedDistractions = [...distractions, distractionData];
        setDistractions(updatedDistractions);
        localStorage.setItem("distractions", JSON.stringify(updatedDistractions));
      }
    })
  ).current;

  // --- Start capturing and sending frames ---
  const startCapturing = () => {
    wsManager.connect(); // ✅ Connect WebSocket
    captureIntervalRef.current = setInterval(() => {
      if (webcamRef.current) {
        const screenshot = webcamRef.current.getScreenshot();
        if (screenshot) {
          wsManager.send(screenshot); // 🔥 Send frame
        }
      }
    }, 500); // ~30 FPS
  };

  // --- Stop capturing and close connection ---
  const stopCapturing = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    wsManager.disconnect(); // ❌ Close WebSocket connection
    setFocusStatus("");
  };

  // --- Toggle Camera ---
  const toggleCamera = () => {
    setIsCameraOn((prev) => {
      const newState = !prev;
      if (newState) {
        startCapturing();
      } else {
        stopCapturing();
        lastReminderTypeRef.current = ""; // ✅ Reset type on stop
        lastReminderTimeRef.current = 0; // ✅ Reset time on stop
      }
      return newState;
    });
  };
  

  const updateFocusHistory = (status) => {
    const now = new Date().getTime();
  
    setFocusHistory((prev) => {
      // Clear history if focus is regained
      if (status === "Focused") {
        return []; // ✅ Clear history when user regains focus
      }
  
      // Add new status to history and keep last 20 seconds
      const updatedHistory = [
        ...prev,
        { status, timestamp: now },
      ].filter((entry) => now - entry.timestamp <= 20000); // Keep last 20 seconds
  
      // Check distraction count in the last 20s
      const notFocusedCount = updatedHistory.filter(
        (entry) => entry.status === "Not Focused"
      ).length;
  
      if (notFocusedCount >= 35) {
        handleDistractionAlert(); // ✅ Trigger progressive alerts
      }
  
      return updatedHistory;
    });
  };

// --- 🚨 Handle Progressive Alerts ---
const handleDistractionAlert = () => {
  const now = new Date().getTime();
  const cooldownPeriod = 10000; // ⏳ 10 seconds cooldown before next alert

  setReminderCount((prevCount) => {
    const newCount = prevCount + 1;
    const alertMessage = getAlertMessage(newCount);

    // ✅ Skip reminder if the same alert was shown recently
    if (
      (lastReminderTypeRef.current !== alertMessage ||
        now - lastReminderTimeRef.current > cooldownPeriod)
    ) {
      triggerReminder(alertMessage); // 🎯 Trigger appropriate alert
      playAlertSound();
      console.log(`Reminder triggered! Count: ${newCount}`);
      lastReminderTypeRef.current = alertMessage; // ✅ Update last reminder type
      lastReminderTimeRef.current = now; // ⏳ Update last triggered time
    } else {
      console.log("Skipping duplicate or recent reminder...");
    }
    

    return newCount;
  });
};




// --- 🔔 Get Appropriate Alert Message ---
const getAlertMessage = (count) => {
  if (count < 2) {
    return "You're getting distracted often. Try to refocus! ⏳";
  } else if (count < 5) {
    return "Too many distractions! Consider taking a 5-minute break. 🛑";
  } else if (count < 7) {
    return "You seem fatigued. A short break might help! 🌟";
  } else if (count === 7) {
    return "It's time for a break! Recharge and come back stronger. 🚀";
  } else {
    return "You are losing focus repeatedly. Please reflect and refocus. ⚡";
  }
};
  // --- 🔊 Play Alert Sound ---
const playAlertSound = () => {
  const audio = document.getElementById("alert2"); // 🎧 Get alert2 audio
  if (audio) {
    audio.play().catch((err) => console.error("Audio playback error:", err));
  }
};

  return (
    <div className="camera-container">
      <h3 className="camera-header">📷 Camera Preview</h3>
      <div
        className={`webcam-container ${isCameraOn ? "" : "camera-placeholder"} ${
          focusStatus === "Focused" ? "focused" : (focusStatus === "Not Focused" ? "not-focused" : "")
        }`}
      >
        {isCameraOn ? (
          <Webcam
            ref={webcamRef}
            mirrored={true}
            screenshotFormat="image/jpeg"
            className="w-full h-full rounded-md"
          />
        ) : (
          <div className="camera-placeholder">Camera is Off</div>
        )}
      </div>

      <p>Focus Status: {focusStatus}</p>

      <div className="flex justify-center">
  <button
    onClick={toggleCamera}
    className={`camera-btn ${
      isCameraOn ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"
    } text-white font-bold py-2 px-4 rounded`}
  >
    {isCameraOn ? "Stop Camera" : "Start Camera"}
  </button>
</div>
<audio id="alert2" src="/audio/alert2.mp3" preload="auto"></audio>
    </div>
  );
}

export default CameraPreview;
