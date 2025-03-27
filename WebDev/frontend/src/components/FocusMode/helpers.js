import axios from "axios";

const storeInLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const getFromLocalStorage = (key, defaultValue) => JSON.parse(localStorage.getItem(key)) || defaultValue;

const fetchTasks = async (setTasks, setQueuedTasks) => {
    try {
        const res = await fetch("https://mindsync-backend.up.railway.app/api/tasks");
        const data = await res.json();
        setTasks(data);
        const inProgressTasks = data.filter((task) => task.status === "In Progress");
        setQueuedTasks(inProgressTasks);
        storeInLocalStorage("queuedTasks", inProgressTasks);
    } catch (err) {
        console.error("Error fetching tasks:", err);
    }
};

const triggerReminder = (
    message,
    color = "rgb(208, 135, 0)",
    setReminderMessage,
    setReminderColor,
    setShowReminder,
    setReminderQueue,
    setLastReminderTime,
    taskId = null
) => {
    const now = new Date();

    setReminderMessage(message);
    setReminderColor(color);
    setShowReminder(true);
    setReminderQueue((prevQueue) => [...prevQueue, { message, color, taskId }]);

    setLastReminderTime((prev) => ({
        ...prev,
        [taskId || "global"]: now,
    }));

    setTimeout(() => {
        setShowReminder(false);
    }, 5000);
};

const handleDistraction = async (
    setDistractionTimestamps,
    triggerReminder,
    focusedTask
) => {
    const now = new Date();

    setDistractionTimestamps((prev) => {
        const updatedTimestamps = prev.filter((time) => now - time < 5 * 60 * 1000);
        updatedTimestamps.push(now);

        if (updatedTimestamps.length === 3) {
            triggerReminder("You're getting distracted often. Try to refocus! ⏳");
        } else if (updatedTimestamps.length >= 5) {
            triggerReminder("Too many distractions! Do you need a break? 🛑");
        } else {
            triggerReminder("Stay on track! Keep focusing. 🚀");
        }

        return updatedTimestamps;
    });

    if (focusedTask) {
        try {
            await axios.put(
                `https://mindsync-backend.up.railway.app/api/tasks/${focusedTask._id}/update-distractions`
            );
        } catch (error) {
            console.error("Error updating distraction count:", error);
        }
    }
};

const enqueueTask = (task, setQueuedTasks, setTasks) => {
    setQueuedTasks((prev) => [...prev, task]);
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
};

const setInProgressTask = (task) => {
    fetch(`https://mindsync-backend.up.railway.app/api/tasks/${task._id}/inProgress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "In Progress" }),
    }).catch((err) => console.error("Error updating task status:", err));
};

const dequeueTask = (task, setTasks, setQueuedTasks) => {
    setTasks((prev) => [...prev, task]);
    setQueuedTasks((prev) => prev.filter((t) => t._id !== task._id));
};

const startFocusMode = async (
    queuedTasks,
    setIsFocusModeStarted,
    setSessionId,
    setDistractions,
    setTasksCompleted,
    setTaskTitles,
    setCompletedTaskTitles,
    setSessionStart,
    setShownTaskIds
) => {
    if (queuedTasks.length === 0) {
        alert("Enqueue at least one task before starting Focus Mode!");
        setIsFocusModeStarted(false);
        return;
    }
    try {
        const res = await axios.post("https://mindsync-backend.up.railway.app/api/sessions/start", {
            userId: "testUser",
        });
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
    } catch (error) {
        console.error("Error starting session:", error);
    }
};

const handleFocusOnTask = (
    task,
    focusedTask,
    stopTrackingCurrentTask,
    setFocusedTask,
    setTaskFocusTime,
    isRunning,
    taskFocusInterval,
    trackTaskTime,
    setTaskTitles
) => {
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

const trackTaskTime = (setTaskFocusTime, taskFocusInterval, setTaskFocusInterval) => {
    if (taskFocusInterval) clearInterval(taskFocusInterval);
    const interval = setInterval(() => {
        setTaskFocusTime((prev) => prev + 1);
    }, 1000);
    setTaskFocusInterval(interval);
};

const stopTrackingCurrentTask = async (
    taskFocusInterval,
    focusedTask,
    taskFocusTime,
    setTaskFocusTime
) => {
    clearInterval(taskFocusInterval);
    if (!focusedTask || taskFocusTime === 0) return;
    try {
        await axios.put(`https://mindsync-backend.up.railway.app/api/tasks/${focusedTask._id}/update-time-spent`, {
            timeSpent: taskFocusTime,
        });
    } catch (error) {
        console.error("Error updating focus time:", error);
    }
    setTaskFocusTime(0);
};

const startTimer = (
    isRunning,
    setIsRunning,
    trackTaskTime,
    setTimeLeft,
    checkAutoExtend,
    autoExtendTriggered,
    setAutoExtendTriggered,
    setTimerInterval
) => {
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

const pauseTimer = (
    timerInterval,
    setIsRunning,
    stopTrackingCurrentTask,
    setTaskFocusTime
) => {
    clearInterval(timerInterval);
    setIsRunning(false);
    stopTrackingCurrentTask();
    setTaskFocusTime(0);
};

const resetTimer = async (
    sessionId,
    taskTitles,
    distractions,
    completedTaskTitles,
    setQueuedTasks,
    setTimeLeft,
    setSessionId,
    setDistractions,
    setTasksCompleted,
    setTaskTitles,
    setFocusedTask,
    setCompletedTaskTitles,
    setTaskFocusTime,
    setSessionStart,
    setAutoExtendTriggered,
    setShownTaskIds,
    setIsRunning,
    setIsFocusModeStarted,
    timerInterval,
    INIT_TIME
) => {
    const storedSessionId = sessionId || localStorage.getItem("sessionId");
    if (!storedSessionId) return;

    try {
        await axios.put(`https://mindsync-backend.up.railway.app/api/tasks/reset`);
        await axios.post(`https://mindsync-backend.up.railway.app/api/sessions/end/${sessionId}`, {
            distractions: distractions.length,
            tasksCompleted: completedTaskTitles.length,
            taskTitles,
        });
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
    setSessionStart(null);
    setAutoExtendTriggered(false);
    setShownTaskIds(new Set());

    localStorage.clear();

    try {
        await fetch("https://mindsync-backend.up.railway.app/api/tasks/reset", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        console.log("Tasks reset successfully!");
    } catch (err) {
        console.error("Error resetting tasks:", err);
    }
};

const calculateFocusPercentage = (totalTime, distractions) => {
    if (totalTime === 0) return 100;
    const distractionTime = distractions.length * 30;
    return ((totalTime - distractionTime) / totalTime) * 100;
};

const checkAutoExtend = (totalTime, distractions, extendTimer, triggerReminder) => {
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
        console.log(`Auto-extended by ${extraTime / 60} minutes due to deep focus!`);
    }

    triggerReminder(reminderMessage, "rgb(0, 166, 62)");
};

const extendTimer = (extraTime, setTimeLeft) => {
    setTimeLeft((prev) => prev + extraTime);
};

const checkTaskDeadlines = (queuedTasks, shownTaskIds, setShownTaskIds, setReminderMessage,
    setReminderColor,
    setShowReminder,
    setReminderQueue,
    setLastReminderTime) => {
    const now = new Date();

    queuedTasks.forEach((task) => {
        if (!task || !task.dueDate || shownTaskIds.has(task._id)) return;

        const dueDateTime = new Date(task.dueDate);
        dueDateTime.setHours(23, 59, 59, 999);
        const timeLeft = (dueDateTime - now) / (1000 * 60 * 60);

        if (timeLeft > 0 && timeLeft <= 6) {
            triggerReminder(`Task "${task.title}" is due TODAY! ⏳`, "orange", setReminderMessage,
                setReminderColor,
                setShowReminder,
                setReminderQueue,
                setLastReminderTime, task._id);
            setShownTaskIds((prev) => new Set([...prev, task._id]));
        } else if (timeLeft > 6 && timeLeft <= 24) {
            triggerReminder(`Task "${task.title}" is due within 24 hours. 📅`, "yellow", setReminderMessage,
                setReminderColor,
                setShowReminder,
                setReminderQueue,
                setLastReminderTime, task._id);
            setShownTaskIds((prev) => new Set([...prev, task._id]));
        } else if (timeLeft <= 0) {
            triggerReminder(`Task "${task.title}" is OVERDUE! ⚠️`, "red", setReminderMessage,
                setReminderColor,
                setShowReminder,
                setReminderQueue,
                setLastReminderTime, task._id);
            setShownTaskIds((prev) => new Set([...prev, task._id]));
        }
    });
};

const completeTask = async (
    taskId,
    taskTitle,
    stopTrackingCurrentTask,
    setQueuedTasks,
    setTasksCompleted,
    setTaskTitles,
    setCompletedTaskTitles,
    setJustCompletedTask,
    focusedTask,
    setFocusedTask
) => {
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
        await axios.put(`https://mindsync-backend.up.railway.app/api/tasks/${taskId}/complete`);
    } catch (error) {
        console.error("Error marking task as complete:", error);
    }

    setJustCompletedTask(taskTitle);
    if (focusedTask?._id === taskId) {
        setFocusedTask(null);
    }
};

// Export all helper functions
export {
    storeInLocalStorage,
    getFromLocalStorage,
    fetchTasks,
    triggerReminder,
    handleDistraction,
    enqueueTask,
    setInProgressTask,
    dequeueTask,
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
};
