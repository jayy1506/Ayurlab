import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config(); // fallback to cwd .env

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";
import { seedPracticals } from "./utils/seedPracticals.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import practicalRoutes from "./routes/practicalRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import mongoose from "mongoose";
import { defaultRateLimiter } from "./middleware/rateLimiter.js";
import { authenticateUser, requireFacultyOrAdmin } from "./middleware/auth.js";
import { startRecordingRetentionSchedule } from "./jobs/recordingCleanup.js";
import logger from "./utils/logger.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy for correct client IP detection behind proxies/reverse-proxies
app.set("trust proxy", 1);

// 1. Helmet security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for React SPA dynamic assets & WebRTC/video streaming
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 2. CORS with whitelist from environment + localhost/127.0.0.1/[::1] support for local development
const getAllowedOrigins = () => {
  const envOrigins = process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175";
  return envOrigins
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
};

const LOCAL_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, mobile webviews, Vite proxy)
      if (!origin) return callback(null, true);

      // Strip trailing slash if present
      const cleanOrigin = origin.replace(/\/$/, "");

      // In local development or testing, always allow any localhost/127.0.0.1/[::1] port
      if (LOCAL_ORIGIN_REGEX.test(cleanOrigin)) {
        return callback(null, true);
      }

      // Check configured allowed origins
      const currentAllowed = getAllowedOrigins();
      if (currentAllowed.includes(cleanOrigin)) {
        return callback(null, true);
      }

      logger.warn(`CORS blocked: Origin '${cleanOrigin}' is not authorized.`);
      return callback(null, false);
    },
    credentials: true,
  })
);

// 3. Request body size limits (defense against oversized payload DoS)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Request logging middleware with structured format
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.request(req, res, duration);
  });
  next();
});

// Enhanced Health check endpoint with database and resource diagnostics
app.get("/health", (req, res) => {
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const dbStatus = dbStates[mongoose.connection.readyState] || "unknown";

  const isHealthy = mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2;

  const responseData = {
    status: isHealthy ? "ok" : "degraded",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
    memory: {
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  };

  // Return HTTP 200 even if degraded during cold-starts so container doesn't restart continuously
  res.status(200).json(responseData);
});

// Serve static files from the React frontend build (exempt from API rate limits)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Protect exam recordings directory: Only authorized faculty and admins can access
app.use(
  "/uploads/exam_recordings",
  authenticateUser,
  requireFacultyOrAdmin,
  express.static(path.join(__dirname, "uploads/exam_recordings"))
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 4. Rate limiting strictly applied to /api routes
app.use("/api", defaultRateLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/practicals", practicalRoutes);
app.use("/api/simulation", simulationRoutes);
app.use("/api/exam", examRoutes);
app.use("/api", simulationRoutes); // For /api/admin/student-activity, /api/admin/exam-attempts, etc.

// Support React Router single-page application routing (wildcard redirect to index.html)
app.get("/*splat", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled express route error", err, { path: req.path });
  res.status(err.status || 500).json({
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred",
  });
});

// 🤖 Keep-Alive Robot for Render Free Tier
// Note: When Render puts an instance to sleep after 15m inactivity, the Node process freezes.
// This loop keeps the process warm while active, but external triggers (like GitHub Actions or UptimeRobot)
// are required to wake the instance up from a cold sleep.
const selfPing = () => {
  const rawUrl = process.env.RENDER_EXTERNAL_URL;
  if (!rawUrl) return;

  const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
  const target = `${url.replace(/\/$/, "")}/health`;

  logger.info(`[Keep-Alive Robot] Self-pinging ${target}`);
  import("https").then(({ get }) => {
    get(target, (res) => {
      logger.info(`[Keep-Alive Robot] Health response status: ${res.statusCode}`);
    }).on("error", (err) => {
      logger.warn(`[Keep-Alive Robot] Ping failed: ${err.message}`);
    });
  }).catch(err => {
    logger.error("[Keep-Alive Robot] Failed to load https module:", err);
  });
};

// Run ping every 14 minutes (840000 ms) while active, if RENDER_EXTERNAL_URL is provided
if (process.env.RENDER_EXTERNAL_URL) {
  logger.info("[Keep-Alive Robot] Render environment detected. Initializing keep-alive loop.");
  setTimeout(selfPing, 60000);
  setInterval(selfPing, 840000);
}

// Start Server and initialize Database & Seed Admin
const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedPracticals();
    startRecordingRetentionSchedule();
  } catch (err) {
    console.error("[Server Startup Warning]: Database connection / admin seed encountered an issue:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Ayurlab backend running on port ${PORT}`);
    console.log(`[Security] Helmet, Strict CORS whitelist (${getAllowedOrigins().join(", ")}), and 1MB body limits active`);
  });
};

startServer();

export default app;
