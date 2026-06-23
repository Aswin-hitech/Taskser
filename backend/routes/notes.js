const express = require("express");
const Note = require("../models/Note");
const protect = require("../middleware/protect");
const {
  sanitizeText,
  sanitizeMultilineText,
  validateObjectIdParam,
} = require("../utils/validation");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, notes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const cleanTitle = sanitizeText(req.body.title) || "Untitled";
    const cleanContent = sanitizeMultilineText(req.body.content);

    if (!cleanContent) {
      return res.status(400).json({ success: false, message: "Content required" });
    }

    const note = new Note({
      user: req.userId,
      title: cleanTitle,
      content: cleanContent,
    });

    await note.save();
    return res.status(201).json({ success: true, note });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const idError = validateObjectIdParam(req.params.id, "Note");
    if (idError) {
      return res.status(400).json({ success: false, message: idError });
    }

    const cleanTitle = sanitizeText(req.body.title) || "Untitled";
    const cleanContent = sanitizeMultilineText(req.body.content);

    if (!cleanContent) {
      return res.status(400).json({ success: false, message: "Content required" });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title: cleanTitle, content: cleanContent },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    return res.json({ success: true, note });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const idError = validateObjectIdParam(req.params.id, "Note");
    if (idError) {
      return res.status(400).json({ success: false, message: idError });
    }

    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    return res.json({ success: true, message: "Note deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
