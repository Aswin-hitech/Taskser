const express = require("express");
const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");

const router = express.Router();
const JWT_SECRET = "mysecretkey";

// Debug middleware
router.use((req, res, next) => {
  console.log(`[NOTIFICATIONS] ${req.method} ${req.path}`);
  next();
});

const getUserId = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("[NOTIFICATIONS] No auth header");
    return null;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("[NOTIFICATIONS] No token in header");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("[NOTIFICATIONS] User ID:", decoded.id);
    return decoded.id;
  } catch (err) {
    console.log("[NOTIFICATIONS] Token verification failed:", err.message);
    return null;
  }
};

/* GET ALL NOTIFICATIONS */
router.get("/", async (req, res) => {
  console.log("[NOTIFICATIONS] GET / called");
  const userId = getUserId(req);
  
  if (!userId) {
    console.log("[NOTIFICATIONS] Unauthorized - no user ID");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 });
    
    console.log(`[NOTIFICATIONS] Found ${notifications.length} notifications for user ${userId}`);
    res.json(notifications);
  } catch (err) {
    console.error("[NOTIFICATIONS] Error fetching:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* CREATE NOTIFICATION */
router.post("/", async (req, res) => {
  console.log("[NOTIFICATIONS] POST / called with body:", req.body);
  const userId = getUserId(req);
  
  if (!userId) {
    console.log("[NOTIFICATIONS] Unauthorized for POST");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { taskId, type, message } = req.body;

  // Validate required fields
  if (!taskId || !type || !message) {
    console.log("[NOTIFICATIONS] Missing required fields");
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check for duplicate notification in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const exists = await Notification.findOne({
      user: userId,
      task: taskId,
      type,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (exists) {
      console.log("[NOTIFICATIONS] Duplicate notification skipped");
      return res.json({ skipped: true, message: "Duplicate notification" });
    }

    const notification = await Notification.create({
      user: userId,
      task: taskId,
      type,
      message,
    });

    console.log("[NOTIFICATIONS] Created:", notification._id);
    res.json(notification);
  } catch (err) {
    console.error("[NOTIFICATIONS] Error creating:", err);
    res.status(500).json({ message: "Failed to create notification" });
  }
});

/* MARK SINGLE NOTIFICATION AS VIEWED */
router.put("/:id/view", async (req, res) => {
  console.log(`[NOTIFICATIONS] PUT /${req.params.id}/view called`);
  const userId = getUserId(req);
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const notif = await Notification.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!notif) {
      console.log("[NOTIFICATIONS] Notification not found");
      return res.status(404).json({ message: "Not found" });
    }

    notif.viewed = true;
    await notif.save();

    console.log("[NOTIFICATIONS] Marked as viewed:", notif._id);
    res.json(notif);
  } catch (err) {
    console.error("[NOTIFICATIONS] Error updating:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* MARK ALL NOTIFICATIONS AS READ */
router.put("/mark-all-read", async (req, res) => {
  console.log("[NOTIFICATIONS] PUT /mark-all-read called");
  const userId = getUserId(req);
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await Notification.updateMany(
      { user: userId, viewed: false },
      { $set: { viewed: true } }
    );

    console.log(`[NOTIFICATIONS] Marked ${result.modifiedCount} notifications as read`);
    res.json({ 
      success: true, 
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error("[NOTIFICATIONS] Error marking all as read:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* DELETE SINGLE NOTIFICATION */
router.delete("/:id", async (req, res) => {
  console.log(`[NOTIFICATIONS] DELETE /${req.params.id} called`);
  const userId = getUserId(req);
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const notif = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!notif) {
      console.log("[NOTIFICATIONS] Notification not found for deletion");
      return res.status(404).json({ message: "Not found" });
    }

    console.log("[NOTIFICATIONS] Deleted:", notif._id);
    res.json({ 
      success: true, 
      message: "Notification deleted successfully" 
    });
  } catch (err) {
    console.error("[NOTIFICATIONS] Error deleting:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* DELETE MULTIPLE NOTIFICATIONS */
router.delete("/", async (req, res) => {
  console.log("[NOTIFICATIONS] DELETE / (multiple) called with body:", req.body);
  const userId = getUserId(req);
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No notification IDs provided" });
  }

  try {
    const result = await Notification.deleteMany({
      _id: { $in: ids },
      user: userId
    });

    console.log(`[NOTIFICATIONS] Deleted ${result.deletedCount} notifications`);
    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} notifications`,
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error("[NOTIFICATIONS] Error deleting multiple:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* CLEAR ALL NOTIFICATIONS */
router.delete("/clear-all", async (req, res) => {
  console.log("[NOTIFICATIONS] DELETE /clear-all called");
  const userId = getUserId(req);
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await Notification.deleteMany({ user: userId });

    console.log(`[NOTIFICATIONS] Cleared all ${result.deletedCount} notifications`);
    res.json({ 
      success: true, 
      message: `Cleared all ${result.deletedCount} notifications`,
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error("[NOTIFICATIONS] Error clearing all:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
