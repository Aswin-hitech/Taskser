require("dotenv").config();   // ✅ MUST be first line

const express = require("express");
const cors = require("cors");

const cookieparser = require("cookie-parser");
const noteRoutes = require("./routes/notes");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const notificationRoutes = require("./routes/notifications");
const checklistRoutes = require("./routes/checklists");
const statsRoutes = require("./routes/stats");

const connectDB = require("./config/db");

const app = express();

// ✅ Connect Database
connectDB();

// ✅ CORS Configuration for Cross-Origin Deployment
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5000";
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieparser());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/stats", statsRoutes);

// ✅ Use env PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
