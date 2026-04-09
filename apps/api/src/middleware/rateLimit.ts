/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiter for MVP (suitable for single-instance deployments)
 * For production multi-instance, consider Redis-based solution
 */

import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RateLimitOptions {
  windowMs: number; // Time window in ms
  maxRequests: number; // Max requests per window
}

const store: RateLimitStore = {};

/**
 * Create a rate limiter middleware
 * Uses IP address to track requests
 */
export function rateLimit(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Get client IP (handle proxies)
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    const key = `${ip}:${req.path}`;
    const now = Date.now();

    // Initialize or retrieve store entry
    if (!store[key]) {
      store[key] = { count: 0, resetTime: now + options.windowMs };
    }

    const entry = store[key];

    // Reset if window has passed
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + options.windowMs;
    }

    // Check if limit exceeded
    if (entry.count >= options.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.set("Retry-After", retryAfter.toString());
      res.status(429).json({
        success: false,
        error: "Too many requests, please try again later",
        retryAfter,
      });
      return;
    }

    // Increment counter and proceed
    entry.count++;
    res.set("X-RateLimit-Limit", options.maxRequests.toString());
    res.set("X-RateLimit-Remaining", (options.maxRequests - entry.count).toString());

    next();
  };
}

/**
 * Cleanup old entries from store (prevent memory leak)
 * Run this periodically in production
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  let cleaned = 0;

  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
      cleaned++;
    }
  }

  return cleaned;
}

// Clean up store every 5 minutes
setInterval(() => {
  const cleaned = cleanupRateLimitStore();
  if (cleaned > 0) {
    console.log(`[RateLimit] Cleaned up ${cleaned} expired entries`);
  }
}, 5 * 60 * 1000);
