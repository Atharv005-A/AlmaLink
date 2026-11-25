import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export class NotificationController {
  /**
   * GET /api/notifications
   */
  static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ status: "fail", message: "Not authenticated" });
        return;
      }

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
      });

      res.status(200).json({
        status: "success",
        data: notifications,
        unreadCount,
      });
    } catch (err: unknown) {
      console.error("[GET NOTIFICATIONS ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to fetch notifications." });
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const notificationId = parseInt(req.params.id, 10);

      await prisma.notification.updateMany({
        where: { notificationId, userId },
        data: { isRead: true },
      });

      res.status(200).json({ status: "success", message: "Marked as read." });
    } catch (err: unknown) {
      console.error("[MARK NOTIFICATION READ ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to mark notification as read." });
    }
  }

  /**
   * POST /api/notifications/mark-all-read
   */
  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ status: "fail", message: "Not authenticated" });
        return;
      }

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      res.status(200).json({ status: "success", message: "All notifications marked as read." });
    } catch (err: unknown) {
      console.error("[MARK ALL READ ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to mark all as read." });
    }
  }
}
