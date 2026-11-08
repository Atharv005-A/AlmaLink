import { z } from "zod";

export const indianPhoneRegex = /^[6-9]\d{9}$/;

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export const alumniRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100).trim(),
  email: z.string().email("Please provide a valid email address").toLowerCase().trim(),
  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, "Enter a valid 10-digit Indian mobile number (starts with 6-9)"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  program: z.string().min(2, "Academic program is required (e.g. MCA, MBA)").trim(),
  graduationYear: z
    .number()
    .int()
    .min(1980, "Graduation year must be 1980 or later")
    .max(new Date().getFullYear(), "Graduation year cannot be in the future"),
  enrollmentNo: z
    .string()
    .min(3, "Enrollment number is required")
    .max(50)
    .trim()
    .toUpperCase(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "You must consent to IMCC storing your profile" }),
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address").toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const staffOnboardingSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AlumniRegisterInput = z.infer<typeof alumniRegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type StaffOnboardingInput = z.infer<typeof staffOnboardingSchema>;

