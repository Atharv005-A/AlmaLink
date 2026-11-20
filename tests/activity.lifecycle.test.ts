import { describe, it, expect } from "vitest";
import { ActivityStatus } from "../shared/src/enums/activity-status.enum.js";

// Helper function modeling timeline classification for activities
function getActivityTimelineStatus(
  status: ActivityStatus,
  startAt: string,
  endAt: string,
  currentTimestamp: Date = new Date()
): "DRAFT" | "UPCOMING" | "ONGOING" | "COMPLETED" {
  if (status === ActivityStatus.DRAFT) {
    return "DRAFT";
  }

  const now = currentTimestamp.getTime();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (now < start) {
    return "UPCOMING";
  } else if (now >= start && now <= end) {
    return "ONGOING";
  } else {
    return "COMPLETED";
  }
}

describe("Activity Lifecycle & Timeline Management (Module 3)", () => {
  it("should verify all core ActivityStatus enum members", () => {
    expect(ActivityStatus.DRAFT).toBe("DRAFT");
    expect(ActivityStatus.PUBLISHED).toBe("PUBLISHED");
    expect(ActivityStatus.ONGOING).toBe("ONGOING");
    expect(ActivityStatus.COMPLETED).toBe("COMPLETED");
  });

  describe("Timeline Status Resolver", () => {
    const startAt = "2026-11-25T10:00:00.000Z";
    const endAt = "2026-11-25T13:00:00.000Z";

    it("should keep draft status regardless of dates", () => {
      const pastTime = new Date("2026-11-30T10:00:00.000Z");
      const result = getActivityTimelineStatus(ActivityStatus.DRAFT, startAt, endAt, pastTime);
      expect(result).toBe("DRAFT");
    });

    it("should classify event as UPCOMING when current time is before start time", () => {
      const beforeTime = new Date("2026-11-24T12:00:00.000Z");
      const result = getActivityTimelineStatus(ActivityStatus.PUBLISHED, startAt, endAt, beforeTime);
      expect(result).toBe("UPCOMING");
    });

    it("should classify event as ONGOING when current time is within duration", () => {
      const duringTime = new Date("2026-11-25T11:30:00.000Z");
      const result = getActivityTimelineStatus(ActivityStatus.PUBLISHED, startAt, endAt, duringTime);
      expect(result).toBe("ONGOING");
    });

    it("should classify event as COMPLETED when current time is after end time", () => {
      const afterTime = new Date("2026-11-25T14:00:00.000Z");
      const result = getActivityTimelineStatus(ActivityStatus.PUBLISHED, startAt, endAt, afterTime);
      expect(result).toBe("COMPLETED");
    });
  });
});
