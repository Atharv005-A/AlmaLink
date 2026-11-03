import { Role } from "../enums/roles.enum.js";
import { UserStatus } from "../enums/user-status.enum.js";

export interface UserSession {
  userId: number;
  email: string;
  fullName: string;
  role: Role;
  phone?: string | null;
  avatarUrl?: string | null;
  cellId?: number | null;
  status: UserStatus;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: Role;
  cellId?: number | null;
  iat?: number;
  exp?: number;
}

export interface StaffCoordinatorProfile {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  cellId: number;
  cellName: string;
  cellCode: string;
  assignedOn: string;
  status: UserStatus;
}

