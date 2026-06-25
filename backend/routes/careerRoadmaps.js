const express = require("express");
const CareerRoadmap = require("../models/CareerRoadmap");
const protect = require("../middleware/protect");
const { generateCareerRoadmap } = require("../services/llmService");
const {
  normalizeDateInput,
  sanitizeText,
  validateObjectIdParam,
} = require("../utils/validation");

const router = express.Router();

const parseTopics = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeText).filter(Boolean).slice(0, 40);
  }

  return String(value || "")
    .split(/,|\n|>/)
    .map(sanitizeText)
    .filter(Boolean)
    .slice(0, 40);
};

const normalizeModules = (modules) =>
  (Array.isArray(modules) ? modules : []).slice(0, 12).map((module) => ({
    title: sanitizeText(module.title) || "Learning Module",
    description: sanitizeText(module.description),
    milestones: (Array.isArray(module.milestones) ? module.milestones : [])
      .slice(0, 8)
      .map((milestone) => ({
        title: sanitizeText(milestone.title) || "Milestone",
        checklist: (Array.isArray(milestone.checklist) ? milestone.checklist : [])
          .slice(0, 12)
          .map((item) => ({
            title: sanitizeText(typeof item === "string" ? item : item.title),
            completed: false,
          }))
          .filter((item) => item.title),
      })),
    completed: false,
  }));

const summarizeRoadmap = (roadmap) => {
  const modules = roadmap.modules || [];
  const allItems = modules.flatMap((module) =>
    module.milestones.flatMap((milestone) => milestone.checklist)
  );
  const completedItems = allItems.filter((item) => item.completed).length;
  const progress = allItems.length === 0 ? 0 : Math.round((completedItems / allItems.length) * 100);
  const completedModules = modules.filter((module) => module.completed).length;
  const remainingModules = Math.max(modules.length - completedModules, 0);
  const today = new Date();
  const target = new Date(roadmap.targetCompletionDate);
  const daysLeft = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    progress,
    completedItems,
    totalItems: allItems.length,
    completedModules,
    remainingModules,
    daysLeft,
    estimatedStatus:
      progress === 100
        ? "Course complete"
        : daysLeft < 0
          ? "Past target date"
          : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`,
  };
};

const withSummary = (roadmap) => {
  const object = roadmap.toObject ? roadmap.toObject() : roadmap;
  return { ...object, summary: summarizeRoadmap(object) };
};

const updateModuleCompletion = (roadmap) => {
  roadmap.modules.forEach((module) => {
    const items = module.milestones.flatMap((milestone) => milestone.checklist);
    module.completed = items.length > 0 && items.every((item) => item.completed);
  });
  roadmap.status = roadmap.modules.length > 0 && roadmap.modules.every((module) => module.completed)
    ? "completed"
    : "active";
};

router.get("/", protect, async (req, res) => {
  try {
    const roadmaps = await CareerRoadmap.find({ user: req.userId }).sort({ updatedAt: -1 });
    return res.json({ success: true, roadmaps: roadmaps.map(withSummary) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load roadmaps." });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const title = sanitizeText(req.body.title);
    const topics = parseTopics(req.body.topics);
    const targetCompletionDate = normalizeDateInput(req.body.targetCompletionDate);

    if (!title || topics.length === 0 || !targetCompletionDate) {
      return res.status(400).json({
        success: false,
        message: "Roadmap title, topics, and target completion date are required.",
      });
    }

    const generated = await generateCareerRoadmap({
      title,
      topics,
      targetCompletionDate: req.body.targetCompletionDate,
    });
    const modules = normalizeModules(generated.modules);

    if (modules.length === 0) {
      return res.status(502).json({
        success: false,
        message: "The roadmap generator returned no usable modules.",
      });
    }

    const roadmap = await CareerRoadmap.create({
      user: req.userId,
      title,
      rawTopics: topics,
      targetCompletionDate,
      modules,
    });

    return res.status(201).json({ success: true, roadmap: withSummary(roadmap) });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to generate roadmap.",
    });
  }
});

router.put("/:id/checklist/:itemId", protect, async (req, res) => {
  try {
    const roadmapIdError = validateObjectIdParam(req.params.id, "Roadmap");
    const itemIdError = validateObjectIdParam(req.params.itemId, "Checklist item");
    if (roadmapIdError || itemIdError) {
      return res.status(400).json({ success: false, message: roadmapIdError || itemIdError });
    }

    const roadmap = await CareerRoadmap.findOne({ _id: req.params.id, user: req.userId });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found." });
    }

    let found = false;
    roadmap.modules.forEach((module) => {
      module.milestones.forEach((milestone) => {
        milestone.checklist.forEach((item) => {
          if (String(item._id) === req.params.itemId) {
            item.completed =
              typeof req.body.completed === "boolean" ? req.body.completed : !item.completed;
            found = true;
          }
        });
      });
    });

    if (!found) {
      return res.status(404).json({ success: false, message: "Checklist item not found." });
    }

    updateModuleCompletion(roadmap);
    await roadmap.save();
    return res.json({ success: true, roadmap: withSummary(roadmap) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to update roadmap." });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const idError = validateObjectIdParam(req.params.id, "Roadmap");
    if (idError) {
      return res.status(400).json({ success: false, message: idError });
    }

    const deleted = await CareerRoadmap.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Roadmap not found." });
    }

    return res.json({ success: true, message: "Roadmap deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to delete roadmap." });
  }
});

module.exports = router;
