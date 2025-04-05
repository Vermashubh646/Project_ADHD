const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  category: { type: String, enum: ["Study", "Work", "Assignment", "Other"], required: true },
  estimatedTime: { type: Number, required: true }, // Expected time to complete (in minutes)
  timeSpent: { type: Number, default: 0 }, // Actual time spent on the task
  distractions: { type: Number, default: 0 }, // Number of times distraction detected
  createdAt: { type: Date, default: Date.now },
  googleTaskId: {
    type: String,
    default: null,
  },
  position: { type: Number, required: true },
  userId: {
    type: String, // Clerk provides user ID as a string
    required: true,
    index: true, // Add index for faster lookups
  }
});

module.exports = mongoose.model("Task", TaskSchema);
