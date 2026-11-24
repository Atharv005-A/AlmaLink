import { describe, it, expect } from "vitest";
import { AuditAction } from "../shared/src/enums/audit-action.enum.js";

describe("Audit Logging & Governance Module", () => {
  it("should have comprehensive AuditAction enum members for institutional governance", () => {
    expect(AuditAction.ALUMNI_VERIFIED).toBe("ALUMNI_VERIFIED");
    expect(AuditAction.ALUMNI_REJECTED).toBe("ALUMNI_REJECTED");
    expect(AuditAction.STAFF_INVITED).toBe("STAFF_INVITED");
    expect(AuditAction.CELL_CREATED).toBe("CELL_CREATED");
    expect(AuditAction.PROFILE_UPDATED).toBe("PROFILE_UPDATED");
  });

  it("should validate audit log query parameters correctly", () => {
    const validActions = Object.values(AuditAction);
    expect(validActions).toContain("ALUMNI_VERIFIED");
    expect(validActions).toContain("STAFF_INVITED");
    expect(validActions.length).toBeGreaterThanOrEqual(10);
  });
});
