const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");

const authMiddleware = ClerkExpressWithAuth({
  onAuthSuccess: (req, res, next) => {
    console.log("✅ Authenticated User:", req.auth.userId);
    next(); // ✅ Correct way to proceed
  },
  onAuthFailure: (req, res) => {
    console.error("❌ Unauthorized - No valid token");
    res.status(401).json({ message: "Unauthorized - No valid token" });
  },
});

module.exports = authMiddleware;
