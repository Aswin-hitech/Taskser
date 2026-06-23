const express = require("express");
const Task = require("../models/Task");
const Note = require("../models/Note");
const Checklist = require("../models/CheckList");
const protect = require("../middleware/protect");

const router = express.Router();

const calculateCurrentStreak = (logs = []) => {
  let streak = 0;
  const uniqueLogs = new Set(logs);
  const today = new Date();

  for (let i = 0; ; i += 1) {
    const date = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i, 12)
    );
    const dateKey = date.toISOString().split("T")[0];

    if (uniqueLogs.has(dateKey)) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const notesCount = await Note.countDocuments({ user: req.userId });
    const checklistsCount = await Checklist.countDocuments({ user: req.userId });

    const dailyTasks = tasks.filter((task) => task.type === "daily");
    const activeStreak = dailyTasks.reduce(
      (max, task) => Math.max(max, calculateCurrentStreak(task.habitLogs || [])),
      0
    );

    return res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        totalNotes: notesCount,
        totalChecklists: checklistsCount,
        activeStreak,
        completionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    });
  } catch (err) {
    console.error("[STATS ERROR]", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
