const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const noteRoutes = require("./routes/notes");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const notificationRoutes = require("./routes/notifications");
const checklistRoutes = require("./routes/checklists");
const statsRoutes = require("./routes/stats");
const app = express();

connectDB();

app.use(cors({
  origin: [
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/stats", statsRoutes);

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(` Server running on port ${PORT}`);
});
