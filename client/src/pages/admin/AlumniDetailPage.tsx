import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { alumniDirectoryApi } from "@/api/alumni-directory.api";
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  Phone,
  Building,
  Briefcase,
  Award,
  CheckCircle2,
  Clock,
  Linkedin,
  Calendar,
} from "lucide-react";

export const AlumniDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["alumni-detail", id],
    queryFn: () => alumniDirectoryApi.getAlumniById(id!),
    enabled: !!id,
  });

  const profile = data?.data;

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
      <AdminSidebar activeNav="alumni" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Alumni Directory", href: "/admin/alumni" },
            { label: profile ? profile.fullName : "Profile Detail" },
          ]}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1280px] w-full">
          {/* Back link */}
          <div>
            <Link
              to="/admin/alumni"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Alumni Directory</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Loading alumnus profile details...
            </div>
          ) : error || !profile ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <p className="text-slate-700 font-semibold">Alumnus not found</p>
              <p className="text-xs text-slate-400 mt-1">
                The requested profile does not exist or was removed.
              </p>
            </div>
          ) : (
            <>
              {/* Profile Header Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-brand-iris/10 text-brand-iris font-bold text-2xl flex items-center justify-center shrink-0">
                    {profile.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
                      {profile.verificationStatus === "VERIFIED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Verified Alumnus</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{profile.verificationStatus}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-slate-400" />
                        <span>
                          {profile.program} · Class of {profile.graduationYear}
                        </span>
                      </span>
                      <span>·</span>
                      <span className="font-mono text-xs text-slate-400">
                        Roll: {profile.enrollmentNo}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Points card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-4 shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Earned Points
                    </p>
                    <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                      {profile.totalPoints}{" "}
                      <span className="text-xs font-normal text-slate-500">pts</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid 2-columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Contact & Professional */}
                <div className="space-y-6 md:col-span-1">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Contact & Info
                    </h2>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate">{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{profile.phone}</span>
                      </div>
                      {profile.linkedinUrl && (
                        <div className="flex items-center gap-2.5 text-brand-iris">
                          <Linkedin className="h-4 w-4 shrink-0" />
                          <a
                            href={profile.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline truncate"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Professional Career
                    </h2>
                    <div className="space-y-3 text-xs">
                      <div>
                        <p className="text-slate-400 text-[11px]">Current Designation</p>
                        <p className="font-semibold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <span>{profile.designation || "Not specified"}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[11px]">Organization / Company</p>
                        <p className="font-semibold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                          <Building className="h-4 w-4 text-slate-400" />
                          <span>{profile.organization || "Not specified"}</span>
                        </p>
                      </div>
                      {profile.industry && (
                        <div>
                          <p className="text-slate-400 text-[11px]">Industry Domain</p>
                          <p className="font-medium text-slate-700 mt-0.5">{profile.industry}</p>
                        </div>
                      )}
                      {profile.skills?.length > 0 && (
                        <div>
                          <p className="text-slate-400 text-[11px] mb-1.5">Skills & Expertise</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.skills.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Engagement & Participation History */}
                <div className="space-y-6 md:col-span-2">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                      <span>Event Participation & Contribution Record</span>
                      <span className="text-xs font-normal text-slate-400">
                        {profile.participations?.length || 0} activities completed
                      </span>
                    </h2>

                    {profile.participations?.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No recorded event participation yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {profile.participations.map((p) => (
                          <div
                            key={p.participationId}
                            className="py-3.5 flex items-center justify-between gap-4"
                          >
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">
                                {p.activityTitle}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(p.date).toLocaleDateString()}</span>
                                </span>
                                {p.cellName && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                                    {p.cellName}
                                  </span>
                                )}
                                <span>{p.activityType}</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">
                                +{p.pointsAwarded} pts
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
