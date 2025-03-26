import React, { useContext } from "react";
import "./Controls.css";
import { TaskContext } from "../../context/TaskContext";

function Controls() {
  const {
    startTimer,
    pauseTimer,
    resetTimer,
    extendTimer,
    isRunning,
  } = useContext(TaskContext); // ✅ Accessing from TaskContext

  return (
    <div className="controls-container">
      {/* Start/Pause Button */}
      {!isRunning ? (
        <button onClick={startTimer} className="control-btn start-btn">
          ▶ Start
        </button>
      ) : (
        <button onClick={pauseTimer} className="control-btn pause-btn">
          ⏸ Pause
        </button>
      )}

      {/* Extend Timer Button */}
      <button
        onClick={() => extendTimer(300)} // ✅ 5 minutes (300 seconds)
        className="control-btn extend-btn"
      >
        ⏩ +5 min
      </button>

      {/* Reset Button */}
      <button onClick={resetTimer} className="control-btn reset-btn">
        🔄 Reset
      </button>
    </div>
  );
}

export default Controls;
