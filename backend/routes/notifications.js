const express = require("express");
const Notification = require("../models/Notification");
const protect = require("../middleware/protect");

const router = express.Router();

/* GET ALL NOTIFICATIONS */
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    console.error("[NOTIFICATIONS ERROR]", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* CREATE NOTIFICATION */
router.post("/", protect, async (req, res) => {
  const { taskId, type, message } = req.body;
  if (!taskId || !type || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const exists = await Notification.findOne({
      user: req.userId,
      task: taskId,
      type,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (exists) return res.json({ success: true, skipped: true });

    const notification = await Notification.create({
      user: req.userId,
      task: taskId,
      type,
      message,
    });

    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create notification" });
  }
});

/* MARK VIEWED */
router.put("/:id/view", protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { viewed: true },
      { new: true }
    );

    if (!notif) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* MARK ALL READ */
router.put("/mark-all-read", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, viewed: false },
      { $set: { viewed: true } }
    );
    res.json({ success: true, message: "All marked read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* DELETE SINGLE */
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await Notification.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!result) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* CLEAR ALL */
router.delete("/clear-all", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.userId });
    res.json({ success: true, message: "Notifications cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
