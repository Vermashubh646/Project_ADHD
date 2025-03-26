const express = require("express");
const Session = require("../models/Session"); // Import the Session model
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // Import custom middleware



router.use(authMiddleware);

router.get("/all", async (req, res) => {
  try {
    console.log("User ID from Auth:", req.auth.userId);
    const sessions = await Session.find({userId: req.auth.userId}).sort({ createdAt: -1 }); // Latest sessions first
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching sessions" });
  }
});


// ✅ Start a Session
router.post("/start", async (req, res) => {
  try {
    const userId = req.auth.userId; // Extract userId from authMiddleware
    const session = new Session({
      userId: userId,
      startTime: new Date(),
      totalFocusDuration: 0, // Starts at 0, updated when session ends
    });
    await session.save();
    res.status(201).json({ message: "Session started", sessionId: session._id });
  } catch (error) {
    res.status(500).json({ error: "Error starting session" });
  }
});

// ✅ End a Session
router.post("/end/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { distractions, tasksCompleted, taskTitles } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    session.endTime = new Date();
    session.totalFocusDuration = Math.floor((session.endTime - session.startTime) / 1000); // Convert ms to seconds
    session.distractions = distractions || 0;
    session.tasksCompleted = tasksCompleted || 0;
    session.taskTitles = taskTitles || [];

    await session.save();
    res.json({ message: "Session ended", session });
  } catch (error) {
    res.status(500).json({ error: "Error ending session" });
  }
});

// ✅ Get Past Sessions
router.get("/history", async (req, res) => {
  try {
    const sessions = await Session.find({userId: req.auth.userId}).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Error fetching session history" });
  }
});

module.exports = router;
