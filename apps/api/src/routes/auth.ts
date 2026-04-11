/**
 * Authentication: register, login, logout, refresh, me
 */

import { randomBytes } from "crypto";
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { loginSchema, registerSchema } from "@illustriober/shared";
import prisma from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from "../lib/cookies";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";

const router = Router();

const REFRESH_DAYS = 30;

function createRefreshTokenValue(): string {
  return randomBytes(48).toString("hex");
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
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!raw) {
      throw new AppError(401, "Missing refresh session");
    }

    const record = await prisma.refreshToken.findUnique({
      where: { token: raw },
      include: { user: true },
    });

    if (
      !record ||
      record.revokedAt ||
      record.expiresAt < new Date() ||
      !record.user.isActive
    ) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
      throw new AppError(401, "Invalid or expired session");
    }

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
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (raw) {
      await prisma.refreshToken.updateMany({
        where: { token: raw, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
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
