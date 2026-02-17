const config = require("./config/env");

const express = require("express");
const cors = require("cors");

// --- Deployment Helper & Startup Validation ---
const diag = config.getDiagnostics();
console.log("-----------------------------------------");
console.log(`🚀 Startup Environment: ${diag.environment}`);
console.log(`📡 Port: ${diag.port}`);
console.log(`🔑 Secrets Loaded: ${diag.secretsLoaded ? "YES" : "NO"}`);
console.log(`📂 Source: ${diag.source}`);
if (diag.missing.length > 0) {
  console.warn(`⚠️  Missing: ${diag.missing.join(", ")}`);
}
console.log("-----------------------------------------");

if (!config.isValid && config.isProduction) {
  console.error("❌ FATAL: JWT Secrets missing in production. Shutting down.");
  process.exit(1);
}

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
app.use(cors({
  origin: config.frontendUrl,
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
