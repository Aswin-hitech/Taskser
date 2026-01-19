const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  description: { type: String, required: true },

  type: {
    type: String,
    enum: ["daily", "scheduled"],
    required: true,
  },

  date: Date,
  time: String,  

  habitLogs: {
    type: [String],
    default: [],
  },

  priority: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },

  reminder: { type: Boolean, default: false },
  reminderTime: String,
}, { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);