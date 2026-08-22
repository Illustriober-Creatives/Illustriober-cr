import { createHash } from "node:crypto";
import { Router, Request, Response } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import prisma from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";
import {
  adminTicketQuerySchema,
  createCommentSchema,
  createTicketSchema,
  updateTicketSchema,
  type TicketComment,
} from "@illustriober/shared";
import { emitTicketComment } from "../lib/realtime";

const router = Router();
const commentRateLimit = rateLimit({
  windowMs: 60 * 1000,
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
  message: { success: false, error: "Too many replies. Please wait a moment." },
});

// GET /api/tickets
// List tickets with isolation
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const { projectId } = req.query;
    const query = adminTicketQuerySchema.parse(req.query);

    const where: any = {};

    if (role !== "ADMIN") {
      where.project = { clientId: userId };
    }

    if (projectId && typeof projectId === "string") {
      where.projectId = projectId;
    }

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { project: { name: { contains: query.search, mode: "insensitive" } } },
        { submittedBy: { firstName: { contains: query.search, mode: "insensitive" } } },
        { submittedBy: { lastName: { contains: query.search, mode: "insensitive" } } },
      ];
    }

    const baseInclude = {
      project: { select: { name: true, slug: true } },
      submittedBy: { select: { firstName: true, lastName: true } },
    };

    if (query.page || query.limit) {
      const page = query.page ?? 1;
      const limit = query.limit ?? 20;
      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where,
          include: {
            ...baseInclude,
            comments: {
              orderBy: { createdAt: "desc" as const },
              take: 1,
              select: { createdAt: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.ticket.count({ where }),
      ]);

      res.json({
        success: true,
        tickets,
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      });
      return;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: baseInclude,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, tickets });
  })
);

// POST /api/tickets
// Create a new ticket
router.post(
  "/",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const data = createTicketSchema.parse(req.body);
    if (!data.projectId) throw new AppError(400, "Project ID is required");

    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) throw new AppError(404, "Project not found");
    if (role !== "ADMIN" && project.clientId !== userId) {
      throw new AppError(403, "You do not have access to this project");
    }

    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority || "MEDIUM",
        projectId: data.projectId,
        submittedById: userId,
      },
    });

    res.status(201).json({ success: true, ticket });
  })
);

// GET /api/tickets/:id
router.get(
  "/:id",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        project: true,
        submittedBy: { select: { firstName: true, lastName: true, email: true } },
        comments: {
          where: role === "ADMIN" ? {} : { isInternal: false },
          include: {
            author: { select: { id: true, firstName: true, lastName: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) throw new AppError(404, "Ticket not found");

    if (role !== "ADMIN" && ticket.project.clientId !== userId) {
      throw new AppError(403, "Access denied");
    }

    res.json({ success: true, ticket });
  })
);

// POST /api/tickets/:id/comments
router.post(
  "/:id/comments",
  commentRateLimit,
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const role = req.user!.role;
    const data = createCommentSchema.parse(req.body);

    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });

    if (!ticket) throw new AppError(404, "Ticket not found");
    if (role !== "ADMIN" && ticket.project.clientId !== userId) {
      throw new AppError(403, "Access denied");
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        ticketId: ticket.id,
        authorId: userId,
        isInternal: role === "ADMIN" && data.isInternal,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });

    const serializedComment: TicketComment = {
      id: comment.id,
      content: comment.content,
      ticketId: comment.ticketId,
      authorId: comment.authorId,
      isInternal: comment.isInternal,
      createdAt: comment.createdAt.toISOString(),
      editedAt: comment.editedAt?.toISOString() ?? null,
      author: comment.author,
    };

    emitTicketComment(serializedComment);
    res.status(201).json({ success: true, comment: serializedComment });
  })
);

// PATCH /api/tickets/:id
router.patch(
  "/:id",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const data = updateTicketSchema.parse(req.body);

    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });

    if (!ticket) throw new AppError(404, "Ticket not found");

    if (role !== "ADMIN") {
      if (ticket.project.clientId !== userId) {
        throw new AppError(403, "Access denied");
      }

      // Clients can only update certain fields
      // and cannot change status to things like REJECTED or IN_REVIEW directly?
      // Actually, let's just restrict status changes for clients to CLOSED/REOPENED if we had those
      // For now, let's say clients can only update title, description, type, priority
      if (data.status || data.assignedToId) {
        throw new AppError(403, "Only admins can update status or assignment");
      }
    }

    const updated = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        ...data,
        resolvedAt: data.status === "RESOLVED" ? new Date() : undefined,
      },
    });

    res.json({ success: true, ticket: updated });
  })
);

export default router;
