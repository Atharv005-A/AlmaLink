import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Send, RotateCw } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useCells, useInviteStaff, useResendInvite } from "@/api/staff-cells.api";

export const InviteStaffPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states matching Figma 3314:46917
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"CELL_COORDINATOR" | "COLLEGE_ADMIN">("CELL_COORDINATOR");
  const [cellId, setCellId] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState(
    "Hello Prof., please join IMCC AlmaLink to coordinate activities. Use the secure email invitation to set your password."
  );
  const [sendEmailImmediately, setSendEmailImmediately] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<{
    fullName: string;
    email: string;
    cellName: string;
    invitationLink: string;
    userId: number;
  } | null>(null);

  // Queries & Mutations
  const { data: cellsData } = useCells();
  const inviteStaffMutation = useInviteStaff();
  const resendInviteMutation = useResendInvite();

  // Selected cell name
  const selectedCell = cellsData?.find((c) => c.cellId === cellId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Full name is required");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("A valid institutional email is required");
      return;
    }

    if (!cellId) {
      setErrorMessage("Please select an assigned cell");
      return;
    }

    try {
      const result = await inviteStaffMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        cellId,
        message,
        sendEmailImmediately,
      });

      setInviteSuccess({
        fullName: result.fullName,
        email: result.email,
        cellName: result.assignedCell,
        invitationLink: result.invitationLink,
        userId: result.userId,
      });
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Failed to send staff invitation. Please check the inputs."
      );
    }
  };

  const handleResend = async () => {
    if (!inviteSuccess) return;
    try {
      await resendInviteMutation.mutateAsync(inviteSuccess.userId);
      alert(`Invitation resent to ${inviteSuccess.email}`);
    } catch {
      alert("Failed to resend invitation");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* 1. Desktop Persistent Left Sidebar */}
      <AdminSidebar activeNav="staff" />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          breadcrumbs={[
            { label: "Staff & cells", href: "/admin/staff" },
            { label: "Invite staff" },
          ]}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Title & Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                ADMINISTRATION / WORKSPACE
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Invite a colleague
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Create a college-managed account and assign the right level of access.
              </p>
            </div>

            <div>
              <button
                onClick={() => navigate("/admin/staff?tab=staff")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to staff</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {inviteSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Staff invitation sent:</strong> {inviteSuccess.fullName}'s account is
                  created with {inviteSuccess.cellName} access. A secure set-password invitation was
                  sent to {inviteSuccess.email}.
                </span>
              </div>
              <button
                onClick={() => navigate("/admin/staff?tab=staff")}
                className="px-3.5 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg text-xs hover:bg-emerald-700 shrink-0 self-start sm:self-auto"
              >
                View in staff directory
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
              <span className="font-semibold">Error:</span> {errorMessage}
            </div>
          )}

          {/* Grid Layout (2/3 Form + 1/3 Permission Summary) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Form Section (Figma 3314:46917) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">New staff account</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Full name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Prof. Nikhil Apte"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] transition-all"
                    />
                  </div>

                  {/* Institutional Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Institutional email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. nikhil.apte@imcc.mespune.in"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Role Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">Role *</label>
                    <select
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value as "CELL_COORDINATOR" | "COLLEGE_ADMIN")
                      }
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] text-slate-700"
                    >
                      <option value="CELL_COORDINATOR">Cell coordinator</option>
                      <option value="COLLEGE_ADMIN">College admin</option>
                    </select>
                  </div>

                  {/* Assigned Cell */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Assigned cell *
                    </label>
                    <select
                      required
                      value={cellId || ""}
                      onChange={(e) => setCellId(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] text-slate-700"
                    >
                      <option value="">Select an assigned cell...</option>
                      {cellsData?.map((c) => (
                        <option key={c.cellId} value={c.cellId}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Invitation Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Invitation message
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] transition-all resize-none"
                  />
                </div>

                {/* Send Email Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="sendImmediately"
                    checked={sendEmailImmediately}
                    onChange={(e) => setSendEmailImmediately(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#5D5FEF] focus:ring-[#5D5FEF]"
                  />
                  <label htmlFor="sendImmediately" className="text-xs text-slate-700 font-medium">
                    Send invitation email immediately
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/staff?tab=staff")}
                    className="px-5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteStaffMutation.isPending}
                    className="px-5 py-2.5 rounded-lg bg-[#5D5FEF] text-white text-xs sm:text-sm font-semibold hover:bg-[#4B4DDB] transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {inviteStaffMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending invitation...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Create & invite staff</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Permission Summary Card (Right Column - Figma 3314:46917) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Permission summary
              </h3>

              <div className="space-y-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5D5FEF]/10 text-[#5D5FEF] border border-[#5D5FEF]/20">
                  {role === "CELL_COORDINATOR" ? "Cell coordinator" : "College admin"}
                </span>

                <ul className="space-y-2 text-xs text-slate-700 pt-1">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Create {selectedCell ? selectedCell.name : "cell"} activities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Invite verified alumni</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Record and approve normal entries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>View own-cell contribution records</span>
                  </li>
                </ul>

                <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
                  Cannot manage other cells, verify identities, approve high-value scores or access
                  college-wide rankings and awards.
                </p>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  Invitation expires in 72 hours. No password is created or sent by the admin.
                </p>
              </div>
            </div>
          </div>

          {/* Pending Activation Card (Figma 3314:46917) */}
          {inviteSuccess && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900">Pending activation</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Invited
                  </span>
                  <span>Invited today · Expires in 72 hours</span>
                </div>
              </div>

              <div>
                <button
                  onClick={handleResend}
                  disabled={resendInviteMutation.isPending}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Resend invitation</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 px-6 sm:px-8 py-4 bg-white text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
          <span>IMCC AlmaLink · MES, Pune</span>
          <span>Academic year · 1 Jul 2026 – 30 Jun 2027</span>
        </footer>
      </div>
    </div>
  );
};

export default InviteStaffPage;
