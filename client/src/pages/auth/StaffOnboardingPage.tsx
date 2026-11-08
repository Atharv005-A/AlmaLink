import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { authApi } from "@/api/auth.api";
import { PasswordStrengthIndicator } from "@/components/common/PasswordStrengthIndicator";
import { Eye, EyeOff, CheckCircle2, Building2, UserCheck, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

const staffOnboardingFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type StaffOnboardingFormInput = z.infer<typeof staffOnboardingFormSchema>;

export const StaffOnboardingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-filled staff details (resolved dynamically from invitation token via API)
  const [staffDetails, setStaffDetails] = useState<{
    fullName: string;
    email: string;
    assignedCell: string;
    cellCode: string;
    role: string;
  }>({
    fullName: "Prof. Meera Kulkarni",
    email: "meera.tech@imcc.mespune.in",
    assignedCell: "Technical & Co-curricular Cell",
    cellCode: "TECH",
    role: "Cell Coordinator",
  });

  useEffect(() => {
    if (!token) return;
    authApi
      .verifyInvitation(token)
      .then((data) => {
        setStaffDetails(data);
      })
      .catch((err) => {
        setServerError(err.message || "Invalid or expired invitation token.");
      });
  }, [token]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StaffOnboardingFormInput>({
    resolver: zodResolver(staffOnboardingFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("password");

  const onSubmit = async (data: StaffOnboardingFormInput) => {
    if (!token) {
      setServerError("Onboarding token is missing. Please use the invitation link from your email.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      await authApi.resetPassword({
        token,
        password: data.password,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Failed to activate staff account. Link may have expired.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Empowering college faculty and department cell coordinators to engage alumni with ease.
              </p>
            </div>

            {/* Real Campus Photo from Figma Asset */}
            <div className="pt-2">
              <img
                src="/campus-life.png"
                alt="MES IMCC Campus Life"
                className="w-full max-w-[460px] h-[210px] xl:h-[240px] object-cover rounded-xl shadow-xl border border-slate-700/60"
              />
            </div>
          </div>

          {/* Bottom: Institution Caption */}
          <div className="pb-1 text-xs text-slate-400 leading-tight">
            <p className="font-medium text-slate-300">
              MES Institute of Management & Career Courses
            </p>
            <p className="text-slate-500">Pune, Maharashtra · Since 1983</p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT COLUMN: Staff Onboarding Form (Refined Contrast)         */}
      {/* ============================================================== */}
      <div className="w-full lg:w-1/2 bg-[#F8FAFC] flex flex-col justify-center items-center lg:items-start lg:pl-14 xl:pl-20 lg:pr-8 px-4 sm:px-6 py-6 sm:py-8 lg:py-0 h-auto lg:h-full overflow-y-auto lg:overflow-y-hidden">
        <div className="w-full max-w-[460px] space-y-4 sm:space-y-5">
          {isSuccess ? (
            /* ========================================================== */
            /* SUCCESS STATE: Account Activated                           */
            /* ========================================================== */
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Account activated
                </h2>
                <p className="text-sm text-slate-500 leading-snug">
                  Welcome to the IMCC faculty coordinator team.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04),0_1px_3px_rgb(0,0,0,0.02)] p-6 sm:p-7 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Coordinator workspace ready
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    Your password has been configured and your cell coordinator permissions are active for{" "}
                    <span className="font-semibold text-slate-900">{staffDetails.assignedCell}</span>.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full h-10 rounded-xl bg-brand-iris hover:bg-brand-iris-hover text-white text-sm font-semibold shadow-sm inline-flex items-center justify-center gap-2"
                  >
                    <span>Sign in to coordinator portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================== */
            /* FORM STATE: Set coordinator password                       */
            /* ========================================================== */
            <>
              {/* Heading & Subtitle */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Welcome to faculty portal
                </h2>
                <p className="text-sm text-slate-500 leading-snug">
                  Complete onboarding to activate your cell coordinator workspace.
                </p>
              </div>

              {/* Pre-filled Coordinator Invitation Details Card */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-brand-iris" />
                    <span className="text-sm font-semibold text-slate-900">
                      {staffDetails.fullName}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {staffDetails.role}
                  </Badge>
                </div>

                <div className="text-xs text-slate-500">{staffDetails.email}</div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 text-xs text-slate-700">
                  <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    Assigned:{" "}
                    <span className="font-semibold text-slate-900">
                      {staffDetails.assignedCell}
                    </span>
                  </span>
                </div>
              </div>

              {/* Token Missing Warning Banner */}
              {!token && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 shadow-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Demo mode: No token in URL. In production, teachers open the link from their invitation email.
                  </span>
                </div>
              )}

              {/* Server Error Banner */}
              {serverError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 shadow-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Form Card Container (Elevated Crisp White Card) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04),0_1px_3px_rgb(0,0,0,0.02)] p-6 sm:p-7">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Create password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Choose a strong password"
                        error={!!errors.password}
                        {...register("password")}
                        autoComplete="new-password"
                        className="h-11 rounded-xl bg-slate-50/50 hover:bg-slate-50/90 focus:bg-white border-slate-200 pr-10 text-sm focus-visible:ring-brand-iris transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-rose-600">{errors.password.message}</p>
                    )}

                    {/* Interactive Password Strength Indicator */}
                    <div className="pt-1">
                      <PasswordStrengthIndicator password={watchedPassword || ""} />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        error={!!errors.confirmPassword}
                        {...register("confirmPassword")}
                        autoComplete="new-password"
                        className="h-11 rounded-xl bg-slate-50/50 hover:bg-slate-50/90 focus:bg-white border-slate-200 pr-10 text-sm focus-visible:ring-brand-iris transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-7 h-10 rounded-xl inline-flex items-center justify-center gap-2 bg-brand-iris hover:bg-brand-iris-hover text-white text-sm font-semibold shadow-sm transition-all"
                      isLoading={isSubmitting}
                    >
                      <span>Activate coordinator account</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>

              {/* Secondary Action: Back to Login */}
              <div>
                <Link to="/login" className="block">
                  <button
                    type="button"
                    className="w-full py-3 rounded-xl border border-slate-200/90 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs inline-flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Cancel and return to sign in</span>
                  </button>
                </Link>
              </div>
            </>
          )}

          {/* Institutional Help Footer */}
          <div className="pt-0.5 px-1 space-y-0.5 text-xs text-slate-400">
            <p>
              Need help?{" "}
              <a
                href="mailto:alumni@imcc.mespune.in"
                className="text-slate-600 hover:underline"
              >
                alumni@imcc.mespune.in
              </a>
            </p>
            <p>Your information is used only for college alumni engagement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
