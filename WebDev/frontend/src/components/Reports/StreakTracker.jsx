import React, { useState, useEffect } from "react";

const StreakTracker = ({ sessions }) => {
  const [streaks, setStreaks] = useState({
    currentStreak: 0,
    bestStreak: 0,
    activeDays: new Set(), // Track days with focus
  });

  useEffect(() => {
    if (sessions.length === 0) return;

    // Convert session dates into a Set for easy lookup
    const sessionDates = new Set(
      sessions
        .filter((session) => session.totalFocusDuration >= 1800) // Only count sessions with ≥30 mins
        .map((session) => new Date(session.createdAt).toDateString())
    );

    let currentStreak = 0;
    let bestStreak = 0;
    let today = new Date();
    
    // Check streak from today backward
    while (sessionDates.has(today.toDateString())) {
      currentStreak++;
      today.setDate(today.getDate() - 1);
    }

    // Find the best streak across all sessions
    let streak = 0;
    let previousDate = null;

    [...sessionDates]
      .map((date) => new Date(date))
      .sort((a, b) => a - b)
      .forEach((date) => {
        if (previousDate) {
          let diff = (date - previousDate) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            streak++;
          } else {
            bestStreak = Math.max(bestStreak, streak);
            streak = 1;
          }
        } else {
          streak = 1;
        }
        previousDate = date;
      });

    bestStreak = Math.max(bestStreak, streak);

    setStreaks({ currentStreak, bestStreak, activeDays: sessionDates });
  }, [sessions]);

  // Generate calendar days for the current month
  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null); // Empty spots before the first day
    }
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i).toDateString();
      days.push({ day: i, active: streaks.activeDays.has(date) });
    }
    return days;
  };

  return (
    <div className="streak-tracker">
      <h2 className="streak-heading">🔥 Productivity Streaks</h2>
      <div className="streak-cards">
        <div className="streak-card">
          <h3>🔥 Current Streak</h3>
          <p>{streaks.currentStreak} Days</p>
        </div>
        <div className="streak-card">
          <h3>🏆 Best Streak</h3>
          <p>{streaks.bestStreak} Days</p>
        </div>
      </div>

      <div className="streak-calendar">
        {getCalendarDays().map((item, index) =>
          item ? (
            <div key={index} className={`calendar-day ${item.active ? "active-day" : ""}`}>
              {item.day}
            </div>
          ) : (
            <div key={index} className="calendar-day empty"></div>
          )
        )}
      </div>
    </div>
  );
};

export default StreakTracker;
