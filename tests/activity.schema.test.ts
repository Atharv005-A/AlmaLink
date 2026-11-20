import { describe, it, expect } from "vitest";
import { createActivitySchema } from "../shared/src/schemas/activity.schema.js";

describe("Activity & Event Creation Schemas (Module 3)", () => {
  const validActivity = {
    cellId: 1,
    categoryId: 2,
    title: "Expert Lecture on Cloud Architecture & Kubernetes",
    description:
      "Industry session for MCA students exploring scalable microservices in production.",
    requiredExpertise: ["Cloud Computing", "Kubernetes", "DevOps"],
    startAt: "2026-11-25T10:00:00.000Z",
    endAt: "2026-11-25T13:00:00.000Z",
    venue: "IMCC Main Auditorium, 4th Floor",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    pointsWeight: 15,
  };

  it("should accept valid activity payload with all required fields", () => {
    const result = createActivitySchema.safeParse(validActivity);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Expert Lecture on Cloud Architecture & Kubernetes");
      expect(result.data.requiredExpertise.length).toBe(3);
    }
  });

  it("should reject activity titles shorter than 3 characters", () => {
    const result = createActivitySchema.safeParse({
      ...validActivity,
      title: "AI",
    });
    expect(result.success).toBe(false);
  });

  it("should reject activity descriptions shorter than 10 characters", () => {
    const result = createActivitySchema.safeParse({
      ...validActivity,
      description: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty required expertise tag list", () => {
    const result = createActivitySchema.safeParse({
      ...validActivity,
      requiredExpertise: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid ISO date formats for startAt or endAt", () => {
    const invalidStart = createActivitySchema.safeParse({
      ...validActivity,
      startAt: "25-11-2026 10:00 AM",
    });
    expect(invalidStart.success).toBe(false);

    const invalidEnd = createActivitySchema.safeParse({
      ...validActivity,
      endAt: "invalid-date",
    });
    expect(invalidEnd.success).toBe(false);
  });

  it("should allow empty meetingLink for purely in-person events", () => {
    const inPerson = createActivitySchema.safeParse({
      ...validActivity,
      meetingLink: "",
    });
    expect(inPerson.success).toBe(true);
  });

  it("should reject invalid meeting URL format when provided", () => {
    const badUrl = createActivitySchema.safeParse({
      ...validActivity,
      meetingLink: "not-a-valid-url",
    });
    expect(badUrl.success).toBe(false);
  });

  it("should reject pointsWeight outside range 1 to 100", () => {
    const zeroPoints = createActivitySchema.safeParse({
      ...validActivity,
      pointsWeight: 0,
    });
    expect(zeroPoints.success).toBe(false);

    const excessivePoints = createActivitySchema.safeParse({
      ...validActivity,
      pointsWeight: 150,
    });
    expect(excessivePoints.success).toBe(false);
  });
});
