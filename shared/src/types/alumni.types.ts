import { VerificationStatus } from "../enums/verification-status.enum.js";

export interface AlumniProfileDTO {
  alumniId: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  program: string;
  graduationYear: number;
  enrollmentNo: string;
  organization?: string | null;
  designation?: string | null;
  industry?: string | null;
  linkedinUrl?: string | null;
  experienceYears?: number | null;
  skills: string[];
  expertise: string[];
  preferredActivities: string[];
  preferredFormat?: "Online" | "In-Person" | "Hybrid" | null;
  availability?: string | null;
  areaOfInterest?: string | null;
  willingToParticipate: boolean;
  consentGiven: boolean;
  profileCompleted: boolean;
  verificationStatus: VerificationStatus;
  verificationNote?: string | null;
  verifiedBy?: number | null;
  verifiedAt?: string | null;
  totalPoints?: number;
}

export interface AlumniRegistrationPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  program: string;
  graduationYear: number;
  enrollmentNo: string;
  consentGiven: boolean;
}

export interface AlumniProfileUpdatePayload {
  organization?: string;
  designation?: string;
  industry?: string;
  linkedinUrl?: string;
  experienceYears?: number;
  skills: string[];
  expertise: string[];
  preferredActivities: string[];
  preferredFormat?: "Online" | "In-Person" | "Hybrid";
  availability?: string;
  areaOfInterest?: string;
  willingToParticipate?: boolean;
}

