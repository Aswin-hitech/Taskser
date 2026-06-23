const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const protect = require("../middleware/protect");
const {
  sanitizeText,
  validateObjectIdParam,
  normalizeDateInput,
  normalizeTimeInput,
} = require("../utils/validation");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({
      priority: 1,
      createdAt: -1,
    });
    return res.json({ success: true, tasks });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { description, type, date, time, reminder, reminderTime } = req.body;
    const cleanDescription = sanitizeText(description);

    if (!cleanDescription || !type) {
      return res.status(400).json({
        success: false,
        message: "Description and type required",
      });
    }

    if (!["daily", "scheduled"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid task type" });
    }

    const normalizedDate = type === "scheduled" ? normalizeDateInput(date) : null;
    const normalizedTime = type === "scheduled" ? normalizeTimeInput(time) : null;
    const normalizedReminderTime =
      type === "daily" && reminder ? normalizeTimeInput(reminderTime) : null;

    const task = new Task({
      user: req.userId,
      description: cleanDescription,
      type,
      date: normalizedDate || undefined,
      time: normalizedTime || undefined,
      reminder: type === "daily" ? Boolean(reminder) : false,
      reminderTime: normalizedReminderTime || undefined,
    });

    await task.save();
    return res.status(201).json({ success: true, task });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const idError = validateObjectIdParam(req.params.id, "Task");
    if (idError) {
      return res.status(400).json({ success: false, message: idError });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    task.completed = !task.completed;
    await task.save();
    return res.json({ success: true, task });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/bulk/priority", protect, async (req, res) => {
  try {
    const { priorities } = req.body;
    if (!Array.isArray(priorities)) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    const hasInvalidItem = priorities.some(
      (item) =>
        !mongoose.isValidObjectId(item.id) ||
        !Number.isInteger(item.priority) ||
        item.priority < 0
    );

    if (hasInvalidItem) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority payload",
      });
    }

    const operations = priorities.map((item) => ({
      updateOne: {
        filter: { _id: item.id, user: req.userId },
        update: { $set: { priority: item.priority } },
      },
    }));

    await Task.bulkWrite(operations);
    return res.json({ success: true, message: "Order updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:id/checkin", protect, async (req, res) => {
  try {
    const idError = validateObjectIdParam(req.params.id, "Task");
    if (idError) {
      return res.status(400).json({ success: false, message: idError });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
      type: "daily",
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Habit not found" });
    }

    const today = new Date().toISOString().split("T")[0];
    if (!task.habitLogs.includes(today)) {
      task.habitLogs.push(today);
      await task.save();
    }

    return res.json({ success: true, task });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:id/reset-streak", protect, async (req, res) => {
  try {
    const idError = validateObjectIdParam(req.params.id, "Task");
    if (idError) {
      return res.status(400).json({ success: false, message: idError });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
      type: "daily",
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Habit not found" });
    }

    task.habitLogs = [];
    await task.save();

    return res.json({ success: true, task });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const idError = validateObjectIdParam(req.params.id, "Task");
    if (idError) {
      return res.status(400).json({ success: false, message: idError });
    }

    const result = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.json({ success: true, message: "Task removed" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
