import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { alumniRegisterSchema, type AlumniRegisterInput } from "@almalink/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/api/auth.api";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  // Array of graduation years from current year down to 1985
  const graduationYears = Array.from({ length: currentYear - 1985 + 1 }, (_, i) => currentYear - i);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AlumniRegisterInput>({
    resolver: zodResolver(alumniRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      program: "MCA",
      graduationYear: currentYear - 2, // default recent batch e.g. 2024
      enrollmentNo: "",
      consentGiven: true,
    },
  });

  const onSubmit = async (data: AlumniRegisterInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await authApi.registerAlumni(data);
      // Navigate to /alumni/pending carrying registration receipt info in route state
      navigate("/alumni/pending", {
        state: {
          referenceId: response.referenceId,
          fullName: response.fullName,
          email: response.email,
          program: response.program,
          graduationYear: response.graduationYear,
          submittedAt: response.submittedAt,
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Failed to submit registration. Please verify your details.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* ============================================================== */}
      {/* MOBILE TOP BAR: Brand Header (Visible ONLY on Mobile < lg)     */}
      {/* ============================================================== */}
      <div className="lg:hidden bg-[#161D2C] px-5 py-3.5 flex items-center shadow-sm shrink-0">
        <img src="/imcc-almalink-logo-white.svg" alt="MES IMCC AlmaLink" className="h-9 w-auto" />
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
                Bring your experience back to campus. Inspire students, share expertise and shape
                what comes next.
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
      {/* RIGHT COLUMN: Alumni Registration Form                         */}
      {/* ============================================================== */}
      <div className="w-full lg:w-1/2 bg-[#F8FAFC] flex flex-col items-center lg:items-start lg:pl-12 xl:pl-16 lg:pr-8 px-4 sm:px-6 py-8 lg:py-10 h-auto lg:h-full overflow-y-auto">
        <div className="w-full max-w-[540px] space-y-4 pb-12">
          {/* Heading & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">
              Come back. Give back.
            </h2>
            <p className="text-sm text-slate-500 leading-snug">
              Create your alumni account. The college will verify your details before activating it.
            </p>
          </div>

          {/* Server Error Alert Banner */}
          {serverError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 shadow-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Validation summary alert banner if invalid */}
          {hasValidationErrors && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start gap-2 shadow-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold">Please check the highlighted details</p>
                <p className="text-amber-700 text-xs mt-0.5">
                  Use a valid email, a 10-digit Indian mobile number and a graduation year from
                  1985–{currentYear}. Enrollment number is required.
                </p>
              </div>
            </div>
          )}

          {/* Form Card Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04),0_1px_3px_rgb(0,0,0,0.02)] p-6 sm:p-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* Row 1: Full Name & Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Full name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Kavya Shah"
                    error={!!errors.fullName}
                    {...register("fullName")}
                    autoComplete="name"
                    className="h-10 rounded-xl bg-slate-50/50 hover:bg-slate-50/90 focus:bg-white border-slate-200 focus:border-brand-iris focus:ring-4 focus:ring-brand-iris/10 text-sm transition-all"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Mobile number <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    error={!!errors.phone}
                    {...register("phone")}
                    autoComplete="tel"
                    maxLength={10}
                    className="h-10 rounded-xl bg-slate-50/50 hover:bg-slate-50/90 focus:bg-white border-slate-200 focus:border-brand-iris focus:ring-4 focus:ring-brand-iris/10 text-sm transition-all"
                  />
                  {errors.phone ? (
                    <p className="text-xs text-rose-600">{errors.phone.message}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400">10-digit Indian mobile number</p>
                  )}
                </div>
              </div>

              {/* Row 2: Email Address */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  Email address <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="kavya.shah@gmail.com"
                  error={!!errors.email}
                  {...register("email")}
                  autoComplete="email"
                  className="h-10 rounded-xl bg-slate-50/50 hover:bg-slate-50/90 focus:bg-white border-slate-200 focus:border-brand-iris focus:ring-4 focus:ring-brand-iris/10 text-sm transition-all"
                />
                {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
              </div>

              {/* Row 3: Password */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    error={!!errors.password}
                    {...register("password")}
                    autoComplete="new-password"
                    className="h-10 pr-10 rounded-xl bg-slate-50/50 hover:bg-slate-50/90 focus:bg-white border-slate-200 focus:border-brand-iris focus:ring-4 focus:ring-brand-iris/10 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-xs text-rose-600">{errors.password.message}</p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    At least 8 characters with an uppercase letter and a number.
                  </p>
                )}
              </div>

              {/* Row 4: Program & Graduation Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Program <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("program")}
                    className="w-full h-10 rounded-xl bg-slate-50/50 hover:bg-slate-50/90 focus:bg-white border border-slate-200 focus:border-brand-iris focus:ring-4 focus:ring-brand-iris/10 text-sm transition-all px-3 text-slate-700 font-medium"
                  >
                    <option value="MCA">MCA (Master of Computer Applications)</option>
                    <option value="MBA">MBA (Master of Business Administration)</option>
                  </select>
                  {errors.program && (
                    <p className="text-xs text-rose-600">{errors.program.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Graduation year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("graduationYear")}
                    className="w-full h-10 rounded-xl bg-slate-50/50 hover:bg-slate-50/90 focus:bg-white border border-slate-200 focus:border-brand-iris focus:ring-4 focus:ring-brand-iris/10 text-sm transition-all px-3 text-slate-700 font-medium"
                  >
                    {graduationYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                  {errors.graduationYear && (
                    <p className="text-xs text-rose-600">{errors.graduationYear.message}</p>
                  )}
                </div>
              </div>

              {/* Row 5: Enrollment Number */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  Enrollment number <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="MES/MCA/2019/042"
                  error={!!errors.enrollmentNo}
                  {...register("enrollmentNo")}
                  onChange={(e) => {
                    setValue("enrollmentNo", e.target.value.toUpperCase());
                  }}
                  className="h-10 rounded-xl bg-slate-50/50 hover:bg-slate-50/90 focus:bg-white border-slate-200 focus:border-brand-iris focus:ring-4 focus:ring-brand-iris/10 text-sm font-mono transition-all uppercase"
                />
                {errors.enrollmentNo ? (
                  <p className="text-xs text-rose-600">{errors.enrollmentNo.message}</p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Use the number on your college records (e.g. MES/MCA/2019/042).
                  </p>
                )}
              </div>

              {/* Row 6: Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register("consentGiven")}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-iris focus:ring-brand-iris/20 shrink-0"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    I consent to IMCC storing my profile and contacting me for college activities. I
                    can withdraw consent through the coordinator.
                  </span>
                </label>
                {errors.consentGiven && (
                  <p className="text-xs text-rose-600 mt-1">
                    {errors.consentGiven.message ||
                      "Please provide consent to create your alumni account."}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-brand-iris hover:bg-brand-iris/90 text-white font-medium shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>{isSubmitting ? "Creating account..." : "Create alumni account"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Back to Sign In Link */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-xs sm:text-sm text-slate-500">Already registered? </span>
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-brand-iris hover:text-brand-iris/80 transition-colors"
              >
                Sign in
              </Link>
            </div>
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
export default RegisterPage;
