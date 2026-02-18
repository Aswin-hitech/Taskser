const express = require("express");
const Checklist = require("../models/CheckList");
const protect = require("../middleware/protect");

const router = express.Router();

/* GET ALL LISTS */
router.get("/", protect, async (req, res) => {
  try {
    const lists = await Checklist.find({ user: req.userId });
    res.json({ success: true, lists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* CREATE LIST */
router.post("/", protect, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title required" });

    const list = await Checklist.create({
      user: req.userId,
      title,
      items: [],
    });

    res.status(201).json({ success: true, list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* UPDATE LIST */
router.put("/:id", protect, async (req, res) => {
  try {
    const list = await Checklist.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );

    if (!list) return res.status(404).json({ success: false, message: "Checklist not found" });
    res.json({ success: true, list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* DELETE LIST */
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await Checklist.deleteOne({ _id: req.params.id, user: req.userId });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: "Checklist not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
