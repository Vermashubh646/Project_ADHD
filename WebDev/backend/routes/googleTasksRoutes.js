const express = require("express");
const { google } = require("googleapis");
const { getGoogleAccessToken } = require("../utils/clerk"); // You'll implement this
const router = express.Router();
const axios = require("axios");

router.post("/create", async (req, res) => {
  const userId = req.auth.userId;
  const {
    title,
    description,
    dueDate,
    status,
    position,
  } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!title) return res.status(400).json({ error: "Missing task title" });

  try {
    const { token: accessToken } = await getGoogleAccessToken(userId);

    const taskPayload = {
      title,
      ...(description && { notes: description }),
      ...(dueDate && { due: new Date(dueDate).toISOString() }),
      status: status === "Completed" ? "completed" : "needsAction",
      ...(status === "Completed" && { completed: new Date().toISOString() }),
      ...(position !== undefined && { position: position.toString() }),
    };

    const response = await axios.post(
      "https://www.googleapis.com/tasks/v1/lists/@default/tasks",
      taskPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ success: true, task: response.data });
  } catch (err) {
    console.error("❌ Error creating Google Task:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create Google Task" });
  }
});

router.patch("/edit/:googleTaskId", async (req, res) => {
  const userId = req.auth.userId;
  const { googleTaskId } = req.params;
  const { title, description, dueDate, status, position } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { token: accessToken } = await getGoogleAccessToken(userId);

    const updatePayload = {
      ...(title && { title }),
      ...(description && { notes: description }),
      ...(dueDate && { due: new Date(dueDate).toISOString() }),
      ...(status && { status: status === "Completed" ? "completed" : "needsAction" }),
      ...(status === "Completed" && { completed: new Date().toISOString() }),
      ...(position !== undefined && { position: position.toString() }),
    };

    const response = await axios.patch(
      `https://www.googleapis.com/tasks/v1/lists/@default/tasks/${googleTaskId}`,
      updatePayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ success: true, updatedTask: response.data });
  } catch (err) {
    console.error("❌ Edit Task Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to update Google Task" });
  }
});

router.delete("/delete/:googleTaskId", async (req, res) => {
  const userId = req.auth.userId;
  const { googleTaskId } = req.params;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { token: accessToken } = await getGoogleAccessToken(userId);

    await axios.delete(
      `https://www.googleapis.com/tasks/v1/lists/@default/tasks/${googleTaskId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Delete Task Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to delete Google Task" });
  }
});

router.patch("/complete/:googleTaskId", async (req, res) => {
  const userId = req.auth.userId;
  const { googleTaskId } = req.params;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { token: accessToken } = await getGoogleAccessToken(userId);

    const response = await axios.patch(
      `https://www.googleapis.com/tasks/v1/lists/@default/tasks/${googleTaskId}`,
      {
        status: "completed",
        completed: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ success: true, updatedTask: response.data });
  } catch (err) {
    console.error("❌ Complete Task Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to complete Google Task" });
  }
});


module.exports = router;
