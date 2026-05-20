import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";
import { createTicketSchema, updateTicketSchema } from "@illustriober/shared";

const router = Router();

// GET /api/tickets
// List tickets with isolation
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const { projectId } = req.query;

    const where: any = {};
    
    if (role !== "ADMIN") {
      where.project = { clientId: userId };
    }

    if (projectId && typeof projectId === "string") {
      where.projectId = projectId;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        project: { select: { name: true, slug: true } },
        submittedBy: { select: { firstName: true, lastName: true } },
      },
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
          include: {
            author: { select: { firstName: true, lastName: true, role: true } },
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
