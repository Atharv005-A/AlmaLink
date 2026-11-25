import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlumniSidebar } from "@/components/layout/AlumniSidebar";
import { notificationsApi } from "@/api/notifications.api";
import { CheckCheck, Clock, CheckCircle2, Info } from "lucide-react";

export const AlumniNotificationsPage: React.FC = () => {
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

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
      <AlumniSidebar activeNav="notifications" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[960px] w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
              <p className="text-sm text-slate-500 mt-1">
                Updates regarding your event invitations, verified participation, and alumni news.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4 text-brand-iris" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Loading your notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500/80 mb-2" />
                <p className="font-semibold text-slate-800">You're all caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No notifications yet.</p>
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
                    <div className="h-8 w-8 rounded-full bg-brand-iris/10 text-brand-iris flex items-center justify-center shrink-0 mt-0.5">
                      <Info className="h-4 w-4" />
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

                      {n.link && (
                        <div className="mt-2">
                          <Link
                            to={n.link}
                            className="text-xs font-semibold text-brand-iris hover:underline"
                          >
                            View details →
                          </Link>
                        </div>
                      )}
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
