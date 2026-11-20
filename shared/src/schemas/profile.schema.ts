import { z } from "zod";

export const profileCompletionSchema = z.object({
  organization: z.string().max(150).trim().optional(),
  designation: z.string().max(100).trim().optional(),
  industry: z.string().max(100).trim().optional(),
  linkedinUrl: z
    .string()
    .url("Please provide a valid LinkedIn URL")
    .regex(/linkedin\.com/, "URL must be a LinkedIn profile link")
    .optional()
    .or(z.literal("")),
  experienceYears: z.number().int().min(0).max(60).optional(),
  skills: z.array(z.string().min(1).max(50)).default([]),
  expertise: z.array(z.string().min(1).max(50)).default([]),
  preferredActivities: z.array(z.string().min(1).max(100)).default([]),
  preferredFormat: z.enum(["Online", "In-Person", "Hybrid"]).optional(),
  availability: z.string().max(100).trim().optional(),
  areaOfInterest: z.string().max(500).trim().optional(),
  willingToParticipate: z.boolean().default(true),
});

export const verificationReviewSchema = z.object({
  alumniId: z.number().int().positive(),
  status: z.enum(["VERIFIED", "REJECTED"]),
  verificationNote: z.string().max(500).trim().optional(),
});

export type ProfileCompletionInput = z.infer<typeof profileCompletionSchema>;
export type VerificationReviewInput = z.infer<typeof verificationReviewSchema>;
