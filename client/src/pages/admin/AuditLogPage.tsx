import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { auditApi } from "@/api/audit.api";
import { ShieldCheck, Search, Filter, Clock, UserCheck } from "lucide-react";

export const AuditLogPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", { search, action, page }],
    queryFn: () =>
      auditApi.getLogs({
        search: search || undefined,
        action: action !== "ALL" ? action : undefined,
        page,
        limit: 20,
      }),
  });

  const logs = data?.data || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
      <AdminSidebar activeNav="audit" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Audit Log" }]}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1280px] w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                <ShieldCheck className="h-4 w-4 text-brand-iris" />
                <span>Security & Compliance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Institutional Audit Trail
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Immutable activity logs tracking all administrative changes, verifications, and
                actions.
              </p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search action, actor, details, IP..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-iris/20 focus:border-brand-iris transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter Action:</span>
              </div>
              <select
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-iris/20"
              >
                <option value="ALL">All Actions</option>
                <option value="ALUMNI_VERIFIED">Alumni Verified</option>
                <option value="ALUMNI_REJECTED">Alumni Rejected</option>
                <option value="STAFF_INVITED">Staff Invited</option>
                <option value="ACTIVITY_CREATED">Activity Created</option>
                <option value="POINTS_AWARDED">Points Awarded</option>
                <option value="PASSWORD_RESET">Password Reset</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading audit logs...</div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <ShieldCheck className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-800">No audit records found</p>
                <p className="text-xs text-slate-400 mt-1">Audit log entries will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">Target Entity</th>
                      <th className="py-3 px-4 text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {logs.map((log) => (
                      <tr key={log.logId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {log.user ? (
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-slate-400" />
                              <div>
                                <p className="font-medium text-slate-900 text-xs">
                                  {log.user.fullName}
                                </p>
                                <p className="text-[10px] text-slate-400">{log.user.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">System</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                          {log.details || "-"}
                        </td>

                        <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                          {log.entityType} #{log.entityId}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-400">
                          {log.ipAddress || "127.0.0.1"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} log
                  entries)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
