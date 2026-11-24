/**
 * LeaderboardPage.tsx
 * -------------------------------------------------
 * Module 7: Private Internal Staff Leaderboard (Figma Frame 3314:46444)
 *
 * RESTRICTED TO COLLEGE STAFF ONLY (Admins & Coordinators)
 * Shows aggregated alumni contribution points, rank tiering,
 * cell affiliation, and activity breakdown modals.
 * -------------------------------------------------
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useLeaderboard, LeaderboardEntryDTO } from "@/api/awards.api";
import {
  Trophy,
  Award,
  Search,
  Filter,
  Calendar,
  Building2,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  X,
  Star,
  CheckCircle2,
} from "lucide-react";

export const LeaderboardPage: React.FC = () => {
  const [academicYear, setAcademicYear] = useState<string>("2026-27");
  const [selectedCell, setSelectedCell] = useState<string>("ALL");
  const [batchFilter, setBatchFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAlumnus, setSelectedAlumnus] = useState<LeaderboardEntryDTO | null>(null);

  // Check current user role
  let isCoordinator = false;
  try {
    const raw = localStorage.getItem("almalink_user");
    if (raw) {
      const u = JSON.parse(raw);
      isCoordinator = u.role === "CELL_COORDINATOR";
    }
  } catch {}

  const cellIdParam =
    selectedCell === "PLACEMENT"
      ? 1
      : selectedCell === "ENTREPRENEURSHIP"
        ? 2
        : selectedCell === "TECH"
          ? 3
          : undefined;

  const batchParam = batchFilter !== "ALL" ? parseInt(batchFilter, 10) : undefined;

  const { data: leaderboard = [], isLoading } = useLeaderboard({
    academicYear,
    cellId: cellIdParam,
    batch: batchParam,
  });

  // Client-side search filtering
  const filteredList = leaderboard.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.alumniName.toLowerCase().includes(q) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.primaryCellName && item.primaryCellName.toLowerCase().includes(q))
    );
  });

  // KPI Calculations
  const topContributor = leaderboard[0];
  const totalVerifiedPoints = leaderboard.reduce((acc, curr) => acc + curr.totalPoints, 0);
  const activeContributorsCount = leaderboard.length;
  const avgPoints =
    activeContributorsCount > 0 ? Math.round(totalVerifiedPoints / activeContributorsCount) : 0;

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <AdminSidebar activeNav="leaderboard" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          breadcrumbs={[
            {
              label: "Workspace",
              href: isCoordinator ? "/coordinator/dashboard" : "/admin/dashboard",
            },
            { label: "Leaderboard" },
          ]}
        />

        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner & Internal Privacy Notice */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Internal Staff Only — Confidential
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-200">
                    Academic Session {academicYear}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Alumni Contribution Leaderboard
                </h1>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                  Real-time aggregated points earned through verified guest lectures, hackathon
                  judging, student project mentorships, and mock interviews across all IMCC cells.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={isCoordinator ? "/coordinator/awards" : "/admin/awards"}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md hover:shadow-indigo-500/25 shrink-0"
                >
                  <Award className="w-4 h-4" />
                  Annual Awards Voting
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Top Ranked Alumnus
                </span>
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 truncate">
                {topContributor ? topContributor.alumniName : "—"}
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {topContributor ? `${topContributor.totalPoints} Verified Points` : "No points yet"}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total Points Awarded
                </span>
                <Star className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{totalVerifiedPoints}</div>
              <div className="text-xs text-slate-500 mt-1">Across all approved activities</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Active Contributors
                </span>
                <GraduationCap className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{activeContributorsCount}</div>
              <div className="text-xs text-slate-500 mt-1">Participated in AY {academicYear}</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Points</span>
                <Award className="w-5 h-5 text-violet-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{avgPoints} pts</div>
              <div className="text-xs text-slate-500 mt-1">Per active alumnus</div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Cell Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "ALL", label: "All Cells" },
                  { id: "PLACEMENT", label: "Training & Placement" },
                  { id: "ENTREPRENEURSHIP", label: "Entrepreneurship" },
                  { id: "TECH", label: "Tech Club & Coding" },
                ].map((cell) => (
                  <button
                    key={cell.id}
                    onClick={() => setSelectedCell(cell.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCell === cell.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    {cell.label}
                  </button>
                ))}
              </div>

              {/* Right Side Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Academic Year Selector */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Year:</span>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="2026-27">2026-27 (Current)</option>
                    <option value="2025-26">2025-26</option>
                    <option value="2024-25">2024-25</option>
                  </select>
                </div>

                {/* Batch Selector */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span>Batch:</span>
                  <select
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ALL">All Batches</option>
                    <option value="2024">Class of 2024</option>
                    <option value="2023">Class of 2023</option>
                    <option value="2022">Class of 2022</option>
                    <option value="2021">Class of 2021</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alumni by name, email, or affiliated cell..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Official Rankings — Session {academicYear}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Points ledger is immutable and updated post event attendance confirmation.
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                {filteredList.length} Ranked Alumni
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Loading internal leaderboard rankings...
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-medium text-slate-700 text-sm">No alumni records found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No verified participations matched your selected cell, batch, or search filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4 w-16 text-center">Rank</th>
                      <th className="py-3 px-4">Alumnus Information</th>
                      <th className="py-3 px-4">Program & Batch</th>
                      <th className="py-3 px-4">Primary Cell Contribution</th>
                      <th className="py-3 px-4 text-center">Events Attended</th>
                      <th className="py-3 px-4 text-center">Total Verified Points</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredList.map((entry) => {
                      const isTop1 = entry.rank === 1;
                      const isTop2 = entry.rank === 2;
                      const isTop3 = entry.rank === 3;

                      return (
                        <tr
                          key={entry.alumniId}
                          className="hover:bg-indigo-50/40 transition-colors"
                        >
                          {/* Rank Badge */}
                          <td className="py-3 px-4 text-center">
                            {isTop1 ? (
                              <div className="w-7 h-7 mx-auto rounded-full bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center font-bold text-xs shadow-sm">
                                🥇
                              </div>
                            ) : isTop2 ? (
                              <div className="w-7 h-7 mx-auto rounded-full bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center font-bold text-xs">
                                🥈
                              </div>
                            ) : isTop3 ? (
                              <div className="w-7 h-7 mx-auto rounded-full bg-amber-700/10 text-amber-800 border border-amber-700/30 flex items-center justify-center font-bold text-xs">
                                🥉
                              </div>
                            ) : (
                              <span className="font-semibold text-slate-500 text-xs">
                                #{entry.rank}
                              </span>
                            )}
                          </td>

                          {/* Alumnus Name & Email */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 text-sm">
                              {entry.alumniName}
                            </div>
                            <div className="text-slate-400 text-xs">{entry.email}</div>
                          </td>

                          {/* Program & Batch */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-xs">
                              {entry.program} '
                              {entry.graduationYear ? String(entry.graduationYear).slice(-2) : "24"}
                            </span>
                          </td>

                          {/* Primary Cell */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                              <Building2 className="w-3 h-3 text-indigo-500" />
                              {entry.primaryCellName || "General Engagement"}
                            </span>
                          </td>

                          {/* Activities Count */}
                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold text-slate-700">
                              {entry.activitiesCount} sessions
                            </span>
                          </td>

                          {/* Points Badge */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              {entry.totalPoints} pts
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedAlumnus(entry)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-medium rounded-lg text-xs transition-colors"
                            >
                              View Breakdown
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Points Breakdown Modal */}
      {selectedAlumnus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                    Rank #{selectedAlumnus.rank}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedAlumnus.alumniName}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedAlumnus.program} Class of {selectedAlumnus.graduationYear} •{" "}
                  {selectedAlumnus.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedAlumnus(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <div>
                  <span className="text-xs font-medium text-indigo-700">Total Contribution</span>
                  <div className="text-xl font-bold text-indigo-950 mt-0.5">
                    {selectedAlumnus.totalPoints} Points Awarded
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-white text-indigo-600 rounded-lg shadow-xs border border-indigo-200">
                  {selectedAlumnus.activitiesCount} Verified Sessions
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Participated Events & Point Allocations
                </h4>

                <div className="space-y-2">
                  {selectedAlumnus.activities && selectedAlumnus.activities.length > 0 ? (
                    selectedAlumnus.activities.map((act: any, i: number) => (
                      <div
                        key={i}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900">{act.activityTitle}</div>
                          <div className="text-slate-500 flex items-center gap-2">
                            <span>Role: {act.role}</span>
                            <span>•</span>
                            <span>{act.cellName}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            +{act.pointsAwarded} pts
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No individual activities recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Ledger verified by IMCC College Administration
              </span>
              <button
                onClick={() => setSelectedAlumnus(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
