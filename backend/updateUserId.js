const mongoose = require("mongoose");
const Task = require("./models/Task"); // Adjust path if necessary
const Session = require("./models/Session"); // Adjust path if necessary

const MONGO_URI = 'mongodb://127.0.0.1:27017/mindsync'; // Replace with your URI

// Define a dummy userId to associate with existing tasks/sessions
const dummyUserId = "user_2udrrn5LnO3RyfdpY3zNclRq6or"; // Replace with an actual Clerk userId if possible

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB.");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

// Update Tasks Collection
async function updateTasks() {
  try {
    const result = await Task.updateMany(
      { userId: { $exists: false } }, // Only update tasks without a userId
      { $set: { userId: dummyUserId } } // Add the userId to all existing tasks
    );
    console.log(`✅ Updated ${result.modifiedCount} tasks with userId.`);
  } catch (error) {
    console.error("❌ Error updating tasks:", error);
  }
}

// Update Sessions Collection
async function updateSessions() {
  try {
    const result = await Session.updateMany(
      { userId: { $exists: true } }, // Only update sessions without a userId
      { $set: { userId: dummyUserId } } // Add the userId to all existing sessions
    );
    console.log(`✅ Updated ${result.modifiedCount} sessions with userId.`);
  } catch (error) {
    console.error("❌ Error updating sessions:", error);
  }
}

// Main Function
async function updateData() {
  await connectDB();
  await updateTasks();
  await updateSessions();
  mongoose.disconnect(); // Disconnect after updates
  console.log("✅ All updates complete. Database updated!");
}

// Run the update
updateData();
