import { describe, it, expect } from "vitest";
import {
  createCellSchema,
  assignCoordinatorSchema,
  inviteStaffSchema,
} from "../shared/src/schemas/cell.schema.js";

describe("Cell & Coordinator Management Schemas", () => {
  describe("createCellSchema", () => {
    it("should accept valid cell creation details", () => {
      const validCell = {
        name: "Entrepreneurship Development Cell",
        code: "edc",
        description: "Promoting student startups and innovation at IMCC.",
        headStaffId: 5,
      };
      const result = createCellSchema.safeParse(validCell);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe("EDC"); // Normalizes to uppercase
      }
    });

    it("should reject cell names shorter than 2 characters", () => {
      const result = createCellSchema.safeParse({
        name: "A",
        code: "TEST",
      });
      expect(result.success).toBe(false);
    });

    it("should reject cell code shorter than 2 characters", () => {
      const result = createCellSchema.safeParse({
        name: "Training & Placement Cell",
        code: "T",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("assignCoordinatorSchema", () => {
    it("should accept positive integers for cellId and userId", () => {
      const result = assignCoordinatorSchema.safeParse({
        cellId: 1,
        userId: 12,
      });
      expect(result.success).toBe(true);
    });

    it("should reject negative or zero IDs", () => {
      const result = assignCoordinatorSchema.safeParse({
        cellId: -1,
        userId: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("inviteStaffSchema", () => {
    it("should accept valid staff invitation for CELL_COORDINATOR", () => {
      const result = inviteStaffSchema.safeParse({
        fullName: "Dr. Sandeep Kadam",
        email: "Sandeep.Kadam@IMCC.mespune.in",
        cellId: 2,
        role: "CELL_COORDINATOR",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("sandeep.kadam@imcc.mespune.in"); // Lowercased
      }
    });

    it("should reject unauthorized roles like ALUMNI or SUPER_ADMIN in staff invite", () => {
      const result = inviteStaffSchema.safeParse({
        fullName: "Student Member",
        email: "student@imcc.mespune.in",
        cellId: 2,
        role: "ALUMNI",
      });
      expect(result.success).toBe(false);
    });
  });
});
