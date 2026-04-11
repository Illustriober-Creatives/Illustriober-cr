/**
 * Enquiry Routes
 * Public endpoints for form submissions (rate-limited)
 * POST /api/enquiries - Submit a new enquiry
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import prisma from "../lib/prisma";
import { rateLimit } from "../middleware/rateLimit";
import { sendEnquiryEmails } from "../lib/email";

const router = Router();

// Validation schema for enquiry form
const enquirySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().max(100, "Company name too long").optional().or(z.literal("")),
  projectType: z
    .string()
    .min(1, "Project type is required")
    .max(50, "Project type too long"),
  budget: z.string().optional().or(z.literal("")),
  timeline: z.string().optional().or(z.literal("")),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be at most 5000 characters"),
});

type EnquiryInput = z.infer<typeof enquirySchema>;

/**
 * POST /api/enquiries
 * Create a new enquiry from public form
 * Rate limited: 3 per IP per hour
 */
router.post(
  "/",
  rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 3 }),
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    let data: EnquiryInput;
    try {
      data = enquirySchema.parse(req.body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const message = validationError.issues.map((i) => i.message).join(", ");
        throw new AppError(400, `Validation failed: ${message}`);
      }
      throw validationError;
    }

    // Split name into firstName and lastName
    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "Inquiry";

    // Create enquiry in database
    const enquiry = await prisma.enquiry.create({
      data: {
        firstName,
        lastName,
        email: data.email.toLowerCase(),
        company: data.company || null,
        projectType: data.projectType,
        budgetRange: data.budget || null,
        timeline: data.timeline || null,
        description: data.description,
        status: "NEW",
      },
    });

    const clientName = `${firstName} ${lastName}`.trim();
    try {
      await sendEnquiryEmails({
        enquiryId: enquiry.id,
        clientEmail: enquiry.email,
        clientName,
        projectType: data.projectType,
        description: data.description,
      });
    } catch (emailErr) {
      console.error("[enquiries] email send failed:", emailErr);
    }

    res.status(201).json({
      success: true,
      message: "Thank you for your enquiry! We'll be in touch soon.",
      enquiry: {
        id: enquiry.id,
        email: enquiry.email,
        createdAt: enquiry.createdAt,
      },
    });
  })
);

export default router;
