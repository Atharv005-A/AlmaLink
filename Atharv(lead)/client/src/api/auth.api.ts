import { apiClient } from "./client";
import {
  LoginInput,
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
  login: async (credentials: LoginInput): Promise<AuthResponse["data"]> => {
    const res = await apiClient.post<AuthResponse>("/auth/login", credentials);
    return res.data.data;
  },

  getCurrentUser: async (): Promise<UserSession> => {
    const res = await apiClient.get<{ status: string; data: { user: UserSession } }>(
      "/auth/me"
    );
    return res.data.data.user;
  },

  logout: async (): Promise<void> => {
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
};

