/**
 * AttendanceRecordingPage.tsx
 * -------------------------------------------------
 * Figma Reference: 3314:46261
 * Routes: /coordinator/activities/:id/participation, /coordinator/participation, /admin/participation
 *
 * Module 6: Attendance Recording & Contribution Points Engine
 *  - Post-event attendance roster of alumni who accepted the invitation
 *  - Toggle Attendance (Attended / Absent)
 *  - Role confirmation & supporting evidence URL
 *  - Immutable points ledger recording & visual feedback
 * -------------------------------------------------
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Users,
  Calendar,
  MapPin,
  ExternalLink,
  Upload,
  ArrowLeft,
  Loader2,
  Sparkles,
  Search,
  FileCheck2,
} from "lucide-react";

import { useActivity, useActivities } from "@/api/activities.api";
import { useActivityInvitations } from "@/api/invitations.api";
import { useActivityParticipations, useRecordAttendance } from "@/api/participations.api";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { InvitationStatus } from "@almalink/shared";
import { cn } from "@/lib/utils";

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export const AttendanceRecordingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Retrieve user session dynamically for correct workspace scoping
  let user: { role?: string } | null = null;
  try {
    const raw = localStorage.getItem("almalink_user");
    if (raw) user = JSON.parse(raw);
  } catch {}
  const isCoordinator = user
    ? user.role === "CELL_COORDINATOR"
    : window.location.pathname.startsWith("/coordinator");
  const basePath = isCoordinator ? "/coordinator" : "/admin";

  const { data: allActivities = [] } = useActivities();
  const activityId = id ? parseInt(id, 10) : allActivities[0]?.activityId || 106;

  // ── Fetch Activity, Invitations & Participations ──
  const { data: activity } = useActivity(activityId);
  const { data: invitations = [], isLoading: loadingInvitations } =
    useActivityInvitations(activityId);
  const { data: participations = [], isLoading: loadingParticipations } =
    useActivityParticipations(activityId);

  const { mutate: recordAttendance, isPending: isSubmitting } = useRecordAttendance();

  // ── Local Modal State ──
  const [activeModal, setActiveModal] = useState<{
    alumniId: number;
    alumniName: string;
    invitationId?: number;
    initialRole: string;
    initialAttended: boolean;
    initialPoints: number;
    initialEvidenceUrl?: string;
  } | null>(null);

  const [attendedVal, setAttendedVal] = useState<boolean>(true);
  const [roleVal, setRoleVal] = useState<string>("");
  const [pointsVal, setPointsVal] = useState<number>(15);
  const [evidenceUrlVal, setEvidenceUrlVal] = useState<string>("");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Filter confirmed invitees (who RSVP'd ACCEPTED) + existing participations
  const confirmedInvitees = invitations.filter((inv) => inv.status === InvitationStatus.ACCEPTED);

  // Map participation by alumniId for quick lookup
  const participationMap = new Map(participations.map((p) => [p.alumniId, p]));

  // Combine confirmed invitees with any manually added participations
  const rosterItems = confirmedInvitees.map((inv) => {
    const existing = participationMap.get(inv.alumniId);
    const alumniName = inv.alumniName || `Alumnus #${inv.alumniId}`;
    return {
      alumniId: inv.alumniId,
      alumniName,
      alumniEmail: inv.alumniEmail,
      invitationId: inv.invitationId,
      role: existing?.role || inv.expectedRole || "Guest Speaker",
      attended: existing ? existing.attended : false,
      pointsAwarded: existing ? existing.pointsAwarded : activity?.pointsWeight || 15,
      evidenceUrl: existing?.evidenceUrl || "",
      isRecorded: !!existing,
      verifiedAt: existing?.verifiedAt,
    };
  });

  const filteredRoster = rosterItems.filter(
    (item) =>
      item.alumniName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Metrics
  const totalEligible = rosterItems.length;
  const verifiedAttendedCount = rosterItems.filter((r) => r.isRecorded && r.attended).length;
  const totalPointsAwarded = rosterItems.reduce(
    (sum, r) => sum + (r.isRecorded && r.attended ? r.pointsAwarded : 0),
    0
  );

  const handleOpenAttendanceModal = (item: (typeof rosterItems)[0]) => {
    setActiveModal({
      alumniId: item.alumniId,
      alumniName: item.alumniName,
      invitationId: item.invitationId,
      initialRole: item.role,
      initialAttended: item.isRecorded ? item.attended : true,
      initialPoints: item.pointsAwarded,
      initialEvidenceUrl: item.evidenceUrl,
    });
    setAttendedVal(item.isRecorded ? item.attended : true);
    setRoleVal(item.role);
    setPointsVal(item.pointsAwarded);
    setEvidenceUrlVal(item.evidenceUrl || "");
  };

  const handleSaveAttendance = () => {
    if (!activeModal) return;

    recordAttendance(
      {
        activityId,
        alumniId: activeModal.alumniId,
        invitationId: activeModal.invitationId,
        role: roleVal || "Participant",
        attended: attendedVal,
        pointsAwarded: attendedVal ? pointsVal : 0,
        evidenceUrl: evidenceUrlVal || undefined,
        completionStatus: attendedVal ? "COMPLETED" : "ABSENT",
      },
      {
        onSuccess: () => {
          setActiveModal(null);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
      {/* 1. Left Persistent Sidebar */}
      <AdminSidebar activeNav="activities" />

      {/* 2. Right Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          breadcrumbs={[
            { label: "Workspace", href: `${basePath}/dashboard` },
            { label: "Activities", href: `${basePath}/activities` },
            { label: activity?.title || "Attendance Roster" },
          ]}
        />

        <main className="flex-1 space-y-6 pb-20">
          {/* ── Top Header ─────────────────────────────────────────────────── */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`${basePath}/activities`)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-iris">
                      {activity?.categoryName ?? "Event"}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Module 6: Post-Event Attendance
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                    Attendance & Contribution Points
                  </h1>

                  {/* Active Event Dropdown Selector */}
                  {allActivities.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">Select event:</span>
                      <select
                        value={activityId}
                        onChange={(e) =>
                          navigate(`${basePath}/activities/${e.target.value}/participation`)
                        }
                        className="text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-iris/20 cursor-pointer transition-colors"
                      >
                        {allActivities.map((a) => (
                          <option key={a.activityId} value={a.activityId}>
                            {a.title} ({a.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`${basePath}/activities/${activityId}/invitations`)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Users className="h-4 w-4 text-slate-500" />
                  View Invitations Roster
                </button>
              </div>
            </div>

            {/* Event Summary Details */}
            {activity && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {formatDate(activity.startAt)}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {activity.venue}
                </span>
                <span className="flex items-center gap-1.5 text-brand-iris font-semibold">
                  <Award className="h-3.5 w-3.5" />
                  Standard Points: {activity.pointsWeight} pts
                </span>
              </div>
            )}
          </div>

          {/* ── Main Container ─────────────────────────────────────────────── */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Confirmed Invitees
                </span>
                <p className="text-2xl font-bold text-slate-900">{totalEligible}</p>
                <p className="text-xs text-slate-400">Alumni who accepted RSVP</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Verified Attended
                </span>
                <p className="text-2xl font-bold text-emerald-700">
                  {verifiedAttendedCount}
                  <span className="text-xs text-slate-400 font-normal"> / {totalEligible}</span>
                </p>
                <p className="text-xs text-slate-400">Attendance recorded & validated</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-iris">
                  Points Credited
                </span>
                <p className="text-2xl font-bold text-brand-iris">{totalPointsAwarded} pts</p>
                <p className="text-xs text-slate-400">Directly posted to contribution ledger</p>
              </div>
            </div>

            {/* Attendance Roster Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Post-Event Attendance & Verification Roster
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Confirm participation to grant official points toward the MES IMCC Annual Alumni
                    Honors.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by alumnus or role…"
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-iris/20"
                  />
                </div>
              </div>

              {/* Roster List */}
              {loadingInvitations || loadingParticipations ? (
                <div className="py-20 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-iris mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading participation records…</p>
                </div>
              ) : filteredRoster.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <FileCheck2 className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">
                    No confirmed invitees found
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Alumni who accept their event invitations will automatically appear in this
                    attendance roster.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Alumnus</th>
                        <th className="px-4 py-3.5">Assigned Role</th>
                        <th className="px-4 py-3.5">Attendance Status</th>
                        <th className="px-4 py-3.5">Contribution Points</th>
                        <th className="px-4 py-3.5">Evidence</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRoster.map((item) => (
                        <tr key={item.alumniId} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{item.alumniName}</div>
                            {item.alumniEmail && (
                              <div className="text-[11px] text-slate-400">{item.alumniEmail}</div>
                            )}
                          </td>

                          <td className="px-4 py-4 font-medium text-slate-700">{item.role}</td>

                          <td className="px-4 py-4">
                            {item.isRecorded ? (
                              item.attended ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Attended
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <XCircle className="h-3 w-3" />
                                  Absent
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="h-3 w-3" />
                                Awaiting Mark
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {item.isRecorded && item.attended ? (
                              <span className="font-bold text-brand-iris flex items-center gap-1">
                                <Sparkles className="h-3.5 w-3.5" />+{item.pointsAwarded} pts
                              </span>
                            ) : (
                              <span className="text-slate-400">0 pts</span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {item.evidenceUrl ? (
                              <a
                                href={item.evidenceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-iris hover:underline"
                              >
                                View Evidence
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-slate-300">None attached</span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleOpenAttendanceModal(item)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-brand-iris hover:text-white hover:border-brand-iris transition-colors"
                            >
                              {item.isRecorded ? "Edit Record" : "Record Attendance"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Attendance & Points Award Modal ───────────────────────────────── */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-iris">
                Post-Event Verification
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Record Participation for {activeModal.alumniName}
              </h3>
              <p className="text-xs text-slate-500">{activity?.title}</p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Attendance Toggle */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Attendance Confirmation <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAttendedVal(true)}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all",
                      attendedVal
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Attended & Contributed
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendedVal(false)}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all",
                      !attendedVal
                        ? "bg-rose-50 border-rose-500 text-rose-700 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <XCircle className="h-4 w-4 text-rose-600" />
                    Absent / Did Not Attend
                  </button>
                </div>
              </div>

              {attendedVal && (
                <>
                  {/* Contribution Role */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Confirmed Role / Contribution Type
                    </label>
                    <input
                      type="text"
                      value={roleVal}
                      onChange={(e) => setRoleVal(e.target.value)}
                      placeholder="e.g. Keynote Speaker & Hackathon Judge"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-iris/20"
                    />
                  </div>

                  {/* Points Awarded */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Contribution Points to Credit
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Rubric standard: {activity?.pointsWeight || 15} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={pointsVal}
                        onChange={(e) => setPointsVal(parseInt(e.target.value, 10) || 0)}
                        className="w-28 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-brand-iris focus:outline-none focus:ring-2 focus:ring-brand-iris/20"
                      />
                      <span className="text-xs font-semibold text-slate-500">Points</span>
                    </div>
                  </div>

                  {/* Supporting Evidence URL */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Supporting Evidence (Photo, Brochure or Drive Link)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={evidenceUrlVal}
                        onChange={(e) => setEvidenceUrlVal(e.target.value)}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-iris/20"
                      />
                      <Upload className="h-4 w-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand-iris text-white hover:bg-brand-iris/90 shadow-sm transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Save & Credit Points
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
