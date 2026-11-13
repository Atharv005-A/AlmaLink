import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth.api";
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  Calendar,
  LogOut,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export const AlumniHomePage: React.FC = () => {
  const navigate = useNavigate();

  // Retrieve user session from localStorage or fetch from authApi
  const [user, setUser] = useState<{
    fullName?: string;
    email?: string;
    role?: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem("almalink_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [alumniDetails, setAlumniDetails] = useState<{
    program?: string;
    graduationYear?: number;
    enrollmentNo?: string;
  } | null>(null);

  useEffect(() => {
    authApi
      .getCurrentUser()
      .then((session) => {
        if (session) {
          setUser(session);
        }
      })
      .catch(() => {
        // Fallback to localStorage session
      });

    // Also fetch registration/profile details if available
    const raw = localStorage.getItem("almalink_user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.email) {
          authApi
            .checkRegistrationStatus({ email: parsed.email })
            .then((res) => {
              if (res) {
                setAlumniDetails({
                  program: res.program,
                  graduationYear: res.graduationYear,
                  enrollmentNo: res.referenceId,
                });
              }
            })
            .catch(() => {});
        }
      } catch {}
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      navigate("/login");
    }
  };

  const displayName = user?.fullName || "Alumnus";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-[#161D2C] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/imcc-almalink-logo-white.svg"
              alt="MES IMCC AlmaLink"
              className="h-8 w-auto"
            />
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3" />
              VERIFIED ALUMNI PORTAL
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-300">
              {displayName}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Welcome Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="h-20 w-20 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <GraduationCap className="h-10 w-10" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              College Verified Alumnus
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {displayName}!
            </h1>
            <p className="text-sm text-slate-500">
              {alumniDetails?.program || "MCA"} · Class of {alumniDetails?.graduationYear || "2024"}{" "}
              · MES Institute of Management & Career Courses, Pune.
            </p>
          </div>
        </div>

        {/* Feature Hub Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card 1: Invitations Hub (Module 4) */}
          <Link
            to="/alumni/invitations"
            className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 hover:border-brand-iris/40 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-11 w-11 rounded-xl bg-brand-iris/10 text-brand-iris flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-iris transition-colors">
                  Invitations Hub
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Review and accept invitations from college cells for guest lectures, hackathon
                  mentoring, and mock interviews.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-iris">
              <span>Open Invitations</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Activities & Events (Module 3) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Campus Engagements</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Stay connected with IMCC academic cells. Your verified participations will record
                  contribution points.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
              <span>Verified Account Active</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Institutional Trust Footer */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>MES Institute of Management & Career Courses, Pune · Since 1983</p>
          <p className="text-[11px]">Academic Year 2026–2027 · AlmaLink Engagement Network</p>
        </div>
      </main>
    </div>
  );
};
export default AlumniHomePage;
