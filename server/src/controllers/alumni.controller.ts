import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuditAction, Role } from "@almalink/shared";

export class AlumniController {
  /**
   * GET /api/alumni/profile
   * Returns current logged-in alumnus full profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ status: "fail", message: "Not authenticated" });
        return;
      }

      const profile = await prisma.alumniProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              userId: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              status: true,
            },
          },
        },
      });

      if (!profile) {
        res.status(404).json({ status: "fail", message: "Alumni profile not found." });
        return;
      }

      res.status(200).json({
        status: "success",
        data: {
          alumniId: profile.alumniId,
          userId: profile.userId,
          fullName: profile.user.fullName,
          email: profile.user.email,
          phone: profile.user.phone,
          enrollmentNo: profile.enrollmentNo,
          program: profile.program,
          graduationYear: profile.graduationYear,
          organization: profile.organization,
          designation: profile.designation,
          industry: profile.industry,
          linkedinUrl: profile.linkedinUrl,
          experienceYears: profile.experienceYears,
          skills: Array.isArray(profile.skills) ? profile.skills : [],
          expertise: Array.isArray(profile.expertise) ? profile.expertise : [],
          preferredActivities: Array.isArray(profile.preferredActivities)
            ? profile.preferredActivities
            : [],
          preferredFormat: profile.preferredFormat,
          availability: profile.availability,
          areaOfInterest: profile.areaOfInterest,
          willingToParticipate: profile.willingToParticipate,
          profileCompleted: profile.profileCompleted,
          verificationStatus: profile.verificationStatus,
        },
      });
    } catch (err: unknown) {
      console.error("[ALUMNI GET PROFILE ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to fetch profile." });
    }
  }

  /**
   * PATCH /api/alumni/profile
   * Updates profile fields and persists changes to database
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ status: "fail", message: "Not authenticated" });
        return;
      }

      const existing = await prisma.alumniProfile.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!existing) {
        res.status(404).json({ status: "fail", message: "Alumni profile not found." });
        return;
      }

      const {
        fullName,
        phone,
        organization,
        designation,
        industry,
        linkedinUrl,
        experienceYears,
        skills,
        expertise,
        preferredActivities,
        preferredFormat,
        availability,
        areaOfInterest,
        willingToParticipate,
      } = req.body;

      const clientIp =
        (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

      const updated = await prisma.$transaction(async (tx) => {
        // 1. Update user info if name or phone changed
        if (fullName || phone) {
          await tx.user.update({
            where: { userId },
            data: {
              ...(fullName ? { fullName: String(fullName).trim() } : {}),
              ...(phone ? { phone: String(phone).trim() } : {}),
            },
          });
        }

        // 2. Update profile
        const newProfile = await tx.alumniProfile.update({
          where: { userId },
          data: {
            organization: organization !== undefined ? String(organization).trim() : existing.organization,
            designation: designation !== undefined ? String(designation).trim() : existing.designation,
            industry: industry !== undefined ? String(industry).trim() : existing.industry,
            linkedinUrl: linkedinUrl !== undefined ? String(linkedinUrl).trim() : existing.linkedinUrl,
            experienceYears:
              experienceYears !== undefined
                ? Number(experienceYears) || null
                : existing.experienceYears,
            skills: skills !== undefined ? skills : existing.skills,
            expertise: expertise !== undefined ? expertise : existing.expertise,
            preferredActivities:
              preferredActivities !== undefined
                ? preferredActivities
                : existing.preferredActivities,
            preferredFormat:
              preferredFormat !== undefined
                ? String(preferredFormat).trim()
                : existing.preferredFormat,
            availability:
              availability !== undefined ? String(availability).trim() : existing.availability,
            areaOfInterest:
              areaOfInterest !== undefined ? String(areaOfInterest).trim() : existing.areaOfInterest,
            willingToParticipate:
              willingToParticipate !== undefined
                ? Boolean(willingToParticipate)
                : existing.willingToParticipate,
            profileCompleted: true,
          },
          include: {
            user: {
              select: {
                userId: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        });

        // 3. Audit Log
        await tx.auditLog.create({
          data: {
            userId,
            action: AuditAction.PROFILE_UPDATED,
            entityType: "AlumniProfile",
            entityId: existing.alumniId,
            details: JSON.stringify({
              updatedAt: new Date().toISOString(),
              organization: newProfile.organization,
              designation: newProfile.designation,
            }),
            ipAddress: clientIp.slice(0, 45),
          },
        });

        return newProfile;
      });

      res.status(200).json({
        status: "success",
        message: "Profile updated successfully.",
        data: {
          alumniId: updated.alumniId,
          userId: updated.userId,
          fullName: updated.user.fullName,
          email: updated.user.email,
          phone: updated.user.phone,
          enrollmentNo: updated.enrollmentNo,
          program: updated.program,
          graduationYear: updated.graduationYear,
          organization: updated.organization,
          designation: updated.designation,
          industry: updated.industry,
          linkedinUrl: updated.linkedinUrl,
          experienceYears: updated.experienceYears,
          skills: Array.isArray(updated.skills) ? updated.skills : [],
          expertise: Array.isArray(updated.expertise) ? updated.expertise : [],
          preferredActivities: Array.isArray(updated.preferredActivities)
            ? updated.preferredActivities
            : [],
          preferredFormat: updated.preferredFormat,
          availability: updated.availability,
          areaOfInterest: updated.areaOfInterest,
          willingToParticipate: updated.willingToParticipate,
          profileCompleted: updated.profileCompleted,
          verificationStatus: updated.verificationStatus,
        },
      });
    } catch (err: unknown) {
      console.error("[ALUMNI UPDATE PROFILE ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to update profile." });
    }
  }

  /**
   * GET /api/alumni/dashboard
   * Returns aggregated dashboard metrics, next campus visit, pending invitations,
   * and contribution history for logged-in alumnus
   */
  static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ status: "fail", message: "Not authenticated" });
        return;
      }

      const profile = await prisma.alumniProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: { fullName: true, email: true },
          },
        },
      });

      if (!profile) {
        res.status(404).json({ status: "fail", message: "Alumni profile not found." });
        return;
      }

      // Fetch participations (verified attendance records)
      const participations = await prisma.participation.findMany({
        where: { alumniId: profile.alumniId },
        include: {
          activity: {
            include: {
              cell: { select: { name: true, code: true } },
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Fetch all invitations
      const invitations = await prisma.invitation.findMany({
        where: { alumniId: profile.alumniId },
        include: {
          activity: {
            include: {
              cell: { select: { name: true, code: true } },
              category: { select: { name: true } },
              creator: { select: { fullName: true } },
            },
          },
        },
        orderBy: { sentAt: "desc" },
      });

      // 1. Calculate Metrics
      const attendedParticipations = participations.filter((p) => p.attended);
      const approvedContributions = attendedParticipations.length;
      const approvedPoints = attendedParticipations.reduce(
        (sum, p) => sum + (p.pointsAwarded || p.activity.pointsWeight || 0),
        0
      );

      // Pending invitations awaiting RSVP
      const pendingInvitations = invitations.filter((i) => i.status === "SENT");
      const pendingCount = pendingInvitations.length;

      // 2. Next Campus Visit: Earliest upcoming event where invitation was accepted
      const acceptedUpcoming = invitations
        .filter((i) => i.status === "ACCEPTED" && new Date(i.activity.startAt) >= new Date())
        .sort(
          (a, b) =>
            new Date(a.activity.startAt).getTime() - new Date(b.activity.startAt).getTime()
        );

      const nextVisit = acceptedUpcoming[0]
        ? {
            activityId: acceptedUpcoming[0].activity.activityId,
            title: acceptedUpcoming[0].activity.title,
            cellName: acceptedUpcoming[0].activity.cell.name,
            categoryName: acceptedUpcoming[0].activity.category.name,
            startAt: acceptedUpcoming[0].activity.startAt.toISOString(),
            endAt: acceptedUpcoming[0].activity.endAt.toISOString(),
            venue: acceptedUpcoming[0].activity.venue,
            coordinatorName: acceptedUpcoming[0].activity.creator?.fullName || "Faculty Coordinator",
          }
        : null;

      // 3. Waiting Invitation (newest pending invite needing RSVP)
      const waitingInvite = pendingInvitations[0]
        ? {
            invitationId: pendingInvitations[0].invitationId,
            activityId: pendingInvitations[0].activity.activityId,
            title: pendingInvitations[0].activity.title,
            cellName: pendingInvitations[0].activity.cell.name,
            categoryName: pendingInvitations[0].activity.category.name,
            startAt: pendingInvitations[0].activity.startAt.toISOString(),
            responseDeadline: pendingInvitations[0].responseDeadline.toISOString(),
            expectedRole: pendingInvitations[0].expectedRole,
          }
        : null;

      // 4. Contribution History Table List
      const contributionHistory = attendedParticipations.map((p) => ({
        participationId: p.participationId,
        date: p.createdAt.toISOString(),
        activityTitle: p.activity.title,
        cellName: p.activity.cell.name,
        categoryName: p.activity.category.name,
        points: p.pointsAwarded || p.activity.pointsWeight,
        status: p.verifiedAt ? "Approved" : "Pending",
      }));

      // 5. Pending Records List (accepted invitations pending event completion / attendance)
      const pendingRecords = invitations
        .filter((i) => i.status === "ACCEPTED")
        .map((i) => ({
          invitationId: i.invitationId,
          date: i.activity.startAt.toISOString(),
          activityTitle: i.activity.title,
          cellName: i.activity.cell.name,
          categoryName: i.activity.category.name,
          points: i.activity.pointsWeight,
          status: "Pending Attendance Review",
        }));

      res.status(200).json({
        status: "success",
        data: {
          fullName: profile.user.fullName,
          program: profile.program,
          graduationYear: profile.graduationYear,
          verificationStatus: profile.verificationStatus,
          approvedContributions,
          approvedPoints,
          pendingCount,
          nextCampusVisit: nextVisit,
          waitingInvitation: waitingInvite,
          contributionHistory,
          pendingRecords,
        },
      });
    } catch (err: unknown) {
      console.error("[ALUMNI GET DASHBOARD ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to fetch dashboard data." });
    }
  }
}
