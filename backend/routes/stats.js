const express = require("express");
const jwt = require("jsonwebtoken");
const Task = require("../models/Task");
const Note = require("../models/Note");
const Checklist = require("../models/CheckList");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const getUserId = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

router.get("/", async (req, res) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Get task statistics
    const tasks = await Task.find({ user: userId });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;

    // Get notes count
    const notes = await Note.find({ user: userId });
    const totalNotes = notes.length;

    // Calculate active streak (simplified - you can enhance this)
    const dailyTasks = tasks.filter(task => task.type === "daily");
    let activeStreak = 0;

    // Simple streak calculation (you can improve this)
    if (dailyTasks.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const hasTaskToday = dailyTasks.some(task =>
        task.habitLogs && task.habitLogs.includes(today)
      );
      activeStreak = hasTaskToday ? 1 : 0;
    }

    // Get checklists count
    const checklists = await Checklist.find({ user: userId });
    const totalChecklists = checklists.length;

    res.json({
      totalTasks,
      completedTasks,
      totalNotes,
      totalChecklists,
      activeStreak,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
