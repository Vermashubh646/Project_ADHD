const express = require("express");
const Task = require("../models/Task");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware"); // Import auth middleware
const { getGoogleAccessToken } = require("../utils/clerk");
const axios = require("axios");

// Apply authMiddleware to all routes
router.use(authMiddleware);

// Get All Tasks
router.get("/", async (req, res) => {
  try {
    //res.json(req.auth.userId);
    const tasks = await Task.find({ userId: req.auth.userId }).sort({ position: 1 });
    res.json(tasks);
    console.log(tasks);
    //console.log(req.auth.userId);
  } catch (error) {
    // console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update task order
router.put("/reorder", async (req, res) => {
  const { tasks } = req.body;

  try {
    // console.log("Received tasks for reordering:", tasks); // Debugging

    const updatePromises = tasks.map((task) =>
      Task.findOneAndUpdate(
        { _id: task._id, userId: req.auth.userId },
        { position: task.position },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.json({ success: true, message: "Task order updated successfully" });
  } catch (error) {
    console.error("Error updating task order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get A Task
router.get("/:id", authMiddleware, async (req, res) => {
  if (!req.auth.userId) console.log("Not authenticated!");
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.auth.userId, // Validate task belongs to the authenticated user
    });

    // Return 404 if task not found or unauthorized
    if (!task) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }


    // Send task details if found
    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});


// Task Completion
router.put("/:id/complete", async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { status: "Completed" },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    // Sync Google Task if exists
    try {
      const { token: googleAccessToken } = await getGoogleAccessToken(req.auth.userId);

      if (googleAccessToken && updatedTask.googleTaskId) {
        await axios.patch(
          `https://www.googleapis.com/tasks/v1/lists/@default/tasks/${updatedTask.googleTaskId}`,
          { status: "completed" },
          {
            headers: {
              Authorization: `Bearer ${googleAccessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (err) {
      console.warn("Google Task status update failed:", err.message);
    }

    res.json(updatedTask);
  } catch (err) {
    console.error("Error marking task complete:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Task In Progress
// Set a task to "In Progress" and others to "Pending"
router.put("/:taskId/inProgress", async (req, res) => {
  try {
    const { taskId } = req.params;

    // Set all tasks to "Pending" first
    await Task.updateMany({ userId: req.auth.userId }, { $set: { status: "Pending" } });

    // Set the selected task to "In Progress"
    await Task.findOneAndUpdate(
      { _id: taskId, userId: req.auth.userId },
      { status: "In Progress" }
    );

    res.json({ success: true, message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update distraction count for a task
router.put("/:taskId/update-distractions", async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      userId: req.auth.userId,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.distractions += 1; // Increment distraction count
    await task.save();

    res.json({ message: "Distraction count updated", distractions: task.distractions });
  } catch (error) {
    console.error("Error updating distractions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a Task
router.post("/", async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    }

    const taskCount = await Task.countDocuments({ userId: req.auth.userId });
    const { title, description, dueDate, priority, status, category, estimatedTime } = req.body;

    const newTask = new Task({
      title,
      description,
      dueDate,
      priority,
      status,
      category,
      estimatedTime: Number(estimatedTime) || 0,
      timeSpent: 0,
      distractions: 0,
      position: taskCount,
      userId: req.auth.userId,
    });

    // Try Google Sync
    try {
      const { token: googleAccessToken } = await getGoogleAccessToken(req.auth.userId);

      if (googleAccessToken) {
        const googleTaskData = {
          title,
          notes: description || "",
          due: dueDate ? new Date(dueDate).toISOString() : undefined,
          status: status === "Completed" ? "completed" : "needsAction",
        };

        console.log("Sending to Google Tasks:", googleTaskData);

        const googleResponse = await axios.post(
          "https://www.googleapis.com/tasks/v1/lists/@default/tasks",
          googleTaskData,
          {
            headers: {
              Authorization: `Bearer ${googleAccessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Google response full:", googleResponse.data);

        // Save Google Task ID
        newTask.googleTaskId = googleResponse.data.id;
        console.log("Google Task ID", googleResponse.data.id);
      }
    } catch (googleErr) {
      console.warn("Google Tasks sync failed:", googleErr.message);
      // Don’t block task creation, just log warning
    }

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error creating task:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reset All In-Progress Tasks to Pending
router.put("/reset", async (req, res) => {
  try {
    await Task.updateMany(
      { userId: req.auth.userId, status: "In Progress" },
      { status: "Pending" }
    );
    res.json({ message: "Tasks reset successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Error resetting tasks" });
  }
});

// Update Task
router.put("/:id", async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    }

    const { title, description, dueDate, priority, status, category, estimatedTime } = req.body;

    // Update task in DB
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      {
        title,
        description,
        dueDate,
        priority,
        status: "Pending", // reset to pending on edit
        category,
        estimatedTime: Number(estimatedTime) || 0,
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    // Update task in Google Tasks if possible
    try {
      const { token: googleAccessToken } = await getGoogleAccessToken(req.auth.userId);

      if (googleAccessToken && updatedTask.googleTaskId) {
        const googleTaskData = {
          title,
          notes: description || "",
          due: dueDate ? new Date(dueDate).toISOString() : undefined,
          status: "needsAction", // Always reset to pending
        };

        await axios.patch(
          `https://www.googleapis.com/tasks/v1/lists/@default/tasks/${updatedTask.googleTaskId}`,
          googleTaskData,
          {
            headers: {
              Authorization: `Bearer ${googleAccessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Sent Data Successfully!");
      } else {
        console.warn("Skipping Google update — Missing access token or googleTaskId");
      }
    } catch (googleErr) {
      console.warn("Google Tasks update failed:", googleErr.response?.data || googleErr.message);
      // Don't block DB update if Google fails
    }

    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});




// Delete Task
router.delete("/:id", async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    }

    // Find and delete the task
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.auth.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    // Try deleting from Google Tasks if googleTaskId exists
    try {
      const { token: googleAccessToken } = await getGoogleAccessToken(req.auth.userId);

      if (googleAccessToken && task.googleTaskId) {
        await axios.delete(
          `https://www.googleapis.com/tasks/v1/lists/@default/tasks/${task.googleTaskId}`,
          {
            headers: {
              Authorization: `Bearer ${googleAccessToken}`,
            },
          }
        );
      } else {
        console.warn("Skipping Google task deletion — Missing access token or googleTaskId");
      }
    } catch (googleErr) {
      console.warn("Google Tasks deletion failed:", googleErr.response?.data || googleErr.message);
      // Don’t block task deletion in DB if Google deletion fails
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


/** 
 * 🔹 New Routes for Tracking 
 */

// Update Time Spent on Task
router.put("/:taskId/update-time-spent", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { timeSpent } = req.body;

    // Check if Task ID is valid
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: req.auth.userId },
      { $inc: { timeSpent } }, // Increment time
      { new: true }
    );

    if (!updatedTask) return res.status(404).json({ message: "Task not found" });

    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task time:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});



// Update Distractions for a Task
router.put("/:taskId/update-distractions", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { distractions } = req.body;

    if (typeof distractions !== "number" || distractions < 0) {
      return res.status(400).json({ message: "Invalid distractions value" });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: req.auth.userId },
      { $inc: { distractions } },
      { new: true }
    );

    if (!updatedTask) return res.status(404).json({ message: "Task not found" });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;
