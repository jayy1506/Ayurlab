import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config(); // fallback to cwd .env

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import {
  defaultRateLimiter,
  aiRateLimiter,
} from "./middleware/rateLimiter.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy for correct client IP detection behind proxies/reverse-proxies
app.set("trust proxy", 1);

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Request logging middleware for monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint for uptime and monitoring
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    collegeId: process.env.COLLEGE_ID || "COLLEGE_001",
    memoryUsage: process.memoryUsage(),
  });
});

// Apply global rate limiting to all requests
app.use(defaultRateLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// AI route with dedicated strict rate limiting
app.post("/api/ai", aiRateLimiter, (req, res) => {
  res.json({ message: "AI response placeholder" });
});

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Support React Router single-page application routing (wildcard redirect to index.html)
app.get("/*splat", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("[ServerError]:", err);
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
  } catch (err) {
    console.error("[Server Startup Warning]: Database connection / admin seed encountered an issue:", err.message);
  }

  if (process.argv[1] && process.argv[1].endsWith("server.js")) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }
};

startServer();

export default app;
