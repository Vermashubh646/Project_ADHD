import { useState, useEffect, useRef, useContext } from "react";
import Webcam from "react-webcam";
import { TaskContext } from "../../context/TaskContext";
import "./CameraPreview.css";

function CameraPreview() {
  const {
    distractions,
    setDistractions,
    handleDistraction,
    triggerReminder,
    focusedTask,
  } = useContext(TaskContext); // ✅ Use context

  const [isCameraOn, setIsCameraOn] = useState(false);
  const webcamRef = useRef(null);

  // 📸 Simulate Distraction Detection
  const detectDistraction = () => {
    if (!isCameraOn) return;

    // 🔥 Simulate 30% chance of distraction
    const isDistracted = Math.random() < 0.3;

    if (isDistracted) {
      const distractionData = {
        timestamp: new Date().toISOString(),
        status: "Distracted",
      };

      // ✅ Correct Usage: Pass only `focusedTask`
      handleDistraction(focusedTask);

      // ✅ Trigger a reminder after distraction
      triggerReminder(
        `Distraction detected! Refocus on "${focusedTask?.title || "your task"}".`,
        "rgb(208, 135, 0)"
      );

      // ✅ Update distraction state
      const updatedDistractions = [...distractions, distractionData];
      setDistractions(updatedDistractions);
      localStorage.setItem("distractions", JSON.stringify(updatedDistractions));
    }
  };

  // 🕒 Periodically Check for Distractions
  useEffect(() => {
    let interval;
    if (isCameraOn) {
      interval = setInterval(detectDistraction, 10000); // Check every 10s
    }
    return () => clearInterval(interval);
  }, [isCameraOn, distractions]);

  // ⏳ Reduce Warning Level If No New Distractions for 1 Minute
  useEffect(() => {
    let resetTimeout;
    if (distractions.length > 0) {
      resetTimeout = setTimeout(() => {
        const reducedDistractions = distractions.slice(0, -1);
        setDistractions(reducedDistractions);
        localStorage.setItem("distractions", JSON.stringify(reducedDistractions));
      }, 60000); // Reset after 1 minute
    }
    return () => clearTimeout(resetTimeout);
  }, [distractions]);

  return (
    <div className="camera-container">
      <h3 className="camera-header">📷 Camera Preview</h3>

      {/* Camera Preview or Placeholder */}
      <div className={`webcam-container ${isCameraOn ? "" : "camera-placeholder"}`}>
        {isCameraOn ? (
          <Webcam
            ref={webcamRef}
            mirrored={true}
            className="w-full h-full rounded-md"
          />
        ) : (
          <div className="camera-placeholder">Camera is Off</div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCameraOn((prev) => !prev)}
        className={`camera-btn ${isCameraOn ? "btn-stop" : "btn-start"}`}
      >
        {isCameraOn ? "Stop Camera" : "Start Camera"}
      </button>
    </div>
  );
}

export default CameraPreview;
