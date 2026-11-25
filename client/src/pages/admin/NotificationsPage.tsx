import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { notificationsApi } from "@/api/notifications.api";
import { Bell, CheckCheck, Clock, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getNotifications(),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
      <AdminSidebar activeNav="notifications" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Notification Center" },
          ]}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1280px] w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                <Bell className="h-4 w-4 text-brand-iris" />
                <span>Alerts & Activity Updates</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Notification Center
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Stay updated with recent alumni registrations, event responses, and approvals.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4 text-brand-iris" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500/80 mb-2" />
                <p className="font-semibold text-slate-800">You're all caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No new notifications at this time.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div
                    key={n.notificationId}
                    className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                      n.isRead ? "bg-white" : "bg-brand-iris/[0.02]"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {n.type === "WARNING" ? (
                        <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      ) : n.type === "SUCCESS" ? (
                        <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-brand-iris/10 text-brand-iris flex items-center justify-center">
                          <Info className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm ${
                            n.isRead ? "font-medium text-slate-700" : "font-bold text-slate-900"
                          }`}
                        >
                          {n.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>

                      <div className="mt-2 flex items-center gap-3">
                        {n.link && (
                          <Link
                            to={n.link}
                            className="text-xs font-semibold text-brand-iris hover:underline"
                          >
                            View details →
                          </Link>
                        )}
                        {!n.isRead && (
                          <button
                            onClick={() => markReadMutation.mutate(n.notificationId)}
                            className="text-[11px] font-medium text-slate-400 hover:text-slate-600"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
