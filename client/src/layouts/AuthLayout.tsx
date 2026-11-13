import React from "react";
import { GraduationCap, ShieldCheck, Award } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left Column: Institutional Brand & Heritage Banner (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#161D2C] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background gradient accents */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-iris/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-iris/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-brand-iris flex items-center justify-center shadow-lg shadow-brand-iris/30">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                MES IMCC <span className="text-brand-iris">AlmaLink</span>
              </h1>
              <p className="text-xs text-slate-400">
                Institute of Management & Career Courses, Pune
              </p>
            </div>
          </div>
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-brand-iris-light">
            <Award className="h-3.5 w-3.5 text-brand-iris" />
            Centralized Institutional Alumni Network
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Connecting Pune’s premier tech leaders back to their alma mater.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Coordinating cell activities, smart tag-based matchmaking for hackathons & guest
            lectures, verifiable contribution points, and annual alumni recognition.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Verified Alumni Pool</p>
                <p className="text-xs text-slate-400">
                  Directly matched with IMCC graduation records.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Cell Workspace</p>
                <p className="text-xs text-slate-400">
                  Coordinated guest lectures & placement drives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MES IMCC, Pune. All rights reserved.</p>
          <p className="text-slate-500">Autonomous Accreditation NAAC A+</p>
        </div>
      </div>

      {/* Right Column: Authentication Card & Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header (Visible on < 1024px) */}
          <div className="lg:hidden text-center space-y-2 mb-6">
            <div className="inline-flex h-12 w-12 rounded-xl bg-brand-iris items-center justify-center shadow-md mb-2">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              MES IMCC <span className="text-brand-iris">AlmaLink</span>
            </h1>
            <p className="text-xs text-slate-500">
              MES Institute of Management & Career Courses, Pune
            </p>
          </div>

          {/* Page Title & Subtitle */}
          <div className="space-y-1.5 text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>

          {/* Form Content */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            {children}
          </div>

          {/* Institutional Support Footer */}
          <div className="text-center space-y-1">
            <p className="text-xs text-slate-500">
              Staff accounts are provisioned by college administration.
            </p>
            <p className="text-xs text-slate-400">
              Need assistance? Contact{" "}
              <a
                href="mailto:alumni@imcc.mespune.in"
                className="text-brand-iris hover:underline font-medium"
              >
                alumni@imcc.mespune.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
