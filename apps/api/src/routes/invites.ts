import { randomBytes } from "crypto";
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from "../lib/cookies";
import { sendInviteEmail } from "../lib/email";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";
import { requireRoles } from "../middleware/authorize";

const router = Router();

const INVITE_DAYS = 7;

const createInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const acceptInviteSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

async function findValidToken(token: string) {
  const record = await prisma.inviteToken.findUnique({ where: { token } });
  if (!record) throw new AppError(404, "Invite not found");
  if (record.usedAt || record.expiresAt < new Date()) throw new AppError(410, "Invite has expired or already been used");
  return record;
}

// POST /api/invites — admin creates an invite for a given email
router.post(
  "/",
  authenticate,
  requireRoles("ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = createInviteSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) throw new AppError(409, "An account with this email already exists");

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_DAYS);

    const invite = await prisma.inviteToken.create({
      data: { token, email: email.toLowerCase(), expiresAt },
    });

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    await sendInviteEmail({ to: email, inviteUrl: `${baseUrl}/invite/${token}` });

    res.status(201).json({ success: true, token: invite.token, email: invite.email });
  })
);

// GET /api/invites/:token — validate invite (used by landing page)
router.get(
  "/:token",
  asyncHandler(async (req: Request, res: Response) => {
    const record = await findValidToken(req.params.token);
    res.json({ success: true, valid: true, email: record.email });
  })
);

// POST /api/invites/:token/accept — complete registration
router.post(
  "/:token/accept",
  asyncHandler(async (req: Request, res: Response) => {
    const record = await findValidToken(req.params.token);

    let body: z.infer<typeof acceptInviteSchema>;
    try {
      body = acceptInviteSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new AppError(400, e.issues.map((i) => i.message).join(", "));
      }
      throw e;
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email: record.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: "CLIENT",
        emailVerified: true,
      },
    });

    await prisma.inviteToken.update({
      where: { id: record.id },
      data: { usedAt: new Date(), userId: user.id },
    });

    // Issue session immediately after account activation
    const refreshRaw = randomBytes(48).toString("hex");
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: { token: refreshRaw, userId: user.id, expiresAt: refreshExpiresAt },
    });
    res.cookie(REFRESH_COOKIE_NAME, refreshRaw, refreshCookieOptions());

    const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });

    res.status(201).json({
      success: true,
      accessToken,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  })
);

export default router;
