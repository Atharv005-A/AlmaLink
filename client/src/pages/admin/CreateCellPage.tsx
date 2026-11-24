import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useCreateCell, useStaffList } from "@/api/staff-cells.api";

export const CreateCellPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states matching Figma 3314:47045
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [coordinatorUserId, setCoordinatorUserId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdSuccess, setCreatedSuccess] = useState<{
    cellName: string;
    coordinatorName?: string;
  } | null>(null);

  // Queries & Mutations
  const { data: staffList } = useStaffList();
  const createCellMutation = useCreateCell();

  // Selected Coordinator Preview
  const selectedCoordinator = staffList?.find((s) => s.userId === coordinatorUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Cell name is required");
      return;
    }

    // Auto-generate code if not specified
    const cellCode = code.trim() || name.trim().slice(0, 5).toUpperCase();

    try {
      await createCellMutation.mutateAsync({
        name: name.trim(),
        code: cellCode,
        description: description.trim() || undefined,
        coordinatorUserId,
        status,
      });

      setCreatedSuccess({
        cellName: name.trim(),
        coordinatorName: selectedCoordinator?.fullName,
      });
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Failed to create cell. Please check the inputs."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* 1. Desktop Persistent Left Sidebar */}
      <AdminSidebar activeNav="staff" />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          breadcrumbs={[{ label: "Staff & cells", href: "/admin/staff" }, { label: "Create cell" }]}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Title & Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                ADMINISTRATION / WORKSPACE
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Create an engagement cell
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Admin-only setup · Example state from the initial five-cell onboarding
              </p>
            </div>

            <div>
              <button
                onClick={() => navigate("/admin/staff?tab=cells")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to cells</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {createdSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>{createdSuccess.cellName} cell created</strong> —{" "}
                  {createdSuccess.coordinatorName
                    ? `${createdSuccess.coordinatorName} is assigned as coordinator.`
                    : "Ready for coordinator assignment."}{" "}
                  The cell is now available in staff assignments and activity setup.
                </span>
              </div>
              <button
                onClick={() => navigate("/admin/staff?tab=cells")}
                className="px-3 py-1 bg-emerald-600 text-white font-semibold rounded-md text-xs hover:bg-emerald-700"
              >
                View in cells
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
              <span className="font-semibold">Error:</span> {errorMessage}
            </div>
          )}

          {/* Grid Layout (2/3 Form + 1/3 Assignment Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Form Section (Figma 3314:47045) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">Cell details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Cell Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Cell name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!code) {
                        setCode(
                          e.target.value
                            .replace(/[^A-Za-z]/g, "")
                            .slice(0, 5)
                            .toUpperCase()
                        );
                      }
                    }}
                    placeholder="e.g. Entrepreneurship & Innovation"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] transition-all"
                  />
                </div>

                {/* Cell Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Cell code (uppercase, e.g. ECELL) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ECELL"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] uppercase font-mono transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Connect alumni founders and business leaders with students through mentoring, startup workshops and guest sessions."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] transition-all resize-none"
                  />
                </div>

                {/* Assign Coordinator */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Assign coordinator
                  </label>
                  <select
                    value={coordinatorUserId || ""}
                    onChange={(e) =>
                      setCoordinatorUserId(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] text-slate-700"
                  >
                    <option value="">Select an available staff coordinator...</option>
                    {staffList?.map((s) => (
                      <option key={s.userId} value={s.userId}>
                        {s.fullName} ({s.email}) · {s.assignedCellName || "Unassigned"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] text-slate-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/staff?tab=cells")}
                    className="px-5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCellMutation.isPending}
                    className="px-5 py-2.5 rounded-lg bg-[#5D5FEF] text-white text-xs sm:text-sm font-semibold hover:bg-[#4B4DDB] transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {createCellMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating cell...</span>
                      </>
                    ) : (
                      <span>+ Create cell</span>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 pt-2 leading-relaxed">
                  Cell names must be unique. Coordinators receive access only to assigned cells
                  after activating their account.
                </p>
              </form>
            </div>

            {/* Assignment Preview Card (Right Column - Figma 3314:47045) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Assignment preview
              </h3>

              <div className="space-y-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5D5FEF]/10 text-[#5D5FEF] border border-[#5D5FEF]/20">
                  {name || "Cell Preview"}
                </span>

                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">
                    {selectedCoordinator ? selectedCoordinator.fullName : "No coordinator selected"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedCoordinator
                      ? selectedCoordinator.email
                      : "coordinator@imcc.mespune.in"}
                  </p>
                  <p className="text-[11px] text-[#5D5FEF] font-semibold pt-0.5">
                    Cell coordinator ·{" "}
                    {selectedCoordinator?.status === "INVITED" ? "Awaiting activation" : "Assigned"}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-2">
                  Can create activities, invite alumni and approve normal participation for{" "}
                  <strong>{name || "this cell"}</strong> only.
                </p>
              </div>

              {/* Purple Alert Box */}
              <div className="p-4 rounded-xl bg-[#5D5FEF]/10 border border-[#5D5FEF]/20 space-y-1">
                <h4 className="text-xs font-bold text-[#5D5FEF]">No existing records are moved</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  A new cell starts with no activities or participation records.
                </p>
              </div>
            </div>
          </div>
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

export default CreateCellPage;
