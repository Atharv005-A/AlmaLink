import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@almalink/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/api/auth.api";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await authApi.forgotPassword(data);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Failed to request password reset. Please try again.");
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
          {/* Top: Institution Logo (Noticeably Enlarged) */}
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
                Bring your experience back to campus. Inspire students, share expertise and shape what comes next.
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
      {/* RIGHT COLUMN: Password Recovery Form (Refined Contrast)       */}
      {/* ============================================================== */}
      <div className="w-full lg:w-1/2 bg-[#F8FAFC] flex flex-col justify-center items-center lg:items-start lg:pl-14 xl:pl-20 lg:pr-8 px-4 sm:px-6 py-6 sm:py-8 lg:py-0 h-auto lg:h-full overflow-y-auto lg:overflow-y-hidden">
        <div className="w-full max-w-[460px] space-y-4 sm:space-y-5">
          {isSubmitted ? (
            /* ========================================================== */
            /* SUCCESS STATE: "Check your inbox" (Figma Node 3314:45087)  */
            /* ========================================================== */
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Check your inbox
                </h2>
                <p className="text-sm text-slate-500 leading-snug">
                  Reset instructions have been dispatched.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04),0_1px_3px_rgb(0,0,0,0.02)] p-6 sm:p-7 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Password reset link sent successfully!
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    If an account exists for{" "}
                    <span className="font-semibold text-slate-900">{submittedEmail}</span>,
                    a secure reset link has been emailed. The link expires in 60 minutes.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 leading-relaxed">
                  Didn't receive it? Check your spam folder or request another email after 60 seconds. Your existing password remains unchanged until you reset it.
                </div>

                <div className="pt-2">
                  <Link to="/login" className="block">
                    <Button className="w-full h-10 rounded-xl bg-brand-iris hover:bg-brand-iris-hover text-white text-sm font-semibold shadow-sm">
                      Back to sign in
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Secondary Option: Retry */}
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200/90 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                Try another email
              </button>
            </div>
          ) : (
            /* ========================================================== */
            /* INPUT STATE: Reset your password (Figma Node 3314:45087)   */
            /* ========================================================== */
            <>
              {/* Heading & Subtitle */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Reset your password
                </h2>
                <p className="text-sm text-slate-500 leading-snug">
                  Enter the email address associated with your account.
                </p>
              </div>

              {/* Error Banner */}
              {serverError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 shadow-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Form Card Container (Elevated Crisp White Card) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04),0_1px_3px_rgb(0,0,0,0.02)] p-6 sm:p-7">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Enter your registered email address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your registered email address"
                      error={!!errors.email}
                      {...register("email")}
                      autoComplete="email"
                      className="h-11 rounded-xl bg-slate-50/50 hover:bg-slate-50/90 focus:bg-white border-slate-200 focus:border-brand-iris focus:ring-4 focus:ring-brand-iris/10 text-sm transition-all"
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <Button
                      type="submit"
                      className="w-full sm:w-auto px-7 h-10 rounded-xl inline-flex items-center justify-center gap-2 bg-brand-iris hover:bg-brand-iris-hover text-white text-sm font-semibold shadow-sm transition-all"
                      isLoading={isSubmitting}
                    >
                      <Mail className="h-4 w-4" />
                      <span>Send password reset link</span>
                    </Button>
                  </div>
                </form>
              </div>

              {/* Secondary Action: Back to Sign In */}
              <div>
                <Link to="/login" className="block">
                  <button
                    type="button"
                    className="w-full py-3 rounded-xl border border-slate-200/90 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs inline-flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to sign in</span>
                  </button>
                </Link>
              </div>

              <p className="text-xs text-slate-400 leading-snug px-1">
                Staff accounts are managed by the college administrator. Teachers can also request password resets here.
              </p>
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
