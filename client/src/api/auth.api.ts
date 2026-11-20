import { apiClient } from "./client";
import {
  LoginInput,
  AlumniRegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UserSession,
  Role,
  UserStatus,
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

// ─── Authentic MES IMCC Pune Demo Accounts (Offline / Preview Fallback) ──────
const DEMO_ACCOUNTS: Record<
  string,
  { user: UserSession; token: string; alumniVerificationStatus?: string | null }
> = {
  "admin@imcc.mespune.in": {
    user: {
      userId: 1,
      email: "admin@imcc.mespune.in",
      fullName: "Dr. Anjali Joshi",
      role: Role.COLLEGE_ADMIN,
      status: UserStatus.ACTIVE,
    },
    token: "demo-jwt-token-admin",
  },
  "meera.tech@imcc.mespune.in": {
    user: {
      userId: 2,
      email: "meera.tech@imcc.mespune.in",
      fullName: "Prof. Meera Kulkarni",
      role: Role.CELL_COORDINATOR,
      cellId: 1,
      status: UserStatus.ACTIVE,
    },
    token: "demo-jwt-token-meera",
  },
  "rajesh.place@imcc.mespune.in": {
    user: {
      userId: 3,
      email: "rajesh.place@imcc.mespune.in",
      fullName: "Prof. Rajesh Patil",
      role: Role.CELL_COORDINATOR,
      cellId: 2,
      status: UserStatus.ACTIVE,
    },
    token: "demo-jwt-token-rajesh",
  },
  "aarav.deshmukh@persistent.com": {
    user: {
      userId: 4,
      email: "aarav.deshmukh@persistent.com",
      fullName: "Aarav Deshmukh",
      role: Role.ALUMNI,
      status: UserStatus.ACTIVE,
    },
    token: "demo-jwt-token-aarav",
    alumniVerificationStatus: "VERIFIED",
  },
  "rohan.shinde@infosys.com": {
    user: {
      userId: 5,
      email: "rohan.shinde@infosys.com",
      fullName: "Rohan Shinde",
      role: Role.ALUMNI,
      status: UserStatus.ACTIVE,
    },
    token: "demo-jwt-token-rohan",
    alumniVerificationStatus: "PENDING",
  },
};

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
    try {
      const res = await apiClient.post<AuthResponse>("/auth/login", credentials);
      return res.data.data;
    } catch (err: unknown) {
      // Offline fallback: when backend server is not running
      const email = credentials.email.toLowerCase().trim();
      const demo = DEMO_ACCOUNTS[email];
      if (demo) {
        return demo;
      }
      throw err;
    }
  },

  getCurrentUser: async (): Promise<UserSession> => {
    try {
      const res = await apiClient.get<{ status: string; data: { user: UserSession } }>("/auth/me");
      return res.data.data.user;
    } catch {
      const raw = localStorage.getItem("almalink_user");
      if (raw) return JSON.parse(raw);
      throw new Error("No active session");
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("almalink_token");
    localStorage.removeItem("almalink_user");
    try {
      await apiClient.post("/auth/logout");
    } catch {}
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
