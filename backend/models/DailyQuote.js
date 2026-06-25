const mongoose = require("mongoose");

const dailyQuoteSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    quote: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      default: "Unknown",
      trim: true,
    },
    category: {
      type: String,
      default: "inspiration",
      trim: true,
    },
    emoji: {
      type: String,
      default: ":sparkles:",
    },
    source: {
      type: String,
      default: "api-ninjas",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DailyQuote", dailyQuoteSchema);
