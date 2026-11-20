/**
 * InvitationsHubPage.tsx
 * -------------------------------------------------
 * Figma Reference: 3314:47466
 * Route: /alumni/invitations
 *
 * Alumni Portal: Invitations Hub
 *  - Alumni review incoming event invitations from MES IMCC college cells
 *  - Accept or Decline with personalized availability notes
 *  - View contribution points, venue logistics, and Google Meet links
 *  - Strict privacy protection: only the logged-in alumnus sees their invites
 * -------------------------------------------------
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Shield,
  Loader2,
  Inbox,
} from "lucide-react";

import { useAlumniInvitations, useRsvpInvitation } from "@/api/invitations.api";
import { InvitationStatus, InvitationDTO } from "@almalink/shared";
import { cn } from "@/lib/utils";

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export const InvitationsHubPage: React.FC = () => {
  const navigate = useNavigate();

  let storedUser: { id?: number; fullName?: string; email?: string } = {};
  try {
    const raw = localStorage.getItem("almalink_user");
    if (raw) storedUser = JSON.parse(raw);
  } catch {}

  const alumnus = {
    alumniId: storedUser.id || 1,
    fullName: storedUser.fullName || "Alumnus",
    program: "MCA",
    graduationYear: 2024,
    organization: "IMCC Alumnus",
    designation: "Member",
  };

  // ── Fetch Invitations ──
  const { data: invitations = [], isLoading } = useAlumniInvitations(alumnus.alumniId);
  const { mutate: submitRsvp, isPending: isSubmittingRsvp } = useRsvpInvitation();

  // ── UI Filter State ──
  const [filter, setFilter] = useState<InvitationStatus | "ALL">("ALL");

  // State for RSVP inline note modals / popups
  const [activeRsvpModal, setActiveRsvpModal] = useState<{
    invitation: InvitationDTO;
    action: InvitationStatus.ACCEPTED | InvitationStatus.DECLINED;
  } | null>(null);
  const [rsvpNote, setRsvpNote] = useState("");

  // ── Metrics ──
  const pendingCount = invitations.filter((i) => i.status === InvitationStatus.SENT).length;
  const acceptedCount = invitations.filter((i) => i.status === InvitationStatus.ACCEPTED).length;
  const declinedCount = invitations.filter((i) => i.status === InvitationStatus.DECLINED).length;

  const filteredInvitations = invitations.filter((inv) => {
    if (filter === "ALL") return true;
    return inv.status === filter;
  });

  const handleOpenRsvp = (
    invitation: InvitationDTO,
    action: InvitationStatus.ACCEPTED | InvitationStatus.DECLINED
  ) => {
    setActiveRsvpModal({ invitation, action });
    setRsvpNote(
      action === InvitationStatus.ACCEPTED
        ? "Glad to join in-person at IMCC campus!"
        : "Sorry, I have a prior professional commitment."
    );
  };

  const handleConfirmRsvp = () => {
    if (!activeRsvpModal) return;

    submitRsvp(
      {
        invitationId: activeRsvpModal.invitation.invitationId,
        payload: {
          status: activeRsvpModal.action,
          responseNote: rsvpNote,
        },
      },
      {
        onSuccess: () => {
          setActiveRsvpModal(null);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ── Top Navigation / Identity Header ─────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-iris">
                Alumni Portal
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Shield className="h-3 w-3" />
                Verified Alumnus
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Invitations & Campus Requests
            </h1>
            <p className="text-xs text-slate-500">
              Welcome back, <span className="font-semibold text-slate-800">{alumnus.fullName}</span>{" "}
              ({alumnus.program} Class of {alumnus.graduationYear} · {alumnus.organization})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/coordinator/activities")}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Switch to Coordinator View
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Container ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Privacy & Impact Notice */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-iris/10 via-brand-iris/5 to-transparent border border-brand-iris/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-iris text-white flex items-center justify-center shrink-0 shadow-sm shadow-brand-iris/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Give back to your Alma Mater & Earn Contribution Points
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Every session you conduct or judge earns official points towards the Annual MES IMCC
                Alumni of the Year Honors.
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-xs text-slate-500">Pending Requests</span>
            <p className="text-xl font-bold text-brand-iris">{pendingCount} Action Required</p>
          </div>
        </div>

        {/* ── Filter Tabs ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          {[
            { label: "All Invitations", value: "ALL", count: invitations.length },
            { label: "Action Required", value: InvitationStatus.SENT, count: pendingCount },
            {
              label: "Accepted & Confirmed",
              value: InvitationStatus.ACCEPTED,
              count: acceptedCount,
            },
            { label: "Declined", value: InvitationStatus.DECLINED, count: declinedCount },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setFilter(tab.value as any)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap",
                filter === tab.value
                  ? "bg-brand-iris text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  filter === tab.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
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
            <span className="text-sm font-medium">Loading your invitations…</span>
          </div>
        )}

        {/* ── Invitations Cards Stack ─────────────────────────────────────── */}
        {!isLoading && filteredInvitations.length > 0 && (
          <div className="space-y-4">
            {filteredInvitations.map((invitation: InvitationDTO) => {
              const isPending = invitation.status === InvitationStatus.SENT;
              const isAccepted = invitation.status === InvitationStatus.ACCEPTED;
              const isDeclined = invitation.status === InvitationStatus.DECLINED;

              return (
                <div
                  key={invitation.invitationId}
                  className={cn(
                    "bg-white rounded-2xl border p-5 sm:p-6 space-y-4 transition-all shadow-sm",
                    isPending
                      ? "border-amber-200 ring-2 ring-amber-100 bg-amber-50/[0.02]"
                      : isAccepted
                        ? "border-emerald-200"
                        : "border-slate-200 opacity-80"
                  )}
                >
                  {/* Top Bar: Cell Name + Status Badge + Points */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-iris bg-brand-iris/10 px-2.5 py-1 rounded-md">
                        {invitation.cellName ?? "College Cell"}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Invited as:{" "}
                        <span className="text-slate-800 font-bold">{invitation.expectedRole}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <Clock className="h-3.5 w-3.5" />
                          RSVP by {invitation.responseDeadline}
                        </span>
                      )}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Attendance Confirmed
                        </span>
                      )}
                      {isDeclined && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                          <XCircle className="h-3.5 w-3.5" />
                          Declined
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-iris bg-brand-iris/5 px-2.5 py-1 rounded-full border border-brand-iris/20">
                        <Award className="h-3.5 w-3.5" />
                        +20 Points
                      </span>
                    </div>
                  </div>

                  {/* Title & Logistics */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {invitation.activityTitle}
                    </h3>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(invitation.sentAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        MES IMCC Seminar Hall & Labs, Pune
                      </span>
                    </div>
                  </div>

                  {/* Response Note (if already responded) */}
                  {invitation.responseNote && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <span className="font-semibold text-slate-500 block mb-0.5">
                        Your Response Note:
                      </span>
                      <p className="italic">"{invitation.responseNote}"</p>
                    </div>
                  )}

                  {/* Action Buttons for Pending Invitation */}
                  {isPending && (
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                      <button
                        onClick={() => handleOpenRsvp(invitation, InvitationStatus.DECLINED)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleOpenRsvp(invitation, InvitationStatus.ACCEPTED)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-brand-iris text-white text-xs font-bold hover:bg-brand-iris/90 shadow-sm shadow-brand-iris/30 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Accept Invitation
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredInvitations.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">
              No invitations matching this filter
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are all caught up! New requests from MES IMCC coordinators will appear here and in
              your WhatsApp/Email.
            </p>
          </div>
        )}
      </div>

      {/* ── RSVP Confirmation Modal ────────────────────────────────────────── */}
      {activeRsvpModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveRsvpModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  activeRsvpModal.action === InvitationStatus.ACCEPTED
                    ? "text-emerald-700"
                    : "text-rose-700"
                )}
              >
                {activeRsvpModal.action === InvitationStatus.ACCEPTED
                  ? "Confirm Attendance"
                  : "Decline Invitation"}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {activeRsvpModal.invitation.activityTitle}
              </h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Message to College Coordinator (Optional)
              </label>
              <textarea
                rows={3}
                value={rsvpNote}
                onChange={(e) => setRsvpNote(e.target.value)}
                placeholder="Add a note regarding your schedule or topic focus…"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-iris/30 focus:border-brand-iris resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveRsvpModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRsvp}
                disabled={isSubmittingRsvp}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white shadow-sm",
                  activeRsvpModal.action === InvitationStatus.ACCEPTED
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                )}
              >
                {isSubmittingRsvp ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Submit Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
