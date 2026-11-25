import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { alumniDirectoryApi } from "@/api/alumni-directory.api";
import {
  Users,
  Search,
  Filter,
  Eye,
  GraduationCap,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

export const AlumniDirectoryPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["alumni-directory", { search, program, status, page }],
    queryFn: () =>
      alumniDirectoryApi.getAlumniList({
        search: search || undefined,
        program: program !== "ALL" ? program : undefined,
        status: status !== "ALL" ? status : undefined,
        page,
        limit: 15,
      }),
  });

  const alumniList = data?.data || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
      <AdminSidebar activeNav="alumni" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Alumni Directory" },
          ]}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1280px] w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                <Users className="h-4 w-4 text-brand-iris" />
                <span>IMCC Alumni Network</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Alumni Directory
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Browse, search, and connect with verified graduates of IMCC.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/reports/export/csv?type=alumni"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs hover:bg-slate-50 transition-all"
              >
                <ExternalLink className="h-4 w-4 text-slate-500" />
                <span>Export CSV</span>
              </a>
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
                placeholder="Search name, enrollment no, org, role..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-iris/20 focus:border-brand-iris transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="h-3.5 w-3.5" />
                <span>Program:</span>
              </div>
              <select
                value={program}
                onChange={(e) => {
                  setProgram(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-iris/20"
              >
                <option value="ALL">All Programs</option>
                <option value="MCA">MCA</option>
                <option value="MBA">MBA</option>
                <option value="MMS">MMS</option>
              </select>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-iris/20"
              >
                <option value="ALL">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Alumni Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Loading alumni records...
              </div>
            ) : alumniList.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-800">No alumni found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Alumnus Name</th>
                      <th className="py-3 px-4">Program & Batch</th>
                      <th className="py-3 px-4">Current Role & Org</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Score Points</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {alumniList.map((a) => (
                      <tr key={a.alumniId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-brand-iris/10 text-brand-iris font-bold text-xs flex items-center justify-center shrink-0">
                              {a.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">
                                {a.fullName}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">{a.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {a.program} · Class of {a.graduationYear}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {a.enrollmentNo}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          {a.designation || a.organization ? (
                            <div>
                              <p className="text-slate-800 font-medium">
                                {a.designation || "Graduate"}
                              </p>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <Building className="h-3 w-3" />
                                <span>{a.organization || "Independent"}</span>
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not specified</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {a.verificationStatus === "VERIFIED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="h-3 w-3" />
                              <span>{a.verificationStatus}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                            {a.totalPoints} pts
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/admin/alumni/${a.alumniId}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-iris bg-brand-iris/10 hover:bg-brand-iris/20 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </Link>
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
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
                  total alumni)
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
