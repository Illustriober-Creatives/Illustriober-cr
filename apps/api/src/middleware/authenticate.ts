/**
 * Require a valid Bearer access JWT; attaches req.user
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import { verifyAccessToken } from "../lib/jwt";
import type { Role } from "@prisma/client";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "Missing or invalid Authorization header"));
    return;
  }

  const token = header.slice(7).trim();
  if (!token) {
    next(new AppError(401, "Missing access token"));
    return;
  }

  try {
    const { sub, role, email } = verifyAccessToken(token);
    req.user = {
      id: sub,
      role: role as Role,
      email,
    };
    next();
  } catch {
    next(new AppError(401, "Invalid or expired access token"));
  }
}
