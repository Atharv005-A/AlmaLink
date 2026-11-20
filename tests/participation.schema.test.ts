import { describe, it, expect } from "vitest";
import {
  recordParticipationSchema,
  createAwardNominationSchema,
  castAwardVoteSchema,
} from "../shared/src/schemas/activity.schema.js";

describe("Participation & Award Nomination Schemas (Module 5 Foundation)", () => {
  describe("recordParticipationSchema", () => {
    const validParticipation = {
      activityId: 1,
      alumniId: 45,
      invitationId: 12,
      role: "Keynote Speaker",
      contributionType: "Delivered 2-hour practical workshop on Next.js 14",
      attended: true,
      pointsAwarded: 25,
      evidenceUrl: "https://drive.google.com/file/d/sample-certificate-123",
      completionStatus: "Completed",
    };

    it("should accept valid participation record", () => {
      const result = recordParticipationSchema.safeParse(validParticipation);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.attended).toBe(true);
        expect(result.data.pointsAwarded).toBe(25);
      }
    });

    it("should reject pointsAwarded greater than 100", () => {
      const result = recordParticipationSchema.safeParse({
        ...validParticipation,
        pointsAwarded: 120,
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative pointsAwarded", () => {
      const result = recordParticipationSchema.safeParse({
        ...validParticipation,
        pointsAwarded: -5,
      });
      expect(result.success).toBe(false);
    });

    it("should allow empty evidenceUrl string", () => {
      const result = recordParticipationSchema.safeParse({
        ...validParticipation,
        evidenceUrl: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("createAwardNominationSchema", () => {
    const validNomination = {
      academicYear: "2026-27",
      cellId: 1,
      alumniId: 45,
      justification:
        "Contributed over 40 hours of mentorship, conducted mock technical interviews, and facilitated 5 campus hiring drives.",
    };

    it("should accept valid award nomination", () => {
      const result = createAwardNominationSchema.safeParse(validNomination);
      expect(result.success).toBe(true);
    });

    it("should reject academic year not in YYYY-YY format", () => {
      const resultFullYear = createAwardNominationSchema.safeParse({
        ...validNomination,
        academicYear: "2026-2027",
      });
      expect(resultFullYear.success).toBe(false);

      const resultShortYear = createAwardNominationSchema.safeParse({
        ...validNomination,
        academicYear: "26-27",
      });
      expect(resultShortYear.success).toBe(false);
    });

    it("should reject justification shorter than 20 characters", () => {
      const result = createAwardNominationSchema.safeParse({
        ...validNomination,
        justification: "Good alumnus",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("castAwardVoteSchema", () => {
    it("should validate award vote submission", () => {
      const result = castAwardVoteSchema.safeParse({
        nominationId: 14,
        academicYear: "2026-27",
      });
      expect(result.success).toBe(true);
    });
  });
});
