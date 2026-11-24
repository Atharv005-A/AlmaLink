/**
 * AwardsManagementPage.tsx
 * -------------------------------------------------
 * Module 7: Annual Alumni of the Year Awards & Staff Voting
 * (Figma Frames 3314:46554, 3314:46645, 3314:46718)
 *
 * Capabilities:
 *  - Coordinator Nominations (up to 3 per cell with citations)
 *  - College Administration curation of Top 5 Shortlist Draft
 *  - Staff Voting Round (1 vote per staff member per academic year)
 *  - Final Winner Confirmation & Official IMCC Branded Certificate Generation
 * -------------------------------------------------
 */

import React, { useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import {
  useAwardNominations,
  useCreateNomination,
  useAwardShortlist,
  useVotingStatus,
  useCastAwardVote,
  useConfirmAwardWinner,
  useAwardWinner,
} from "@/api/awards.api";
import { AwardNominationStatus } from "@almalink/shared";
import {
  Award,
  Trophy,
  Vote,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  Download,
  Printer,
  AlertCircle,
  X,
  Quote,
} from "lucide-react";

export const AwardsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"NOMINATIONS" | "VOTING" | "WINNER">("NOMINATIONS");
  const academicYear = "2026-27";

  // Nomination form modal state
  const [isNominateModalOpen, setIsNominateModalOpen] = useState(false);
  const [nomAlumniId, setNomAlumniId] = useState<number>(1);
  const [nomCellId, setNomCellId] = useState<number>(1);
  const [nomJustification, setNomJustification] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Voting state
  const [selectedBallotId, setSelectedBallotId] = useState<number | null>(null);
  const [voteSuccessMsg, setVoteSuccessMsg] = useState<string | null>(null);

  // Check current user role
  let isCoordinator = false;
  try {
    const raw = localStorage.getItem("almalink_user");
    if (raw) {
      const u = JSON.parse(raw);
      isCoordinator = u.role === "CELL_COORDINATOR";
    }
  } catch {}

  // API hooks
  const { data: nominations = [], isLoading: loadingNominations } = useAwardNominations({
    academicYear,
  });
  const { data: shortlist = [] } = useAwardShortlist(academicYear);
  const { data: votingStatus } = useVotingStatus(academicYear);
  const { data: currentWinner } = useAwardWinner(academicYear);

  const createNominationMutation = useCreateNomination();
  const castVoteMutation = useCastAwardVote();
  const confirmWinnerMutation = useConfirmAwardWinner();

  // Handle Nomination Submission
  const handleNominationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (nomJustification.trim().length < 20) {
      setFormError("Citation must be at least 20 characters explaining the alumnus's impact.");
      return;
    }

    try {
      await createNominationMutation.mutateAsync({
        academicYear,
        cellId: nomCellId,
        alumniId: nomAlumniId,
        justification: nomJustification.trim(),
      });
      setIsNominateModalOpen(false);
      setNomJustification("");
    } catch (err: any) {
      setFormError(err.message || "Failed to submit nomination. Check quota limit.");
    }
  };

  // Handle Voting
  const handleCastVote = async () => {
    if (!selectedBallotId) return;
    try {
      await castVoteMutation.mutateAsync({
        nominationId: selectedBallotId,
        academicYear,
      });
      setVoteSuccessMsg("Your official vote has been recorded. Thank you for participating!");
    } catch (err: any) {
      alert(err.message || "Could not cast vote");
    }
  };

  // Handle Winner Confirmation
  const handleConfirmWinner = async (nominationId: number) => {
    if (
      !window.confirm(
        "Confirm this alumnus as the official MES IMCC Alumni of the Year and generate digital certificate?"
      )
    ) {
      return;
    }

    try {
      await confirmWinnerMutation.mutateAsync({ nominationId });
      setActiveTab("WINNER");
    } catch (err: any) {
      alert(err.message || "Failed to confirm winner");
    }
  };

  // Total votes cast across finalists
  const totalVotesCast = shortlist.reduce((acc, curr) => acc + (curr.voteCount || 0), 0);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <AdminSidebar activeNav="awards" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          breadcrumbs={[
            {
              label: "Workspace",
              href: isCoordinator ? "/coordinator/dashboard" : "/admin/dashboard",
            },
            { label: "Awards & Honors" },
          ]}
        />

        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.2),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <Trophy className="w-3.5 h-3.5" />
                    MES IMCC Pune Honors
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-200">
                    AY {academicYear}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Annual Alumni Contributor of the Year
                </h1>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                  Coordinators nominate outstanding cell contributors, staff cast democratic ballots
                  for the top 5 shortlist, and the college administration awards the official
                  certificate of honor.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsNominateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md hover:shadow-amber-500/25 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  Nominate Cell Alumnus
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              {
                id: "NOMINATIONS",
                label: "1. Cell Nominations",
                icon: FileCheck2,
                badge: `${nominations.length} Nominees`,
              },
              {
                id: "VOTING",
                label: "2. Staff Voting Round",
                icon: Vote,
                badge: votingStatus?.hasVoted ? "Ballot Cast" : "Voting Open",
              },
              {
                id: "WINNER",
                label: "3. Winner & Certificate",
                icon: Trophy,
                badge: currentWinner ? "Winner Crowned" : "Pending",
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: CELL NOMINATIONS (Figma 3314:46554) */}
          {activeTab === "NOMINATIONS" && (
            <div className="space-y-6">
              {/* Quota Rules Notice */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">Nomination Policy:</span> Each Cell Coordinator may
                  nominate a maximum of <strong>3 alumni contributors</strong> per academic year who
                  have verified attendance records. College administration will draft the Top 5
                  Shortlist for staff voting.
                </div>
              </div>

              {/* Nominations Table / Grid */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">
                      Submitted Nominations — AY {academicYear}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review citations submitted by respective IMCC cell coordinators.
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {nominations.length} Active Nominations
                  </span>
                </div>

                {loadingNominations ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    Loading nominations...
                  </div>
                ) : nominations.length === 0 ? (
                  <div className="p-12 text-center">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="font-medium text-slate-700 text-sm">No nominations yet</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Click the "Nominate Cell Alumnus" button above to submit your cell's first
                      nominee.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {nominations.map((nom) => (
                      <div
                        key={nom.nominationId}
                        className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {nom.alumniName}
                            </span>
                            <span className="text-xs text-slate-500">
                              ({nom.program} '{nom.graduationYear})
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {nom.cellName}
                            </span>
                            {nom.status === AwardNominationStatus.SHORTLISTED && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                ⭐ Shortlisted Finalist
                              </span>
                            )}
                            {nom.status === AwardNominationStatus.WINNER && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                🏆 Confirmed Winner
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic relative">
                            <Quote className="w-3.5 h-3.5 text-slate-300 absolute -top-1 -left-1" />
                            "{nom.justification}"
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center gap-3">
                            <span>
                              Nominated by: <strong>{nom.nominatorName}</strong>
                            </span>
                            <span>•</span>
                            <span>Votes Received: {nom.voteCount || 0}</span>
                          </div>
                        </div>

                        {/* Admin Action: Confirm winner direct shortcut if in shortlisted status */}
                        {!isCoordinator && nom.status === AwardNominationStatus.SHORTLISTED && (
                          <button
                            onClick={() => handleConfirmWinner(nom.nominationId)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            Crown as Winner
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STAFF VOTING ROUND (Figma 3314:46645) */}
          {activeTab === "VOTING" && (
            <div className="space-y-6">
              {/* Voting Instruction / Eligibility Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Vote className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Official Staff Ballot — Session {academicYear}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    Each college faculty and administration staff member is entitled to cast{" "}
                    <strong>exactly 1 confidential vote</strong> for the Alumni Contributor of the
                    Year from the top 5 shortlisted finalists.
                  </p>
                </div>

                <div className="shrink-0">
                  {votingStatus?.hasVoted ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Your Ballot Has Been Cast
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                      <Vote className="w-4 h-4 text-amber-600" />
                      Ballot Ready to Cast
                    </div>
                  )}
                </div>
              </div>

              {voteSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {voteSuccessMsg}
                </div>
              )}

              {/* Shortlist Finalists Ballot Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortlist.map((candidate) => {
                  const isSelected = selectedBallotId === candidate.nominationId;
                  const isUserVotedForThis =
                    votingStatus?.votedNominationId === candidate.nominationId;
                  const votePercent =
                    totalVotesCast > 0
                      ? Math.round(((candidate.voteCount || 0) / totalVotesCast) * 100)
                      : 0;

                  return (
                    <div
                      key={candidate.nominationId}
                      onClick={() => {
                        if (!votingStatus?.hasVoted) {
                          setSelectedBallotId(candidate.nominationId);
                        }
                      }}
                      className={`relative bg-white rounded-xl border p-5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-md"
                          : isUserVotedForThis
                            ? "border-emerald-500 bg-emerald-50/20 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 shadow-sm"
                      } ${votingStatus?.hasVoted ? "cursor-default" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                            {candidate.alumniName?.charAt(0) || "A"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {candidate.alumniName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {candidate.program} Class of {candidate.graduationYear} •{" "}
                              {candidate.cellName}
                            </div>
                          </div>
                        </div>

                        {/* Radio selector */}
                        {!votingStatus?.hasVoted && (
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        )}

                        {isUserVotedForThis && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Your Vote
                          </span>
                        )}
                      </div>

                      {/* Citation */}
                      <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                        "{candidate.justification}"
                      </p>

                      {/* Live Tally Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Staff Votes</span>
                          <span className="font-bold text-slate-700">
                            {candidate.voteCount || 0} votes ({votePercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${votePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Voting Action Button */}
              {!votingStatus?.hasVoted && (
                <div className="flex justify-end">
                  <button
                    disabled={!selectedBallotId || castVoteMutation.isPending}
                    onClick={handleCastVote}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md"
                  >
                    <Vote className="w-4 h-4" />
                    {castVoteMutation.isPending
                      ? "Recording Ballot..."
                      : "Submit Official Staff Vote"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WINNER & CERTIFICATE GENERATION (Figma 3314:46718) */}
          {activeTab === "WINNER" && (
            <div className="space-y-6">
              {currentWinner ? (
                <div className="space-y-6">
                  {/* Winner Crown Card */}
                  <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                        <Trophy className="w-4 h-4 text-amber-200" />
                        Alumni Contributor of the Year Winner
                      </div>
                      <h2 className="text-3xl font-extrabold">{currentWinner.alumniName}</h2>
                      <p className="text-amber-100 text-xs max-w-xl">
                        Awarded for extraordinary dedication to student placement preparation,
                        technology masterclasses, and elevating the reputation of MES IMCC Pune.
                      </p>
                      <div className="flex items-center gap-4 text-xs text-amber-200 pt-2">
                        <span>Program: {currentWinner.program}</span>
                        <span>•</span>
                        <span>Class of {currentWinner.graduationYear}</span>
                        <span>•</span>
                        <span>{currentWinner.cellName}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs shadow-md hover:bg-amber-50 transition-all"
                      >
                        <FileCheck2 className="w-4 h-4 text-indigo-600" />
                        Print Digital Certificate
                      </button>
                    </div>
                  </div>

                  {/* Certificate Direct Preview Embedded */}
                  <div className="bg-white rounded-2xl border-2 border-amber-200/60 p-8 shadow-lg max-w-4xl mx-auto relative overflow-hidden">
                    {/* Decorative Border Frame */}
                    <div className="border-4 border-double border-amber-600/30 p-8 rounded-xl space-y-6 text-center relative bg-gradient-to-b from-amber-50/20 via-white to-amber-50/20">
                      {/* IMCC Crest Header */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                          Maharashtra Education Society's
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                          Institute of Management and Career Courses (IMCC), Pune
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          (Affiliated to Savitribai Phule Pune University & Approved by AICTE)
                        </p>
                      </div>

                      <div className="w-24 h-0.5 bg-amber-500 mx-auto my-2" />

                      {/* Title */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                          Certificate of Excellence
                        </span>
                        <h4 className="text-2xl font-extrabold text-slate-800 pt-2">
                          Annual Alumni Contributor of the Year
                        </h4>
                        <div className="text-xs text-slate-500">Academic Year {academicYear}</div>
                      </div>

                      {/* Recipient */}
                      <div className="py-4 space-y-2">
                        <p className="text-xs text-slate-600 italic">
                          This prestigious award is proudly conferred upon
                        </p>
                        <h2 className="text-3xl font-black text-indigo-950 tracking-wide font-serif">
                          {currentWinner.alumniName}
                        </h2>
                        <p className="text-xs font-medium text-slate-600 max-w-lg mx-auto">
                          In recognition of invaluable leadership, selfless mentorship, and
                          inspiring contribution towards the students and institutional vision of
                          MES IMCC Pune.
                        </p>
                      </div>

                      {/* Signatures & Seal */}
                      <div className="pt-8 flex items-end justify-between border-t border-slate-200 text-xs">
                        <div className="text-left space-y-1">
                          <div className="font-serif italic text-slate-700 font-bold text-sm">
                            Dr. Anjali Joshi
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Head of Department / Admin
                          </div>
                          <div className="text-[10px] text-slate-400">MES IMCC, Pune</div>
                        </div>

                        {/* Gold Seal Graphic */}
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600 bg-amber-50 flex items-center justify-center text-amber-800 text-[9px] font-black uppercase text-center p-1 leading-tight shadow-inner">
                          Official IMCC Seal
                        </div>

                        <div className="text-right space-y-1">
                          <div className="font-serif italic text-slate-700 font-bold text-sm">
                            Dr. Santosh K. Patil
                          </div>
                          <div className="text-[10px] text-slate-400">Director</div>
                          <div className="text-[10px] text-slate-400">MES IMCC, Pune</div>
                        </div>
                      </div>

                      {/* Certificate ID */}
                      <div className="text-[10px] text-slate-400 tracking-wider">
                        CERTIFICATE ID:{" "}
                        <span className="font-mono font-semibold text-slate-600">
                          MES-IMCC-AWARD-{academicYear.replace("/", "-")}-01
                        </span>{" "}
                        • VERIFIED BY ALMALINK LEDGER
                      </div>
                    </div>

                    {/* Print / Download Controls */}
                    <div className="mt-6 flex items-center justify-end gap-3">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Certificate
                      </button>
                      <button
                        onClick={() =>
                          alert("Official certificate PDF downloaded: MES-IMCC-AWARD-2026-01.pdf")
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Branded PDF
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                  <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-medium text-slate-700 text-sm">No Winner Confirmed Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Once the staff voting round finishes, College Administration can crown the
                    winner from the Staff Voting tab to generate the official certificate.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Nomination Form Modal (Coordinator CTA) */}
      {isNominateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Nominate Alumnus for Annual Honors
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cell Coordinators may nominate up to 3 contributors per session.
                </p>
              </div>
              <button
                onClick={() => setIsNominateModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleNominationSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              {/* Select Cell */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominating Cell
                </label>
                <select
                  value={nomCellId}
                  onChange={(e) => setNomCellId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>Training & Placement Cell</option>
                  <option value={2}>Entrepreneurship & Startup Cell</option>
                  <option value={3}>Tech Club & Coding Cell</option>
                  <option value={4}>Cultural & Alumni Cell</option>
                </select>
              </div>

              {/* Select Alumnus */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Candidate Alumnus
                </label>
                <select
                  value={nomAlumniId}
                  onChange={(e) => setNomAlumniId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>Prithviraj Pratap Patil (MCA '24) — 65 pts</option>
                  <option value={2}>Sneha Deshmukh (MCA '23) — 45 pts</option>
                  <option value={3}>Rahul Suresh Shinde (MCA '22) — 40 pts</option>
                  <option value={4}>Tanmay Shirish Joshi (MBA '23) — 30 pts</option>
                  <option value={5}>Priya Anand Kulkarni (MCA '24) — 25 pts</option>
                </select>
              </div>

              {/* Justification / Citation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Citation & Justification (Min 20 characters)
                </label>
                <textarea
                  value={nomJustification}
                  onChange={(e) => setNomJustification(e.target.value)}
                  rows={4}
                  placeholder="Detail the alumnus's impact on IMCC students, sessions conducted, student placement guidance, or code contest judging..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNominateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createNominationMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  {createNominationMutation.isPending ? "Submitting..." : "Submit Nomination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AwardsManagementPage;
