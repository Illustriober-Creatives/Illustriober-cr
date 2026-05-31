import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// GET /api/portfolio — public, returns client-approved portfolio entries
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const entries = await prisma.portfolioEntry.findMany({
      where: { clientApproved: true },
      orderBy: [{ featured: "desc" }, { order: "asc" }],
      select: {
        id: true,
        title: true,
        summary: true,
        coverImageUrl: true,
        images: true,
        tags: true,
        featured: true,
        liveUrl: true,
        project: {
          select: { name: true, techStack: true },
        },
      },
    });

    res.json({ success: true, entries });
  })
);

export default router;
