import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth.api";
import { useActivities } from "@/api/activities.api";
import {
  Calendar,
  Clock,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from "lucide-react";

export const CoordinatorDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  let user: { fullName?: string; email?: string } = {
    fullName: "Prof. Meera Kulkarni",
    email: "meera.tech@imcc.mespune.in",
  };
  try {
    const raw = localStorage.getItem("almalink_user");
    if (raw) user = JSON.parse(raw);
  } catch {}

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    navigate("/login");
  };

  const { data: activities = [] } = useActivities();
  const cellActivities = activities.filter(
    (a) => a.cellName?.toLowerCase().includes("tech") || a.cellId === 1
  );

  const totalInvited = cellActivities.reduce((acc, a) => acc + (a.invitedCount || 0), 0);
  const totalAccepted = cellActivities.reduce((acc, a) => acc + (a.acceptedCount || 0), 0);
  const waitingResponses = Math.max(0, totalInvited - totalAccepted);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#161D2C] text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/coordinator/dashboard" className="flex items-center gap-2">
              <img
                src="/imcc-almalink-logo-white.svg"
                alt="MES IMCC AlmaLink"
                className="h-8 w-auto"
              />
            </Link>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
              TECHNICAL CELL COORDINATOR
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-700/60">
              <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs">
                MK
              </div>
              <div className="text-left text-xs leading-tight">
                <p className="font-semibold text-slate-100">
                  {user.fullName || "Prof. Meera Kulkarni"}
                </p>
                <p className="text-[10px] text-slate-400">Technical Cell Lead</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-slate-800/80 bg-[#121824] hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 py-1 text-xs font-semibold">
              <Link
                to="/coordinator/dashboard"
                className="px-3 py-2 rounded-lg bg-brand-iris text-white shadow-xs"
              >
                Dashboard
              </Link>
              <Link
                to="/coordinator/activities"
                className="px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              >
                Activities
              </Link>
              <Link
                to="/coordinator/activities/create"
                className="px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              >
                Create activity
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb Context */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tracking-wide uppercase">
          <span>Technical Cell</span>
          <span>/</span>
          <span className="text-slate-800">Workspace Dashboard</span>
        </div>

        {/* Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Your Technical cell workspace
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome, {user.fullName || "Prof. Meera Kulkarni"}. Coordinate expertise, not
              spreadsheets.
            </p>
          </div>

          <Link to="/coordinator/activities/create">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-iris text-white font-semibold text-sm shadow-sm hover:bg-brand-iris/90 transition-all">
              <Plus className="h-4 w-4" />
              <span>Create activity</span>
            </button>
          </Link>
        </div>

        {/* Cell Scope Banner */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Assigned cell · Technical:</strong> Activities, invitations, and participation
            records shown here belong to Technical Cell only. High-value scores, corrections, and
            faculty awards go to the college administrator.
          </p>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Upcoming activities</span>
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">
              {cellActivities.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Technical cell only</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Approved participation</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">0</p>
            <p className="text-xs text-slate-500 mt-1">Verified records</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Waiting for responses</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">{waitingResponses}</p>
            <p className="text-xs text-slate-500 mt-1">Open invitations in your cell</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Pending records</span>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">0</p>
            <p className="text-xs text-slate-500 mt-1">Attendance reviews</p>
          </div>
        </div>

        {/* Section 1: Your Next Activities */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Your next activities</h3>
            <Link
              to="/coordinator/activities"
              className="text-xs font-semibold text-brand-iris hover:underline"
            >
              View all activities →
            </Link>
          </div>

          {cellActivities.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                No activities created yet for your cell
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                Click 'Create activity' to schedule your first alumni engagement event.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-4">Activity</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Alumni RSVPs</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-xs">
                  {cellActivities.map((act) => (
                    <tr key={act.activityId}>
                      <td className="py-3 px-4 font-semibold text-slate-900">{act.title}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {act.startAt
                          ? new Date(act.startAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "TBD"}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">
                        {act.acceptedCount || 0} / {act.invitedCount || 0} accepted
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Participation to Review */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Participation to review</h3>
            <span className="text-xs text-slate-500">Technical cell records</span>
          </div>

          <div className="py-8 text-center flex flex-col items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              No participation records to review
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
              Attendance scoring and participation records will appear here after events conclude.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
          <span>
            Normal entries within the rubric can be approved by you for Technical. Contributions
            outside your assigned cell remain hidden.
          </span>
          <span className="text-[11px] text-slate-400 font-medium">MES IMCC Pune · 2026–2027</span>
        </div>
      </main>
    </div>
  );
};

export default CoordinatorDashboardPage;
