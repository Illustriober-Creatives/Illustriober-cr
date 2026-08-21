import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// GET /api/projects
// Returns projects scoped to the authenticated client
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const role = req.user!.role;

    // Admins see all, clients see only theirs
    const where = role === "ADMIN" ? {} : { clientId: userId };

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, projects });
  })
);

// GET /api/projects/:slug
router.get(
  "/:slug",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { slug } = req.params;

    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        milestones: { orderBy: { order: "asc" } },
        tickets: { orderBy: { createdAt: "desc" }, take: 5 },
      }
    });

    if (!project) return res.status(404).json({ success: false, error: "Project not found" });

    // Access control
    if (role !== "ADMIN" && project.clientId !== userId) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    return res.json({ success: true, project });
  })
);

export default router;
