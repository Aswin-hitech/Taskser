const config = require("./config/env");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const noteRoutes = require("./routes/notes");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const notificationRoutes = require("./routes/notifications");
const checklistRoutes = require("./routes/checklists");
const statsRoutes = require("./routes/stats");
const contestRoutes = require("./routes/contests");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandlers");
const startContestJobs = require("./jobs/contestSyncJob");
const { syncContests } = require("./services/contestService");

const diag = config.getDiagnostics();
console.log("-----------------------------------------");
console.log(`Startup Environment: ${diag.environment}`);
console.log(`Port: ${diag.port}`);
console.log(`Secrets Loaded: ${diag.secretsLoaded ? "YES" : "NO"}`);
console.log(`Config Source: ${diag.source}`);
if (diag.missing.length > 0) {
  console.warn(`Missing: ${diag.missing.join(", ")}`);
}
console.log("-----------------------------------------");

if (!config.isValid && config.isProduction) {
  console.error("FATAL: Required configuration is missing in production.");
  process.exit(1);
}

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.json({ limit: "250kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/contests", contestRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    startContestJobs();
    syncContests().catch((error) => {
      console.error("[INITIAL CONTEST SYNC]", error.message);
    });
    app.listen(config.port, "0.0.0.0", () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
