import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { z } from "zod";
import prisma from "../lib/prisma";
import { uploadBuffer, isCloudinaryConfigured } from "../lib/cloudinary";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/authenticate";

const router = Router();

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
  "application/pdf",
  "application/zip",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) return cb(null, true);
    cb(new Error("File type not allowed"));
  },
});

const uploadQuerySchema = z.object({
  projectId: z.string().optional(),
  ticketId: z.string().optional(),
  category: z.enum(["DELIVERABLE", "ATTACHMENT", "REFERENCE", "INVOICE"]).optional().default("ATTACHMENT"),
});

// POST /api/upload
router.post(
  "/",
  authenticate,
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isCloudinaryConfigured()) {
      throw new AppError(503, "File uploads are not configured. Set CLOUDINARY_* environment variables.");
    }

    if (!req.file) throw new AppError(400, "No file provided");

    const query = uploadQuerySchema.parse(req.query);

    // Verify project ownership if projectId supplied
    if (query.projectId) {
      const project = await prisma.project.findUnique({ where: { id: query.projectId } });
      if (!project) throw new AppError(404, "Project not found");
      if (req.user!.role !== "ADMIN" && project.clientId !== req.user!.id) {
        throw new AppError(403, "Access denied");
      }
    }

    const ext = path.extname(req.file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const folder = `illustriober/${query.projectId ?? "general"}`;

    const { url, publicId } = await uploadBuffer(req.file.buffer, {
      folder,
      filename,
      mimeType: req.file.mimetype,
    });

    const file = await prisma.file.create({
      data: {
        name: filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url,
        publicId,
        category: query.category,
        projectId: query.projectId ?? null,
        ticketId: query.ticketId ?? null,
        uploadedById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, file });
  })
);

export default router;
