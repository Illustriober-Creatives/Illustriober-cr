/**
 * Self-service user routes: update own profile, change own password.
 */

import { createHash } from "node:crypto";
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { z } from "zod";
import { changePasswordSchema, updateProfileSchema } from "@illustriober/shared";
import prisma from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";
import { REFRESH_COOKIE_NAME, readRequestCookie } from "../lib/cookies";

const router = Router();

// Keyed per-user (via Authorization header) so one user's requests can't
// exhaust another's budget, and so it isn't just an IP-keyed limiter
// behind a shared proxy.
const profileUpdateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const authorization = req.headers.authorization;
    if (authorization) {
      return createHash("sha256").update(authorization).digest("hex");
    }
    return ipKeyGenerator(req.ip ?? "unknown");
  },
  message: { success: false, error: "Too many profile update attempts. Please wait a moment." },
});

// Password-change is an authenticated password-verification oracle — rate
// limit it the same way ticket comments are limited, keyed on the caller's
// own Authorization header so one user's attempts can't exhaust another's
// budget (and so it isn't just an IP-keyed limiter behind a shared proxy).
const passwordChangeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const authorization = req.headers.authorization;
    if (authorization) {
      return createHash("sha256").update(authorization).digest("hex");
    }
    return ipKeyGenerator(req.ip ?? "unknown");
  },
  message: { success: false, error: "Too many password change attempts. Please wait a moment." },
});

// PATCH /api/users/me
// Update own firstName/lastName/phone
router.patch(
  "/me",
  profileUpdateRateLimit,
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    let body: z.infer<typeof updateProfileSchema>;
    try {
      body = updateProfileSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        const msg = e.issues.map((i) => i.message).join(", ");
        throw new AppError(400, `Validation failed: ${msg}`);
      }
      throw e;
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone.length > 0 ? body.phone : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatarUrl: true,
      },
    });

    res.json({ success: true, user });
  })
);

// POST /api/users/me/password
// Change own password (requires current password). Revokes every OTHER
// active session for this user; the session making this request (identified
// by its own refresh cookie, if present) is left alone so the user isn't
// signed out of the device they're using right now.
router.post(
  "/me/password",
  passwordChangeRateLimit,
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    let body: z.infer<typeof changePasswordSchema>;
    try {
      body = changePasswordSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        const msg = e.issues.map((i) => i.message).join(", ");
        throw new AppError(400, `Validation failed: ${msg}`);
      }
      throw e;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      throw new AppError(401, "User not found");
    }

    const ok = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!ok) {
      throw new AppError(401, "Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    const currentRefreshToken = readRequestCookie(req, REFRESH_COOKIE_NAME);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
      await tx.refreshToken.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
          ...(currentRefreshToken ? { token: { not: currentRefreshToken } } : {}),
        },
        data: { revokedAt: new Date() },
      });
    });

    res.json({ success: true, message: "Password updated." });
  })
);

export default router;
