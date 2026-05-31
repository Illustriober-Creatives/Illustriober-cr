import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";
import { createTicketSchema, updateTicketStatusSchema } from "@illustriober/shared";

const router = Router({ mergeParams: true });

async function resolveProject(slug: string, userId: string, role: string) {
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) throw new AppError(404, "Project not found");
  if (role !== "ADMIN" && project.clientId !== userId) throw new AppError(403, "Access denied");
  return project;
}

// GET /api/projects/:slug/tickets
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const project = await resolveProject(req.params.slug, req.user!.id, req.user!.role);
    const tickets = await prisma.ticket.findMany({
      where: { projectId: project.id },
      include: { submittedBy: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, tickets });
  })
);

// POST /api/projects/:slug/tickets
router.post(
  "/",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const project = await resolveProject(req.params.slug, req.user!.id, req.user!.role);

    let data: z.infer<typeof createTicketSchema>;
    try {
      data = createTicketSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new AppError(400, e.issues.map((i) => i.message).join(", "));
      }
      throw e;
    }

    const ticket = await prisma.ticket.create({
      data: {
        ...data,
        projectId: project.id,
        submittedById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, ticket });
  })
);

// GET /api/projects/:slug/tickets/:id
router.get(
  "/:id",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const project = await resolveProject(req.params.slug, req.user!.id, req.user!.role);

    const ticket = await prisma.ticket.findFirst({
      where: { id: req.params.id, projectId: project.id },
      include: {
        submittedBy: { select: { firstName: true, lastName: true } },
        comments: {
          where: req.user!.role === "ADMIN" ? {} : { isInternal: false },
          include: { author: { select: { firstName: true, lastName: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) throw new AppError(404, "Ticket not found");
    res.json({ success: true, ticket });
  })
);

// PATCH /api/projects/:slug/tickets/:id/status
router.patch(
  "/:id/status",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const project = await resolveProject(req.params.slug, req.user!.id, req.user!.role);

    let body: z.infer<typeof updateTicketStatusSchema>;
    try {
      body = updateTicketStatusSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new AppError(400, e.issues.map((i) => i.message).join(", "));
      }
      throw e;
    }

    const ticket = await prisma.ticket.findFirst({
      where: { id: req.params.id, projectId: project.id },
    });
    if (!ticket) throw new AppError(404, "Ticket not found");

    // Clients may only close their own tickets
    if (req.user!.role !== "ADMIN") {
      if (body.status !== "CLOSED") throw new AppError(403, "Clients may only close tickets");
      if (ticket.submittedById !== req.user!.id) throw new AppError(403, "Cannot close another user's ticket");
    }

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: body.status,
        resolvedAt: ["RESOLVED", "CLOSED"].includes(body.status) ? new Date() : null,
      },
    });

    res.json({ success: true, ticket: updated });
  })
);

export default router;
