import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { reportsApi } from "@/api/reports.api";
import {
  BarChart3,
  Users,
  Calendar,
  Award,
  Download,
  CheckCircle2,
  TrendingUp,
  Building,
} from "lucide-react";

export const ReportsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["reports-summary"],
    queryFn: () => reportsApi.getSummary(),
  });

  const summary = data?.data;

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
      <AdminSidebar activeNav="reports" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Engagement Reports" },
          ]}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1280px] w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                <BarChart3 className="h-4 w-4 text-brand-iris" />
                <span>NAAC & Accreditation Analytics</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Institutional Engagement Reports
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Real-time metrics on alumni participation, cell engagement, and NAAC criteria
                readiness.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/reports/export/csv?type=alumni"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs hover:bg-slate-50 transition-all"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Alumni CSV</span>
              </a>
              <a
                href="/api/reports/export/csv?type=activities"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-iris text-white font-semibold text-xs shadow-xs hover:bg-brand-iris/90 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Activities CSV</span>
              </a>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Loading report aggregates...
            </div>
          ) : !summary ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
              Failed to load engagement report.
            </div>
          ) : (
            <>
              {/* Top Overview Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                    <span>Verified Alumni</span>
                    <Users className="h-4 w-4 text-brand-iris" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">
                    {summary.alumni.verified}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    out of {summary.alumni.total} registered ({summary.alumni.pending} pending)
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                    <span>Events Conducted</span>
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">
                    {summary.activities.completed}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    of {summary.activities.total} total scheduled
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                    <span>Response Rate</span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">
                    {summary.activities.acceptanceRate}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {summary.activities.acceptedInvitations} accepted of{" "}
                    {summary.activities.totalInvitations} invites
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                    <span>Total Points Awarded</span>
                    <Award className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">
                    {summary.engagement.totalPointsAwarded}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    across {summary.engagement.totalAttendedParticipations} verified sessions
                  </p>
                </div>
              </div>

              {/* Cell Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Building className="h-4 w-4 text-brand-iris" />
                    <span>Cell-Wise Performance Distribution</span>
                  </h2>

                  <div className="divide-y divide-slate-100">
                    {summary.engagement.cellBreakdown.map((cell) => (
                      <div
                        key={cell.cellId}
                        className="py-3.5 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{cell.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {cell.activityCount} activities · {cell.participationCount} alumni
                            participations
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {cell.pointsAwarded} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Academic Program Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-iris" />
                    <span>Academic Program Distribution</span>
                  </h2>

                  <div className="space-y-4">
                    {summary.alumni.programBreakdown.map((p) => {
                      const pct = summary.alumni.total
                        ? Math.round((p.count / summary.alumni.total) * 100)
                        : 0;
                      return (
                        <div key={p.program} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{p.program}</span>
                            <span>
                              {p.count} alumni ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-iris rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
