import { describe, it, expect } from "vitest";
import {
  createCellSchema,
  assignCoordinatorSchema,
  inviteStaffSchema,
} from "../shared/src/schemas/cell.schema.js";

function getCellFocusSummary(code: string, description?: string | null): string {
  if (code === "TECH") return "Workshops · Hackathons";
  if (code === "PLACE") return "Interviews · Career Guidance";
  if (code === "CULT") return "Arts · Cultural Events";
  if (code === "SPORTS") return "Sports · Coaching";
  if (code === "ECELL") return "Founders · Mentoring";
  if (description) return description.slice(0, 32) + "...";
  return "General Campus Engagement";
}

function getStaffDisplayRole(roleName: string): string {
  if (roleName === "COLLEGE_ADMIN" || roleName === "SUPER_ADMIN") {
    return "Admin · HOD";
  }
  return "Coordinator";
}

describe("Staff and Cells Management (Module 5)", () => {
  describe("createCellSchema Validation", () => {
    it("should accept valid cell creation input with coordinator", () => {
      const valid = {
        name: "Entrepreneurship & Innovation Cell",
        code: "ecell",
        description: "Connect alumni founders with student startups",
        coordinatorUserId: 7,
        status: "Active",
      };
      const result = createCellSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe("ECELL");
        expect(result.data.coordinatorUserId).toBe(7);
      }
    });

    it("should reject cell names shorter than 2 characters", () => {
      const result = createCellSchema.safeParse({
        name: "E",
        code: "ECELL",
      });
      expect(result.success).toBe(false);
    });

    it("should reject cell codes longer than 20 characters", () => {
      const result = createCellSchema.safeParse({
        name: "Very Long Cell Name",
        code: "THISISAREALLYLONGERCELLCODENAME",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("inviteStaffSchema Validation", () => {
    it("should validate complete staff invitation input matching Figma", () => {
      const validInvite = {
        fullName: "Prof. Nikhil Apte",
        email: "nikhil.apte@imcc.mespune.in",
        cellId: 5,
        role: "CELL_COORDINATOR" as const,
        message: "Please join IMCC AlmaLink to coordinate Entrepreneurship cell activities.",
        sendEmailImmediately: true,
      };
      const result = inviteStaffSchema.safeParse(validInvite);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("nikhil.apte@imcc.mespune.in");
        expect(result.data.sendEmailImmediately).toBe(true);
      }
    });

    it("should reject invalid email addresses", () => {
      const result = inviteStaffSchema.safeParse({
        fullName: "Prof. Nikhil Apte",
        email: "not-an-email",
        cellId: 5,
        role: "CELL_COORDINATOR",
      });
      expect(result.success).toBe(false);
    });

    it("should reject unauthorized roles outside coordinator or admin", () => {
      const result = inviteStaffSchema.safeParse({
        fullName: "Alumnus Member",
        email: "alumni@test.com",
        cellId: 1,
        role: "ALUMNI" as any,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("assignCoordinatorSchema", () => {
    it("should accept valid cell and user IDs", () => {
      const result = assignCoordinatorSchema.safeParse({
        cellId: 1,
        userId: 2,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Cell Focus Summary Helpers", () => {
    it("should map standard IMCC cell codes to Figma focus strings", () => {
      expect(getCellFocusSummary("TECH")).toBe("Workshops · Hackathons");
      expect(getCellFocusSummary("PLACE")).toBe("Interviews · Career Guidance");
      expect(getCellFocusSummary("CULT")).toBe("Arts · Cultural Events");
      expect(getCellFocusSummary("SPORTS")).toBe("Sports · Coaching");
      expect(getCellFocusSummary("ECELL")).toBe("Founders · Mentoring");
    });

    it("should fallback gracefully for custom cell descriptions", () => {
      expect(getCellFocusSummary("RESEARCH", "Advancing faculty research")).toBe(
        "Advancing faculty research..."
      );
    });
  });

  describe("Staff Display Role Mapping", () => {
    it("should map college administration to Admin · HOD", () => {
      expect(getStaffDisplayRole("COLLEGE_ADMIN")).toBe("Admin · HOD");
      expect(getStaffDisplayRole("SUPER_ADMIN")).toBe("Admin · HOD");
    });

    it("should map cell coordinator to Coordinator", () => {
      expect(getStaffDisplayRole("CELL_COORDINATOR")).toBe("Coordinator");
    });
  });
});
