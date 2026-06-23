const mongoose = require("mongoose");

const contestSyncStateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global",
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    lastSuccessAt: {
      type: Date,
      default: null,
    },
    lastStatus: {
      type: String,
      enum: ["idle", "success", "partial_failure", "failure"],
      default: "idle",
    },
    sourceStatuses: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastError: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContestSyncState", contestSyncStateSchema);
