import { Router, Request, Response } from "express";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import prisma from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";
import { createTicketSchema, updateTicketStatusSchema, createCommentSchema } from "@illustriober/shared";
import { sendTicketNotification } from "../lib/email";

const ALLOWED_HTML: sanitizeHtml.IOptions = {
  allowedTags: ["p", "strong", "em", "u", "s", "ul", "ol", "li", "blockquote", "code", "pre", "h2", "h3", "br"],
  allowedAttributes: {},
};

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
        description: sanitizeHtml(data.description, ALLOWED_HTML),
        projectId: project.id,
        submittedById: req.user!.id,
      },
    });

    // Notify admin when a HIGH or CRITICAL ticket is submitted
    if ((data.priority === "HIGH" || data.priority === "CRITICAL") && process.env.ENQUIRY_ADMIN_EMAIL) {
      const submitter = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { firstName: true, lastName: true } });
      void sendTicketNotification({
        to: process.env.ENQUIRY_ADMIN_EMAIL,
        subject: `[${data.priority}] New ticket: ${data.title}`,
        clientName: "Team",
        ticketTitle: data.title,
        projectName: project.name,
        message: `A ${data.priority.toLowerCase()} priority ticket was submitted by ${submitter?.firstName ?? "a client"}.`,
      });
    }

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

    // Notify client when admin resolves or closes their ticket
    if (req.user!.role === "ADMIN" && ["RESOLVED", "CLOSED"].includes(body.status)) {
      const client = await prisma.user.findUnique({ where: { id: project.clientId }, select: { email: true, firstName: true } });
      if (client) {
        void sendTicketNotification({
          to: client.email,
          subject: `Your ticket has been ${body.status.toLowerCase()}`,
          clientName: client.firstName,
          ticketTitle: ticket.title,
          projectName: project.name,
          message: `Your ticket has been marked as ${body.status.toLowerCase()} by our team.`,
        });
      }
    }

    res.json({ success: true, ticket: updated });
  })
);

// POST /api/projects/:slug/tickets/:id/comments
router.post(
  "/:id/comments",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const project = await resolveProject(req.params.slug, req.user!.id, req.user!.role);

    const ticket = await prisma.ticket.findFirst({
      where: { id: req.params.id, projectId: project.id },
    });
    if (!ticket) throw new AppError(404, "Ticket not found");

    let body: z.infer<typeof createCommentSchema>;
    try {
      body = createCommentSchema.parse(req.body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new AppError(400, e.issues.map((i) => i.message).join(", "));
      }
      throw e;
    }

    // Only admins can post internal notes
    const isInternal = req.user!.role === "ADMIN" ? (body.isInternal ?? false) : false;

    const comment = await prisma.comment.create({
      data: {
        content: sanitizeHtml(body.content, ALLOWED_HTML),
        ticketId: ticket.id,
        authorId: req.user!.id,
        isInternal,
      },
      include: {
        author: { select: { firstName: true, lastName: true, role: true } },
      },
    });

    // Notify the other party about new public comments
    if (!isInternal) {
      if (req.user!.role === "ADMIN") {
        // Admin replied → notify client
        const client = await prisma.user.findUnique({ where: { id: project.clientId }, select: { email: true, firstName: true } });
        if (client) {
          void sendTicketNotification({
            to: client.email,
            subject: `New reply on your ticket: ${ticket.title}`,
            clientName: client.firstName,
            ticketTitle: ticket.title,
            projectName: project.name,
            message: "Our team has replied to your ticket.",
          });
        }
      } else if (process.env.ENQUIRY_ADMIN_EMAIL) {
        // Client replied → notify admin
        const submitter = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { firstName: true, lastName: true } });
        void sendTicketNotification({
          to: process.env.ENQUIRY_ADMIN_EMAIL,
          subject: `Client replied on ticket: ${ticket.title}`,
          clientName: "Team",
          ticketTitle: ticket.title,
          projectName: project.name,
          message: `${submitter?.firstName ?? "A client"} has replied to a ticket.`,
        });
      }
    }

    res.status(201).json({ success: true, comment });
  })
);

export default router;
