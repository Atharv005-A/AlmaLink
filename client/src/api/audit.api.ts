import { apiClient } from "./client";

export interface AuditLogItem {
  logId: number;
  action: string;
  entityType: string;
  entityId: number;
  details?: string;
  ipAddress: string;
  createdAt: string;
  user?: {
    userId: number;
    fullName: string;
    email: string;
    role?: string;
  };
}

export interface AuditLogsResponse {
  status: string;
  data: AuditLogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const auditApi = {
  getLogs: async (params?: {
    page?: number;
    limit?: number;
    action?: string;
    search?: string;
  }): Promise<AuditLogsResponse> => {
    const res = await apiClient.get<AuditLogsResponse>("/audit", { params });
    return res.data;
  },
};
