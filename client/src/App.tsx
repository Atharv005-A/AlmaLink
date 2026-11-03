import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { StaffOnboardingPage } from "@/pages/auth/StaffOnboardingPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Module 1: Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/onboarding/staff" element={<StaffOnboardingPage />} />

        {/* Default Redirect to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Fallback 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
              <h1 className="text-4xl font-bold text-slate-900">404</h1>
              <p className="text-sm text-slate-500 mt-2">Page under construction</p>
              <a
                href="/login"
                className="mt-4 text-xs font-semibold text-brand-iris hover:underline"
              >
                Back to Sign In
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
