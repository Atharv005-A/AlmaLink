import { describe, it, expect } from "vitest";
import {
  profileCompletionSchema,
  verificationReviewSchema,
} from "../shared/src/schemas/profile.schema.js";

describe("Alumni Profile & Review Schemas (Module 2)", () => {
  describe("profileCompletionSchema", () => {
    const validProfile = {
      organization: "Persistent Systems",
      designation: "Senior Software Engineer",
      industry: "Information Technology",
      linkedinUrl: "https://www.linkedin.com/in/rohit-shinde-imcc",
      experienceYears: 4,
      skills: ["React", "TypeScript", "Node.js"],
      expertise: ["Full Stack Development", "System Design"],
      preferredActivities: ["Guest Lectures", "Project Mentorship"],
      preferredFormat: "Hybrid",
      availability: "Saturdays 10 AM to 1 PM",
      willingToParticipate: true,
    };

    it("should accept valid alumni profile completion payload", () => {
      const result = profileCompletionSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.experienceYears).toBe(4);
        expect(result.data.preferredFormat).toBe("Hybrid");
      }
    });

    it("should validate that linkedinUrl contains linkedin.com domain", () => {
      const invalidUrl = profileCompletionSchema.safeParse({
        ...validProfile,
        linkedinUrl: "https://twitter.com/rohit_dev",
      });
      expect(invalidUrl.success).toBe(false);
    });

    it("should allow empty linkedinUrl if alumnus does not have one", () => {
      const emptyUrl = profileCompletionSchema.safeParse({
        ...validProfile,
        linkedinUrl: "",
      });
      expect(emptyUrl.success).toBe(true);
    });

    it("should reject experienceYears exceeding maximum threshold (60)", () => {
      const excessiveExperience = profileCompletionSchema.safeParse({
        ...validProfile,
        experienceYears: 65,
      });
      expect(excessiveExperience.success).toBe(false);
    });

    it("should default skills and expertise to empty arrays when omitted", () => {
      const minimalProfile = {
        organization: "Infosys Ltd",
      };
      const result = profileCompletionSchema.safeParse(minimalProfile);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.skills).toEqual([]);
        expect(result.data.expertise).toEqual([]);
        expect(result.data.willingToParticipate).toBe(true);
      }
    });
  });

  describe("verificationReviewSchema", () => {
    it("should accept VERIFIED status with review note", () => {
      const result = verificationReviewSchema.safeParse({
        alumniId: 101,
        status: "VERIFIED",
        verificationNote: "Verified against IMCC MCA 2022 batch student ledger.",
      });
      expect(result.success).toBe(true);
    });

    it("should accept REJECTED status with reason", () => {
      const result = verificationReviewSchema.safeParse({
        alumniId: 102,
        status: "REJECTED",
        verificationNote: "Enrollment number does not match institute records.",
      });
      expect(result.success).toBe(true);
    });

    it("should reject unsupported review statuses like PENDING", () => {
      const result = verificationReviewSchema.safeParse({
        alumniId: 103,
        status: "PENDING",
      });
      expect(result.success).toBe(false);
    });
  });
});
