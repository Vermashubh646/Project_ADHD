require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const geminiRoutes = require("./routes/geminiRoutes");
const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");
const authMiddleware = require("./middleware/authMiddleware");




const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(
  ClerkExpressWithAuth({
    apiKey: process.env.CLERK_SECRET_KEY,
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));




// Routes
app.use("/api/tasks", authMiddleware, require("./routes/taskRoutes"));
app.use("/api/sessions", authMiddleware, require("./routes/sessionRoutes"));
app.use(geminiRoutes);

app.get("/api/test-auth", authMiddleware, (req, res) => {
  console.log("Auth Object:", req.auth);
  res.json({ auth: req.auth });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
