import { apiClient } from "./client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AlumniProfileData {
  alumniId: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  enrollmentNo: string;
  program: string;
  graduationYear: number;
  organization?: string | null;
  designation?: string | null;
  industry?: string | null;
  linkedinUrl?: string | null;
  experienceYears?: number | null;
  skills: string[];
  expertise: string[];
  preferredActivities: string[];
  preferredFormat?: string | null;
  availability?: string | null;
  areaOfInterest?: string | null;
  willingToParticipate: boolean;
  profileCompleted: boolean;
  verificationStatus: string;
}

export interface AlumniDashboardData {
  fullName: string;
  program: string;
  graduationYear: number;
  verificationStatus: string;
  approvedContributions: number;
  approvedPoints: number;
  pendingCount: number;
  nextCampusVisit: {
    activityId: number;
    title: string;
    cellName: string;
    categoryName: string;
    startAt: string;
    endAt: string;
    venue: string;
    coordinatorName: string;
  } | null;
  waitingInvitation: {
    invitationId: number;
    activityId: number;
    title: string;
    cellName: string;
    categoryName: string;
    startAt: string;
    responseDeadline: string;
    expectedRole: string;
  } | null;
  contributionHistory: Array<{
    participationId: number;
    date: string;
    activityTitle: string;
    cellName: string;
    categoryName: string;
    points: number;
    status: string;
  }>;
  pendingRecords: Array<{
    invitationId: number;
    date: string;
    activityTitle: string;
    cellName: string;
    categoryName: string;
    points: number;
    status: string;
  }>;
}

export const ALUMNI_PROFILE_QUERY_KEY = ["alumni", "profile"];
export const ALUMNI_DASHBOARD_QUERY_KEY = ["alumni", "dashboard"];

export const alumniApi = {
  getProfile: async (): Promise<AlumniProfileData> => {
    const res = await apiClient.get<{ status: string; data: AlumniProfileData }>("/alumni/profile");
    return res.data.data;
  },

  updateProfile: async (payload: Partial<AlumniProfileData>): Promise<AlumniProfileData> => {
    const res = await apiClient.patch<{ status: string; message: string; data: AlumniProfileData }>(
      "/alumni/profile",
      payload
    );
    return res.data.data;
  },

  getDashboard: async (): Promise<AlumniDashboardData> => {
    const res = await apiClient.get<{ status: string; data: AlumniDashboardData }>(
      "/alumni/dashboard"
    );
    return res.data.data;
  },
};

export const useAlumniProfile = () => {
  return useQuery({
    queryKey: ALUMNI_PROFILE_QUERY_KEY,
    queryFn: alumniApi.getProfile,
    staleTime: 60_000,
  });
};

export const useUpdateAlumniProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: alumniApi.updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(ALUMNI_PROFILE_QUERY_KEY, updated);
      queryClient.invalidateQueries({ queryKey: ALUMNI_DASHBOARD_QUERY_KEY });
      // Update local storage user if name/phone changed
      try {
        const raw = localStorage.getItem("almalink_user");
        if (raw) {
          const user = JSON.parse(raw);
          user.fullName = updated.fullName;
          user.phone = updated.phone;
          localStorage.setItem("almalink_user", JSON.stringify(user));
        }
      } catch {}
    },
  });
};

export const useAlumniDashboard = () => {
  return useQuery({
    queryKey: ALUMNI_DASHBOARD_QUERY_KEY,
    queryFn: alumniApi.getDashboard,
    staleTime: 30_000,
  });
};
