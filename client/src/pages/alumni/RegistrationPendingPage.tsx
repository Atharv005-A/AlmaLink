import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api/auth.api";
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface PendingLocationState {
  referenceId?: string;
  fullName?: string;
  email?: string;
  program?: string;
  graduationYear?: number;
  submittedAt?: string;
}

export const RegistrationPendingPage: React.FC = () => {
  const location = useLocation();
  const state = (location.state as PendingLocationState) || {};

  // Try to retrieve user details from route state, or local storage fallback
  let storedUser: { fullName?: string; email?: string } = {};
  try {
    const raw = localStorage.getItem("almalink_user");
    if (raw) storedUser = JSON.parse(raw);
  } catch {
    // fallback
  }

  const fullName = state.fullName || storedUser.fullName || "Alumnus";
  const firstName = fullName.trim().split(" ")[0] || "Alumnus";
  const email = state.email || storedUser.email || "";
  const referenceId = state.referenceId || "AL-0005";

  // Verification status state: defaults to PENDING
  const [verificationStatus, setVerificationStatus] = useState<string>("PENDING");
  const [verificationNote, setVerificationNote] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Format submission timestamp
  const submissionDate = state.submittedAt
    ? new Date(state.submittedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  // Real-time status polling
  const checkStatus = async () => {
    if (!email && !referenceId) return;
    setIsChecking(true);
    try {
      const res = await authApi.checkRegistrationStatus({
        referenceId: referenceId.startsWith("AL-") ? referenceId : undefined,
        email: email || undefined,
      });

      if (res && res.verificationStatus) {
        setVerificationStatus(res.verificationStatus);
        if (res.verificationNote) {
          setVerificationNote(res.verificationNote);
        }
      }
    } catch {
      // Ignore polling errors
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Poll every 4 seconds so that admin approvals in another tab reflect in real time
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, [email, referenceId]);

  const isVerified = verificationStatus === "VERIFIED";

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* ============================================================== */}
      {/* MOBILE TOP BAR: Brand Header (Visible ONLY on Mobile < lg)     */}
      {/* ============================================================== */}
      <div className="lg:hidden bg-[#161D2C] px-5 py-3.5 flex items-center shadow-sm shrink-0">
        <img
          src="/imcc-almalink-logo-white.svg"
          alt="MES IMCC AlmaLink"
          className="h-9 w-auto"
        />
      </div>

      {/* ============================================================== */}
      {/* LEFT COLUMN: Institution Story & Photo (Visible ONLY on lg+)   */}
      {/* ============================================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#161D2C] text-white p-8 lg:p-10 xl:p-14 flex-col justify-between h-full">
        <div className="w-full max-w-[500px] ml-auto flex flex-col justify-between h-full">
          {/* Top: Institution Logo */}
          <div className="pt-2">
            <img
              src="/imcc-almalink-logo-white.svg"
              alt="MES IMCC AlmaLink"
              className="h-12 sm:h-14 lg:h-16 w-auto"
            />
          </div>

          {/* Middle: Brand Promise & Campus Life */}
          <div className="my-auto space-y-4 py-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-semibold text-white tracking-tight leading-[1.18]">
                A connection that grows beyond graduation.
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Bring your experience back to campus. Inspire students, share expertise
                and shape what comes next.
              </p>
            </div>

            {/* Real Campus Photo from Figma Asset (Proportionally Scaled) */}
            <div className="pt-2">
              <img
                src="/campus-life.png"
                alt="MES IMCC Campus Life"
                className="w-full max-w-[460px] h-[210px] xl:h-[240px] object-cover rounded-xl shadow-xl border border-slate-700/60"
              />
            </div>
          </div>

          {/* Bottom: Institutional Attribution */}
          <div className="text-xs space-y-1">
            <p className="font-semibold text-slate-300">
              MES Institute of Management & Career Courses
            </p>
            <p className="text-slate-500">Pune, Maharashtra · Since 1983</p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT COLUMN: Pending / Verified Notice                        */}
      {/* ============================================================== */}
      <div className="w-full lg:w-1/2 bg-[#F8FAFC] flex flex-col items-center lg:items-start lg:pl-12 xl:pl-16 lg:pr-8 px-4 sm:px-6 py-8 lg:py-10 h-auto lg:h-full overflow-y-auto">
        <div className="w-full max-w-[500px] space-y-4 pb-12">
          {/* Heading & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">
              {isVerified
                ? `You're approved, ${firstName}!`
                : `You're on the list, ${firstName}.`}
            </h2>
            <p className="text-sm text-slate-500 leading-snug">
              {isVerified
                ? "Your registration has been verified against college records. Welcome back to IMCC!"
                : "Your registration was received. We're checking your details against the college records."}
            </p>
          </div>

          {/* Floating Elevated Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04),0_1px_3px_rgb(0,0,0,0.02)] p-6 sm:p-7 space-y-5">
            {/* Account Created Reference Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-950">
                  Account created successfully
                </p>
                <p className="text-xs text-emerald-800/90 font-medium mt-0.5 font-mono">
                  Reference {referenceId} · Submitted {submissionDate}
                </p>
              </div>
            </div>

            {/* REAL-TIME APPROVAL BANNER */}
            {isVerified && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-300">
                <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950">
                    Registration Verified & Approved!
                  </p>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    College administration verified your academic records. You now have full access to the Alumni Portal, events, and cell invitations.
                  </p>
                </div>
              </div>
            )}

            {/* REAL-TIME CHANGES REQUESTED BANNER */}
            {verificationStatus === "CHANGES_REQUESTED" && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">
                    Action Required: Clarification Needed
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    {verificationNote || "Please contact alumni@imcc.mespune.in to verify your details."}
                  </p>
                </div>
              </div>
            )}

            {/* "What happens next?" Stepper Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">
                    What happens next?
                  </h3>
                  <button
                    onClick={checkStatus}
                    title="Check status now"
                    className="p-1 rounded text-slate-400 hover:text-brand-iris transition-colors"
                  >
                    <RefreshCw className={`h-3 w-3 ${isChecking ? "animate-spin text-brand-iris" : ""}`} />
                  </button>
                </div>

                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Verified by college
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Pending verification
                  </span>
                )}
              </div>

              {/* Steps Progress List */}
              <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden bg-slate-50/40 text-xs">
                {/* Step 1: Registration received */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                    <span className="font-medium text-slate-700">Registration received</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="text-[10px]">●</span> Completed
                  </span>
                </div>

                {/* Step 2: College verification */}
                <div className={`p-3 flex items-center justify-between ${isVerified ? "bg-emerald-50/30" : "bg-amber-50/30"}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`h-5 w-5 rounded-full ${isVerified ? "bg-emerald-500" : "bg-amber-500"} text-white flex items-center justify-center text-[10px] font-bold`}>
                      {isVerified ? "✓" : "2"}
                    </div>
                    <span className="font-medium text-slate-800">College verification</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 ${isVerified ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}`}>
                    <span className="text-[10px]">●</span> {isVerified ? "Completed" : "Pending"}
                  </span>
                </div>

                {/* Step 3: Alumni portal access */}
                <div className={`p-3 flex items-center justify-between ${isVerified ? "bg-emerald-50/20" : "opacity-70"}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`h-5 w-5 rounded-full ${isVerified ? "bg-emerald-500 text-white" : "bg-slate-300 text-slate-600"} flex items-center justify-center text-[10px] font-bold`}>
                      {isVerified ? "✓" : "3"}
                    </div>
                    <span className={`font-medium ${isVerified ? "text-slate-800 font-semibold" : "text-slate-500"}`}>
                      Alumni portal access
                    </span>
                  </div>
                  <span className={isVerified ? "text-emerald-700 font-bold" : "text-slate-400 font-medium"}>
                    {isVerified ? "Active" : "After approval"}
                  </span>
                </div>
              </div>
            </div>

            {/* Informational Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
              {isVerified ? (
                <span>
                  Your profile is fully verified. Click the button below to sign in and open your alumni portal.
                </span>
              ) : (
                <span>
                  Verification usually takes <strong>2–3 working days</strong>. We'll email{" "}
                  <span className="font-semibold text-slate-800">{email || "your registered email"}</span> when your account is
                  verified or if we need changes.
                </span>
              )}
            </div>

            {/* Action Button: Dynamic based on approval */}
            {isVerified ? (
              <Link to="/login" className="block w-full">
                <Button className="w-full h-11 rounded-xl bg-brand-iris hover:bg-brand-iris/90 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm">
                  <span>Sign in to Alumni Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/login" className="block w-full">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to sign in</span>
                </Button>
              </Link>
            )}

            {/* Restriction Helper */}
            {!isVerified && (
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                While verification is pending, activity invitations and contribution records are unavailable.
              </p>
            )}
          </div>

          {/* Institutional Help & Trust Anchor */}
          <div className="text-center space-y-0.5 text-xs text-slate-400">
            <p>
              Need help?{" "}
              <a
                href="mailto:alumni@imcc.mespune.in"
                className="text-slate-600 hover:text-brand-iris underline transition-colors"
              >
                alumni@imcc.mespune.in
              </a>
            </p>
            <p className="text-[11px] text-slate-400">
              Your information is used only for college alumni engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RegistrationPendingPage;
