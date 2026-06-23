const express = require("express");
const protect = require("../middleware/protect");
const { validateObjectIdParam } = require("../utils/validation");
const {
  DEFAULT_REMINDER_OFFSETS,
  getContestList,
  syncContests,
  updateContestPreference,
} = require("../services/contestService");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const { platform = "all", sort = "date_asc", favoritesOnly = "false" } = req.query;

    const data = await getContestList({
      userId: req.userId,
      platform,
      sort,
      favoritesOnly: favoritesOnly === "true",
    });

    return res.json({
      success: true,
      ...data,
      availableReminderOffsets: DEFAULT_REMINDER_OFFSETS,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load contests.",
    });
  }
});

router.post("/refresh", protect, async (req, res) => {
  try {
    const result = await syncContests();
    return res.json({ success: true, sync: result });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Contest refresh failed. Cached data is still available.",
    });
  }
});

router.put("/:id/preference", protect, async (req, res) => {
  try {
    const idError = validateObjectIdParam(req.params.id, "Contest");
    if (idError) {
      return res.status(400).json({ success: false, message: idError });
    }

    const updated = await updateContestPreference({
      userId: req.userId,
      contestId: req.params.id,
      isFavorite: req.body?.isFavorite,
      reminderOffsets: req.body?.reminderOffsets,
    });

    return res.json({ success: true, contest: updated });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update contest preference.",
    });
  }
});

module.exports = router;
