import { apiClient } from "./client";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CellDetailDTO, StaffMemberDTO, CreateCellInput, InviteStaffInput } from "@almalink/shared";

export type CellItem = CellDetailDTO;
export type StaffItem = StaffMemberDTO;

export interface StaffFilterParams {
  search?: string;
  role?: string;
  cell?: string;
  status?: string;
}

export const staffCellsApi = {
  getCells: async (): Promise<CellItem[]> => {
    const res = await apiClient.get<{ success: boolean; data: CellItem[] }>("/staff-cells/cells");
    return res.data.data;
  },

  createCell: async (payload: CreateCellInput): Promise<CellItem> => {
    const res = await apiClient.post<{ success: boolean; data: CellItem }>(
      "/staff-cells/cells",
      payload
    );
    return res.data.data;
  },

  toggleCell: async (cellId: number): Promise<void> => {
    await apiClient.patch(`/staff-cells/cells/${cellId}/toggle`);
  },

  assignCoordinator: async (cellId: number, userId: number): Promise<void> => {
    await apiClient.patch(`/staff-cells/cells/${cellId}/assign`, { userId });
  },

  getStaff: async (params?: StaffFilterParams): Promise<StaffItem[]> => {
    const res = await apiClient.get<{ success: boolean; data: StaffItem[] }>("/staff-cells/staff", {
      params,
    });
    return res.data.data;
  },

  inviteStaff: async (
    payload: InviteStaffInput
  ): Promise<{
    userId: number;
    fullName: string;
    email: string;
    assignedCell: string;
    invitationLink: string;
  }> => {
    const res = await apiClient.post<{
      success: boolean;
      data: {
        userId: number;
        fullName: string;
        email: string;
        assignedCell: string;
        invitationLink: string;
      };
    }>("/staff-cells/staff/invite", payload);
    return res.data.data;
  },

  updateStaffStatus: async (
    userId: number,
    status: "ACTIVE" | "INACTIVE" | "ARCHIVED"
  ): Promise<void> => {
    await apiClient.patch(`/staff-cells/staff/${userId}/status`, { status });
  },

  resendInvite: async (userId: number): Promise<{ invitationLink: string }> => {
    const res = await apiClient.post<{
      success: boolean;
      data: { invitationLink: string };
    }>(`/staff-cells/staff/${userId}/resend`);
    return res.data.data;
  },
};

// ==========================================
// TanStack Query Hooks
// ==========================================

export const useCells = () => {
  return useQuery({
    queryKey: ["cells"],
    queryFn: staffCellsApi.getCells,
    staleTime: 60_000,
  });
};

export const useStaffList = (params?: StaffFilterParams) => {
  return useQuery({
    queryKey: ["staff", params],
    queryFn: () => staffCellsApi.getStaff(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useCreateCell = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffCellsApi.createCell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useToggleCell = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffCellsApi.toggleCell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cells"] });
    },
  });
};

export const useAssignCoordinator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cellId, userId }: { cellId: number; userId: number }) =>
      staffCellsApi.assignCoordinator(cellId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useInviteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffCellsApi.inviteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["cells"] });
    },
  });
};

export const useUpdateStaffStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: number;
      status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
    }) => staffCellsApi.updateStaffStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["cells"] });
    },
  });
};

export const useResendInvite = () => {
  return useMutation({
    mutationFn: (userId: number) => staffCellsApi.resendInvite(userId),
  });
};
