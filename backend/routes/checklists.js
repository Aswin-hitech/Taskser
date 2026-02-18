const express = require("express");
const jwt = require("jsonwebtoken");
const Checklist = require("../models/CheckList");

const router = express.Router();
const config = require("../config/env");
const JWT_SECRET = config.accessSecret;

const getUserId = (req) => {
  const auth = req.headers.authorization;
  if (!auth) return null;
  try {
    return jwt.verify(auth.split(" ")[1], JWT_SECRET).id;
  } catch {
    return null;
  }
};

/* GET ALL LISTS */
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ msg: "Unauthorized" });

  const lists = await Checklist.find({ user: userId });
  res.json(lists);
});

/* CREATE LIST */
router.post("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ msg: "Unauthorized" });

  const list = await Checklist.create({
    user: userId,
    title: req.body.title,
    items: [],
  });

  res.status(201).json(list);
});

/* UPDATE LIST */
router.put("/:id", async (req, res) => {
  const userId = getUserId(req);
  const list = await Checklist.findOneAndUpdate(
    { _id: req.params.id, user: userId },
    req.body,
    { new: true }
  );

  res.json(list);
});

/* DELETE LIST */
router.delete("/:id", async (req, res) => {
  const userId = getUserId(req);
  await Checklist.deleteOne({ _id: req.params.id, user: userId });
  res.json({ msg: "Deleted" });
});

module.exports = router;
