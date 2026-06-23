const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ["leetcode", "codeforces", "codechef", "atcoder"],
      required: true,
      index: true,
    },
    externalId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    raw: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

contestSchema.index({ platform: 1, externalId: 1 }, { unique: true });

module.exports = mongoose.model("Contest", contestSchema);
