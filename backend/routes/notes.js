const express = require("express");
const Note = require("../models/Note");
const protect = require("../middleware/protect");

const router = express.Router();

// 1. GET ALL NOTES
router.get("/", protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. CREATE NOTE
router.post("/", protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: "Content required" });

    const note = new Note({
      user: req.userId,
      title: title || "Untitled",
      content,
    });

    await note.save();
    res.status(201).json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. UPDATE NOTE
router.put("/:id", protect, async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, content },
      { new: true }
    );

    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. DELETE NOTE
router.delete("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.json({ success: true, message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
