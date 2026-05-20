import { z } from 'zod';

export const enquirySchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    company: z.string().optional(),
    projectType: z.string().min(1, "Project type is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    budgetRange: z.string().optional(),
    timeline: z.string().optional(),
    referralSource: z.string().optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const createProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  clientId: z.string().min(1, "Client ID is required"),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETE", "CANCELLED"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const createTicketSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["BUG", "FEATURE", "IDEA", "QUESTION", "SUPPORT"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  projectId: z.string().min(1, "Project ID is required"),
});

export const updateTicketSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  type: z.enum(["BUG", "FEATURE", "IDEA", "QUESTION", "SUPPORT"]).optional(),
  status: z.enum(["OPEN", "IN_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  assignedToId: z.string().nullable().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
