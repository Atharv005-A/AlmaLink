import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { authApi } from "@/api/auth.api";
import { PasswordStrengthIndicator } from "@/components/common/PasswordStrengthIndicator";
import { Lock, Eye, EyeOff, CheckCircle2, Building2, UserCheck, AlertCircle } from "lucide-react";

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

  // Example pre-filled staff details (resolved from token in Phase 3 backend)
  const staffDetails = {
    fullName: "Prof. Meera Kulkarni",
    email: "meera.tech@imcc.mespune.in",
    assignedCell: "Technical & Co-curricular Cell",
    cellCode: "TECH",
    role: "Cell Coordinator",
  };

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
    <AuthLayout
      title="Welcome to the faculty portal"
      subtitle="Complete your onboarding to activate your college coordinator workspace."
    >
      {isSuccess ? (
        <div className="space-y-6 text-center py-2">
          <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Account Activated</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your password has been configured and your cell coordinator permissions are active.
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => navigate("/login")}
              className="w-full"
              size="lg"
            >
              Sign In to Coordinator Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Pre-filled Invitation Details Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-brand-iris" />
                <span className="text-xs font-semibold text-slate-900">
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

          {!token && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Demo mode: No token found in URL. Use the onboarding link sent to your institutional email.
              </span>
            </div>
          )}

          {serverError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Set Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              Create Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Choose a secure password"
                error={!!errors.password}
                {...register("password")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
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

            {/* Real-time Strength Checklist */}
            <PasswordStrengthIndicator password={watchedPassword || ""} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                error={!!errors.confirmPassword}
                {...register("confirmPassword")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
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

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            isLoading={isSubmitting}
          >
            Activate Account & Enter Workspace
          </Button>

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-600 hover:text-brand-iris"
            >
              Already activated? Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

