/**
 * Authentication: register, login, logout, refresh, me
 */

import { createHash, randomBytes } from "crypto";
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@illustriober/shared";
import prisma from "../lib/prisma";
import { sendPasswordResetEmail } from "../lib/email";
import { signAccessToken } from "../lib/jwt";
import {
  CSRF_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  createCsrfToken,
  csrfCookieOptions,
  readRequestCookie,
  refreshCookieOptions,
} from "../lib/cookies";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";

const router = Router();

const REFRESH_DAYS = 30;
const PASSWORD_RESET_MINUTES = 30;
const RESET_REQUEST_MESSAGE =
  "If an active account exists for that email, a reset link has been sent.";

function createRefreshTokenValue(): string {
  return randomBytes(48).toString("hex");
}

function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function publicAppUrl(): string {
  const configured = process.env.APP_URL || process.env.CORS_ORIGIN?.split(",")[0];
  return (configured || "http://localhost:3000").trim().replace(/\/$/, "");
}

async function issueRefreshCookie(res: Response, userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const raw = createRefreshTokenValue();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);

  await prisma.refreshToken.create({
    data: {
      token: raw,
      userId,
      expiresAt,
    },
  });

  res.cookie(REFRESH_COOKIE_NAME, raw, refreshCookieOptions());
  res.cookie(CSRF_COOKIE_NAME, createCsrfToken(raw), csrfCookieOptions());
}

function clearSessionCookies(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
  res.clearCookie(CSRF_COOKIE_NAME, { path: "/" });
}

router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    if (process.env.ALLOW_PUBLIC_REGISTRATION === "false") {
      throw new AppError(403, "Registration is disabled");
    }

    let body: z.infer<typeof registerSchema>;
    try {
      body = registerSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        const msg = e.issues.map((i) => i.message).join(", ");
        throw new AppError(400, `Validation failed: ${msg}`);
      }
      throw e;
    }

    const email = body.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: "CLIENT",
      },
    });

    await issueRefreshCookie(res, user.id);
    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    let body: z.infer<typeof loginSchema>;
    try {
      body = loginSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        const msg = e.issues.map((i) => i.message).join(", ");
        throw new AppError(400, `Validation failed: ${msg}`);
      }
      throw e;
    }

    const email = body.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError(401, "Invalid email or password");
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      throw new AppError(401, "Invalid email or password");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await issueRefreshCookie(res, user.id);
    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  })
);

router.post(
  "/forgot-password",
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, isActive: true },
    });

    if (user?.isActive) {
      const rawToken = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_MINUTES * 60 * 1000);

      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      const resetToken = await prisma.passwordResetToken.create({
        data: {
          tokenHash: hashPasswordResetToken(rawToken),
          userId: user.id,
          expiresAt,
        },
      });

      const delivery = await sendPasswordResetEmail({
        to: user.email,
        resetUrl: `${publicAppUrl()}/reset-password?token=${rawToken}`,
      });

      if (!delivery.success) {
        await prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() },
        });
      }
    }

    res.json({ success: true, message: RESET_REQUEST_MESSAGE });
  })
);

router.post(
  "/reset-password",
  asyncHandler(async (req: Request, res: Response) => {
    const body = resetPasswordSchema.parse(req.body);
    const now = new Date();
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashPasswordResetToken(body.token) },
      include: { user: { select: { id: true, isActive: true } } },
    });

    if (!record || record.usedAt || record.expiresAt <= now || !record.user.isActive) {
      throw new AppError(400, "Invalid or expired reset link");
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    await prisma.$transaction(async (tx) => {
      const consumed = await tx.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (consumed.count !== 1) {
        throw new AppError(400, "Invalid or expired reset link");
      }

      await tx.user.update({
        where: { id: record.user.id },
        data: { passwordHash },
      });
      await tx.refreshToken.updateMany({
        where: { userId: record.user.id, revokedAt: null },
        data: { revokedAt: now },
      });
    });

    clearSessionCookies(res);
    res.json({ success: true, message: "Password updated. You can now sign in." });
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    const raw = readRequestCookie(req, REFRESH_COOKIE_NAME);
    if (!raw) {
      throw new AppError(401, "Missing refresh session");
    }

    const record = await prisma.refreshToken.findUnique({
      where: { token: raw },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date() || !record.user.isActive) {
      clearSessionCookies(res);
      throw new AppError(401, "Invalid or expired session");
    }

    // Replay attack: token already rotated — revoke all sessions for this user
    if (record.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: record.user.id },
        data: { revokedAt: new Date() },
      });
      clearSessionCookies(res);
      throw new AppError(401, "Invalid or expired session");
    }

    // Rotate: revoke old token family and issue a new one
    await issueRefreshCookie(res, record.user.id);

    const accessToken = signAccessToken({
      sub: record.user.id,
      role: record.user.role,
      email: record.user.email,
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: record.user.id,
        email: record.user.email,
        firstName: record.user.firstName,
        lastName: record.user.lastName,
        role: record.user.role,
      },
    });
  })
);

router.post(
  "/logout",
  asyncHandler(async (req: Request, res: Response) => {
    const raw = readRequestCookie(req, REFRESH_COOKIE_NAME);
    if (raw) {
      await prisma.refreshToken.updateMany({
        where: { token: raw, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    clearSessionCookies(res);
    res.json({ success: true, message: "Logged out" });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
      },
    });
    if (!user) {
      throw new AppError(401, "User not found");
    }
    res.json({ success: true, user });
  })
);

export default router;
