import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { EmailService } from "../services/email.service.js";
import { AuditAction } from "@almalink/shared";

export class VerificationsController {
  /**
   * GET /api/verifications
   * Lists alumni verification queue with filtering, stats, and search
   */
  static async getQueue(req: Request, res: Response): Promise<void> {
    try {
      const statusParam = (req.query.status as string) || "ALL";
      const programParam = (req.query.program as string) || "ALL";
      const batchParam = (req.query.batch as string) || "ALL";
      const searchParam = (req.query.search as string)?.trim() || "";
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
      const skip = (page - 1) * limit;

      // 1. Build where conditions
      const where: any = {};

      if (statusParam === "INACTIVE") {
        where.user = { status: "ARCHIVED" };
        where.verificationStatus = { not: "REJECTED" };
      } else if (statusParam === "REJECTED") {
        where.verificationStatus = "REJECTED";
      } else if (statusParam !== "ALL") {
        where.verificationStatus = statusParam;
        where.user = { status: { not: "ARCHIVED" } };
      }

      if (programParam !== "ALL") {
        where.program = programParam;
      }

      if (batchParam !== "ALL") {
        const batchYear = parseInt(batchParam, 10);
        if (!isNaN(batchYear)) {
          where.graduationYear = batchYear;
        }
      }

      if (searchParam) {
        where.OR = [
          { enrollmentNo: { contains: searchParam, mode: "insensitive" } },
          { user: { fullName: { contains: searchParam, mode: "insensitive" } } },
          { user: { email: { contains: searchParam, mode: "insensitive" } } },
        ];
      }

      // 2. Fetch requests, total count, and aggregated stats in a single parallel batch
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [requests, total, statsRows] = await Promise.all([
        prisma.alumniProfile.findMany({
          where,
          include: {
            user: {
              select: {
                userId: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                status: true,
                createdAt: true,
              },
            },
            verifiedBy: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.alumniProfile.count({ where }),
        prisma.$queryRaw<
          Array<{
            awaitingReviewCount: number;
            changesRequestedCount: number;
            verifiedCount: number;
            rejectedCount: number;
            inactiveCount: number;
            verifiedThisMonthCount: number;
            oldestPendingCreatedAt: Date | null;
          }>
        >`
          SELECT
            COUNT(*) FILTER (WHERE ap.verification_status = 'PENDING' AND u.status != 'ARCHIVED')::int AS "awaitingReviewCount",
            COUNT(*) FILTER (WHERE ap.verification_status = 'CHANGES_REQUESTED' AND u.status != 'ARCHIVED')::int AS "changesRequestedCount",
            COUNT(*) FILTER (WHERE ap.verification_status = 'VERIFIED' AND u.status != 'ARCHIVED')::int AS "verifiedCount",
            COUNT(*) FILTER (WHERE ap.verification_status = 'REJECTED')::int AS "rejectedCount",
            COUNT(*) FILTER (WHERE u.status = 'ARCHIVED' AND ap.verification_status != 'REJECTED')::int AS "inactiveCount",
            COUNT(*) FILTER (WHERE ap.verification_status = 'VERIFIED' AND ap.verified_at >= ${startOfMonth} AND u.status != 'ARCHIVED')::int AS "verifiedThisMonthCount",
            MIN(ap.created_at) FILTER (WHERE ap.verification_status = 'PENDING' AND u.status != 'ARCHIVED') AS "oldestPendingCreatedAt"
          FROM alumni_profiles ap
          JOIN users u ON ap.user_id = u.user_id;
        `,
      ]);

      const aggStats = statsRows[0] || {
        awaitingReviewCount: 0,
        changesRequestedCount: 0,
        verifiedCount: 0,
        rejectedCount: 0,
        inactiveCount: 0,
        verifiedThisMonthCount: 0,
        oldestPendingCreatedAt: null,
      };

      let oldestPendingDays = 0;
      if (aggStats.oldestPendingCreatedAt) {
        const diffMs = Date.now() - new Date(aggStats.oldestPendingCreatedAt).getTime();
        oldestPendingDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }

      const formattedRequests = requests.map((item) => ({
        alumniId: item.alumniId,
        referenceId: `AL-${String(item.alumniId).padStart(4, "0")}`,
        userId: item.userId,
        fullName: item.user.fullName,
        email: item.user.email,
        phone: item.user.phone,
        program: item.program,
        graduationYear: item.graduationYear,
        enrollmentNo: item.enrollmentNo,
        verificationStatus: item.verificationStatus,
        verificationNote: item.verificationNote,
        userStatus: item.user.status,
        submittedAt: item.createdAt.toISOString(),
        verifiedAt: item.verifiedAt?.toISOString() || null,
        verifiedBy: item.verifiedBy?.fullName || null,
      }));

      res.status(200).json({
        status: "success",
        data: {
          requests: formattedRequests,
          stats: {
            awaitingReviewCount: aggStats.awaitingReviewCount || 0,
            changesRequestedCount: aggStats.changesRequestedCount || 0,
            verifiedCount: aggStats.verifiedCount || 0,
            rejectedCount: aggStats.rejectedCount || 0,
            inactiveCount: aggStats.inactiveCount || 0,
            verifiedThisMonthCount: aggStats.verifiedThisMonthCount || 0,
            oldestPendingDays,
          },
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
      });
    } catch (err: any) {
      console.error("[VERIFICATIONS QUEUE ERROR]:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to load verification queue",
      });
    }
  }

  /**
   * GET /api/verifications/:id
   * Fetches single alumni verification detail with side-by-side college records
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const alumniId = parseInt(req.params.id, 10);
      if (isNaN(alumniId)) {
        res.status(400).json({ status: "fail", message: "Invalid verification request ID" });
        return;
      }

      const profile = await prisma.alumniProfile.findUnique({
        where: { alumniId },
        include: {
          user: true,
          verifiedBy: {
            select: { fullName: true, email: true },
          },
        },
      });

      if (!profile) {
        res.status(404).json({ status: "fail", message: "Verification request not found" });
        return;
      }

      // College master record simulation (in IMCC, this compares against the archived university ledger)
      const collegeRecord = {
        fullName: profile.user.fullName,
        enrollmentNo: profile.enrollmentNo,
        program: profile.program,
        graduationYear: profile.graduationYear,
        isMatch: true,
        matchNote: "Enrollment and batch match the archived student record.",
      };

      res.status(200).json({
        status: "success",
        data: {
          alumniId: profile.alumniId,
          referenceId: `AL-${String(profile.alumniId).padStart(4, "0")}`,
          userId: profile.userId,
          fullName: profile.user.fullName,
          email: profile.user.email,
          phone: profile.user.phone,
          program: profile.program,
          graduationYear: profile.graduationYear,
          enrollmentNo: profile.enrollmentNo,
          consentGiven: profile.consentGiven,
          verificationStatus: profile.verificationStatus,
          verificationNote: profile.verificationNote,
          userStatus: profile.user.status,
          submittedAt: profile.createdAt.toISOString(),
          verifiedAt: profile.verifiedAt?.toISOString() || null,
          verifiedBy: profile.verifiedBy?.fullName || null,
          collegeRecord,
        },
      });
    } catch (err: any) {
      console.error("[VERIFICATIONS GET ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to load verification record" });
    }
  }

  /**
   * POST /api/verifications/:id/approve
   * Approves alumnus, activates account, records audit log and emails notification
   */
  static async approve(req: Request, res: Response): Promise<void> {
    try {
      const alumniId = parseInt(req.params.id, 10);
      const { note } = req.body;
      const adminUserId = req.user?.userId;

      if (isNaN(alumniId)) {
        res.status(400).json({ status: "fail", message: "Invalid ID" });
        return;
      }

      const existing = await prisma.alumniProfile.findUnique({
        where: { alumniId },
        include: { user: true },
      });

      if (!existing) {
        res.status(404).json({ status: "fail", message: "Alumni record not found" });
        return;
      }

      const clientIp =
        (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

      await prisma.$transaction(async (tx) => {
        await tx.alumniProfile.update({
          where: { alumniId },
          data: {
            verificationStatus: "VERIFIED",
            verificationNote: note || "Enrollment and batch verified with college records.",
            verifiedById: adminUserId || null,
            verifiedAt: new Date(),
          },
        });

        await tx.user.update({
          where: { userId: existing.userId },
          data: { status: "ACTIVE" },
        });

        if (adminUserId) {
          await tx.auditLog.create({
            data: {
              userId: adminUserId,
              action: AuditAction.ALUMNI_VERIFIED,
              entityType: "AlumniProfile",
              entityId: alumniId,
              details: JSON.stringify({
                note: note || "Verified by Administrator",
                enrollmentNo: existing.enrollmentNo,
                approvedAt: new Date().toISOString(),
              }),
              ipAddress: clientIp.slice(0, 45),
            },
          });
        }
      });

      // Send approval email
      const clientOrigin = req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173";
      EmailService.sendAlumniApprovedEmail(
        existing.user.email,
        existing.user.fullName,
        `${clientOrigin}/login`
      ).catch((err) => console.error("[EMAIL ERROR] Failed to send approval email:", err));

      res.status(200).json({
        status: "success",
        message: `Alumnus ${existing.user.fullName} approved successfully. Account is now active.`,
      });
    } catch (err: any) {
      console.error("[VERIFICATIONS APPROVE ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to approve alumni registration" });
    }
  }

  /**
   * POST /api/verifications/:id/request-changes
   * Sets verificationStatus to CHANGES_REQUESTED and emails alumnus
   */
  static async requestChanges(req: Request, res: Response): Promise<void> {
    try {
      const alumniId = parseInt(req.params.id, 10);
      const { message } = req.body;
      const adminUserId = req.user?.userId;

      if (isNaN(alumniId)) {
        res.status(400).json({ status: "fail", message: "Invalid ID" });
        return;
      }

      if (!message || !message.trim()) {
        res.status(400).json({ status: "fail", message: "Please provide the changes needed" });
        return;
      }

      const existing = await prisma.alumniProfile.findUnique({
        where: { alumniId },
        include: { user: true },
      });

      if (!existing) {
        res.status(404).json({ status: "fail", message: "Alumni record not found" });
        return;
      }

      const clientIp =
        (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

      await prisma.$transaction(async (tx) => {
        await tx.alumniProfile.update({
          where: { alumniId },
          data: {
            verificationStatus: "CHANGES_REQUESTED",
            verificationNote: message.trim(),
          },
        });

        if (adminUserId) {
          await tx.auditLog.create({
            data: {
              userId: adminUserId,
              action: AuditAction.ALUMNI_CHANGES_REQUESTED,
              entityType: "AlumniProfile",
              entityId: alumniId,
              details: JSON.stringify({
                changesRequested: message.trim(),
                timestamp: new Date().toISOString(),
              }),
              ipAddress: clientIp.slice(0, 45),
            },
          });
        }
      });

      EmailService.sendAlumniChangesRequestedEmail(
        existing.user.email,
        existing.user.fullName,
        message.trim()
      ).catch((err) => console.error("[EMAIL ERROR] Failed to send changes email:", err));

      res.status(200).json({
        status: "success",
        message: "Change request delivered to alumnus. Portal access remains restricted.",
      });
    } catch (err: any) {
      console.error("[VERIFICATIONS REQUEST CHANGES ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to request changes" });
    }
  }

  /**
   * POST /api/verifications/:id/reject
   * Rejects alumnus registration with reason, sets status to ARCHIVED, logs audit
   */
  static async reject(req: Request, res: Response): Promise<void> {
    try {
      const alumniId = parseInt(req.params.id, 10);
      const { reason } = req.body;
      const adminUserId = req.user?.userId;

      if (isNaN(alumniId)) {
        res.status(400).json({ status: "fail", message: "Invalid ID" });
        return;
      }

      if (!reason || !reason.trim()) {
        res
          .status(400)
          .json({ status: "fail", message: "A reason is required to reject this registration." });
        return;
      }

      const existing = await prisma.alumniProfile.findUnique({
        where: { alumniId },
        include: { user: true },
      });

      if (!existing) {
        res.status(404).json({ status: "fail", message: "Alumni record not found" });
        return;
      }

      const clientIp =
        (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

      await prisma.$transaction(async (tx) => {
        await tx.alumniProfile.update({
          where: { alumniId },
          data: {
            verificationStatus: "REJECTED",
            verificationNote: reason.trim(),
            verifiedById: adminUserId || null,
            verifiedAt: new Date(),
          },
        });

        await tx.user.update({
          where: { userId: existing.userId },
          data: { status: "ARCHIVED" },
        });

        if (adminUserId) {
          await tx.auditLog.create({
            data: {
              userId: adminUserId,
              action: AuditAction.ALUMNI_REJECTED,
              entityType: "AlumniProfile",
              entityId: alumniId,
              details: JSON.stringify({
                reason: reason.trim(),
                timestamp: new Date().toISOString(),
              }),
              ipAddress: clientIp.slice(0, 45),
            },
          });
        }
      });

      EmailService.sendAlumniRejectedEmail(
        existing.user.email,
        existing.user.fullName,
        reason.trim()
      ).catch((err) => console.error("[EMAIL ERROR] Failed to send rejection email:", err));

      res.status(200).json({
        status: "success",
        message: "Registration rejected. Record preserved in audit log.",
      });
    } catch (err: any) {
      console.error("[VERIFICATIONS REJECT ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to reject registration" });
    }
  }
}
