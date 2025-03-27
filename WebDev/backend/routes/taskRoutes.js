const express = require("express");
const Task = require("../models/Task");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware"); // Import auth middleware

// Apply authMiddleware to all routes
router.use(authMiddleware);

// Get All Tasks
router.get("/", async (req, res) => {
  try {
    //res.json(req.auth.userId);
    const tasks = await Task.find({ userId: req.auth.userId}).sort({ position: 1 }); 
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
  if(!req.auth.userId) console.log("Not authenticated!");
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
router.put("/:taskId/complete", async (req, res) => {
  try {
    const { taskId } = req.params;
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: req.auth.userId },
      { status: "Completed" },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
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
    const taskCount = await Task.countDocuments({
      userId: req.auth.userId,
    });
    const { title, description, dueDate, priority, status, category, estimatedTime } = req.body;

    const newTask = new Task({
      title,
      description,
      dueDate,
      priority,
      status,
      category,
      estimatedTime: Number(estimatedTime) || 0, // Ensure number
      timeSpent: 0, // Default to zero
      distractions: 0, // Default to zero
      position: taskCount,
      userId: req.auth.userId,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    // Check if req.auth is populated
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    }

    // Attempt to update task only for the correct user
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { ...req.body, status: "Pending" },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Delete Task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.auth.userId,
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
