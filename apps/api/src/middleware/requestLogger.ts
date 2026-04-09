/**
 * Request Logging Middleware
 * Logs incoming requests with method, path, and response timing
 * Improves debugging and monitoring in development and production
 */

import { Request, Response, NextFunction } from "express";

/**
 * Enhanced request logging middleware
 * Logs: method, path, status code, response time
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();

  // Capture original send method to log after response is sent
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const statusColor = getStatusColor(res.statusCode);

    console.log(
      `${statusColor}[${res.statusCode}]${reset} ${req.method} ${req.path} - ${duration}ms`
    );

    // Call original send method
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Get ANSI color code based on HTTP status code
 * Green: 2xx (success), Yellow: 3xx (redirect), Orange: 4xx (client error), Red: 5xx (server error)
 */
function getStatusColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return "\x1b[32m"; // Green
  if (statusCode >= 300 && statusCode < 400) return "\x1b[33m"; // Yellow
  if (statusCode >= 400 && statusCode < 500) return "\x1b[36m"; // Cyan
  return "\x1b[31m"; // Red
}

const reset = "\x1b[0m";
