import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export class AuditController {
  /**
   * GET /api/audit
   * Query params: page, limit, action, search
   */
  static async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const action = req.query.action as string | undefined;
      const search = req.query.search as string | undefined;

      const where: any = {};
      if (action && action !== "ALL") {
        where.action = action;
      }
      if (search) {
        where.OR = [
          { action: { contains: search, mode: "insensitive" } },
          { entityType: { contains: search, mode: "insensitive" } },
          { details: { contains: search, mode: "insensitive" } },
          { user: { fullName: { contains: search, mode: "insensitive" } } },
        ];
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                userId: true,
                fullName: true,
                email: true,
                role: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.auditLog.count({ where }),
      ]);

      res.status(200).json({
        status: "success",
        data: logs.map((l) => ({
          logId: l.logId,
          action: l.action,
          entityType: l.entityType,
          entityId: l.entityId,
          details: l.details,
          ipAddress: l.ipAddress,
          createdAt: l.createdAt,
          user: l.user
            ? {
                userId: l.user.userId,
                fullName: l.user.fullName,
                email: l.user.email,
                role: l.user.role?.name,
              }
            : null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err: unknown) {
      console.error("[AUDIT GET LOGS ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to fetch audit logs." });
    }
  }
}
