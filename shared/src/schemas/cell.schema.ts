import { z } from "zod";

export const createCellSchema = z.object({
  name: z.string().min(2, "Cell name must be at least 2 characters").max(100).trim(),
  code: z.string().min(2, "Cell code must be at least 2 characters").max(20).trim().toUpperCase(),
  description: z.string().max(500).trim().optional(),
  headStaffId: z.number().int().positive().optional(),
});

export const assignCoordinatorSchema = z.object({
  cellId: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export const inviteStaffSchema = z.object({
  fullName: z.string().min(2).max(100).trim(),
  email: z.string().email("Please provide a valid email address").toLowerCase().trim(),
  cellId: z.number().int().positive(),
  role: z.enum(["CELL_COORDINATOR", "COLLEGE_ADMIN"]),
});

export type CreateCellInput = z.infer<typeof createCellSchema>;
export type AssignCoordinatorInput = z.infer<typeof assignCoordinatorSchema>;
export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;
