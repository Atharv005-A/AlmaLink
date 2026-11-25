import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export class ReportsController {
  /**
   * GET /api/reports/summary
   * Aggregates stats for Admin Engagement Reports & NAAC metrics
   */
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalAlumni,
        verifiedAlumni,
        pendingVerifications,
        totalActivities,
        completedActivities,
        cells,
        participations,
        invitations,
      ] = await Promise.all([
        prisma.alumniProfile.count(),
        prisma.alumniProfile.count({ where: { verificationStatus: "VERIFIED" } }),
        prisma.alumniProfile.count({ where: { verificationStatus: "PENDING" } }),
        prisma.activity.count(),
        prisma.activity.count({ where: { status: "COMPLETED" } }),
        prisma.cell.findMany({
          select: {
            cellId: true,
            name: true,
            code: true,
            _count: {
              select: {
                activities: true,
              },
            },
          },
        }),
        prisma.participation.findMany({
          where: { attended: true },
          select: {
            pointsAwarded: true,
            activity: {
              select: {
                cellId: true,
                categoryId: true,
              },
            },
          },
        }),
        prisma.invitation.findMany({
          select: {
            status: true,
          },
        }),
      ]);

      const totalInvitations = invitations.length;
      const acceptedInvitations = invitations.filter((i) => i.status === "ACCEPTED").length;
      const acceptanceRate =
        totalInvitations > 0 ? Math.round((acceptedInvitations / totalInvitations) * 100) : 0;

      const totalPointsAwarded = participations.reduce((sum, p) => sum + p.pointsAwarded, 0);

      // Program breakdown
      const programStats = await prisma.alumniProfile.groupBy({
        by: ["program"],
        _count: { alumniId: true },
      });

      // Cell stats
      const cellBreakdown = cells.map((cell) => {
        const cellParticipations = participations.filter((p) => p.activity.cellId === cell.cellId);
        const cellPoints = cellParticipations.reduce((s, p) => s + p.pointsAwarded, 0);
        return {
          cellId: cell.cellId,
          name: cell.name,
          code: cell.code,
          activityCount: cell._count.activities,
          participationCount: cellParticipations.length,
          pointsAwarded: cellPoints,
        };
      });

      res.status(200).json({
        status: "success",
        data: {
          alumni: {
            total: totalAlumni,
            verified: verifiedAlumni,
            pending: pendingVerifications,
            programBreakdown: programStats.map((p) => ({
              program: p.program,
              count: p._count.alumniId,
            })),
          },
          activities: {
            total: totalActivities,
            completed: completedActivities,
            totalInvitations,
            acceptedInvitations,
            acceptanceRate,
          },
          engagement: {
            totalPointsAwarded,
            totalAttendedParticipations: participations.length,
            cellBreakdown,
          },
        },
      });
    } catch (err: unknown) {
      console.error("[REPORTS GET SUMMARY ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to generate engagement report." });
    }
  }

  /**
   * GET /api/reports/export/csv
   */
  static async exportCsv(req: Request, res: Response): Promise<void> {
    try {
      const type = (req.query.type as string) || "alumni";

      if (type === "alumni") {
        const list = await prisma.alumniProfile.findMany({
          include: {
            user: { select: { fullName: true, email: true, phone: true } },
          },
          orderBy: { graduationYear: "desc" },
        });

        let csv =
          "Alumni ID,Full Name,Email,Phone,Enrollment No,Program,Batch,Status,Organization,Designation\n";
        for (const item of list) {
          csv += `"${item.alumniId}","${item.user.fullName}","${item.user.email}","${item.user.phone}","${item.enrollmentNo}","${item.program}","${item.graduationYear}","${item.verificationStatus}","${item.organization || ""}","${item.designation || ""}"\n`;
        }

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=alumni_engagement_report.csv");
        res.status(200).send(csv);
        return;
      }

      if (type === "activities") {
        const list = await prisma.activity.findMany({
          include: {
            cell: { select: { name: true } },
            category: { select: { name: true } },
            _count: { select: { invitations: true, participations: true } },
          },
          orderBy: { startAt: "desc" },
        });

        let csv =
          "Activity ID,Title,Cell,Type,Date,Venue,Status,Points,Invitations,Participations\n";
        for (const item of list) {
          csv += `"${item.activityId}","${item.title}","${item.cell.name}","${item.category?.name || "Event"}","${item.startAt.toISOString()}","${item.venue}","${item.status}","${item.pointsWeight}","${item._count.invitations}","${item._count.participations}"\n`;
        }

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=activities_report.csv");
        res.status(200).send(csv);
        return;
      }

      res.status(400).json({ status: "fail", message: "Invalid export type." });
    } catch (err: unknown) {
      console.error("[REPORTS CSV EXPORT ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to export report CSV." });
    }
  }
}
