import { apiClient } from "./client";

export interface AlumniListItem {
  alumniId: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  enrollmentNo: string;
  program: string;
  graduationYear: number;
  organization?: string;
  designation?: string;
  industry?: string;
  skills: string[];
  expertise: string[];
  verificationStatus: string;
  totalPoints: number;
  participationsCount: number;
}

export interface AlumniDetail extends AlumniListItem {
  linkedinUrl?: string;
  experienceYears?: number;
  preferredActivities: string[];
  preferredFormat?: string;
  availability?: string;
  areaOfInterest?: string;
  participations: Array<{
    participationId: number;
    activityId: number;
    activityTitle: string;
    activityType: string;
    cellName: string;
    date: string;
    pointsAwarded: number;
    attended: boolean;
    verifiedAt?: string;
  }>;
}

export interface AlumniListResponse {
  status: string;
  data: AlumniListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const alumniDirectoryApi = {
  getAlumniList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    program?: string;
    status?: string;
    graduationYear?: number;
  }): Promise<AlumniListResponse> => {
    const res = await apiClient.get<AlumniListResponse>("/alumni", { params });
    return res.data;
  },

  getAlumniById: async (id: number | string): Promise<{ status: string; data: AlumniDetail }> => {
    const res = await apiClient.get<{ status: string; data: AlumniDetail }>(`/alumni/${id}`);
    return res.data;
  },
};
