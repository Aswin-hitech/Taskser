const express = require("express");
const jwt = require("jsonwebtoken");
const Note = require("../models/Note");

const router = express.Router();
const JWT_SECRET = "mysecretkey";

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};


router.get("/", protect, async (req, res) => {
  const notes = await Note.find({ user: req.userId })
    .sort({ createdAt: -1 });
  res.json(notes);
});

router.post("/", protect, async (req, res) => {
  const { title, content } = req.body;
  if (!content) return res.status(400).json({ msg: "Content required" });

  const note = new Note({
    user: req.userId,
    title: title || "Untitled",
    content,
  });

  await note.save();
  res.status(201).json(note);
});


router.put("/:id", protect, async (req, res) => {
  const { title, content } = req.body;

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { title, content },
    { new: true }
  );

  if (!note) return res.status(404).json({ msg: "Note not found" });

  res.json(note);
});


router.delete("/:id", protect, async (req, res) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    user: req.userId,
  });

  if (!note) return res.status(404).json({ msg: "Note not found" });

  res.json({ msg: "Note deleted" });
});

module.exports = router;
