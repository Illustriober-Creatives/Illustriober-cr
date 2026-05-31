/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Middleware imports
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { rateLimit } from "./middleware/rateLimit";

// Route imports
import authRoutes from "./routes/auth";
import enquiryRoutes from "./routes/enquiries";
import inviteRoutes from "./routes/invites";
import adminRoutes from "./routes/admin";
import projectRoutes from "./routes/projects";
import ticketRoutes from "./routes/tickets";
import uploadRoutes from "./routes/uploads";
import portfolioRoutes from "./routes/portfolio";

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
const VERCEL_PREVIEW_REGEX = /^https:\/\/[\w-]+\.vercel\.app$/i;
const allowNullOrigin = process.env.NODE_ENV !== "production";
const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set<string>([
  "http://localhost:3000",
  "http://localhost:3001",
  "https://illustriober.com",
  "https://www.illustriober.com",
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

      if (
        allowedOrigins.has(origin) ||
        LOCAL_ORIGIN_REGEX.test(origin) ||
        VERCEL_PREVIEW_REGEX.test(origin)
      ) {
        callback(null, true);
        return;
      }

      console.warn(`[cors] blocked origin: ${origin}`);
      callback(null, false);
    },
    credentials: true,
  })
);

// Cookies (refresh token)
app.use(cookieParser());

// Body parsing (parse JSON and URL-encoded bodies)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

// Authentication endpoints: login, signup, logout
// 10 requests per 15 minutes per IP — covers brute-force on login/register/refresh
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 }), authRoutes);

// Enquiry endpoints: form submissions (public)
app.use("/api/enquiries", enquiryRoutes);

// Invite endpoints: admin sends invites, clients accept them
app.use("/api/invites", inviteRoutes);

// Admin endpoints: enquiry management, lead conversion
app.use("/api/admin", adminRoutes);

// Project endpoints: client and admin project tracking
app.use("/api/projects", projectRoutes);

// Ticket endpoints: nested under projects
app.use("/api/projects/:slug/tickets", ticketRoutes);

// File upload endpoint (requires Cloudinary env vars)
app.use("/api/upload", uploadRoutes);

// Public portfolio endpoint
app.use("/api/portfolio", portfolioRoutes);

// Root endpoint for quick API reachability checks
app.get("/", (_req: Request, res: Response) => {
  res.json({
    service: "illustriober-api",
    status: "ok",
    docs: ["/health", "/api/auth/login", "/api/enquiries"],
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
