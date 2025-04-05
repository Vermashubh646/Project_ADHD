import { useState, useRef, useContext, useEffect } from "react";
import Webcam from "react-webcam";
import { TaskContext } from "../../context/TaskContext";
import "./CameraPreview.css";
import { FaceFocusDetector } from "../../utils/FaceFocusDetector"; // 🎯 Import Face Detection Logic

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
    setLastReminderTime,
  } = useContext(TaskContext);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [focusStatus, setFocusStatus] = useState("");
  const [focusHistory, setFocusHistory] = useState([]);
  const [reminderCount, setReminderCount] = useState(0);
  const webcamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const lastReminderTimeRef = useRef(0); // ⏳ Holds last reminder time
  const lastReminderTypeRef = useRef(""); // 🚨 Holds last reminder type

  // ✅ Create Face Detector Instance
  const faceFocusDetectorRef = useRef(new FaceFocusDetector());

  // --- Start capturing frames and process locally ---
  const startCapturing = async () => {
    setFocusStatus("Calibrating..."); // 🧠 Calibrate at the start
    captureIntervalRef.current = setInterval(async () => {
      if (webcamRef.current) {
        const screenshot = webcamRef.current.getScreenshot();
        if (screenshot) {
          processFrame(screenshot); // 🎯 Process frame locally
        }
      }
    }, 500); // ~2 FPS
  };

  // --- Stop capturing and clear interval ---
  const stopCapturing = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    setFocusStatus("");
  };

  // --- Toggle Camera ---
  const toggleCamera = () => {
    setIsCameraOn((prev) => {
      const newState = !prev;
      if (newState) {
        startCapturing(); // 🎥 Start capturing when camera is on
      } else {
        stopCapturing(); // ❌ Stop capturing when camera is off
        lastReminderTypeRef.current = "";
        lastReminderTimeRef.current = 0;
      }
      return newState;
    });
  };

  // --- Process Frame and Detect Focus ---
  const processFrame = async (imageData) => {
    try {
      const result = await faceFocusDetectorRef.current.process(imageData);
      setFocusStatus(result);

      // 🎯 Handle distraction if "Not Focused"
      if (result === "Not Focused") {
        handleDistraction(focusedTask);
        handleDistractionAlert();
      }

      // Update focus history for progressive alerts
      updateFocusHistory(result);
    } catch (error) {
      console.error("Error processing frame:", error);
    }
  };

  // --- Track Focus Status History ---
  const updateFocusHistory = (status) => {
    const now = new Date().getTime();

    setFocusHistory((prev) => {
      // Clear history if focus is regained
      if (status === "Focused") {
        return [];
      }

      // Add new status and keep the last 20 seconds
      const updatedHistory = [
        ...prev,
        { status, timestamp: now },
      ].filter((entry) => now - entry.timestamp <= 20000);

      // Count distractions in the last 20 seconds
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
    const cooldownPeriod = 10000; // ⏳ 10 seconds cooldown

    setReminderCount((prevCount) => {
      const newCount = prevCount + 1;
      const alertMessage = getAlertMessage(newCount);

      // ✅ Skip duplicate reminders in the cooldown period
      if (
        lastReminderTypeRef.current !== alertMessage ||
        now - lastReminderTimeRef.current > cooldownPeriod
      ) {
        triggerReminder(alertMessage);
        playAlertSound();
        console.log(`Reminder triggered! Count: ${newCount}`);
        lastReminderTypeRef.current = alertMessage;
        lastReminderTimeRef.current = now;
      } else {
        console.log("Skipping duplicate or recent reminder...");
      }

      return newCount;
    });
  };

  // --- 🎧 Play Alert Sound ---
  const playAlertSound = () => {
    const audio = document.getElementById("alert2");
    if (audio) {
      audio.play().catch((err) => console.error("Audio playback error:", err));
    }
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

  return (
    <div className="camera-container">
      <h3 className="camera-header">📷 Camera Preview</h3>
      <div
        className={`webcam-container ${isCameraOn ? "" : "camera-placeholder"} ${
          focusStatus === "Focused"
            ? "focused"
            : focusStatus === "Not Focused"
            ? "not-focused"
            : ""
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
            isCameraOn
              ? "bg-red-500 hover:bg-red-700"
              : "bg-green-500 hover:bg-green-700"
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
