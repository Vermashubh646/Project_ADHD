import React, { useContext } from "react";
import { TaskContext } from "../../context/TaskContext";

const TaskList = ({tasks}) => {
  const { enqueueTask } = useContext(TaskContext);

  return (
    <div
      className="h-80 overflow-y-auto border border-gray-700 p-3 rounded-lg bg-gray-800 shadow-lg"
      style={{
        backgroundColor: "rgb(30, 41, 57)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <h2
        className="text-xl font-semibold mb-3 text-white"
        style={{
          background:
            "linear-gradient(to right, rgba(0, 150, 255, 0.7), rgba(255, 255, 255, 0.1))",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        📚 Task List
      </h2>

      {tasks.length === 0 ? (
        <p className="text-gray-400 text-center">No tasks available 💤</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task._id}
              onClick={() => enqueueTask(task)} // ✅ Task Click Enqueues
              className="flex justify-between items-center p-3 rounded-lg cursor-pointer transition duration-300"
              style={{
                backgroundColor: "rgba(45, 55, 72, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1.0)")
              }
            >
              <span className="text-white text-lg truncate">{task.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // ✅ Prevent parent click on button
                  enqueueTask(task);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: "rgba(0, 150, 255, 0.8)",
                  boxShadow: "0 4px 8px rgba(0, 150, 255, 0.3)",
                }}
              >
                ➕ Enqueue
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
