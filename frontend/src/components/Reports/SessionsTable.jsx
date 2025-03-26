import React from "react";

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const SessionsTable = ({ sessions }) => {

  return (
    <div className="reports-table-container">
      <h2 className="section-title">📅 Recent Focus Sessions</h2>
      <table className="reports-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Focus Time</th>
            <th>Tasks Completed</th>
            <th>Task Titles</th>
            <th>Distractions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <tr key={session._id}>
                <td>{new Date(session.createdAt).toLocaleDateString()}</td>
                <td>{formatTime(session.totalFocusDuration)}</td>
                <td>{session.tasksCompleted}</td>
                <td>
                  {session.taskTitles.length > 0 ? (
                    <ul>
                      {session.taskTitles.map((task, index) => (
                        <li key={index}>{task}</li>
                      ))}
                    </ul>
                  ) : (
                    "No tasks completed"
                  )}
                </td>
                <td>{session.distractions}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-data">No session data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SessionsTable;
