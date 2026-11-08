import { AuditAction } from "../enums/audit-action.enum.js";

export interface AuditLogDTO {
  logId: number;
  userId: number;
  actorName?: string;
  actorEmail?: string;
  action: AuditAction;
  entityType: string;
  entityId: number;
  details?: string | null;
  ipAddress: string;
  createdAt: string;
}

export interface NotificationDTO {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

