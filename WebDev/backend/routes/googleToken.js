const express = require("express");
const axios = require('axios');
require("dotenv").config();

const router = express.Router();

router.get("/", async (req, res) => {
    const { userId } = req.query;
  
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
  
    try {
      const response = await axios.get(
        `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/oauth_google`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        }
      );
  
      if (!Array.isArray(response.data) || response.data.length === 0) {
        return res.status(404).json({ error: "No access token found for user" });
      }
      
      const token = response.data[0].token;
      return res.json({ accessToken: token });
    } catch (error) {
      console.error("❌ Error fetching token from Clerk:", error.response?.data || error.message);
      return res.status(500).json({ error: "Failed to fetch token from Clerk" });
    }
  });
  

module.exports = router;
