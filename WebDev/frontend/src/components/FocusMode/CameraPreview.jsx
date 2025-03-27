import { useState, useRef, useContext, useEffect } from "react";
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
  } = useContext(TaskContext);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [focusStatus, setFocusStatus] = useState("");
  const [distractionCheckTimer, setDistractionCheckTimer] = useState(null); // Grace period tracker
  const [reminderCount, setReminderCount] = useState(0); // Reminder intensity tracker
  const [gracePeriodDistractions, setGracePeriodDistractions] = useState([]); // Distractions within 20s
  const webcamRef = useRef(null);
  const captureIntervalRef = useRef(null);

  // 📡 Initialize WebSocketManager with WebSocket URL and onMessage handler
  const wsManager = useRef(
    new WebSocketManager("ws://35.244.15.112:8000/ws", (status) => {
      setFocusStatus(status);
      console.log("Received status:", status);

      if (status === "Not Focused") {
        handleDistractionLogic();
      }
    })
  ).current;

  // --- 📸 Start capturing and sending frames ---
  const startCapturing = () => {
    wsManager.connect(); // ✅ Connect WebSocket
    captureIntervalRef.current = setInterval(() => {
      if (webcamRef.current) {
        const screenshot = webcamRef.current.getScreenshot();
        if (screenshot) {
          wsManager.send(screenshot); // 🔥 Send frame
        }
      }
    }, 200); // ✅ 5 FPS (200ms)
  };

  // --- ⏹️ Stop capturing and close connection ---
  const stopCapturing = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    wsManager.disconnect(); // ❌ Close WebSocket connection
    setFocusStatus("");
    resetDistractionState(); // Reset distraction tracking
  };

  // --- 🚦 Handle Distraction Logic ---
  const handleDistractionLogic = () => {
    const distractionData = {
      timestamp: new Date().toISOString(),
      status: "Not Focused",
    };

    // Add to distractions list
    setDistractions((prev) => {
      const updated = [...prev, distractionData];
      localStorage.setItem("distractions", JSON.stringify(updated));
      return updated;
    });

    // Check if grace period has started
    if (!distractionCheckTimer) {
      // ⏳ Start grace period
      setDistractionCheckTimer(new Date().getTime());
      setGracePeriodDistractions([distractionData]);

      // ⏰ After 20s, check distraction count
      setTimeout(checkDistractionCount, 20000);
    } else {
      // Add to grace period list
      setGracePeriodDistractions((prev) => [...prev, distractionData]);
    }
  };

  // --- ⏰ Check Distraction Count After Grace Period ---
  const checkDistractionCount = () => {
    const now = new Date().getTime();
    const recentDistractions = gracePeriodDistractions.filter(
      (d) => now - new Date(d.timestamp).getTime() <= 20000
    );

    // ✅ If distractions exceed threshold (5), trigger reminder
    if (recentDistractions.length >= 5) {
      triggerProgressiveReminder(); // Trigger based on reminder count
    }

    // Reset distraction check
    resetDistractionState();
  };

  // --- 🔁 Reset Distraction State ---
  const resetDistractionState = () => {
    setDistractionCheckTimer(null);
    setGracePeriodDistractions([]);
  };

  // --- 🔔 Trigger Progressive Reminders ---
  const triggerProgressiveReminder = () => {
    const reminderMessages = [
      "You're getting distracted often. Try to refocus! ⏳",
      "Too many distractions! Consider taking a break. 🛑",
      "It's time for a break! Recharge and come back stronger. 🚀",
    ];

    const message =
      reminderCount < reminderMessages.length
        ? reminderMessages[reminderCount]
        : reminderMessages[reminderMessages.length - 1];

    triggerReminder(message);
    setReminderCount((prev) => prev + 1); // Increase reminder count
  };

  // --- 🎥 Toggle Camera ---
  const toggleCamera = () => {
    setIsCameraOn((prev) => {
      const newState = !prev;
      if (newState) {
        startCapturing();
      } else {
        stopCapturing();
      }
      return newState;
    });
  };

  return (
    <div className="camera-container">
      <h3 className="camera-header">📷 Camera Preview</h3>
      <div
        className={`webcam-container ${isCameraOn ? "" : "camera-placeholder"} ${
          focusStatus === "Focused" ? "focused" : focusStatus === "Not Focused" ? "not-focused" : ""
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
    </div>
  );
}

export default CameraPreview;
