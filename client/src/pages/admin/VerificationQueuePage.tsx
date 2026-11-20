import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { useVerificationQueue } from "@/api/verifications.api";
import {
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

type TabStatus = "PENDING" | "CHANGES_REQUESTED" | "VERIFIED" | "REJECTED" | "INACTIVE";

export const VerificationQueuePage: React.FC = () => {
  const navigate = useNavigate();

  // Filter States
  const [activeTab, setActiveTab] = useState<TabStatus>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("ALL");
  const [selectedBatch, setSelectedBatch] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Available graduation year batches
  const batches = ["ALL", "2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

  // TanStack Query Hook with 30s cache & keepPreviousData
  const { data, isLoading, isFetching, isError, refetch } = useVerificationQueue({
    status: activeTab,
    program: selectedProgram,
    batch: selectedBatch,
    search: searchQuery,
    page,
    limit,
  });

  const requests = data?.requests || [];
  const stats = data?.stats || {
    awaitingReviewCount: 0,
    changesRequestedCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    inactiveCount: 0,
    verifiedThisMonthCount: 0,
    oldestPendingDays: 1,
  };
  const totalCount = data?.pagination.total || 0;
  const totalPages = data?.pagination.totalPages || 1;

  // Handle Search on enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  // Export current list to CSV
  const handleExportCSV = () => {
    if (requests.length === 0) {
      alert("No records to export.");
      return;
    }

    const headers = [
      "Reference ID",
      "Full Name",
      "Email",
      "Phone",
      "Program",
      "Batch",
      "Enrollment Number",
      "Status",
      "Submitted At",
    ];
    const rows = requests.map((r) => [
      r.referenceId,
      r.fullName,
      r.email,
      r.phone,
      r.program,
      r.graduationYear,
      r.enrollmentNo,
      r.verificationStatus,
      r.submittedAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join(
        "\n"
      );

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IMCC_AlmaLink_VerificationQueue_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending verification
          </span>
        );
      case "CHANGES_REQUESTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Changes requested
          </span>
        );
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Verified
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const tabsConfig: { key: TabStatus; label: string; count: number }[] = [
    { key: "PENDING", label: "Pending", count: stats.awaitingReviewCount },
    { key: "CHANGES_REQUESTED", label: "Changes requested", count: stats.changesRequestedCount },
    { key: "VERIFIED", label: "Verified", count: stats.verifiedCount },
    { key: "REJECTED", label: "Rejected", count: stats.rejectedCount },
    { key: "INACTIVE", label: "Inactive", count: stats.inactiveCount },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
      <AdminSidebar activeNav="verifications" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          breadcrumbs={[
            { label: "Workspace", href: "/admin/dashboard" },
            { label: "Verifications" },
          ]}
        />

        {/* Main Container */}
        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1280px] w-full">
          {/* Breadcrumb Context */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tracking-wide uppercase">
            <span>Verifications</span>
            <span>/</span>
            <span className="text-slate-800">Verification queue</span>
          </div>

          {/* Hero Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Verify the next connection
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Match alumni details with college records before granting access.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                title="Refresh queue"
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin text-[#5D5FEF]" : ""}`}
                />
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
              >
                <Download className="h-4 w-4" />
                <span>Export queue</span>
              </button>
            </div>
          </div>

          {/* Metric Cards (Figma 3314:45444) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Awaiting Review */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Awaiting review</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">
                {stats.awaitingReviewCount}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Oldest request · {stats.oldestPendingDays} working days
              </p>
            </div>

            {/* Card 2: Changes Requested */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Changes requested</span>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">
                {stats.changesRequestedCount}
              </p>
              <p className="text-xs text-slate-500 mt-1">Waiting for alumni to respond</p>
            </div>

            {/* Card 3: Verified this month */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Verified this month</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">
                {stats.verifiedThisMonthCount}
              </p>
              <p className="text-xs text-slate-500 mt-1">Reviewed by college administration</p>
            </div>
          </div>

          {/* Filter Tabs Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
            {/* Status Tabs Bar */}
            <div className="flex border-b border-slate-200 overflow-x-auto px-4 pt-2">
              {tabsConfig.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setPage(1);
                    }}
                    className={`pb-3 pt-2 px-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                      isActive
                        ? "border-brand-iris text-brand-iris"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-brand-iris/10 text-brand-iris"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Select Filters */}
            <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3">
              {/* Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or enrollment"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-brand-iris focus:ring-4 focus:ring-brand-iris/10 transition-all placeholder:text-slate-400"
                />
              </form>

              {/* Program Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedProgram}
                  onChange={(e) => {
                    setSelectedProgram(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-iris"
                >
                  <option value="ALL">Program · All</option>
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                </select>

                {/* Batch Filter */}
                <select
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-iris"
                >
                  <option value="ALL">Batch · All</option>
                  {batches
                    .filter((b) => b !== "ALL")
                    .map((yr) => (
                      <option key={yr} value={yr}>
                        Batch · {yr}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Top Loading Indicator */}
            {isFetching && (
              <div className="h-0.5 w-full bg-slate-100 overflow-hidden relative">
                <div className="h-full bg-brand-iris w-full animate-pulse" />
              </div>
            )}

            {/* Table Container */}
            <div className="overflow-x-auto relative min-h-[340px]">
              {/* Prominent Overlay Loader over List Area while fetching */}
              {isFetching && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 transition-opacity">
                  <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white shadow-xl border border-slate-200 text-sm font-semibold text-slate-800">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-iris" />
                    <span>Loading {activeTab.toLowerCase().replace("_", " ")} list…</span>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3.5 px-4 bg-slate-50/70 rounded-xl animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-32 bg-slate-200 rounded" />
                          <div className="h-2.5 w-48 bg-slate-100 rounded" />
                        </div>
                      </div>
                      <div className="h-3 w-20 bg-slate-200 rounded hidden sm:block" />
                      <div className="h-3 w-16 bg-slate-200 rounded hidden md:block" />
                      <div className="h-5 w-24 bg-slate-200 rounded-full" />
                      <div className="h-3 w-16 bg-slate-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="p-12 text-center space-y-3">
                  <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
                  <p className="text-sm font-medium text-slate-800">
                    Failed to load verification requests
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 rounded-xl bg-brand-iris text-white text-xs font-semibold hover:bg-brand-iris-hover transition-colors"
                  >
                    Try again
                  </button>
                </div>
              ) : requests.length === 0 ? (
                <div className="p-16 text-center space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">
                    No {activeTab.toLowerCase().replace("_", " ")} requests found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    There are no alumni registrations matching the current status and filter
                    criteria.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">Alumnus</th>
                      <th className="py-3 px-5">Program / batch</th>
                      <th className="py-3 px-5">Enrollment</th>
                      <th className="py-3 px-5">Submitted</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {requests.map((item) => {
                      const submittedFormatted = new Date(item.submittedAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      );

                      return (
                        <tr
                          key={item.alumniId}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          onClick={() => navigate(`/admin/verifications/${item.alumniId}`)}
                        >
                          {/* Alumnus info */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {item.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 group-hover:text-brand-iris transition-colors">
                                  {item.fullName}
                                </p>
                                <p className="text-xs text-slate-500">{item.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Program / batch */}
                          <td className="py-3.5 px-5 text-slate-700 font-medium">
                            {item.program} · {item.graduationYear}
                          </td>

                          {/* Enrollment */}
                          <td className="py-3.5 px-5 font-mono text-xs text-slate-600 font-semibold">
                            {item.enrollmentNo}
                          </td>

                          {/* Submitted */}
                          <td className="py-3.5 px-5 text-xs text-slate-500">
                            {submittedFormatted}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-5">
                            {renderStatusBadge(item.verificationStatus)}
                          </td>

                          {/* Action Link */}
                          <td className="py-3.5 px-5 text-right">
                            <Link
                              to={`/admin/verifications/${item.alumniId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-iris hover:text-brand-iris/80 transition-colors"
                            >
                              <span>Review profile</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Footer */}
            {!isLoading && totalCount > 0 && (
              <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <span>
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalCount)} of{" "}
                  {totalCount} requests
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="font-semibold text-slate-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Protection Banner & Academic Year Footer */}
          <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-iris shrink-0" />
              <span>
                <strong>Verification protects the community.</strong> Only verified alumni can be
                invited. Rejected and inactive profiles do not appear in activity matching.
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
              IMCC AlmaLink · Academic year 1 Jul 2026 – 30 Jun 2027
            </span>
          </div>
        </main>
      </div>
    </div>
  );
};
export default VerificationQueuePage;
