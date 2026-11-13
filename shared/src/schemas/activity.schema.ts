import { z } from "zod";

export const createActivitySchema = z.object({
  cellId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  title: z.string().min(3).max(150).trim(),
  description: z.string().min(10).max(2000).trim(),
  requiredExpertise: z
    .array(z.string().min(1).max(50))
    .min(1, "At least one expertise tag is required"),
  startAt: z.string().datetime("Please provide a valid ISO start date and time"),
  endAt: z.string().datetime("Please provide a valid ISO end date and time"),
  venue: z.string().min(2).max(200).trim(),
  meetingLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  pointsWeight: z.number().int().min(1).max(100).default(10),
});

export const bulkDispatchInvitationsSchema = z.object({
  activityId: z.number().int().positive(),
  alumniIds: z.array(z.number().int().positive()).min(1, "Select at least one alumnus"),
  expectedRole: z.string().min(2).max(100).trim(),
  responseDeadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  customMessage: z.string().max(1000).trim().optional(),
  sendEmail: z.boolean().default(true),
  sendWhatsapp: z.boolean().default(true),
});

export const rsvpInvitationSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
  responseNote: z.string().max(500).trim().optional(),
});

export const recordParticipationSchema = z.object({
  activityId: z.number().int().positive(),
  alumniId: z.number().int().positive(),
  invitationId: z.number().int().positive().optional(),
  role: z.string().min(2).max(100).trim(),
  contributionType: z.string().max(100).trim().optional(),
  attended: z.boolean(),
  pointsAwarded: z.number().int().min(0).max(100),
  evidenceUrl: z.string().url().optional().or(z.literal("")),
  completionStatus: z.string().max(50).optional(),
});

export const createAwardNominationSchema = z.object({
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Academic year must be formatted as YYYY-YY (e.g. 2026-27)"),
  cellId: z.number().int().positive(),
  alumniId: z.number().int().positive(),
  justification: z
    .string()
    .min(20, "Justification must be at least 20 characters")
    .max(2000)
    .trim(),
});

export const castAwardVoteSchema = z.object({
  nominationId: z.number().int().positive(),
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Academic year must be formatted as YYYY-YY (e.g. 2026-27)"),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type BulkDispatchInvitationsInput = z.infer<typeof bulkDispatchInvitationsSchema>;
export type RsvpInvitationInput = z.infer<typeof rsvpInvitationSchema>;
export type RecordParticipationInput = z.infer<typeof recordParticipationSchema>;
export type CreateAwardNominationInput = z.infer<typeof createAwardNominationSchema>;
export type CastAwardVoteInput = z.infer<typeof castAwardVoteSchema>;
