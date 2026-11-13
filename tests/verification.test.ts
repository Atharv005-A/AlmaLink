import { describe, it, expect } from "vitest";
import { VerificationStatus } from "../shared/src/enums/verification-status.enum.js";
import { UserStatus } from "../shared/src/enums/user-status.enum.js";

function formatReferenceId(id: number): string {
  return `AL-${String(id).padStart(4, "0")}`;
}

function getInitials(name?: string): string {
  if (!name) return "AL";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const cleanParts = parts.filter(
    (p) =>
      !["dr.", "dr", "prof.", "prof", "mr.", "mr", "ms.", "ms", "mrs.", "mrs"].includes(
        p.toLowerCase()
      )
  );
  if (cleanParts.length >= 2) {
    return (cleanParts[0][0] + cleanParts[cleanParts.length - 1][0]).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

describe("Verification Queue & Identity Formats (Module 2)", () => {
  it("should contain all mandatory verification status enum values", () => {
    expect(VerificationStatus.PENDING).toBe("PENDING");
    expect(VerificationStatus.CHANGES_REQUESTED).toBe("CHANGES_REQUESTED");
    expect(VerificationStatus.VERIFIED).toBe("VERIFIED");
    expect(VerificationStatus.REJECTED).toBe("REJECTED");
  });

  it("should contain user status values for active and archived accounts", () => {
    expect(UserStatus.ACTIVE).toBe("ACTIVE");
    expect(UserStatus.ARCHIVED).toBe("ARCHIVED");
  });

  it("should format reference IDs with AL- prefix and 4 zero-padded digits", () => {
    expect(formatReferenceId(1)).toBe("AL-0001");
    expect(formatReferenceId(42)).toBe("AL-0042");
    expect(formatReferenceId(256)).toBe("AL-0256");
    expect(formatReferenceId(1024)).toBe("AL-1024");
  });

  describe("Dynamic Initials Helper", () => {
    it("should compute correct initials ignoring academic titles", () => {
      expect(getInitials("Dr. Anjali Joshi")).toBe("AJ");
      expect(getInitials("Prof. Ramesh Kulkarni")).toBe("RK");
    });

    it("should compute initials for standard student and alumni names", () => {
      expect(getInitials("Prithviraj Pratap Patil")).toBe("PP");
      expect(getInitials("Aarav Deshmukh")).toBe("AD");
      expect(getInitials("Neha Kulkarni")).toBe("NK");
    });

    it("should fallback cleanly for single names or missing names", () => {
      expect(getInitials("Prithvi")).toBe("PR");
      expect(getInitials("")).toBe("AL");
      expect(getInitials(undefined)).toBe("AL");
    });
  });
});
