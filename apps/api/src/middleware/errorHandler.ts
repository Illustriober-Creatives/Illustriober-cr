/**
 * Error Handling Middleware
 * Centralized error handler for all Express routes
 * Converts errors to standardized JSON responses
 */

import { Request, Response, NextFunction } from "express";

/**
 * Application error class with status code and message
 * Used for controlled error responses (not unexpected server errors)
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Global error handling middleware
 * Must be registered LAST in middleware stack
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error for debugging
  console.error("\n❌ Error caught by error handler:");
  console.error(`  Message: ${err.message}`);
  console.error(`  Stack: ${err.stack}\n`);

  // Handle known AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      status: err.statusCode,
    });
    return;
  }

  // Handle unexpected errors
  const statusCode = 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    status: statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

/**
 * Wrapper for async route handlers
 * Catches promise rejections and passes them to error handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
