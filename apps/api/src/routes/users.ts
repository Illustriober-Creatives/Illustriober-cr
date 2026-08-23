/**
 * Self-service user routes: update own profile, change own password.
 */

import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { changePasswordSchema, updateProfileSchema } from "@illustriober/shared";
import prisma from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";
import { REFRESH_COOKIE_NAME, readRequestCookie } from "../lib/cookies";

const router = Router();

// PATCH /api/users/me
// Update own firstName/lastName/phone
router.patch(
  "/me",
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
