import { apiClient } from "./client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export interface VerificationRequestItem {
  alumniId: number;
  referenceId: string;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  program: string;
  graduationYear: number;
  enrollmentNo: string;
  verificationStatus: "PENDING" | "CHANGES_REQUESTED" | "VERIFIED" | "REJECTED";
  verificationNote?: string | null;
  userStatus: string;
  submittedAt: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
}

export interface VerificationQueueStats {
  awaitingReviewCount: number;
  changesRequestedCount: number;
  verifiedCount: number;
  rejectedCount: number;
  inactiveCount: number;
  verifiedThisMonthCount: number;
  oldestPendingDays: number;
}

export interface VerificationQueueResponse {
  requests: VerificationRequestItem[];
  stats: VerificationQueueStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VerificationDetailResponse extends VerificationRequestItem {
  consentGiven: boolean;
  collegeRecord: {
    fullName: string;
    enrollmentNo: string;
    program: string;
    graduationYear: number;
    isMatch: boolean;
    matchNote: string;
  };
}

export const verificationsApi = {
  getQueue: async (params?: {
    status?: string;
    program?: string;
    batch?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<VerificationQueueResponse> => {
    const res = await apiClient.get<{
      status: string;
      data: VerificationQueueResponse;
    }>("/verifications", { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<VerificationDetailResponse> => {
    const res = await apiClient.get<{
      status: string;
      data: VerificationDetailResponse;
    }>(`/verifications/${id}`);
    return res.data.data;
  },

  approve: async (id: number, note?: string): Promise<string> => {
    const res = await apiClient.post<{ message: string }>(`/verifications/${id}/approve`, {
      note,
    });
    return res.data.message;
  },

  requestChanges: async (id: number, message: string): Promise<string> => {
    const res = await apiClient.post<{ message: string }>(
      `/verifications/${id}/request-changes`,
      { message }
    );
    return res.data.message;
  },

  reject: async (id: number, reason: string): Promise<string> => {
    const res = await apiClient.post<{ message: string }>(`/verifications/${id}/reject`, {
      reason,
    });
    return res.data.message;
  },
};

export const VERIFICATIONS_QUERY_KEY = "verifications";

export function useVerificationQueue(params?: {
  status?: string;
  program?: string;
  batch?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [VERIFICATIONS_QUERY_KEY, params],
    queryFn: () => verificationsApi.getQueue(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

