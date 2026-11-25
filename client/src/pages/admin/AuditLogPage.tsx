import React, { useState, useMemo } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { useAuditLogs } from "@/api/audit.api";
import { AuditAction } from "@almalink/shared";
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Globe,
  FileCode,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  UserPlus,
  Layers,
  Edit3,
} from "lucide-react";

export const AuditLogPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [inspectLog, setInspectLog] = useState<any | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isFetching, refetch } = useAuditLogs({
    page,
    limit: 15,
    action: selectedAction === "ALL" ? undefined : selectedAction,
    search: debouncedSearch || undefined,
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };
  const actionStats = data?.actionStats || [];

  // Summary counts
  const totalVerifiedCount = useMemo(() => {
    const found = actionStats.find((s) => s.action === AuditAction.ALUMNI_VERIFIED);
    return found ? found.count : 0;
  }, [actionStats]);

  const totalStaffInvitedCount = useMemo(() => {
    const found = actionStats.find((s) => s.action === AuditAction.STAFF_INVITED);
    return found ? found.count : 0;
  }, [actionStats]);

  const totalProfileUpdatedCount = useMemo(() => {
    const found = actionStats.find((s) => s.action === AuditAction.PROFILE_UPDATED);
    return found ? found.count : 0;
  }, [actionStats]);

  // Format IST Timestamp: e.g. "24 Nov 2026, 11:45 AM"
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch {
      return isoString;
    }
  };

  // Semantic Action Badge configuration
  const getActionBadge = (action: string) => {
    switch (action) {
      case AuditAction.ALUMNI_VERIFIED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
            Alumni Verified
          </span>
        );
      case AuditAction.ALUMNI_REJECTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <X className="h-3.5 w-3.5 text-rose-600" />
            Alumni Rejected
          </span>
        );
      case AuditAction.STAFF_INVITED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <UserPlus className="h-3.5 w-3.5 text-indigo-600" />
            Staff Invited
          </span>
        );
      case AuditAction.CELL_CREATED:
      case AuditAction.CELL_UPDATED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Layers className="h-3.5 w-3.5 text-purple-600" />
            Cell Configured
          </span>
        );
      case AuditAction.PROFILE_UPDATED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Edit3 className="h-3.5 w-3.5 text-sky-600" />
            Profile Updated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Shield className="h-3.5 w-3.5 text-slate-500" />
            {action.replace(/_/g, " ")}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
      <AdminSidebar activeNav="audit" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          breadcrumbs={[
            { label: "Workspace", href: "/admin/dashboard" },
            { label: "Security & Governance" },
            { label: "Audit log" },
          ]}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1280px] w-full">
          {/* Hero Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Institutional Audit Log
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Append-Only
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Immutable record of administrative mutations, verification decisions, and staff
                governance for NAAC/NIRF accreditation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                <span>Refresh Log</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <span className="text-xs font-semibold text-slate-500">TOTAL RECORDED ACTIONS</span>
              <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{pagination.total}</p>
              <p className="text-xs text-slate-400 mt-1">Immutable tamper-evident entries</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <span className="text-xs font-semibold text-slate-500">ALUMNI VERIFICATIONS</span>
              <p className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
                {totalVerifiedCount}
              </p>
              <p className="text-xs text-slate-400 mt-1">College verification sign-offs</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <span className="text-xs font-semibold text-slate-500">STAFF ONBOARDING EVENTS</span>
              <p className="text-2xl font-bold text-indigo-600 mt-2 font-mono">
                {totalStaffInvitedCount}
              </p>
              <p className="text-xs text-slate-400 mt-1">Coordinators invited to cells</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <span className="text-xs font-semibold text-slate-500">PROFILE SYNCHRONIZATIONS</span>
              <p className="text-2xl font-bold text-sky-600 mt-2 font-mono">
                {totalProfileUpdatedCount}
              </p>
              <p className="text-xs text-slate-400 mt-1">Skills & availability updates</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search actor, detail, or IP address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5D5FEF]/20 focus:border-[#5D5FEF] transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">Action:</span>
              </div>
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#5D5FEF]/20"
              >
                <option value="ALL">All Actions</option>
                <option value={AuditAction.ALUMNI_VERIFIED}>Alumni Verified</option>
                <option value={AuditAction.ALUMNI_REJECTED}>Alumni Rejected</option>
                <option value={AuditAction.STAFF_INVITED}>Staff Invited</option>
                <option value={AuditAction.CELL_CREATED}>Cell Created</option>
                <option value={AuditAction.PROFILE_UPDATED}>Profile Updated</option>
                <option value={AuditAction.LOGIN_SUCCESS}>Login Success</option>
                <option value={AuditAction.LOGIN_FAILURE}>Login Failure</option>
              </select>
            </div>
          </div>

          {/* Tabular Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp (IST)</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#5D5FEF]" />
                        <span>Loading audit records...</span>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Shield className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-800">
                          No audit logs matched your query
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting your action filter or search keywords.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.logId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{formatTimestamp(log.createdAt)}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                              {log.actorName
                                ? log.actorName
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .slice(0, 2)
                                    .join("")
                                : "SY"}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{log.actorName}</p>
                              {log.actorEmail && (
                                <p className="text-[11px] text-slate-400">{log.actorEmail}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {log.entityType} #{log.entityId}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                          {log.details ? (
                            <span title={log.details}>{log.details}</span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{log.ipAddress || "127.0.0.1"}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {log.details ? (
                            <button
                              onClick={() => setInspectLog(log)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-[#5D5FEF] transition-colors shadow-2xs"
                            >
                              <FileCode className="h-3 w-3" />
                              <span>Inspect</span>
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Showing page <span className="font-semibold text-slate-800">{pagination.page}</span>{" "}
                of <span className="font-semibold text-slate-800">{pagination.totalPages}</span> (
                {pagination.total} total logs)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1 || isLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages || isLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* JSON Inspection Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-[#5D5FEF]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Audit Log #{inspectLog.logId} Payload
                </h3>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Actor:</span>
                  <span className="font-semibold text-slate-800">{inspectLog.actorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Timestamp:</span>
                  <span className="font-mono text-slate-800">
                    {formatTimestamp(inspectLog.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Action:</span>
                  <span className="font-semibold text-slate-800">{inspectLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Target:</span>
                  <span className="font-mono text-slate-800">
                    {inspectLog.entityType} #{inspectLog.entityId}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Details / Raw Payload:</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-60 whitespace-pre-wrap">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(inspectLog.details), null, 2);
                    } catch {
                      return inspectLog.details;
                    }
                  })()}
                </pre>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
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

export default AuditLogPage;
