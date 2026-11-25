import { apiClient } from "./client";

export interface EngagementSummary {
  alumni: {
    total: number;
    verified: number;
    pending: number;
    programBreakdown: Array<{ program: string; count: number }>;
  };
  activities: {
    total: number;
    completed: number;
    totalInvitations: number;
    acceptedInvitations: number;
    acceptanceRate: number;
  };
  engagement: {
    totalPointsAwarded: number;
    totalAttendedParticipations: number;
    cellBreakdown: Array<{
      cellId: number;
      name: string;
      code: string;
      activityCount: number;
      participationCount: number;
      pointsAwarded: number;
    }>;
  };
}

export const reportsApi = {
  getSummary: async (): Promise<{ status: string; data: EngagementSummary }> => {
    const res = await apiClient.get<{ status: string; data: EngagementSummary }>(
      "/reports/summary"
    );
    return res.data;
  },
};
