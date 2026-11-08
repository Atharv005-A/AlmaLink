/**
 * InvitationTrackingPage.tsx
 * -------------------------------------------------
 * Figma Reference: 3314:46042
 * Route: /coordinator/activities/:id/invitations
 *
 * Per-Activity Invitation Tracking Roster:
 *  - Real-time monitoring of alumni responses (Accepted, Sent, Declined)
 *  - Response notes & availability feedback from alumni
 *  - One-click reminder dispatch for pending invitations
 * -------------------------------------------------
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  BellRing,
  UserPlus,
  Loader2,
  Calendar,
  MapPin,
  ExternalLink,
} from "lucide-react";

import { useActivity } from "@/api/activities.api";
import { useActivityInvitations } from "@/api/invitations.api";
import { InvitationStatus, InvitationDTO } from "@almalink/shared";
import { cn } from "@/lib/utils";

// Format date helper
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export const InvitationTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activityId = parseInt(id || "106", 10);

  // ── Fetch Activity & Invitations ──
  const { data: activity } = useActivity(activityId);
  const { data: invitations = [], isLoading } = useActivityInvitations(activityId);

  // ── Local Filter State ──
  const [filterStatus, setFilterStatus] = useState<InvitationStatus | "ALL">("ALL");
  const [reminderSentMap, setReminderSentMap] = useState<Record<number, boolean>>({});

  // ── Metrics ──
  const totalSent = invitations.length;
  const acceptedCount = invitations.filter((i) => i.status === InvitationStatus.ACCEPTED).length;
  const pendingCount = invitations.filter((i) => i.status === InvitationStatus.SENT).length;
  const declinedCount = invitations.filter((i) => i.status === InvitationStatus.DECLINED).length;
  const responseRate = totalSent > 0 ? Math.round(((acceptedCount + declinedCount) / totalSent) * 100) : 0;

  // ── Filtered List ──
  const filteredList = invitations.filter((inv) => {
    if (filterStatus === "ALL") return true;
    return inv.status === filterStatus;
  });

  const handleSendReminder = (invitationId: number) => {
    setReminderSentMap((prev) => ({ ...prev, [invitationId]: true }));
  };

  // Status Badge Configuration
  const getStatusBadge = (status: InvitationStatus) => {
    switch (status) {
      case InvitationStatus.ACCEPTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Accepted
          </span>
        );
      case InvitationStatus.DECLINED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5" />
            Declined
          </span>
        );
      case InvitationStatus.SENT:
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" />
            Awaiting Response
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/coordinator/activities")}
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
                <span className="text-xs font-semibold text-slate-500">
                  Invitation Tracking Roster
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                {activity?.title ?? "Activity Invitations"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/coordinator/activities/${activityId}/invite`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-iris text-white text-xs sm:text-sm font-semibold hover:bg-brand-iris/90 shadow-sm shadow-brand-iris/30 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              Invite More Alumni
            </button>
          </div>
        </div>

        {/* Event Quick Logistics */}
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
            {activity.meetingLink && (
              <a
                href={activity.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand-iris hover:underline font-medium"
              >
                Virtual Link <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Main Container ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Summary Metric Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Sent</span>
              <Users className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalSent}</p>
            <p className="text-xs text-slate-500">Invited across all channels</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-bold uppercase tracking-wider">Confirmed</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">{acceptedCount}</p>
            <p className="text-xs text-emerald-600 font-medium">Alumni attending</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-bold uppercase tracking-wider">Awaiting</span>
              <Clock className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
            <p className="text-xs text-amber-600 font-medium">Responses pending</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Response Rate</span>
              <span className="text-xs font-bold text-brand-iris">{responseRate}%</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {acceptedCount + declinedCount}/{totalSent}
            </p>
            <p className="text-xs text-slate-500">
              {declinedCount > 0 ? `${declinedCount} declined` : "High response engagement"}
            </p>
          </div>
        </div>

        {/* ── Filter Tabs ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { label: "All Invitations", value: "ALL", count: totalSent },
            { label: "Confirmed (Accepted)", value: InvitationStatus.ACCEPTED, count: acceptedCount },
            { label: "Awaiting Response", value: InvitationStatus.SENT, count: pendingCount },
            { label: "Declined", value: InvitationStatus.DECLINED, count: declinedCount },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setFilterStatus(tab.value as any)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors",
                filterStatus === tab.value
                  ? "bg-brand-iris text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  filterStatus === tab.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-brand-iris mb-2" />
            <span className="text-sm font-medium">Loading invitation roster…</span>
          </div>
        )}

        {/* ── Roster Table (Desktop) ───────────────────────────────────────── */}
        {!isLoading && filteredList.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Alumnus</th>
                  <th className="px-5 py-3.5">Expected Role</th>
                  <th className="px-5 py-3.5">Channels</th>
                  <th className="px-5 py-3.5">Sent Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Response Note</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((invitation: InvitationDTO) => {
                  const reminderSent = reminderSentMap[invitation.invitationId];

                  return (
                    <tr key={invitation.invitationId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Alumnus Name & Email */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{invitation.alumniName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{invitation.alumniEmail}</p>
                      </td>

                      {/* Expected Role */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {invitation.expectedRole}
                        </span>
                      </td>

                      {/* Channels */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {invitation.sentViaEmail && (
                            <span
                              title="Sent via Email (Brevo)"
                              className="p-1 rounded bg-brand-iris/10 text-brand-iris"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </span>
                          )}
                          {invitation.sentViaWhatsapp && (
                            <span
                              title="Sent via WhatsApp"
                              className="p-1 rounded bg-emerald-50 text-emerald-600"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sent Date */}
                      <td className="px-5 py-4 text-xs text-slate-600 font-medium">
                        {formatDate(invitation.sentAt)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">{getStatusBadge(invitation.status)}</td>

                      {/* Response Note */}
                      <td className="px-5 py-4 max-w-[220px]">
                        {invitation.responseNote ? (
                          <div className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-2 italic line-clamp-2">
                            "{invitation.responseNote}"
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No notes yet</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {invitation.status === InvitationStatus.SENT && (
                          <button
                            onClick={() => handleSendReminder(invitation.invitationId)}
                            disabled={reminderSent}
                            className={cn(
                              "inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                              reminderSent
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-brand-iris/10 text-brand-iris hover:bg-brand-iris hover:text-white"
                            )}
                          >
                            <BellRing className="h-3 w-3" />
                            {reminderSent ? "Reminder Sent" : "Send Reminder"}
                          </button>
                        )}
                        {invitation.status === InvitationStatus.ACCEPTED && (
                          <span className="text-xs font-semibold text-emerald-600">Ready for Event</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty Roster State */}
        {!isLoading && filteredList.length === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Users className="h-8 w-8 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No invitations matching this filter</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start by dispatching invitations from the Find & Invite screen.
            </p>
            <button
              onClick={() => navigate(`/coordinator/activities/${activityId}/invite`)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-iris text-white text-xs font-semibold hover:bg-brand-iris/90"
            >
              <UserPlus className="h-4 w-4" />
              Find & Invite Alumni
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
