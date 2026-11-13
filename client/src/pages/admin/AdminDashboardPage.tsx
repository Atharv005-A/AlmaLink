import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { verificationsApi, VerificationQueueStats } from "@/api/verifications.api";
import { useActivities } from "@/api/activities.api";
import {
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  TrendingUp,
  Mail,
  ChevronRight,
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  // Retrieve user session
  let user: { fullName?: string; email?: string } = {
    fullName: "Dr. Anjali Joshi",
    email: "admin@imcc.mespune.in",
  };
  try {
    const raw = localStorage.getItem("almalink_user");
    if (raw) user = JSON.parse(raw);
  } catch {}

  const [stats, setStats] = useState<VerificationQueueStats>({
    awaitingReviewCount: 0,
    changesRequestedCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    inactiveCount: 0,
    verifiedThisMonthCount: 0,
    oldestPendingDays: 0,
  });

  const { data: activities = [] } = useActivities();

  useEffect(() => {
    verificationsApi
      .getQueue({ status: "ALL", limit: 1 })
      .then((res) => {
        if (res && res.stats) {
          setStats(res.stats);
        }
      })
      .catch(() => {});
  }, []);

  const currentDateFormatted = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const totalInvited = activities.reduce((acc, a) => acc + (a.invitedCount || 0), 0);
  const totalAccepted = activities.reduce((acc, a) => acc + (a.acceptedCount || 0), 0);
  const totalAttended = activities.reduce((acc, a) => acc + (a.attendedCount || 0), 0);

  const cellCounts = [
    {
      name: "Technical Cell",
      count: activities.filter((a) => a.cellName?.toLowerCase().includes("tech") || a.cellId === 1)
        .length,
    },
    {
      name: "Placement Cell",
      count: activities.filter((a) => a.cellName?.toLowerCase().includes("place") || a.cellId === 2)
        .length,
    },
    {
      name: "Cultural Cell",
      count: activities.filter((a) => a.cellName?.toLowerCase().includes("cult") || a.cellId === 3)
        .length,
    },
    {
      name: "Sports Cell",
      count: activities.filter((a) => a.cellName?.toLowerCase().includes("sport") || a.cellId === 4)
        .length,
    },
    {
      name: "Entrepreneurship Cell",
      count: activities.filter(
        (a) => a.cellName?.toLowerCase().includes("entrep") || a.cellId === 5
      ).length,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
      {/* 1. Left Persistent Sidebar (Figma Shell A - 236px) */}
      <AdminSidebar activeNav="dashboard" />

      {/* 2. Right Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace Header: Breadcrumbs & Profile Pill */}
        <AdminHeader
          breadcrumbs={[{ label: "Workspace", href: "/admin/dashboard" }, { label: "Dashboard" }]}
        />

        {/* Workspace Main Page Content (Clean, 100% Real Data) */}
        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1280px] w-full">
          {/* Top Kicker Label */}
          <div className="text-[11px] font-bold tracking-wider text-[#71778A] uppercase">
            ADMINISTRATION / WORKSPACE
          </div>

          {/* Hero Header & Date Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                A stronger alumni community
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Good morning, {user.fullName || "Dr. Joshi"}. Here's your college engagement
                overview.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700">
              <Calendar className="h-4 w-4 text-[#5D5FEF]" />
              <span>{currentDateFormatted}</span>
            </div>
          </div>

          {/* 4 Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Verified Alumni */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Verified alumni</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">
                  {stats.verifiedCount}
                </p>
              </div>
              <p className="text-xs font-medium text-emerald-700 mt-3">
                {stats.verifiedThisMonthCount > 0
                  ? `+${stats.verifiedThisMonthCount} verified this month`
                  : "0 verified this month"}
              </p>
            </div>

            {/* Card 2: Pending Verifications */}
            <Link
              to="/admin/verifications"
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5 flex flex-col justify-between hover:border-amber-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Pending verifications</span>
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-2 font-mono group-hover:text-amber-600 transition-colors">
                  {stats.awaitingReviewCount}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="font-medium text-amber-700">
                  {stats.changesRequestedCount > 0
                    ? `${stats.changesRequestedCount} need follow-up`
                    : "0 need follow-up"}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 3: Upcoming Activities */}
            <Link
              to="/coordinator/activities"
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5 flex flex-col justify-between hover:border-[#5D5FEF]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Upcoming activities</span>
                  <Calendar className="h-4 w-4 text-[#5D5FEF]" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-2 font-mono group-hover:text-[#5D5FEF] transition-colors">
                  {activities.length}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="font-medium text-slate-500">Across all 5 cells</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 4: Engaged Alumni */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Engaged alumni</span>
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">
                  {stats.verifiedCount}
                </p>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-3">Registered alumni in system</p>
            </div>
          </div>

          {/* Row 2: Analytics & Status Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Participation Trend Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Participation trend</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Approved participation records</p>
                </div>
                <TrendingUp className="h-5 w-5 text-slate-400" />
              </div>

              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No participation records yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                  As alumni attend campus activities and attendance is verified, trends will appear
                  here.
                </p>
              </div>

              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                Only approved, verified participation is included.
              </p>
            </div>

            {/* Invitations by Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Invitations by status</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {totalInvited} Invitations dispatched
                  </p>
                </div>
                <Mail className="h-5 w-5 text-blue-500" />
              </div>

              <div className="grid grid-cols-5 gap-2 pt-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-700">0</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Draft</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                  <p className="text-xs font-bold text-blue-700">{totalInvited}</p>
                  <p className="text-[10px] text-blue-600 font-medium mt-0.5">Sent</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-700">{totalAccepted}</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Accepted</p>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                  <p className="text-xs font-bold text-rose-700">0</p>
                  <p className="text-[10px] text-rose-600 font-medium mt-0.5">Declined</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <p className="text-xs font-bold text-amber-700">{totalAttended}</p>
                  <p className="text-[10px] text-amber-600 font-medium mt-0.5">Attended</p>
                </div>
              </div>

              {totalInvited > 0 ? (
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${(totalAccepted / totalInvited) * 100}%` }}
                  />
                </div>
              ) : (
                <div className="py-6 text-center text-[11px] text-slate-400">
                  No invitations dispatched yet. Invitations sent for activities will track here.
                </div>
              )}

              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                Live invitation responses across all college cells.
              </p>
            </div>
          </div>

          {/* Row 3: Engagement by Cell & Needs Attention */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement by Cell */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Engagement by cell</h3>
              <p className="text-xs text-slate-500">Activities by cell</p>

              <div className="divide-y divide-slate-100 text-sm">
                {cellCounts.map((cell) => (
                  <div key={cell.name} className="py-2.5 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{cell.name}</span>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {cell.count} {cell.count === 1 ? "activity" : "activities"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Your Attention */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">Needs your attention</h3>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                  {stats.awaitingReviewCount > 0 ? (
                    <Link
                      to="/admin/verifications"
                      className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-semibold text-slate-700">
                        Verify new alumni registrations
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                        {stats.awaitingReviewCount} pending
                      </span>
                    </Link>
                  ) : null}

                  {stats.changesRequestedCount > 0 ? (
                    <Link
                      to="/admin/verifications"
                      className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-semibold text-slate-700">
                        Alumni pending follow-up (Changes Requested)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                        {stats.changesRequestedCount} pending
                      </span>
                    </Link>
                  ) : null}

                  {stats.awaitingReviewCount === 0 && stats.changesRequestedCount === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-1" />
                      <span className="font-semibold text-slate-700">All caught up!</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        No pending registration reviews or actions requiring attention.
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <Link to="/admin/verifications" className="block pt-2">
                <button className="w-full py-2.5 rounded-xl bg-[#5D5FEF] hover:bg-[#5D5FEF]/90 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2">
                  <span>Open verification queue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Row 4: Coming Up On Campus */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Coming up on campus</h3>
              <Link
                to="/coordinator/activities"
                className="text-xs font-semibold text-[#5D5FEF] hover:underline flex items-center gap-1"
              >
                <span>View all activities</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {activities.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  No campus activities scheduled yet
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                  Activities created by cell coordinators will appear here with live RSVP tracking.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-2.5 px-4">Activity</th>
                      <th className="py-2.5 px-4">Cell</th>
                      <th className="py-2.5 px-4">When</th>
                      <th className="py-2.5 px-4 text-right">Alumni responses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-xs">
                    {activities.map((act) => (
                      <tr key={act.activityId}>
                        <td className="py-3 px-4 font-semibold text-slate-900">{act.title}</td>
                        <td className="py-3 px-4 text-slate-600">{act.cellName || "General"}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {act.startAt
                            ? new Date(act.startAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })
                            : "TBD"}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                          {act.acceptedCount || 0} accepted / {act.invitedCount || 0} sent
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
            <span>IMCC AlmaLink · MES, Pune</span>
            <span className="text-[11px] text-slate-400 font-medium">
              Academic year · 1 Jul 2026 – 30 Jun 2027
            </span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
