export interface CellDTO {
  cellId: number;
  name: string;
  code: string;
  description?: string | null;
  headStaffId?: number | null;
  headStaffName?: string | null;
  isActive: boolean;
  coordinatorCount?: number;
  activityCount?: number;
}

export interface CellCoordinatorAssignment {
  cellId: number;
  userId: number;
  assignedOn: string;
}

export interface StaffMemberDTO {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  roleId: number;
  assignedCellId?: number | null;
  assignedCellName?: string | null;
  status: "ACTIVE" | "INVITED" | "INACTIVE" | "ARCHIVED";
  createdAt: string;
  lastLogin?: string | null;
  invitationExpiresAt?: string | null;
}

export interface CellDetailDTO extends CellDTO {
  focus?: string;
  upcomingCount: number;
  approvedRecordsCount: number;
  coordinators: Array<{
    userId: number;
    fullName: string;
    email: string;
    status: string;
    assignedOn: string;
  }>;
}
