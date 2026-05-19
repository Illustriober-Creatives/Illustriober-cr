import { randomBytes } from "crypto";
import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { sendInviteEmail } from "../lib/email";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";
import { requireRoles } from "../middleware/authorize";

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

export default router;
