const express = require("express");
const Task = require("../models/Task");
const protect = require("../middleware/protect");

const router = express.Router();

// 1. GET ALL TASKS
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. CREATE TASK
router.post("/", protect, async (req, res) => {
  try {
    const { description, type, date, time, reminder, reminderTime } = req.body;

    if (!description || !type) {
      return res.status(400).json({ success: false, message: "Description and type required" });
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
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 3. TOGGLE COMPLETION
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    task.completed = !task.completed;
    await task.save();
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. BULK PRIORITY (Drag & Drop Persistence)
router.put("/bulk/priority", protect, async (req, res) => {
  try {
    const { priorities } = req.body; // Array of { id: string, priority: number }
    if (!Array.isArray(priorities)) return res.status(400).json({ success: false, message: "Invalid data" });

    const operations = priorities.map(item => ({
      updateOne: {
        filter: { _id: item.id, user: req.userId },
        update: { $set: { priority: item.priority } }
      }
    }));

    await Task.bulkWrite(operations);
    res.json({ success: true, message: "Order updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. DAILY HABIT CHECK-IN
router.post("/:id/checkin", protect, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId, type: "daily" });

    if (!task) return res.status(404).json({ success: false, message: "Habit not found" });

    const today = new Date().toISOString().split("T")[0];
    if (!task.habitLogs.includes(today)) {
      task.habitLogs.push(today);
      await task.save();
    }

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. RESET STREAK
router.post("/:id/reset-streak", protect, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId, type: "daily" });

    if (!task) return res.status(404).json({ success: false, message: "Habit not found" });

    task.habitLogs = [];
    await task.save();

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. DELETE TASK
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!result) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
