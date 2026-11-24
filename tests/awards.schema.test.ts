import { describe, it, expect } from "vitest";
import {
  createAwardNominationSchema,
  castAwardVoteSchema,
} from "../shared/src/schemas/activity.schema.js";

describe("Awards & Nominations Schemas (Module 7)", () => {
  const validNomination = {
    academicYear: "2026-27",
    cellId: 1,
    alumniId: 42,
    justification:
      "Conducted 4 high-impact guest lectures on scalable cloud systems and mentored 12 student capstone projects with excellence.",
  };

  it("should validate a correct award nomination payload", () => {
    const result = createAwardNominationSchema.safeParse(validNomination);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.academicYear).toBe("2026-27");
      expect(result.data.cellId).toBe(1);
    }
  });

  it("should reject invalid academic year format", () => {
    const result = createAwardNominationSchema.safeParse({
      ...validNomination,
      academicYear: "2026-2027",
    });
    expect(result.success).toBe(false);
  });

  it("should reject justification that is too short", () => {
    const result = createAwardNominationSchema.safeParse({
      ...validNomination,
      justification: "Good alumnus.",
    });
    expect(result.success).toBe(false);
  });

  it("should validate a correct staff vote payload", () => {
    const validVote = {
      nominationId: 15,
      academicYear: "2026-27",
    };
    const result = castAwardVoteSchema.safeParse(validVote);
    expect(result.success).toBe(true);
  });

  it("should reject invalid vote with negative nominationId", () => {
    const result = castAwardVoteSchema.safeParse({
      nominationId: -1,
      academicYear: "2026-27",
    });
    expect(result.success).toBe(false);
  });
});
