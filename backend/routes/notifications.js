const express = require("express");
const Notification = require("../models/Notification");
const Task = require("../models/Task");
const protect = require("../middleware/protect");
const { validateObjectIdParam, sanitizeText } = require("../utils/validation");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, notifications });
  } catch (err) {
    console.error("[NOTIFICATIONS ERROR]", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/", protect, async (req, res) => {
  const { taskId, type, message } = req.body;
  if (!taskId || !type || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const taskIdError = validateObjectIdParam(taskId, "Task");
    if (taskIdError) {
      return res.status(400).json({ success: false, message: taskIdError });
    }

    const task = await Task.findOne({ _id: taskId, user: req.userId }).select("_id");
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const exists = await Notification.findOne({
      user: req.userId,
      task: taskId,
      type,
      createdAt: { $gte: fiveMinutesAgo },
    });

    if (exists) {
      return res.json({ success: true, skipped: true });
    }

    const notification = await Notification.create({
      user: req.userId,
      task: taskId,
      type,
      message: sanitizeText(message),
    });

    return res.json({ success: true, notification });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create notification" });
  }
});

router.put("/mark-all-read", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, viewed: false },
      { $set: { viewed: true } }
    );
    return res.json({ success: true, message: "All marked read" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/clear-all", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.userId });
    return res.json({ success: true, message: "Notifications cleared" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/bulk", protect, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No IDs provided" });
    }

    const invalidId = ids.find((id) => validateObjectIdParam(id, "Notification"));
    if (invalidId) {
      return res.status(400).json({
        success: false,
        message: "One or more notification IDs are invalid",
      });
    }

    await Notification.deleteMany({ _id: { $in: ids }, user: req.userId });
    return res.json({ success: true, message: "Notifications deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/:id/view", protect, async (req, res) => {
  try {
    const idError = validateObjectIdParam(req.params.id, "Notification");
    if (idError) {
      return res.status(400).json({ success: false, message: idError });
    }

    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { viewed: true },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, notification: notif });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const idError = validateObjectIdParam(req.params.id, "Notification");
    if (idError) {
      return res.status(400).json({ success: false, message: idError });
    }

    const result = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!result) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
