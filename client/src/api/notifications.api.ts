import { apiClient } from "./client";

export interface NotificationItem {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getNotifications: async (): Promise<{
    status: string;
    data: NotificationItem[];
    unreadCount: number;
  }> => {
    const res = await apiClient.get<{
      status: string;
      data: NotificationItem[];
      unreadCount: number;
    }>("/notifications");
    return res.data;
  },

  markAsRead: async (id: number): Promise<{ status: string; message: string }> => {
    const res = await apiClient.patch<{ status: string; message: string }>(
      `/notifications/${id}/read`
    );
    return res.data;
  },

  markAllAsRead: async (): Promise<{ status: string; message: string }> => {
    const res = await apiClient.post<{ status: string; message: string }>(
      "/notifications/mark-all-read"
    );
    return res.data;
  },
};
