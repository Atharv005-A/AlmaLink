import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput, Role } from "@almalink/shared";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/api/auth.api";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

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

      // Role-based automatic routing
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
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your institutional or registered credentials."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            Email Address
          </label>
          <Input
            type="email"
            placeholder="e.g. admin@imcc.mespune.in"
            error={!!errors.email}
            {...register("email")}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-xs text-rose-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-iris hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              error={!!errors.password}
              {...register("password")}
              autoComplete="current-password"
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
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            id="rememberMe"
            type="checkbox"
            {...register("rememberMe")}
            className="h-4 w-4 rounded border-slate-300 text-brand-iris focus:ring-brand-iris"
          />
          <label
            htmlFor="rememberMe"
            className="text-xs font-normal text-slate-600 cursor-pointer select-none"
          >
            Remember this device for 30 days
          </label>
        </div>

        {/* Submit CTA */}
        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isSubmitting}
        >
          Sign In to AlmaLink
        </Button>

        {/* Register Redirection */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            MES IMCC Alumnus?{" "}
            <Link
              to="/register"
              className="font-semibold text-brand-iris hover:underline"
            >
              Register your profile
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
