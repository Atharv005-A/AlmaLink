import { apiClient } from "./client";
import { useQuery } from "@tanstack/react-query";
import { AuditLogDTO } from "@almalink/shared";

export interface AuditLogsQueryParams {
  page?: number;
  limit?: number;
  action?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogsResponse {
  logs: (AuditLogDTO & {
    actorRole?: string;
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  actionStats: {
    action: string;
    count: number;
  }[];
}

export const auditApi = {
  getLogs: async (params?: AuditLogsQueryParams): Promise<AuditLogsResponse> => {
    const res = await apiClient.get<{ status: string; data: AuditLogsResponse }>("/audit-logs", {
      params,
    });
    return res.data.data;
  },
};

export const useAuditLogs = (params?: AuditLogsQueryParams) => {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => auditApi.getLogs(params),
    staleTime: 30_000,
  });
};
