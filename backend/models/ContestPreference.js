const mongoose = require("mongoose");

const contestPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
      index: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isScheduled: {
      type: Boolean,
      default: false,
    },
    reminderOffsets: {
      type: [Number],
      default: [],
    },
    sentReminderOffsets: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

contestPreferenceSchema.index({ user: 1, contest: 1 }, { unique: true });

module.exports = mongoose.model("ContestPreference", contestPreferenceSchema);
