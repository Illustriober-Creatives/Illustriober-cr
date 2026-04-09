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

// CORS configuration (allow cross-origin requests)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
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
