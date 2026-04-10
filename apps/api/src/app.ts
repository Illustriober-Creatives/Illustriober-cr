/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Middleware imports
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

// Route imports
import authRoutes from "./routes/auth";
import enquiryRoutes from "./routes/enquiries";

// Load environment variables
dotenv.config();

/**
 * Initialize Express application
 */
const app = express();

// ─────────────────────────────────────────
// MIDDLEWARE STACK
// ─────────────────────────────────────────

// Request logging (logs all incoming requests)
app.use(requestLogger);

const LOCAL_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const allowNullOrigin = process.env.NODE_ENV !== "production";
const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set<string>([
  "http://localhost:3000",
  "http://localhost:3001",
  ...configuredOrigins,
]);

// CORS configuration (allow cross-origin requests)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (origin === "null" && allowNullOrigin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin) || LOCAL_ORIGIN_REGEX.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Body parsing (parse JSON and URL-encoded bodies)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

// Authentication endpoints: login, signup, logout
app.use("/api/auth", authRoutes);

// Enquiry endpoints: form submissions (public)
app.use("/api/enquiries", enquiryRoutes);

// Root endpoint for quick API reachability checks
app.get("/", (_req: Request, res: Response) => {
  res.json({
    service: "illustriober-api",
    status: "ok",
    docs: ["/health", "/api/auth", "/api/enquiries"],
  });
});

// Health check endpoint (used for monitoring and load balancing)
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─────────────────────────────────────────
// 404 & ERROR HANDLING
// ─────────────────────────────────────────

// 404 handler - catch undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
    status: 404,
  });
});

// Global error handler (MUST be registered last)
app.use(errorHandler);

export default app;
