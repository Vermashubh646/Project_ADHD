// routes/geminiRoutes.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Proxy Route to handle Gemini requests
router.post("/api/gemini", async (req, res) => {
  const { userMessage } = req.body;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, // Correct API URL with key
      {
        contents: [{ parts: [{ text: userMessage }] }], // Correct request body structure
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
  }
});

module.exports = router;