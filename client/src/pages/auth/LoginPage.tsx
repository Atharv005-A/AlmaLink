import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput, Role } from "@almalink/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/api/auth.api";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await authApi.login(data);
      const user = response.user;

      if (response.token) {
        localStorage.setItem("almalink_token", response.token);
        localStorage.setItem("almalink_user", JSON.stringify(user));
      }

      // Role-based automatic redirection
      if (user.role === Role.SUPER_ADMIN || user.role === Role.COLLEGE_ADMIN) {
        navigate("/admin/dashboard");
      } else if (user.role === Role.CELL_COORDINATOR) {
        navigate("/coordinator/dashboard");
      } else if (user.role === Role.ALUMNI) {
        if (response.alumniVerificationStatus === "PENDING") {
          navigate("/alumni/pending");
        } else {
          navigate("/alumni/home");
        }
      } else {
        navigate("/");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Failed to sign in. Please verify your credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-slate-50 lg:bg-white">
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

            {/* Real Campus Photo from Figma Asset (Proportionally Scaled) */}
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
      {/* RIGHT COLUMN: Account Form (Desktop & Mobile Refined)         */}
      {/* ============================================================== */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start lg:pl-14 xl:pl-20 lg:pr-8 px-4 sm:px-6 py-6 sm:py-8 lg:py-0 h-auto lg:h-full overflow-y-auto lg:overflow-y-hidden">
        <div className="w-full max-w-[460px] space-y-4 sm:space-y-5">
          {/* Heading & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 leading-snug">
              Sign in to IMCC AlmaLink. Your account role determines your workspace.
            </p>
          </div>

          {/* Error Banner */}
          {serverError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form Card Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  error={!!errors.email}
                  {...register("email")}
                  autoComplete="email"
                  className="h-11 rounded-xl border-slate-300 text-sm focus-visible:ring-brand-iris"
                />
                {errors.email && (
                  <p className="text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    error={!!errors.password}
                    {...register("password")}
                    autoComplete="current-password"
                    className="h-11 rounded-xl border-slate-300 pr-10 text-sm focus-visible:ring-brand-iris"
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
              </div>

              {/* Remember Me */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    {...register("rememberMe")}
                    className="h-4 w-4 rounded border-slate-300 text-brand-iris focus:ring-brand-iris"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Sign In Button */}
              <div className="pt-1">
                <Button
                  type="submit"
                  className="w-full sm:w-auto px-7 h-10 rounded-xl inline-flex items-center justify-center gap-2 bg-brand-iris hover:bg-brand-iris-hover text-white text-sm font-semibold shadow-sm transition-all"
                  isLoading={isSubmitting}
                >
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Forgot Password Link */}
              <div className="pt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-brand-iris transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>

          {/* Secondary Action: Registration */}
          <div>
            <Link to="/register" className="block">
              <button
                type="button"
                className="w-full py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
              >
                Register as an alumnus
              </button>
            </Link>
          </div>

          <p className="text-xs text-slate-400 leading-snug px-1">
            Staff accounts are created by the college administrator. Teachers should use the invitation email to set a password.
          </p>

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
