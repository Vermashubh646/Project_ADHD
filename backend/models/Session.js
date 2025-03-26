const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    startTime: { type: Date, required: true }, 
    endTime: { type: Date }, 
    totalFocusDuration: { type: Number, required: true }, // In minutes
    distractions: { type: Number, default: 0 }, // No. of times distracted
    tasksCompleted: { type: Number, default: 0 }, // No. of tasks completed
    taskTitles: { type: [String], default: [] }, // Store titles of completed tasks
    createdAt: { type: Date, default: Date.now },
    userId: {
      type: String, // Same as Clerk’s user ID
      required: true,
      index: true,
    }
  });

  
module.exports = mongoose.model("Session", sessionSchema);
  