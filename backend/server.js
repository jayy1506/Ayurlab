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
  // Minimal public health check – no sensitive info
  res.json({ status: "ok" });
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

// 🤖 Keep-Alive Robot for Render Free Tier (Prevents 50s cold start)
const selfPing = () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url) return;

  console.log(`[Keep-Alive Robot]: Pinging self at ${url}/health`);
  import("https").then(({ get }) => {
    get(`${url}/health`, (res) => {
      console.log(`[Keep-Alive Robot]: Ping response status: ${res.statusCode}`);
    }).on("error", (err) => {
      console.error("[Keep-Alive Robot]: Ping failed:", err.message);
    });
  }).catch(err => {
    console.error("[Keep-Alive Robot]: Failed to load https module:", err);
  });
};

// Run ping every 10 minutes (600000 ms)
if (process.env.RENDER_EXTERNAL_URL) {
  console.log("[Keep-Alive Robot]: Render environment detected. Initializing self-ping loop.");
  setTimeout(selfPing, 60000);
  setInterval(selfPing, 600000);
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
