/**
 * FindAndInvitePage.tsx
 * -------------------------------------------------
 * Figma Reference: 3314:45957
 * Route: /coordinator/activities/:id/invite
 *
 * Smart Tag-Based Matchmaking Screen:
 *  - Calculates tag intersection between Event Requirements and Alumni Skills
 *  - Ranks alumni descending by Match % (e.g. 100% Match ⭐, 75% Match)
 *  - 1-Click "Select All High Matches"
 *  - Multi-channel dispatch popup (Brevo Email + WhatsApp)
 * -------------------------------------------------
 */

import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Send,
  Calendar,
  MapPin,
  Mail,
  MessageSquare,
  Award,
  Users,
  X,
  Loader2,
} from "lucide-react";

import { useActivity } from "@/api/activities.api";
import { useMatchmaking, useDispatchInvitations, IMCC_DEMO_ALUMNI } from "@/api/invitations.api";
import { ActivityMatchScore } from "@almalink/shared";
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

export const FindAndInvitePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activityId = parseInt(id || "106", 10);

  // ── Fetch current activity & matchmaking list ──
  const { data: activity } = useActivity(activityId);
  const { data: matches = [], isLoading } = useMatchmaking(activityId);

  // ── Local UI State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [minMatchFilter, setMinMatchFilter] = useState<number>(0);
  const [selectedAlumniIds, setSelectedAlumniIds] = useState<number[]>([]);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  // Dispatch form fields
  const [expectedRole, setExpectedRole] = useState("Keynote Speaker & Industry Mentor");
  const [responseDeadline, setResponseDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [customMessage, setCustomMessage] = useState(
    "We are delighted to invite you back to MES IMCC Pune to share your valuable industry insights with our MCA students."
  );
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsapp, setSendWhatsapp] = useState(true);

  const { mutate: dispatchInvites, isPending: isDispatching } = useDispatchInvitations();

  // ── Filter and Search Logic ──
  const filteredMatches = useMemo(() => {
    return matches.filter((alumnus) => {
      const matchScorePass = alumnus.matchPercentage >= minMatchFilter;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchScorePass;

      const fullAlumnus = IMCC_DEMO_ALUMNI.find((a) => a.alumniId === alumnus.alumniId);
      const skillsStr = fullAlumnus ? fullAlumnus.skills.join(" ").toLowerCase() : "";

      const nameMatch = alumnus.fullName.toLowerCase().includes(query);
      const orgMatch = (alumnus.organization || "").toLowerCase().includes(query);
      const roleMatch = (alumnus.designation || "").toLowerCase().includes(query);
      const skillMatch = skillsStr.includes(query);

      return matchScorePass && (nameMatch || orgMatch || roleMatch || skillMatch);
    });
  }, [matches, minMatchFilter, searchQuery]);

  // ── Selection helpers ──
  const toggleSelect = (alumniId: number) => {
    setSelectedAlumniIds((prev) =>
      prev.includes(alumniId) ? prev.filter((id) => id !== alumniId) : [...prev, alumniId]
    );
  };

  const selectHighMatches = () => {
    const highMatchIds = matches.filter((m) => m.matchPercentage >= 75).map((m) => m.alumniId);
    setSelectedAlumniIds(highMatchIds);
  };

  const selectAllFiltered = () => {
    if (selectedAlumniIds.length === filteredMatches.length) {
      setSelectedAlumniIds([]);
    } else {
      setSelectedAlumniIds(filteredMatches.map((m) => m.alumniId));
    }
  };

  // ── Dispatch submit handler ──
  const handleDispatch = () => {
    if (selectedAlumniIds.length === 0) return;

    dispatchInvites(
      {
        activityId,
        alumniIds: selectedAlumniIds,
        expectedRole,
        responseDeadline,
        customMessage,
        sendEmail,
        sendWhatsapp,
      },
      {
        onSuccess: () => {
          setIsDispatchModalOpen(false);
          navigate(`/coordinator/activities/${activityId}/invitations`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
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
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Tag Matchmaking
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                {activity?.title ?? "Find & Invite Alumni"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/coordinator/activities/${activityId}/invitations`)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Users className="h-4 w-4 text-slate-500" />
              View Sent Invitations
            </button>
          </div>
        </div>

        {/* Event Quick Logistics Bar */}
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
            <span className="flex items-center gap-1.5 font-semibold text-brand-iris">
              <Award className="h-3.5 w-3.5" />
              {activity.pointsWeight} Contribution Points
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-slate-400 font-medium">Target Skills:</span>
              {activity.requiredExpertise.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-brand-iris/10 text-brand-iris font-semibold text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Controls Bar: Search + Match Filter + Quick Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by alumnus name, company, designation, or skill tag…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-iris/30 focus:border-brand-iris"
            />
          </div>

          {/* Filter by Match Percentage */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter:</span>
            {[
              { label: "All Matches", min: 0 },
              { label: "≥ 50% Match", min: 50 },
              { label: "≥ 75% Match", min: 75 },
              { label: "100% Match ⭐", min: 100 },
            ].map((f) => (
              <button
                key={f.min}
                onClick={() => setMinMatchFilter(f.min)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap",
                  minMatchFilter === f.min
                    ? "bg-brand-iris text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Bulk Select Action */}
          <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              onClick={selectHighMatches}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-iris bg-brand-iris/10 hover:bg-brand-iris hover:text-white transition-colors whitespace-nowrap"
            >
              Select All ≥ 75% Matches
            </button>
            <button
              onClick={selectAllFiltered}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap"
            >
              {selectedAlumniIds.length === filteredMatches.length && filteredMatches.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-brand-iris mb-2" />
            <span className="text-sm font-medium">Computing intelligent tag matches…</span>
          </div>
        )}

        {/* Alumni Cards Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMatches.map((alumnus: ActivityMatchScore) => {
              const isSelected = selectedAlumniIds.includes(alumnus.alumniId);
              const fullDetails = IMCC_DEMO_ALUMNI.find((a) => a.alumniId === alumnus.alumniId);

              // Match pill styling based on score
              const getMatchPill = (pct: number) => {
                if (pct >= 90) {
                  return {
                    label: `${pct}% Match ⭐`,
                    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  };
                }
                if (pct >= 60) {
                  return {
                    label: `${pct}% Match`,
                    className: "bg-blue-50 text-blue-700 border-blue-200",
                  };
                }
                if (pct >= 30) {
                  return {
                    label: `${pct}% Match`,
                    className: "bg-purple-50 text-purple-700 border-purple-200",
                  };
                }
                return {
                  label: `${pct}% Match`,
                  className: "bg-slate-100 text-slate-600 border-slate-200",
                };
              };

              const pill = getMatchPill(alumnus.matchPercentage);

              return (
                <div
                  key={alumnus.alumniId}
                  onClick={() => toggleSelect(alumnus.alumniId)}
                  className={cn(
                    "bg-white rounded-2xl border p-5 space-y-3.5 transition-all cursor-pointer relative",
                    isSelected
                      ? "border-brand-iris ring-2 ring-brand-iris/20 shadow-md bg-brand-iris/[0.02]"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  )}
                >
                  {/* Card Header: Checkbox + Alumnus Info + Match Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-iris focus:ring-brand-iris cursor-pointer"
                      />
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {alumnus.fullName}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {fullDetails?.program ?? "MCA"} Class of {alumnus.graduationYear} ·{" "}
                          <span className="text-slate-800 font-semibold">{alumnus.organization}</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">{alumnus.designation}</p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold border tracking-wide whitespace-nowrap",
                        pill.className
                      )}
                    >
                      {pill.label}
                    </span>
                  </div>

                  {/* Skills Tag Section */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">
                        Matched Skills ({alumnus.matchedTags.length}/{alumnus.totalRequiredTags})
                      </span>
                      {fullDetails?.availability && (
                        <span className="text-slate-500 text-[11px] truncate max-w-[200px]">
                          🕒 {fullDetails.availability}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {/* Matched tags highlighted in Iris */}
                      {alumnus.matchedTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-brand-iris/15 text-brand-iris text-xs rounded-full font-bold border border-brand-iris/20"
                        >
                          ✓ {tag}
                        </span>
                      ))}

                      {/* Remaining skills in subtle slate */}
                      {fullDetails?.skills
                        .filter((s) => !alumnus.matchedTags.includes(s))
                        .slice(0, 3)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty Search State */}
        {!isLoading && filteredMatches.length === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
            <Users className="h-8 w-8 text-slate-300 mx-auto" />
            <h4 className="text-base font-semibold text-slate-800">No matching alumni found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or lowering the match percentage filter.
            </p>
          </div>
        )}
      </div>

      {/* ── Sticky Bottom Action Bar ───────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 sm:px-8 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-900">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-brand-iris text-white text-xs font-bold mr-1.5">
                {selectedAlumniIds.length}
              </span>
              Alumni Selected
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Selected alumni will receive invitations via Email and WhatsApp
            </span>
          </div>

          <button
            onClick={() => setIsDispatchModalOpen(true)}
            disabled={selectedAlumniIds.length === 0}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md",
              selectedAlumniIds.length > 0
                ? "bg-brand-iris text-white hover:bg-brand-iris/90 active:scale-95 shadow-brand-iris/30"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            )}
          >
            <Send className="h-4 w-4" />
            Dispatch Invitations
          </button>
        </div>
      </div>

      {/* ── Dispatch Modal ─────────────────────────────────────────────────── */}
      {isDispatchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsDispatchModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-iris">
                  Confirm Dispatch
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Send Event Invitations ({selectedAlumniIds.length})
                </h3>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Expected Alumni Role *
                </label>
                <input
                  type="text"
                  value={expectedRole}
                  onChange={(e) => setExpectedRole(e.target.value)}
                  placeholder="e.g. Keynote Speaker, Panel Judge, Technical Mentor"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-iris/30 focus:border-brand-iris"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  RSVP Response Deadline *
                </label>
                <input
                  type="date"
                  value={responseDeadline}
                  onChange={(e) => setResponseDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-iris/30 focus:border-brand-iris"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Personalized Invitation Note
                </label>
                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-iris/30 focus:border-brand-iris resize-none"
                />
              </div>

              {/* Delivery Channels Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Delivery Channels
                </span>
                <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-iris focus:ring-brand-iris"
                  />
                  <Mail className="h-4 w-4 text-brand-iris" />
                  <span>Send Transactional Email via Brevo</span>
                </label>
                <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendWhatsapp}
                    onChange={(e) => setSendWhatsapp(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-iris focus:ring-brand-iris"
                  />
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>Send Automated WhatsApp Alert</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDispatch}
                disabled={isDispatching}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl bg-brand-iris text-white hover:bg-brand-iris/90 disabled:opacity-60 shadow-sm shadow-brand-iris/30"
              >
                {isDispatching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Dispatching…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send {selectedAlumniIds.length} Invites
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
