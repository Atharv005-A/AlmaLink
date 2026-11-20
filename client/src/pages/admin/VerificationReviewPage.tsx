import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { verificationsApi, VerificationDetailResponse } from "@/api/verifications.api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, AlertCircle, XCircle, Loader2, Send } from "lucide-react";

export const VerificationReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<VerificationDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Review Decision Action States
  const [reviewerNote, setReviewerNote] = useState(
    "Enrollment and batch verified with college records."
  );
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Modal / Inline States for Request Changes & Rejection
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [changesMessage, setChangesMessage] = useState(
    "Please confirm your graduation year and provide a copy of your final semester marksheet."
  );

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchRecord = async () => {
    if (!id) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const record = await verificationsApi.getById(parseInt(id, 10));
      setData(record);
      if (record.verificationNote) {
        setReviewerNote(record.verificationNote);
      }
    } catch (err) {
      console.error("Failed to fetch verification detail:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  // Handle Approve
  const handleApprove = async () => {
    if (!id) return;
    setIsSubmittingAction(true);
    try {
      const msg = await verificationsApi.approve(parseInt(id, 10), reviewerNote);
      setActionSuccessMessage(msg);
      fetchRecord();
    } catch (err: any) {
      alert(err.message || "Failed to approve registration");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Request Changes
  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !changesMessage.trim()) return;
    setIsSubmittingAction(true);
    try {
      const msg = await verificationsApi.requestChanges(parseInt(id, 10), changesMessage.trim());
      setActionSuccessMessage(msg);
      setShowChangesModal(false);
      fetchRecord();
    } catch (err: any) {
      alert(err.message || "Failed to request changes");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Reject
  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !rejectReason.trim()) return;
    setIsSubmittingAction(true);
    try {
      const msg = await verificationsApi.reject(parseInt(id, 10), rejectReason.trim());
      setActionSuccessMessage(msg);
      setShowRejectModal(false);
      fetchRecord();
    } catch (err: any) {
      alert(err.message || "Failed to reject registration");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
        <AdminSidebar activeNav="verifications" />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            breadcrumbs={[
              { label: "Workspace", href: "/admin/dashboard" },
              { label: "Verifications", href: "/admin/verifications" },
              { label: "Loading..." },
            ]}
          />
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#5D5FEF] mb-2" />
            <span className="text-sm font-medium">Loading profile verification...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
        <AdminSidebar activeNav="verifications" />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            breadcrumbs={[
              { label: "Workspace", href: "/admin/dashboard" },
              { label: "Verifications", href: "/admin/verifications" },
              { label: "Record not found" },
            ]}
          />
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
            <h2 className="text-lg font-bold text-slate-900">Verification record not found</h2>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              The requested registration may have been removed or does not exist.
            </p>
            <Link to="/admin/verifications" className="mt-4">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to queue</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const submittedFormatted = new Date(data.submittedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
      <AdminSidebar activeNav="verifications" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          breadcrumbs={[
            { label: "Workspace", href: "/admin/dashboard" },
            { label: "Verifications", href: "/admin/verifications" },
            { label: `Review ${data.referenceId}` },
          ]}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1280px] w-full">
          {/* Breadcrumb Context */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tracking-wide uppercase">
              <Link to="/admin/verifications" className="hover:text-slate-800 transition-colors">
                Verifications
              </Link>
              <span>/</span>
              <span className="text-slate-800">Profile review</span>
            </div>

            <Link
              to="/admin/verifications"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to queue</span>
            </Link>
          </div>

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Review alumni registration
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-mono">
                Registration {data.referenceId} · Received {submittedFormatted}
              </p>
            </div>

            {/* Current Status Pill */}
            <div>
              {data.verificationStatus === "PENDING" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Pending verification
                </span>
              )}
              {data.verificationStatus === "CHANGES_REQUESTED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  Changes requested
                </span>
              )}
              {data.verificationStatus === "VERIFIED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
              {data.verificationStatus === "REJECTED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <XCircle className="h-3.5 w-3.5" />
                  Rejected
                </span>
              )}
            </div>
          </div>

          {/* Success Alert Banner if an action was just executed */}
          {actionSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>{actionSuccessMessage}</span>
              </div>
              <button
                onClick={() => setActionSuccessMessage(null)}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Main 2-Column Review Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT 2 COLUMNS: Comparison & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Identity & College Record Card (Figma 3314:45528) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Identity & college record</h2>
                  <span className="text-xs font-medium text-slate-400">
                    Ref: {data.referenceId}
                  </span>
                </div>

                {/* Alumnus Identity Header */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-brand-iris/15 text-brand-iris font-bold text-base flex items-center justify-center shrink-0">
                    {data.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{data.fullName}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {data.program} · Class of {data.graduationYear}
                    </p>
                  </div>
                </div>

                {/* Side-by-Side Comparison Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-2.5 px-4">Field</th>
                        <th className="py-2.5 px-4">Submitted information</th>
                        <th className="py-2.5 px-4">College record</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-3 px-4 text-slate-500 font-normal">Full name</td>
                        <td className="py-3 px-4 text-slate-900 font-semibold">{data.fullName}</td>
                        <td className="py-3 px-4 text-emerald-800">
                          {data.collegeRecord.fullName}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-500 font-normal">Enrollment number</td>
                        <td className="py-3 px-4 text-slate-900 font-mono font-semibold">
                          {data.enrollmentNo}
                        </td>
                        <td className="py-3 px-4 text-emerald-800 font-mono">
                          {data.collegeRecord.enrollmentNo}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-500 font-normal">Program</td>
                        <td className="py-3 px-4 text-slate-900">{data.program}</td>
                        <td className="py-3 px-4 text-emerald-800">{data.collegeRecord.program}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-500 font-normal">Graduation year</td>
                        <td className="py-3 px-4 text-slate-900">{data.graduationYear}</td>
                        <td className="py-3 px-4 text-emerald-800">
                          {data.collegeRecord.graduationYear}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* College Match Highlight Box */}
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-950">College details match</p>
                    <p className="text-emerald-800 mt-0.5">{data.collegeRecord.matchNote}</p>
                  </div>
                </div>
              </div>

              {/* Contact & Consent Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900">Contact & consent</h2>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-sm">
                  <div className="py-3 px-4 flex items-center justify-between">
                    <span className="text-slate-500 text-xs">Email address</span>
                    <span className="font-semibold text-slate-800">{data.email}</span>
                  </div>
                  <div className="py-3 px-4 flex items-center justify-between">
                    <span className="text-slate-500 text-xs">Mobile number</span>
                    <span className="font-semibold text-slate-800 font-mono">{data.phone}</span>
                  </div>
                  <div className="py-3 px-4 flex items-center justify-between">
                    <span className="text-slate-500 text-xs">Consent</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Given · {submittedFormatted}
                    </span>
                  </div>
                  <div className="py-3 px-4 flex items-center justify-between">
                    <span className="text-slate-500 text-xs">Registration source</span>
                    <span className="text-xs font-medium text-slate-700">
                      Alumni self-registration
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Review Decision Action Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 space-y-5 sticky top-24">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Review decision</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Approve when the college record and identity match. All decisions are added to
                    the audit log.
                  </p>
                </div>

                {/* Reviewer Note Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Reviewer note</label>
                  <textarea
                    value={reviewerNote}
                    onChange={(e) => setReviewerNote(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-brand-iris focus:ring-4 focus:ring-brand-iris/10 text-slate-800 resize-none transition-all"
                    placeholder="Enter notes on verification check..."
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-2">
                  {/* Approve Button */}
                  <Button
                    onClick={handleApprove}
                    disabled={isSubmittingAction || data.verificationStatus === "VERIFIED"}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {data.verificationStatus === "VERIFIED"
                        ? "Alumnus Verified"
                        : "Approve alumnus"}
                    </span>
                  </Button>

                  {/* Request Changes Button */}
                  <Button
                    variant="outline"
                    onClick={() => setShowChangesModal(true)}
                    disabled={isSubmittingAction}
                    className="w-full h-11 rounded-xl border-amber-300 text-amber-800 hover:bg-amber-50 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span>Request changes</span>
                  </Button>

                  {/* Reject Registration Button */}
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectModal(true)}
                    disabled={isSubmittingAction}
                    className="w-full h-11 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4 text-rose-500" />
                    <span>Reject registration</span>
                  </Button>
                </div>

                {/* Reviewer Attribution Footer */}
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  <p>
                    Reviewed by <strong className="text-slate-700">Dr. Anjali Joshi</strong> ·
                    College Administrator
                  </p>
                  {data.verifiedAt && data.verifiedBy && (
                    <p className="mt-1 text-emerald-700">
                      Last approved by {data.verifiedBy} on{" "}
                      {new Date(data.verifiedAt).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ============================================================== */}
        {/* MODAL: Request Changes                                         */}
        {/* ============================================================== */}
        {showChangesModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Request changes</h3>
                <p className="text-xs text-slate-500 mt-1">
                  The alumnus will receive an email notification with these instructions. Portal
                  access remains restricted until resolved.
                </p>
              </div>

              <form onSubmit={handleRequestChanges} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Changes needed <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={changesMessage}
                    onChange={(e) => setChangesMessage(e.target.value)}
                    rows={4}
                    required
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-slate-800 resize-none transition-all"
                    placeholder="Specify what details need correction or verification..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowChangesModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isSubmittingAction || !changesMessage.trim()}
                    className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send request for changes</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: Reject Registration                                     */}
        {/* ============================================================== */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div>
                <h3 className="text-lg font-bold text-rose-950">Reject registration</h3>
                <p className="text-xs text-slate-500 mt-1">
                  This prevents access but preserves the registration and review history in the
                  audit log. A rejection email includes your reason.
                </p>
              </div>

              <form onSubmit={handleReject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Reason for rejection <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    required
                    placeholder="Enter a clear reason for the alumnus (e.g. Enrollment number not found in college records)..."
                    className="w-full p-3 rounded-xl bg-rose-50/40 border border-rose-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-slate-800 resize-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isSubmittingAction || !rejectReason.trim()}
                    className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Confirm rejection</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default VerificationReviewPage;
