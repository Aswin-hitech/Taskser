const express = require("express");
const jwt = require("jsonwebtoken");
const Task = require("../models/Task");

const router = express.Router();
const JWT_SECRET = "mysecretkey"; // keep SAME everywhere

// ==========================
// AUTH MIDDLEWARE
// ==========================
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Not authorized - no token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ msg: "Not authorized - invalid token" });
  }
};

// ==========================
// GET ALL TASKS
// ==========================
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId })
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("FETCH TASKS ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
});

// ==========================
// CREATE TASK
// ==========================
router.post("/", protect, async (req, res) => {
  try {
    const {
      description,
      type,
      date,
      time,
      reminder,
      reminderTime,
    } = req.body;

    if (!description || !type) {
      return res.status(400).json({ msg: "Description and type required" });
    }

    const task = new Task({
      user: req.userId,
      description,
      type,

      // scheduled
      date: type === "scheduled" ? date : undefined,
      time: type === "scheduled" ? time : undefined,

      // daily habit reminder
      reminder: type === "daily" ? reminder : false,
      reminderTime: type === "daily" ? reminderTime : undefined,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(400).json({ msg: err.message });
  }
});

// ==========================
// TOGGLE COMPLETION (SCHEDULED ONLY)
// ==========================
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
      type: "scheduled",
    });

    if (!task) {
      return res.status(404).json({ msg: "Scheduled task not found" });
    }

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
});

// ==========================
// DAILY HABIT CHECK-IN (STREAK)
// ==========================
router.post("/:id/checkin", protect, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
      type: "daily",
    });

    if (!task) {
      return res.status(404).json({ msg: "Daily habit not found" });
    }

    const today = new Date().toISOString().split("T")[0];

    if (!task.habitLogs.includes(today)) {
      task.habitLogs.push(today);
      await task.save();
    }

    res.json(task);
  } catch (err) {
    console.error("CHECK-IN ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json({ msg: "Task removed" });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
});
// ==========================
// RESET DAILY HABIT STREAK
// ==========================
router.post("/:id/reset-streak", protect, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
      type: "daily",
    });

    if (!task) {
      return res.status(404).json({ msg: "Daily habit not found" });
    }

    task.habitLogs = [];
    await task.save();

    res.json(task);
  } catch (err) {
    console.error("RESET STREAK ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
});
router.put("/:id/move", protect, async (req, res) => {
  const { direction } = req.body;

  const task = await Task.findOne({
    _id: req.params.id,
    user: req.userId,
  });

  if (!task) return res.status(404).json({ message: "Task not found" });

  task.priority += direction === "up" ? -1 : 1;
  await task.save();

  res.json(task);
});

router.post("/:id/checkin", protect, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const task = await Task.findOne({
    _id: req.params.id,
    user: req.userId,
    type: "daily",
  });

  if (!task) return res.status(404).json({ message: "Habit not found" });

  if (!task.habitLogs.includes(today)) {
    task.habitLogs.push(today);
    await task.save();
  }

  res.json(task);
});


module.exports = router;
