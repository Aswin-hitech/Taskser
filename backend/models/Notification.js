const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    type: {
      type: String,
      enum: [
        "due_24h",
        "due_5h",
        "due_5m",
        "due_now",
        "overdue",
        "reminder",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    viewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
