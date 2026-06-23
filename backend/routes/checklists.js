const express = require("express");
const Checklist = require("../models/CheckList");
const protect = require("../middleware/protect");
const { sanitizeText, validateObjectIdParam } = require("../utils/validation");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const lists = await Checklist.find({ user: req.userId }).sort({ updatedAt: -1 });
    return res.json({ success: true, lists });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const cleanTitle = sanitizeText(req.body.title);
    if (!cleanTitle) {
      return res.status(400).json({ success: false, message: "Title required" });
    }

    const list = await Checklist.create({
      user: req.userId,
      title: cleanTitle,
      items: [],
    });

    return res.status(201).json({ success: true, list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const idError = validateObjectIdParam(req.params.id, "Checklist");
    if (idError) {
      return res.status(400).json({ success: false, message: idError });
    }

    const update = {};

    if (req.body.title !== undefined) {
      const cleanTitle = sanitizeText(req.body.title);
      if (!cleanTitle) {
        return res.status(400).json({ success: false, message: "Title cannot be empty" });
      }
      update.title = cleanTitle;
    }

    if (req.body.items !== undefined) {
      if (!Array.isArray(req.body.items)) {
        return res.status(400).json({ success: false, message: "Items must be an array" });
      }

      update.items = req.body.items
        .map((item, index) => ({
          text: sanitizeText(item.text),
          completed: Boolean(item.completed),
          priority: Number.isInteger(item.priority) ? item.priority : index,
        }))
        .filter((item) => item.text);
    }

    const list = await Checklist.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      update,
      { new: true }
    );

    if (!list) {
      return res.status(404).json({ success: false, message: "Checklist not found" });
    }

    return res.json({ success: true, list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const idError = validateObjectIdParam(req.params.id, "Checklist");
    if (idError) {
      return res.status(400).json({ success: false, message: idError });
    }

    const result = await Checklist.deleteOne({ _id: req.params.id, user: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Checklist not found" });
    }

    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
