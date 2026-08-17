import { Request, Response, Router } from "express";
import { z } from "zod";
import { sendStaceyResponseEmail } from "../lib/email";
import { asyncHandler, AppError } from "../middleware/errorHandler";

const router = Router();

const validIsoDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const staceyResponseSchema = z.object({
  activity: z.enum(["date-night", "movie-night", "date-and-movie"]),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date").refine(validIsoDate, "Please choose a valid date"),
  timeOfDay: z.enum(["afternoon", "evening", "night"]),
  foodDrink: z.string().max(300).optional().or(z.literal("")),
  movieTaste: z.string().max(300).optional().or(z.literal("")),
  perfectNote: z.string().max(1200).optional().or(z.literal("")),
});

router.post("/", asyncHandler(async (req: Request, res: Response) => {
  let data: z.infer<typeof staceyResponseSchema>;
  try {
    data = staceyResponseSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(400, `Validation failed: ${error.issues.map((issue) => issue.message).join(", ")}`);
    }
    throw error;
  }

  const emailResult = await sendStaceyResponseEmail(data);
  if (!emailResult.success) {
    throw new AppError(503, "We couldn't send that just now. Please try again in a moment.");
  }

  res.status(201).json({ success: true, message: "Your hints have been sent." });
}));

export default router;
