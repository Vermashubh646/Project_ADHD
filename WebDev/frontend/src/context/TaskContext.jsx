import { createContext, useState, useEffect } from "react";
import { getTasks } from "../services/taskService";
import { useAuth, useUser, useSession } from "@clerk/clerk-react";
import axios from "axios";

// 🔹 Create Task Context
export const TaskContext = createContext();

// 🔹 Task Provider Component
export const TaskProvider = ({ children }) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const googleSession = useSession().session;
  // 🔹 State Management
  const [tasks, setTasks] = useState([]);
  const [queuedTasks, setQueuedTasks] = useState(() =>
    getFromLocalStorage("queuedTasks", [])
  );
  const [isFocusModeStarted, setIsFocusModeStarted] = useState(() =>
    getFromLocalStorage("isFocusModeStarted", false)
  );
  // Timer State
  const INIT_TIME = 25*60;
  const [timeLeft, setTimeLeft] = useState(
    () => parseInt(localStorage.getItem("focusTimer")) || INIT_TIME
  );
  const [isRunning, setIsRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  // 🔹 Session Tracking
  const [sessionId, setSessionId] = useState(() =>
    localStorage.getItem("sessionId")
  );
  const [distractions, setDistractions] = useState(() =>
    getFromLocalStorage("distractions", [])
  );
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [taskTitles, setTaskTitles] = useState(() =>
    getFromLocalStorage("taskTitles", [])
  );
  const [completedTaskTitles, setCompletedTaskTitles] = useState([]);
  const [sessionStart, setSessionStart] = useState(() => {
    return localStorage.getItem("sessionStart")
      ? Number(localStorage.getItem("sessionStart"))
      : null;
  });
  // 🔹 Focused Task Tracking
  const [focusedTask, setFocusedTask] = useState(null);
  const [taskFocusTime, setTaskFocusTime] = useState(0);
  const [taskFocusInterval, setTaskFocusInterval] = useState(null);
  // Adaptive Reminder State
  const [lastReminderTime, setLastReminderTime] = useState({});
  const [showReminder, setShowReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [distractionTimestamps, setDistractionTimestamps] = useState([]);
  const [autoExtendTriggered, setAutoExtendTriggered] = useState(false);
  const [reminderColor, setReminderColor] = useState("rgb(208, 135, 0)");
  const [reminderQueue, setReminderQueue] = useState([]); // Queue for reminders
  const [isReminderShowing, setIsReminderShowing] = useState(false); // Prevent overlap
  const [justCompletedTask, setJustCompletedTask] = useState(null);
  const [shownTaskIds, setShownTaskIds] = useState(new Set());
  const [lastReminderType, setLastReminderType] = useState(null); // ✅ Track last reminder

  // 🔹 Gemini Assistant State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = () => setIsChatOpen((prev) => !prev);

  // ✅ Fetch Tasks with Token
  const fetchTasksWithToken = async () => {
    try {
      const token = await getToken(); // Get JWT token from Clerk
      if (!token) {
        console.error("No token found, user may not be authenticated.");
        return;
      }
  
      const data = await getTasks(token); // ✅ Pass token to API call
      setTasks(data);
      const inProgressTasks = data.filter(
        (task) => task.status === "In Progress"
      );
      setQueuedTasks(inProgressTasks);
      storeInLocalStorage("queuedTasks", inProgressTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // 🔹 Fetch Tasks on Initial Load
  useEffect(() => {
    fetchTasksWithToken();
  }, []);

  // // 🔹 Fetch tasks from API
  // useEffect(() => {
  //   fetchTasks(setTasks, setQueuedTasks);
  // }, []);

  // 🔹 Persist Data in Local Storage
  useEffect(
    () => storeInLocalStorage("queuedTasks", queuedTasks),
    [queuedTasks]
  );
  // ✅ Restore Queued Tasks from localStorage
useEffect(() => {
  const storedQueuedTasks = localStorage.getItem("queuedTasks");
  if (storedQueuedTasks) {
    setQueuedTasks(JSON.parse(storedQueuedTasks));
  }
}, []);

  useEffect(() => {
    if (!isNaN(timeLeft) && typeof timeLeft === "number") {
      storeInLocalStorage("focusTimer", timeLeft);
    } else {
      console.warn("Invalid value for timeLeft, skipping storage.");
    }
  }, [timeLeft]);
  useEffect(
    () => storeInLocalStorage("isFocusModeStarted", isFocusModeStarted),
    [isFocusModeStarted]
  );
  useEffect(() => storeInLocalStorage("taskTitles", taskTitles), [taskTitles]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("sessionId", sessionId);
    } else {
      localStorage.removeItem("sessionId");
    }
  }, [sessionId]);

  useEffect(() => {
    if (!isFocusModeStarted || isRunning) return;
    const inactivityTimeout = setTimeout(() => {
      triggerReminder("You haven't focused on any task for a while. Pick one now! ⏳", "warning");
    }, 30000); // 30 seconds
    return () => clearTimeout(inactivityTimeout);
  }, [isRunning, isFocusModeStarted]);

  useEffect(() => {
    if (!isReminderShowing && reminderQueue.length > 0) {
      setIsReminderShowing(true);
  
      const nextReminder = reminderQueue.find((reminder) => !reminder.shown); // Find first unshown reminder
  
      if (nextReminder) {
        const { message, color, taskId } = nextReminder;
  
        triggerReminder(message, color, taskId);
  
        setReminderQueue((prevQueue) =>
          prevQueue.map((reminder) =>
            reminder.message === message && reminder.taskId === taskId
              ? { ...reminder, shown: true }
              : reminder
          )
        );
      } else {
        setReminderQueue([]); // clear the queue when no unshown reminders are left.
      }
  
      setTimeout(() => {
        setShowReminder(false);
        setIsReminderShowing(false);
      }, 5000);
    }
  }, [reminderQueue, isReminderShowing]);
  
  useEffect(() => {
    if (distractionTimestamps.length === 0) return;
    const resetTimer = setTimeout(() => {
      setDistractionTimestamps([]);
    }, 10 * 60 * 1000); // Reset after 10 minutes
    return () => clearTimeout(resetTimer);
  }, [distractionTimestamps]);
  
  useEffect(() => {
    if (!focusedTask) return;
  
    const startTime = Date.now();
  
    const intervalId = setInterval(() => {
      setQueuedTasks((prevTasks) =>
        prevTasks.map((t) => {
          if (t._id === focusedTask._id) {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            const totalTimeSpent = t.timeSpent + elapsedTime;
            if (totalTimeSpent >= t.estimatedTime) {
              triggerReminder(`You've exceeded the estimated time for "${t.title}"!`, "rgb(208, 135, 0)");
              clearInterval(intervalId);
            }
          }
          return t;
        })
      );
    }, 1000);
  
    return () => {
      clearInterval(intervalId);
    };
  }, [focusedTask, setQueuedTasks]);

  useEffect(() => {
    if (!isFocusModeStarted) return;
  
    if (queuedTasks.length > 0) {
      checkTaskDeadlines(queuedTasks);
    }
  }, [queuedTasks, shownTaskIds]);

  useEffect(() => {
    if (justCompletedTask && isFocusModeStarted) {
      triggerReminder(`Great job! You completed "${justCompletedTask}"! 🎉`, "rgb(0, 150, 0)");
  
      // Reset after triggering to prevent duplicate reminders
      setJustCompletedTask(null);
    }
  }, [justCompletedTask, isRunning]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        console.warn("User exited fullscreen. Consider returning to Focus Mode.");
      }
    };
  
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  

  // ✅ Enqueue Task
  const enqueueTask = (task) => {
    setQueuedTasks((prev) => [...prev, task]);
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
  };

  // ✅ Dequeue Task
  const dequeueTask = (task) => {
    setTasks((prev) => [...prev, task]);
    setQueuedTasks((prev) => prev.filter((t) => t._id !== task._id));
  };

  // ✅ Trigger Reminder
  const triggerReminder = (
    message,
    color = "rgb(208, 135, 0)",
    taskId = null
  ) => {
    if (message === lastReminderType) {
      console.log("Duplicate reminder skipped.");
      return;
    }
    
    if (message === "You haven't focused on any task for a while. Pick one now! ⏳" && !isRunning) {
      return;
    }
    
    
    const now = new Date();

    setReminderMessage(message);
    setReminderColor(color);
    setShowReminder(true);
    setReminderQueue((prevQueue) => [...prevQueue, { message, color, taskId, shown: false }]); // Add 'shown' flag

    setLastReminderTime((prev) => ({
      ...prev,
      [taskId || "global"]: now,
    }));

    setTimeout(() => {
      setShowReminder(false);
      setLastReminderType(null);
    }, 5000);
  };

  // ✅ Handle Distraction
  const handleDistraction = async (focusedTask) => {
    const now = new Date();

    setDistractionTimestamps((prev) => {
      const updatedTimestamps = prev.filter(
        (time) => now - time < 5 * 60 * 1000
      );
      updatedTimestamps.push(now);

      // if (updatedTimestamps.length === 3) {
      //   triggerReminder("You're getting distracted often. Try to refocus! ⏳");
      // } else if (updatedTimestamps.length >= 5) {
      //   triggerReminder("Too many distractions! Do you need a break? 🛑");
      // } else {
      //   triggerReminder("Stay on track! Keep focusing. 🚀");
      // }

      return updatedTimestamps;
    });

    if (focusedTask) {
      try {
        const token = await getToken();
        await axios.put(
          `https://mindsync-backend.up.railway.app/api/tasks/${focusedTask._id}/update-distractions`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Error updating distraction count:", error);
      }
    }
  };

  // ✅ Set Task to In Progress
  const setInProgressTask = async (task) => {
    try {
      const token = await getToken();
      await axios.put(
        `https://mindsync-backend.up.railway.app/api/tasks/${task._id}/inProgress`,
        { status: "In Progress" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // ✅ Start Focus Mode
  const startFocusMode = async (queuedTasks) => {
    if (queuedTasks.length === 0) {
      alert("Enqueue at least one task before starting Focus Mode!");
      setIsFocusModeStarted(false);
      return;
    }
    try {
      const token = await getToken();
      const res = await axios.post(
        "https://mindsync-backend.up.railway.app/api/sessions/start",
        { userId: `${token}` }, // Later replace "testUser" with the actual user ID
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessionId(res.data.sessionId);
      setIsFocusModeStarted(true);
      setDistractions([]);
      setTasksCompleted(0);
      setTaskTitles([]);
      setCompletedTaskTitles([]);
      const now = Date.now();
      setSessionStart(now);
      localStorage.setItem("sessionStart", now);
      setShownTaskIds(new Set());
      storeInLocalStorage("queuedTasks", queuedTasks);
      enterFullScreen();
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  // ✅ Handle Focus on Task
  const handleFocusOnTask = (task, stopTrackingCurrentTask, trackTaskTime) => {
    if (focusedTask) {
      stopTrackingCurrentTask();
    }
    setFocusedTask(task);
    setTaskFocusTime(0);

    if (isRunning && !taskFocusInterval) {
      trackTaskTime();
    }

    setTaskTitles((prev) => {
      if (!prev.includes(task.title)) {
        const updatedTitles = [...prev, task.title];
        localStorage.setItem("taskTitles", JSON.stringify(updatedTitles));
        return updatedTitles;
      }
      return prev;
    });
  };

  // ✅ Track Task Time
  const trackTaskTime = () => {
    if (taskFocusInterval) clearInterval(taskFocusInterval);
    const interval = setInterval(() => {
      setTaskFocusTime((prev) => prev + 1);
    }, 1000);
    setTaskFocusInterval(interval);
  };

  // ✅ Stop Tracking Current Task
  const stopTrackingCurrentTask = async () => {
    clearInterval(taskFocusInterval);
    if (!focusedTask || taskFocusTime === 0) return;
    try {
      const token = await getToken();
      await axios.put(
        `https://mindsync-backend.up.railway.app/api/tasks/${focusedTask._id}/update-time-spent`,
        { timeSpent: taskFocusTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error updating focus time:", error);
    }
    setTaskFocusTime(0);
  };

  // ✅ Start Timer
  const startTimer = (checkAutoExtend) => {
    if (!isRunning) {
      setIsRunning(true);
      trackTaskTime();
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev < 1) {
            clearInterval(interval);
            setIsRunning(false);
            if (!autoExtendTriggered) {
              checkAutoExtend();
              setAutoExtendTriggered(true);
            }
            localStorage.removeItem("focusTimer");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);
    }
  };

  // ✅ Pause Timer
  const pauseTimer = () => {
    clearInterval(timerInterval);
    setIsRunning(false);
    stopTrackingCurrentTask();
    setTaskFocusTime(0);
  };

  // ✅ Reset Timer
  const resetTimer = async () => {
    const storedSessionId = sessionId || localStorage.getItem("sessionId");
    if (!storedSessionId) return;

    try {
      const token = await getToken();
      await axios.put(
        "https://mindsync-backend.up.railway.app/api/tasks/reset",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.post(
        `https://mindsync-backend.up.railway.app/api/sessions/end/${storedSessionId}`,
        {
          distractions: distractions.length,
          tasksCompleted: completedTaskTitles.length,
          taskTitles,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error ending session:", err);
    }

    clearInterval(timerInterval);
    setIsRunning(false);
    setIsFocusModeStarted(false);
    setQueuedTasks([]);
    setTimeLeft(INIT_TIME);
    setSessionId(null);
    setDistractions([]);
    setTasksCompleted(0);
    setTaskTitles([]);
    setFocusedTask(null);
    setCompletedTaskTitles([]);
    setTaskFocusTime(0);
    stopTrackingCurrentTask();
    setSessionStart(null);
    setAutoExtendTriggered(false);
    setShownTaskIds(new Set());
    localStorage.clear();
    exitFullScreen();
  };

  // ✅ Calculate Focus Percentage
  const calculateFocusPercentage = (totalTime, distractions) => {
    if (totalTime === 0) return 100;
    const distractionTime = distractions.length * 30;
    return ((totalTime - distractionTime) / totalTime) * 100;
  };

  // ✅ Check Auto Extend Logic
  const checkAutoExtend = (totalTime, distractions) => {
    const focusPercentage = calculateFocusPercentage(totalTime, distractions);

    let extraTime = 0;
    let reminderMessage = "";

    if (focusPercentage >= 95) {
      extraTime = 10 * 60;
      reminderMessage = "Amazing focus! Extra 10 minutes added. Keep going!";
    } else if (focusPercentage >= 80) {
      extraTime = 5 * 60;
      reminderMessage = "Great job! Extra 5 minutes added. Stay consistent!";
    } else {
      reminderMessage = "Try to stay focused! Avoid distractions.";
    }

    if (extraTime > 0) {
      extendTimer(extraTime);
      console.log(
        `Auto-extended by ${extraTime / 60} minutes due to deep focus!`
      );
    }

    triggerReminder(reminderMessage, "rgb(0, 166, 62)");
  };

  // ✅ Extend Timer
  const extendTimer = (extraTime) => {
    setTimeLeft((prev) => prev + extraTime);
  };

  // ✅ Check Task Deadlines
  const checkTaskDeadlines = (queuedTasks) => {
    const now = new Date();
  
    queuedTasks.forEach((task) => {
      if (!task || !task.dueDate || shownTaskIds.has(task._id)) return;
  
      const dueDateTime = new Date(task.dueDate);
      dueDateTime.setHours(23, 59, 59, 999);
      const timeLeft = (dueDateTime - now) / (1000 * 60 * 60);
  
      if (timeLeft > 0 && timeLeft <= 6) {
        triggerReminder(`Task "${task.title}" is due TODAY! ⏳`, "orange", task._id);
        setShownTaskIds((prev) => new Set([...prev, task._id]));
      } else if (timeLeft > 6 && timeLeft <= 24) {
        triggerReminder(`Task "${task.title}" is due within 24 hours. 📅`, "yellow", task._id);
        setShownTaskIds((prev) => new Set([...prev, task._id]));
      } else if (timeLeft <= 0) {
        triggerReminder(`Task "${task.title}" is OVERDUE! ⚠️`, "red", task._id);
        setShownTaskIds((prev) => new Set([...prev, task._id]));
      }
    });
  };

  // ✅ Complete Task
  const completeTask = async (taskId, taskTitle, playTaskCompleteSound) => {
    stopTrackingCurrentTask();
    setQueuedTasks((prev) => prev.filter((task) => task._id !== taskId));
    setTasksCompleted((prev) => prev + 1);
    setTaskTitles((prev) => {
      const updatedTitles = [...prev, taskTitle];
      localStorage.setItem("taskTitles", JSON.stringify(updatedTitles));
      return updatedTitles;
    });
    setCompletedTaskTitles((prev) => [...prev, taskTitle]);

    try {
      const token = await getToken();
      await axios.put(
        `https://mindsync-backend.up.railway.app/api/tasks/${taskId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error marking task as complete:", error);
    }

    playTaskCompleteSound();

    setJustCompletedTask(taskTitle);
    if (focusedTask?._id === taskId) {
      setFocusedTask(null);
    }
  };

//   // --- 🔊 Play Task Completion Sound ---
// const playTaskCompleteSound = () => {
//   const audio = document.getElementById("taskCompleteSound");
//   if (audio) {
//     audio.play().catch((err) =>
//       console.error("Audio playback error:", err)
//     );
//   }
// };
// Function to fetch Google OAuth token
// getGoogleAccessToken now calls your secure backend endpoint
// const getGoogleAccessToken = async ({ getToken, userId }) => {
//   try {
//     const jwt = await getToken();
//     if (!jwt || !userId) {
//       alert("You must be logged in to fetch the Google access token.");
//       return null;
//     }

//     const response = await axios.get(
//       `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/oauth_google`,
//       {
//         headers: {
//           Authorization: `Bearer ${import.meta.env.VITE_CLERK_SECRET_KEY}`, // Secret key from .env
//         },
//       }
//     );

//     const token = response.data.token;
//     console.log("✅ Clerk returned Google access token:", token);
//     return token;
//   } catch (error) {
//     console.error("❌ Failed to get Google token from Clerk:", error.response?.data || error.message);
//     return null;
//   }
// };
const getGoogleAccessToken = async (userId) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/google-token`, {
      params: { userId },
    });
    return response.data.accessToken;
  } catch (err) {
    console.error("Frontend: Failed to get token from backend:", err);
    return null;
  }
};

const fetchGoogleTasks = async ({ userId }) => {
  const token = await getGoogleAccessToken(userId); // 🔥 only userId
  if (!token) return null;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/tasks/v1/lists/@default/tasks",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.items;
  } catch (error) {
    console.error("Error fetching Google Tasks:", error);
    return null;
  }
};

const fetchGoogleCalendarEvents = async ({ userId }) => {
  const token = await getGoogleAccessToken(userId); // 🔥 only userId
  if (!token) return;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Google Calendar Events:", response.data.items);
    return response.data.items;
  } catch (error) {
    console.error("❌ Error fetching Google Calendar events:", error);
  }
};


  // 🔹 Context Value
  const contextValue = {
    tasks,
    setTasks,
    queuedTasks,
    setQueuedTasks,
    isFocusModeStarted,
    setIsFocusModeStarted,
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    timerInterval,
    setTimerInterval,
    sessionId,
    setSessionId,
    distractions,
    setDistractions,
    tasksCompleted,
    setTasksCompleted,
    taskTitles,
    setTaskTitles,
    completedTaskTitles,
    setCompletedTaskTitles,
    sessionStart,
    setSessionStart,
    focusedTask,
    setFocusedTask,
    taskFocusTime,
    setTaskFocusTime,
    taskFocusInterval,
    setTaskFocusInterval,
    lastReminderTime,
    setLastReminderTime,
    showReminder,
    setShowReminder,
    reminderMessage,
    setReminderMessage,
    distractionTimestamps,
    setDistractionTimestamps,
    autoExtendTriggered,
    setAutoExtendTriggered,
    reminderColor,
    setReminderColor,
    reminderQueue,
    setReminderQueue,
    isReminderShowing,
    setIsReminderShowing,
    justCompletedTask,
    setJustCompletedTask,
    shownTaskIds,
    setShownTaskIds,
    lastReminderType,
    setLastReminderType,
    isChatOpen,
    setIsChatOpen,
    toggleChat,
    fetchTasksWithToken,
    enqueueTask,
    dequeueTask,
    triggerReminder,
    handleDistraction,
    setInProgressTask,
    startFocusMode,
    handleFocusOnTask,
    trackTaskTime,
    stopTrackingCurrentTask,
    startTimer,
    pauseTimer,
    resetTimer,
    calculateFocusPercentage,
    checkAutoExtend,
    extendTimer,
    checkTaskDeadlines,
    completeTask,
    getGoogleAccessToken,
    fetchGoogleTasks,
    fetchGoogleCalendarEvents,
  };

  return (
    <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
  );
};

// 🔹 Helper Functions
const storeInLocalStorage = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));
const getFromLocalStorage = (key, defaultValue) =>
  JSON.parse(localStorage.getItem(key)) || defaultValue;

const enterFullScreen = () => {
  const elem = document.documentElement; // Get the entire document as the element

  if (elem.requestFullscreen) {
    elem.requestFullscreen(); // Standard method
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen(); // Firefox
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen(); // Chrome, Safari
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen(); // Internet Explorer/Edge
  } else {
    console.warn("Fullscreen not supported by this browser.");
  }
};

// ✅ Exit Fullscreen Mode
const exitFullScreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
};

