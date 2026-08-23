import { randomBytes, createHash } from "crypto";
import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { sendInviteEmail, sendPasswordResetEmail } from "../lib/email";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";
import { requireRoles } from "../middleware/authorize";
import type { AdminDashboardStatusCounts, RecentActivityEntry } from "@illustriober/shared";

const router = Router();

const adminOnly = [authenticate, requireRoles("ADMIN")];

const statusFilterSchema = z.enum([
  "NEW", "REVIEWED", "RESPONDED", "CONVERTED", "ARCHIVED",
]).optional();

// GET /api/admin/enquiries?status=NEW&search=...
router.get(
  "/enquiries",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const status = statusFilterSchema.parse(req.query.status || undefined);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        company: true, projectType: true, status: true,
        budgetRange: true, createdAt: true,
      },
    });

    res.json({ success: true, enquiries });
  })
);

// GET /api/admin/enquiries/:id
router.get(
  "/enquiries/:id",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const enquiry = await prisma.enquiry.findUnique({ where: { id: req.params.id } });
    if (!enquiry) throw new AppError(404, "Enquiry not found");
    res.json({ success: true, enquiry });
  })
);

// POST /api/admin/enquiries/:id/convert
router.post(
  "/enquiries/:id/convert",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const enquiry = await prisma.enquiry.findUnique({ where: { id: req.params.id } });
    if (!enquiry) throw new AppError(404, "Enquiry not found");
    if (enquiry.status === "CONVERTED") throw new AppError(400, "Enquiry already converted");

    const existing = await prisma.user.findUnique({ where: { email: enquiry.email.toLowerCase() } });
    if (existing) throw new AppError(409, "A user account already exists for this email");

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.inviteToken.create({
      data: { token, email: enquiry.email.toLowerCase(), expiresAt },
    });

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    await sendInviteEmail({ to: enquiry.email, inviteUrl: `${baseUrl}/invite/${token}` });

    await prisma.enquiry.update({
      where: { id: enquiry.id },
      data: { status: "CONVERTED" },
    });

    res.json({ success: true, inviteToken: invite.token, email: enquiry.email });
  })
);

// GET /api/admin/clients
router.get(
  "/clients",
  ...adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const clients = await prisma.user.findMany({
      where: { role: "CLIENT" },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, clients });
  })
);

const userRoleFilterSchema = z.enum(["CLIENT", "ADMIN"]).optional();

// GET /api/admin/users?role=CLIENT&search=jane
router.get(
  "/users",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const role = userRoleFilterSchema.parse(req.query.role || undefined);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, users });
  })
);

// GET /api/admin/users/:id
router.get(
  "/users/:id",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        projects: {
          select: { id: true, name: true, slug: true, status: true },
          orderBy: { createdAt: "desc" },
        },
        tickets: {
          select: { id: true, title: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) throw new AppError(404, "User not found");

    res.json({ success: true, user });
  })
);

const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

// PATCH /api/admin/users/:id
// Toggle isActive. An admin cannot deactivate their own account.
//
// Deactivating a user revokes their live refresh tokens, but access tokens
// are stateless JWTs that authenticate() never re-checks against the DB, so
// a just-deactivated admin's own access token stays valid for up to its
// remaining 15-minute lifetime. Without the actor check below, that window
// would let a deactivated admin call this same route again to reactivate
// themselves — the isActive flip alone isn't enforced against the actor's
// own current DB state, only asserted from a JWT that can't reflect it.
router.patch(
  "/users/:id",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const body = updateUserStatusSchema.parse(req.body);

    const actor = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { isActive: true },
    });
    if (!actor?.isActive) {
      throw new AppError(403, "Your account is deactivated");
    }

    if (req.params.id === req.user!.id && !body.isActive) {
      throw new AppError(400, "You cannot deactivate your own account");
    }

    const target = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!target) {
      throw new AppError(404, "User not found");
    }

    const user = await prisma.$transaction(async (tx) => {
      if (!body.isActive) {
        await tx.refreshToken.updateMany({
          where: { userId: req.params.id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }

      return tx.user.update({
        where: { id: req.params.id },
        data: { isActive: body.isActive },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });
    });

    res.json({ success: true, user });
  })
);

// POST /api/admin/users/:id/reset-password
// Sends a password-reset email to the given user via the existing token flow.
router.post(
  "/users/:id/reset-password",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new AppError(404, "User not found");
    if (!user.isActive) throw new AppError(400, "Cannot reset password for a deactivated user");

    const rawToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        tokenHash: createHash("sha256").update(rawToken).digest("hex"),
        userId: user.id,
        expiresAt,
      },
    });

    const appUrl = (process.env.APP_URL || process.env.CORS_ORIGIN?.split(",")[0] || "http://localhost:3000")
      .trim()
      .replace(/\/$/, "");

    const delivery = await sendPasswordResetEmail({
      to: user.email,
      resetUrl: `${appUrl}/reset-password?token=${rawToken}`,
    });

    if (!delivery.success) {
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });
      throw new AppError(502, "Failed to send the reset email. Please try again.");
    }

    res.json({ success: true, message: `Password reset link sent to ${user.email}.` });
  })
);

// GET /api/admin/projects
router.get(
  "/projects",
  ...adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const projects = await prisma.project.findMany({
      include: { client: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, projects });
  })
);

// POST /api/admin/projects
router.post(
  "/projects",
  ...adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { createProjectSchema } = await import("@illustriober/shared");
    const data = createProjectSchema.parse(req.body);
    
    // verify client exists
    const client = await prisma.user.findUnique({ where: { id: data.clientId, role: "CLIENT" } });
    if (!client) throw new AppError(404, "Client not found");

    const project = await prisma.project.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        status: data.status || "PLANNING",
        clientId: data.clientId,
      }
    });

    res.status(201).json({ success: true, project });
  })
);

// GET /api/admin/dashboard
router.get(
  "/dashboard",
  ...adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [statusGroups, recentTickets, recentComments] = await Promise.all([
      prisma.ticket.groupBy({ by: ["status"], _count: true }),
      prisma.ticket.findMany({
        where: { createdAt: { gte: since } },
        select: {
          id: true,
          title: true,
          createdAt: true,
          project: { select: { name: true } },
          submittedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.comment.findMany({
        where: { createdAt: { gte: since } },
        select: {
          id: true,
          ticketId: true,
          isInternal: true,
          createdAt: true,
          ticket: { select: { title: true, project: { select: { name: true } } } },
          author: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const statusCounts: AdminDashboardStatusCounts = {
      OPEN: 0,
      IN_REVIEW: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
    };
    for (const group of statusGroups) {
      if (group.status in statusCounts) {
        statusCounts[group.status as keyof AdminDashboardStatusCounts] = group._count;
      }
    }

    const ticketActivity: RecentActivityEntry[] = recentTickets.map((ticket) => ({
      id: ticket.id,
      kind: "ticket_created",
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      projectName: ticket.project.name,
      actorName: `${ticket.submittedBy.firstName} ${ticket.submittedBy.lastName}`,
      createdAt: ticket.createdAt.toISOString(),
    }));

    const commentActivity: RecentActivityEntry[] = recentComments.map((comment) => ({
      id: comment.id,
      kind: "comment_created",
      ticketId: comment.ticketId,
      ticketTitle: comment.ticket.title,
      projectName: comment.ticket.project.name,
      actorName: `${comment.author.firstName} ${comment.author.lastName}`,
      isInternal: comment.isInternal,
      createdAt: comment.createdAt.toISOString(),
    }));

    const recentActivity = [...ticketActivity, ...commentActivity]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 20);

    res.json({ success: true, statusCounts, recentActivity });
  })
);

export default router;
