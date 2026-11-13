import { apiClient } from "./client";
import {
  LoginInput,
  AlumniRegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UserSession,
} from "@almalink/shared";

interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: UserSession;
    token: string;
    alumniVerificationStatus?: string | null;
  };
}

export const authApi = {
  registerAlumni: async (
    data: AlumniRegisterInput
  ): Promise<{
    referenceId: string;
    fullName: string;
    email: string;
    program: string;
    graduationYear: number;
    submittedAt: string;
  }> => {
    const res = await apiClient.post<{
      status: string;
      message: string;
      data: {
        referenceId: string;
        fullName: string;
        email: string;
        program: string;
        graduationYear: number;
        submittedAt: string;
      };
    }>("/auth/register", data);
    return res.data.data;
  },

  checkRegistrationStatus: async (params: {
    referenceId?: string;
    email?: string;
  }): Promise<{
    referenceId: string;
    fullName: string;
    email: string;
    program: string;
    graduationYear: number;
    verificationStatus: string;
    verificationNote?: string | null;
    isVerified: boolean;
  }> => {
    const res = await apiClient.get<{
      status: string;
      data: {
        referenceId: string;
        fullName: string;
        email: string;
        program: string;
        graduationYear: number;
        verificationStatus: string;
        verificationNote?: string | null;
        isVerified: boolean;
      };
    }>("/auth/registration-status", { params });
    return res.data.data;
  },

  login: async (credentials: LoginInput): Promise<AuthResponse["data"]> => {
    const res = await apiClient.post<AuthResponse>("/auth/login", credentials);
    return res.data.data;
  },

  getCurrentUser: async (): Promise<UserSession> => {
    const res = await apiClient.get<{ status: string; data: { user: UserSession } }>("/auth/me");
    return res.data.data.user;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("almalink_token");
    localStorage.removeItem("almalink_user");
    await apiClient.post("/auth/logout");
  },

  forgotPassword: async (data: ForgotPasswordInput): Promise<string> => {
    const res = await apiClient.post<{ message: string }>("/auth/forgot-password", data);
    return res.data.message;
  },

  resetPassword: async (data: ResetPasswordInput): Promise<string> => {
    const res = await apiClient.post<{ message: string }>("/auth/reset-password", data);
    return res.data.message;
  },

  verifyInvitation: async (
    token: string
  ): Promise<{
    fullName: string;
    email: string;
    role: string;
    assignedCell: string;
    cellCode: string;
  }> => {
    const res = await apiClient.get<{
      status: string;
      data: {
        fullName: string;
        email: string;
        role: string;
        assignedCell: string;
        cellCode: string;
      };
    }>(`/auth/invitation/${token}`);
    return res.data.data;
  },
};
