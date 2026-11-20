import { describe, it, expect } from "vitest";
import {
  bulkDispatchInvitationsSchema,
  rsvpInvitationSchema,
} from "../shared/src/schemas/activity.schema.js";
import { InvitationStatus } from "../shared/src/enums/invitation-status.enum.js";

describe("Invitation & RSVP Schemas (Module 4)", () => {
  describe("bulkDispatchInvitationsSchema", () => {
    const validDispatch = {
      activityId: 10,
      alumniIds: [1, 2, 3],
      expectedRole: "Guest Speaker & Keynote",
      responseDeadline: "2026-11-24",
      customMessage: "Looking forward to your session at IMCC campus.",
      sendEmail: true,
      sendWhatsapp: false,
    };

    it("should accept valid bulk invitation dispatch payload", () => {
      const result = bulkDispatchInvitationsSchema.safeParse(validDispatch);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.alumniIds.length).toBe(3);
        expect(result.data.responseDeadline).toBe("2026-11-24");
      }
    });

    it("should reject dispatch when no alumni are selected", () => {
      const result = bulkDispatchInvitationsSchema.safeParse({
        ...validDispatch,
        alumniIds: [],
      });
      expect(result.success).toBe(false);
    });

    it("should reject deadline not in YYYY-MM-DD format", () => {
      const result = bulkDispatchInvitationsSchema.safeParse({
        ...validDispatch,
        responseDeadline: "24/11/2026",
      });
      expect(result.success).toBe(false);
    });

    it("should reject expectedRole with fewer than 2 characters", () => {
      const result = bulkDispatchInvitationsSchema.safeParse({
        ...validDispatch,
        expectedRole: "A",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("rsvpInvitationSchema", () => {
    it("should accept valid ACCEPTED status with optional note", () => {
      const result = rsvpInvitationSchema.safeParse({
        status: "ACCEPTED",
        responseNote: "Delighted to accept. Will bring presentation slides on pen drive.",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid DECLINED status", () => {
      const result = rsvpInvitationSchema.safeParse({
        status: "DECLINED",
        responseNote: "Out of town on business travel.",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid RSVP statuses like PENDING or MAYBE", () => {
      const maybeResult = rsvpInvitationSchema.safeParse({ status: "MAYBE" });
      expect(maybeResult.success).toBe(false);

      const pendingResult = rsvpInvitationSchema.safeParse({ status: "PENDING" });
      expect(pendingResult.success).toBe(false);
    });

    it("should verify InvitationStatus enum values", () => {
      expect(InvitationStatus.PENDING).toBe("PENDING");
      expect(InvitationStatus.ACCEPTED).toBe("ACCEPTED");
      expect(InvitationStatus.DECLINED).toBe("DECLINED");
    });
  });
});
