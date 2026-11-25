import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, CheckCircle2, Mail, Loader2 } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import {
  useCells,
  useStaffList,
  useToggleCell,
  useUpdateStaffStatus,
  useResendInvite,
  StaffItem,
} from "@/api/staff-cells.api";

export const StaffAndCellsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "cells" ? "cells" : "staff";

  // Filter states for Staff tab
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [cellFilter, setCellFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected staff for deactivation dialog
  const [deactivatingStaff, setDeactivatingStaff] = useState<StaffItem | null>(null);
  const [deactivatedSuccess, setDeactivatedSuccess] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [permissionsModalStaff, setPermissionsModalStaff] = useState<StaffItem | null>(null);

  // Queries & Mutations
  const { data: cellsData, isLoading: cellsLoading, refetch: refetchCells } = useCells();
  const {
    data: staffData,
    isLoading: staffLoading,
    refetch: refetchStaff,
  } = useStaffList({
    search: search || undefined,
    role: roleFilter !== "ALL" ? roleFilter : undefined,
    cell: cellFilter !== "ALL" ? cellFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const updateStaffStatusMutation = useUpdateStaffStatus();
  const resendInviteMutation = useResendInvite();
  const toggleCellMutation = useToggleCell();

  // Handle Tab Switch
  const handleTabChange = (tab: "staff" | "cells") => {
    setSearchParams({ tab });
  };

  // Staff Counts
  const totalStaffCount = staffData?.length ?? 8;
  const totalCellsCount = cellsData?.length ?? 5;

  // Handle Deactivation
  const handleConfirmDeactivate = async () => {
    if (!deactivatingStaff) return;
    try {
      await updateStaffStatusMutation.mutateAsync({
        userId: deactivatingStaff.userId,
        status: "INACTIVE",
      });
      setDeactivatedSuccess(deactivatingStaff.fullName);
      setDeactivatingStaff(null);
      refetchStaff();
    } catch {
      alert("Failed to deactivate staff account");
    }
  };

  // Handle Reactivation
  const handleReactivate = async (staff: StaffItem) => {
    try {
      await updateStaffStatusMutation.mutateAsync({
        userId: staff.userId,
        status: "ACTIVE",
      });
      refetchStaff();
    } catch {
      alert("Failed to reactivate staff account");
    }
  };

  // Handle Resend Invite
  const handleResendInvite = async (staff: StaffItem) => {
    try {
      await resendInviteMutation.mutateAsync(staff.userId);
      setResendSuccess(staff.email);
      setTimeout(() => setResendSuccess(null), 4000);
    } catch {
      alert("Failed to resend invite");
    }
  };

  // Handle Toggle Cell Status
  const handleToggleCell = async (cellId: number) => {
    try {
      await toggleCellMutation.mutateAsync(cellId);
      refetchCells();
    } catch {
      alert("Failed to toggle cell status");
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
            { label: activeTab === "cells" ? "Cells" : "Staff" },
          ]}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Title & Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {activeTab === "cells"
                  ? "Give every cell a clear owner"
                  : "The people behind the connection"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {activeTab === "cells"
                  ? "Five engagement cells bring different alumni expertise into campus life."
                  : "Manage college staff accounts, permissions and cell assignments."}
              </p>
            </div>

            {/* Top Action CTA */}
            <div>
              {activeTab === "cells" ? (
                <button
                  onClick={() => navigate("/admin/cells/create")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#5D5FEF] text-white text-sm font-semibold hover:bg-[#4B4DDB] transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create cell</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/admin/staff/invite")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#5D5FEF] text-white text-sm font-semibold hover:bg-[#4B4DDB] transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add staff</span>
                </button>
              )}
            </div>
          </div>

          {/* Success Banners */}
          {deactivatedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Staff account deactivated:</strong> {deactivatedSuccess} can no longer
                  sign in. Their historical records are preserved.
                </span>
              </div>
              <button
                onClick={() => setDeactivatedSuccess(null)}
                className="text-xs text-emerald-600 hover:text-emerald-900 font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {resendSuccess && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
              <Mail className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Invitation email successfully resent to {resendSuccess}</span>
            </div>
          )}

          {/* Tab Switcher (Figma: Staff · 8 | Cells · 5) */}
          <div className="flex items-center gap-6 border-b border-slate-200 pt-1">
            <button
              onClick={() => handleTabChange("staff")}
              className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
                activeTab === "staff"
                  ? "text-[#5D5FEF] font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Staff · {totalStaffCount}</span>
              {activeTab === "staff" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5D5FEF] rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleTabChange("cells")}
              className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
                activeTab === "cells"
                  ? "text-[#5D5FEF] font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Cells · {totalCellsCount}</span>
              {activeTab === "cells" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5D5FEF] rounded-full" />
              )}
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: CELLS OVERVIEW (Figma Frame 3314:46982) */}
          {/* ======================================================== */}
          {activeTab === "cells" && (
            <div className="space-y-6">
              {/* College engagement cells table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">College engagement cells</h2>
                </div>

                {cellsLoading ? (
                  <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-[#5D5FEF]" />
                    <span>Loading college cells...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3.5">Cell</th>
                          <th className="px-6 py-3.5">Coordinator</th>
                          <th className="px-6 py-3.5">Focus</th>
                          <th className="px-6 py-3.5 text-center">Upcoming</th>
                          <th className="px-6 py-3.5 text-center">Approved records</th>
                          <th className="px-6 py-3.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cellsData?.map((cell) => {
                          const primaryCoordinator = cell.coordinators[0];
                          return (
                            <tr
                              key={cell.cellId}
                              className="hover:bg-slate-50/60 transition-colors"
                            >
                              <td className="px-6 py-4 font-semibold text-slate-900">
                                {cell.name.replace(" Cell", "")}
                              </td>
                              <td className="px-6 py-4 text-slate-600">
                                {primaryCoordinator ? (
                                  <span>{primaryCoordinator.fullName}</span>
                                ) : (
                                  <span className="text-amber-600 italic font-normal">
                                    Awaiting assignment
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-slate-500">{cell.focus}</td>
                              <td className="px-6 py-4 text-center font-medium text-slate-900">
                                {cell.upcomingCount}
                              </td>
                              <td className="px-6 py-4 text-center font-medium text-slate-900">
                                {cell.approvedRecordsCount}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleToggleCell(cell.cellId)}
                                  title="Click to toggle status"
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                                    cell.isActive
                                      ? "text-blue-700 bg-blue-50 border border-blue-200"
                                      : "text-slate-500 bg-slate-100 border border-slate-200"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      cell.isActive ? "bg-blue-600" : "bg-slate-400"
                                    }`}
                                  />
                                  <span>{cell.isActive ? "Active" : "Inactive"}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-400">
                  Approved records shown for Jul–Sep 2026. Nikhil Apte's staff invitation is
                  awaiting activation.
                </div>
              </div>

              {/* Bottom Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Card: Coordinator assignments */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">Coordinator assignments</h3>
                    <p className="text-xs font-semibold text-slate-600">Technical cell</p>
                    <p className="text-xs text-slate-500">
                      Prof. Meera Kulkarni · meera.kulkarni@imcc.mespune.in
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={() => navigate("/admin/staff/invite")}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Edit assignment
                    </button>
                  </div>

                  {/* Purple Notice Box */}
                  <div className="p-4 rounded-xl bg-[#5D5FEF]/10 border border-[#5D5FEF]/20 space-y-1">
                    <h4 className="text-xs font-bold text-[#5D5FEF]">Cell-scoped permissions</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Reassignment changes future access. Historical actions retain their original
                      author and cell.
                    </p>
                  </div>
                </div>

                {/* Right Card: Create with purpose */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900">Create with purpose</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Assign at least one active or invited coordinator to every cell. An unassigned
                      cell cannot publish activities.
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Cell names must be unique. Deactivation preserves activity and participation
                      history.
                    </p>
                  </div>

                  <div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                      Admin-managed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: STAFF DIRECTORY (Figma Frame 3314:46836) */}
          {/* ======================================================== */}
          {activeTab === "staff" && (
            <div className="space-y-6">
              {/* Filter Controls Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search staff"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] transition-all"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] text-slate-700"
                >
                  <option value="ALL">Role · All</option>
                  <option value="ADMIN">Role · Admin</option>
                  <option value="COORDINATOR">Role · Coordinator</option>
                </select>

                {/* Cell Filter */}
                <select
                  value={cellFilter}
                  onChange={(e) => setCellFilter(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] text-slate-700"
                >
                  <option value="ALL">Cell · All</option>
                  <option value="Technical">Cell · Technical</option>
                  <option value="Placement">Cell · Placement</option>
                  <option value="Cultural">Cell · Cultural</option>
                  <option value="Sports">Cell · Sports</option>
                  <option value="Entrepreneurship">Cell · Entrepreneurship</option>
                  <option value="UNASSIGNED">Cell · Unassigned</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] text-slate-700"
                >
                  <option value="ALL">Status · All</option>
                  <option value="ACTIVE">Status · Active</option>
                  <option value="INVITED">Status · Invited</option>
                  <option value="INACTIVE">Status · Inactive</option>
                </select>
              </div>

              {/* Staff Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">College staff</h2>
                </div>

                {staffLoading ? (
                  <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-[#5D5FEF]" />
                    <span>Loading staff directory...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3.5">Staff member</th>
                          <th className="px-6 py-3.5">Email</th>
                          <th className="px-6 py-3.5">Role</th>
                          <th className="px-6 py-3.5">Assigned cell</th>
                          <th className="px-6 py-3.5 text-center">Status</th>
                          <th className="px-6 py-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {staffData?.map((staff) => {
                          const isCollegeAdmin = staff.role.includes("Admin");
                          const isInvited = staff.status === "INVITED";
                          const isInactive =
                            staff.status === "INACTIVE" || staff.status === "ARCHIVED";

                          return (
                            <tr
                              key={staff.userId}
                              className="hover:bg-slate-50/60 transition-colors"
                            >
                              <td className="px-6 py-4 font-semibold text-slate-900">
                                {staff.fullName}
                              </td>
                              <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                                {staff.email}
                              </td>
                              <td className="px-6 py-4 text-slate-700">{staff.role}</td>
                              <td className="px-6 py-4 text-slate-700">
                                {staff.assignedCellName?.replace(" Cell", "")}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                    isInvited
                                      ? "text-indigo-700 bg-indigo-50 border border-indigo-200"
                                      : isInactive
                                        ? "text-slate-500 bg-slate-100 border border-slate-200"
                                        : "text-blue-700 bg-blue-50 border border-blue-200"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isInvited
                                        ? "bg-indigo-500"
                                        : isInactive
                                          ? "bg-slate-400"
                                          : "bg-blue-600"
                                    }`}
                                  />
                                  <span>
                                    {isInvited ? "Invited" : isInactive ? "Inactive" : "Active"}
                                  </span>
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {isCollegeAdmin ? (
                                  <button
                                    onClick={() => setPermissionsModalStaff(staff)}
                                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                                  >
                                    View permissions
                                  </button>
                                ) : isInvited ? (
                                  <button
                                    onClick={() => handleResendInvite(staff)}
                                    className="text-xs font-semibold text-[#5D5FEF] hover:text-[#4B4DDB] transition-colors"
                                  >
                                    Resend invite
                                  </button>
                                ) : isInactive ? (
                                  <button
                                    onClick={() => handleReactivate(staff)}
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                                  >
                                    Reactivate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setDeactivatingStaff(staff)}
                                    className="text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors"
                                  >
                                    Edit / Deactivate
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Showing 1–{staffData?.length || 0} of {totalStaffCount} staff accounts
                  </span>
                  <span className="text-slate-400">Next page</span>
                </div>
              </div>

              {/* Bottom Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Deactivate confirmation widget */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">
                      Deactivate staff · confirmation
                    </h3>
                    <p className="text-xs font-semibold text-slate-700">
                      {deactivatingStaff ? deactivatingStaff.fullName : "Prof. Vinay Kulkarni"}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Deactivate this account? Sign-in access will be removed immediately.
                      Historical activities and audit records remain intact.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setDeactivatingStaff(null)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDeactivate}
                      disabled={!deactivatingStaff || updateStaffStatusMutation.isPending}
                      className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50"
                    >
                      {updateStaffStatusMutation.isPending
                        ? "Deactivating..."
                        : "Deactivate account"}
                    </button>
                  </div>
                </div>

                {/* Account Policy widget */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900">Account policy</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Staff accounts are admin-created. Invitations go to institutional email
                      addresses; the teacher chooses a password through the secure invitation page.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#5D5FEF]/10 border border-[#5D5FEF]/20 space-y-1">
                    <h4 className="text-xs font-bold text-[#5D5FEF]">Least-privilege access</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Coordinators can access only their assigned cell. Admins manage college-wide
                      verification, approvals and reporting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Modal */}
          {permissionsModalStaff && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Admin Permissions</h3>
                  <button
                    onClick={() => setPermissionsModalStaff(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <p>
                    <strong>Member:</strong> {permissionsModalStaff.fullName}
                  </p>
                  <p>
                    <strong>Role:</strong> {permissionsModalStaff.role}
                  </p>
                  <p>
                    <strong>Cell Scope:</strong> {permissionsModalStaff.assignedCellName}
                  </p>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="font-semibold text-slate-800">Granted Privileges:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Full College Administration & Verification Queue Review</li>
                      <li>Creation and deactivation of college engagement cells</li>
                      <li>Staff invitation and coordinator role assignments</li>
                      <li>College-wide audit log access and engagement reports</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-2 text-right">
                  <button
                    onClick={() => setPermissionsModalStaff(null)}
                    className="px-4 py-2 bg-[#5D5FEF] text-white text-xs font-semibold rounded-lg hover:bg-[#4B4DDB]"
                  >
                    Close
                  </button>
                </div>
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

export default StaffAndCellsPage;
