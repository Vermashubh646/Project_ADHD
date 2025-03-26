import React, { useContext } from "react";
import { TaskContext } from "../../context/TaskContext";
import "./FocusedTasks.css";

function FocusedTasks() {
  const {
    queuedTasks,
    setFocusedTask,
    completeTask,
    handleFocusOnTask,
  } = useContext(TaskContext); // ✅ Using TaskContext

  return (
    <div className="ms-focused-tasks-container">
      {/* Header */}
      <h3 className="ms-task-header">🎯 Focused Tasks</h3>

      {/* Task List */}
      <ul className="ms-task-list space-y-2">
        {queuedTasks.length === 0 ? (
          <li className="ms-task-item ms-no-task text-gray-400 text-sm">
            No tasks available.
          </li>
        ) : (
          queuedTasks.map((task) => (
            <li key={task._id} className="ms-task-item">
              <span className="ms-task-title">{task.title}</span>

              <div className="ms-btn-group space-x-2">
                {/* Focus Button */}
                <button
                  onClick={() => {
                    handleFocusOnTask(task);
                    setFocusedTask(task); // ✅ Directly set focused task
                  }}
                  className="ms-task-btn ms-btn-focus"
                >
                  🎯 Focus
                </button>

                {/* Complete Button */}
                <button
                  onClick={() => completeTask(task._id, task.title)}
                  className="ms-task-btn ms-btn-complete"
                >
                  ✅ Complete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default FocusedTasks;
