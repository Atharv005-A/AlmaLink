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
