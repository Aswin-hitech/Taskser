const express = require("express");
const protect = require("../middleware/protect");
const { getDailyQuote } = require("../services/quoteService");

const router = express.Router();

router.get("/daily", protect, async (req, res) => {
  try {
    const quote = await getDailyQuote();
    return res.json({ success: true, quote });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "Daily quote is temporarily unavailable.",
    });
  }
});

module.exports = router;
