import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export class AuditController {
  /**
   * GET /api/audit-logs
   * Retrieves paginated, filterable immutable security audit logs (Admin only)
   */
  static async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 15));
      const skip = (page - 1) * limit;

      const action = req.query.action as string | undefined;
      const search = (req.query.search as string)?.trim();
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const where: any = {};

      if (action && action !== "ALL") {
        where.action = action;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }

      if (search) {
        where.OR = [
          { details: { contains: search, mode: "insensitive" } },
          { ipAddress: { contains: search, mode: "insensitive" } },
          { user: { fullName: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ];
      }

      const [logs, total, actionStats] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                userId: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.auditLog.count({ where }),
        prisma.auditLog.groupBy({
          by: ["action"],
          _count: { action: true },
        }),
      ]);

      const formattedLogs = logs.map((log) => ({
        logId: log.logId,
        userId: log.userId,
        actorName: log.user?.fullName || "System / Automated",
        actorEmail: log.user?.email,
        actorRole: log.user?.role,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: log.details,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt.toISOString(),
      }));

      res.status(200).json({
        status: "success",
        data: {
          logs: formattedLogs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
          actionStats: actionStats.map((stat) => ({
            action: stat.action,
            count: stat._count.action,
          })),
        },
      });
    } catch (error) {
      console.error("[AuditController.getLogs] Error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve audit logs.",
      });
    }
  }
}
