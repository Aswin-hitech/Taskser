const mongoose = require("mongoose");
const config = require("./env");

const connectDB = async () => {
  if (!config.mongoUri) {
    throw new Error("MONGO_URI is not configured.");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected successfully");
};

module.exports = connectDB;
