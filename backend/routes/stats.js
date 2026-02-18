const express = require("express");
const Task = require("../models/Task");
const Note = require("../models/Note");
const Checklist = require("../models/CheckList");
const protect = require("../middleware/protect");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    // Get task statistics
    const tasks = await Task.find({ user: req.userId });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;

    // Get notes count
    const notesCount = await Note.countDocuments({ user: req.userId });

    // Calculate active streak
    const dailyTasks = tasks.filter(task => task.type === "daily");
    let activeStreak = 0;

    if (dailyTasks.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const hasTaskToday = dailyTasks.some(task =>
        task.habitLogs && task.habitLogs.includes(today)
      );
      activeStreak = hasTaskToday ? 1 : 0; // Simplified
    }

    // Get checklists count
    const checklistsCount = await Checklist.countDocuments({ user: req.userId });

    res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        totalNotes: notesCount,
        totalChecklists: checklistsCount,
        activeStreak,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    });
  } catch (err) {
    console.error("[STATS ERROR]", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
