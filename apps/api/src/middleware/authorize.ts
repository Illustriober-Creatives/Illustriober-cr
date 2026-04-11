/**
 * Role-based guard — use after authenticate(). Example:
 *   router.get("/admin", authenticate, requireRoles("ADMIN"), handler)
 */

import { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";
import { AppError } from "./errorHandler";

export function requireRoles(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError(401, "Unauthorized"));
      return;
    }
    if (!allowed.includes(req.user.role)) {
      next(new AppError(403, "Forbidden"));
      return;
    }
    next();
  };
}
