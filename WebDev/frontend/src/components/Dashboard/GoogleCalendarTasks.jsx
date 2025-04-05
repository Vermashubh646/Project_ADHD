import React, { useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { TaskContext } from "../../context/TaskContext";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import "./GoogleCalendarTasks.css"; // Custom styles

const GoogleCalendarTasks = () => {
  const { fetchGoogleTasks, fetchGoogleCalendarEvents, tasks } =
    useContext(TaskContext);
  const { getToken, userId } = useAuth(); // ✅ Get Clerk auth context

  const [googleTasks, setGoogleTasks] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    const loadGoogleData = async () => {
      if (!userId) {
        console.warn("User not authenticated.");
        return;
      }
  
      const tasks = await fetchGoogleTasks({ userId });
      const events = await fetchGoogleCalendarEvents({ userId });
  
      if (tasks) setGoogleTasks(tasks);
  
      if (events) {
        const now = new Date();
        const upcomingEvents = events.filter((event) => {
          const eventDate = new Date(event.start?.dateTime || event.start?.date);
          return eventDate >= now;
        });
  
        // Sort by start time
        upcomingEvents.sort((a, b) => {
          const aDate = new Date(a.start?.dateTime || a.start?.date);
          const bDate = new Date(b.start?.dateTime || b.start?.date);
          return aDate - bDate;
        });
  
        setCalendarEvents(upcomingEvents);
      }
    };
  
    loadGoogleData();
  }, [userId]);
  

  const syncedGoogleTaskIds = tasks
  .map((task) => task.googleTaskId)
  .filter((id) => !!id); // remove null or undefined

  const unsyncedGoogleTasks = googleTasks.filter(
    (task) => !syncedGoogleTaskIds.includes(task.id)
  );
  

  return (
    <div className="google-calendar-tasks">

      {/* Calendar Events */}
      <div className="calendar-section">
  <h2 className="section-title">📆 Upcoming Events</h2>
  {calendarEvents.length === 0 ? (
    <p className="no-events">No upcoming events</p>
  ) : (
    <div className="event-list">
      {calendarEvents.map((event) => {
        const start = event.start?.dateTime || event.start?.date;
        const formattedDate = start
          ? format(new Date(start), "EEE, MMM dd • hh:mm a")
          : "No date";

        return (
          <div key={event.id} className="event-card">
            <div className="event-info">
              <h3 className="event-title">{event.summary || "Untitled Event"}</h3>
              <p className="event-time">{formattedDate}</p>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

      {/* Google Tasks */}
      <div className="google-section tasks-section">
  <h2>✅ Google Tasks</h2>
  {unsyncedGoogleTasks.length === 0 ? (
    <p className="empty-msg">No tasks available</p>
  ) : (
    <ul className="google-list">
      {unsyncedGoogleTasks.map((task) => (
        <li key={task.id} className="google-card">
          <div className="google-task-content">
            <span className="google-task-title">{task.title}</span>
            <Link to={`/tasks/new?googleTitle=${encodeURIComponent(task.title)}`}>
              <button className="google-button">Add to MindSync</button>
            </Link>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>
    </div>
  );
};

export default GoogleCalendarTasks;
