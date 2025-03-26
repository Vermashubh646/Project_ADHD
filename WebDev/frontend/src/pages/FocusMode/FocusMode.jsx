import { useState, useEffect, useContext } from "react";
import axios from "axios";
import TaskList from "../../components/FocusMode/TaskList";
import Timer from "../../components/FocusMode/Timer";
import Controls from "../../components/FocusMode/Controls";
import CameraPreview from "../../components/FocusMode/CameraPreview";
import FocusedTasks from "../../components/FocusMode/FocusedTasks";
import TaskEnqueuedList from "../../components/FocusMode/TaskEnqueuedList";
import StudyMode from "../../components/FocusMode/StudyMode";
import AssistantIcon from "../../components/Assistant/AssistantIcon";
import ChatWindow from "../../components/Assistant/ChatWindow";
import useFetchTasks from "../../hooks/useFetchTasks";
import { TaskContext } from "../../context/TaskContext";

import "./FocusMode.css";


function FocusMode() {

  const { startFocusMode, queuedTasks, tasks, showReminder, isFocusModeStarted, timeLeft, isChatOpen, setIsChatOpen, reminderColor, reminderMessage, setTimeLeft, focusedTask } = useContext(TaskContext);

  const toggleChat = () => setIsChatOpen((prev) => !prev);
  //Hooks
  const { fetchTasks } = useFetchTasks();
  useEffect(() => {
    sessionStorage.removeItem("focusChatHistory");
  }, []);


  const formatTimeInput = (hours, minutes, seconds) => {
    // Ensure each part is always 2 digits
    const pad = (num) => (num < 10 ? `0${num}` : `${num}`);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const uncompletedTasks = tasks.filter((task) => task.status !== "Completed");



  return (
    <>
      <div className="fixed inset-0 bg-gray-900 text-white flex">
        {showReminder && (
          <div
            style={{
              backgroundColor: reminderColor,
              padding: "10px",
              borderRadius: "5px",
            }}
            className="reminder-box fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-md shadow-lg z-100"
          >
            {reminderMessage}
          </div>
        )}
        {/* Left Side - Task List & Task Queue (Before Focus Mode Starts) */}
        {!isFocusModeStarted ? (
          <div className="w-1/2 p-6 flex flex-col space-y-5">
            {/* Task List */}
            <div className="flex-1 p-3 rounded-lg max-h-[300px]">
              <TaskList tasks={uncompletedTasks} />
            </div>
            {/* Task Enqueued List */}
            <div className="flex-1 p-3 rounded-lg max-h-[300px]">
              <TaskEnqueuedList />
            </div>
          </div>
        ) : (
          <div className="w-1/2 bg-black flex items-center justify-center">
            {/* Study Mode Selection */}
            <StudyMode />
          </div>
        )}

        {/* Right Side - Focus Mode UI */}
        <div className="w-1/2 flex flex-col items-center justify-center p-6 space-y-6">
          {/* Heading */}
          <div className="focus-mode-title">
            {isFocusModeStarted
              ? focusedTask
                ? `Focusing on: ${focusedTask.title}`
                : "Select a task to focus on"
              : "🎯 Focus Mode"}
          </div>

          {/* Timer Component */}
          <Timer />

          {/* Timer Input Section - Only Before Starting */}
          {!isFocusModeStarted && (
            <div className="focus-mode-timer">
              <h2 className="focus-timer-label">⏱️ Set Timer:</h2>
              <input
                type="number"
                min="1"
                max="60"
                value={Math.floor(timeLeft / 60)}
                onChange={(e) => setTimeLeft(e.target.value * 60)}
                className="focus-timer-input"
              />
              <span className="focus-timer-unit">minutes</span>
            </div>
          )}

          {/* Start Focus Mode Button */}
          {!isFocusModeStarted ? (
            <button
              onClick={() => {
                startFocusMode(queuedTasks); // ✅ Only `queuedTasks` passed, context handles the rest
              }}
              className="focus-mode-btn-start"
            >
              🎯 Start Focus Mode
            </button>
          ) : (
            <Controls />
          )}

          {isFocusModeStarted && (
            <div className="w-full flex justify-between mt-6">
              <CameraPreview />

              <FocusedTasks/>
            </div>
          )}
          {!isChatOpen && <AssistantIcon toggleChat={toggleChat} />}
          {isChatOpen && <ChatWindow closeChat={toggleChat} />}
        </div>
      </div>
    </>
  );
}

export default FocusMode;
