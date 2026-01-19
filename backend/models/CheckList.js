const mongoose = require("mongoose");

const checklistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "Untitled List",
      trim: true,
    },

    items: [
      {
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
        priority: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Checklist", checklistSchema);
