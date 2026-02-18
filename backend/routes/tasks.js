const express = require("express");
const jwt = require("jsonwebtoken");
const Task = require("../models/Task");

const router = express.Router();
const config = require("../config/env");
const JWT_SECRET = config.accessSecret;

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
      date: type === "scheduled" ? date : undefined,
      time: type === "scheduled" ? time : undefined,
      reminder: type === "daily" ? reminder : false,
      reminderTime: type === "daily" ? reminderTime : undefined,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// ==========================
// TOGGLE COMPLETION
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
    res.status(500).json({ msg: err.message });
  }
});

// ==========================
// DAILY HABIT CHECK-IN
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
    res.status(500).json({ msg: err.message });
  }
});

// ==========================
// RESET STREAK
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
    res.status(500).json({ msg: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    res.json({ msg: "Task removed" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
