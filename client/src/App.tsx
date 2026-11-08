import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { StaffOnboardingPage } from "@/pages/auth/StaffOnboardingPage";
import { ActivitiesListPage } from "@/pages/coordinator/ActivitiesListPage";
import { CreateActivityPage } from "@/pages/coordinator/CreateActivityPage";
import { FindAndInvitePage } from "@/pages/coordinator/FindAndInvitePage";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserCheck, GraduationCap, Clock } from "lucide-react";

// TanStack Query client — manages all data fetching, caching, and invalidation
// staleTime: 60s means data fetched in the last 60s is used from cache without refetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

export const App: React.FC = () => {
  return (
    // QueryClientProvider wraps the entire app so ALL components can use TanStack Query hooks
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        {/* Module 1: Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/onboarding/staff" element={<StaffOnboardingPage />} />

        {/* Module 3: Activity & Event Management (Cell Coordinator Workspace) */}
        <Route path="/coordinator/activities" element={<ActivitiesListPage />} />
        <Route path="/coordinator/activities/create" element={<CreateActivityPage />} />
        <Route path="/coordinator/activities/:id/invite" element={<FindAndInvitePage />} />

        {/* Post-Login Workspaces */}
        <Route
          path="/admin/dashboard"
          element={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 bg-brand-iris/10 text-brand-iris rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="h-9 w-9" />
              </div>
              <span className="text-xs font-bold tracking-widest text-brand-iris uppercase">
                College Administration
              </span>
              <h1 className="text-3xl font-bold text-slate-900 mt-2">
                Welcome, Dr. Anjali Joshi
              </h1>
              <p className="text-sm text-slate-500 max-w-md mt-2">
                You are logged in as College Administrator. Full verification queue, cells, and master dashboards will mount here.
              </p>
              <Link to="/login" className="mt-6">
                <Button variant="outline">Sign Out</Button>
              </Link>
            </div>
          }
        />

        <Route
          path="/coordinator/dashboard"
          element={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <UserCheck className="h-9 w-9" />
              </div>
              <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
                Cell Coordinator Workspace
              </span>
              <h1 className="text-3xl font-bold text-slate-900 mt-2">
                Welcome, Prof. Meera Kulkarni
              </h1>
              <p className="text-sm text-slate-500 max-w-md mt-2">
                Assigned cell: <span className="font-semibold text-slate-800">Technical & Co-curricular Cell</span>. Activity creation & matchmaking will mount here.
              </p>
              <Link to="/login" className="mt-6">
                <Button variant="outline">Sign Out</Button>
              </Link>
            </div>
          }
        />

        <Route
          path="/alumni/home"
          element={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <GraduationCap className="h-9 w-9" />
              </div>
              <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase">
                Alumni Portal
              </span>
              <h1 className="text-3xl font-bold text-slate-900 mt-2">
                Welcome back, Aarav Deshmukh!
              </h1>
              <p className="text-sm text-slate-500 max-w-md mt-2">
                MCA Class of 2018 • Persistent Systems Pune. Your verified contribution ledger and invitations will mount here.
              </p>
              <Link to="/login" className="mt-6">
                <Button variant="outline">Sign Out</Button>
              </Link>
            </div>
          }
        />

        <Route
          path="/alumni/pending"
          element={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="h-9 w-9" />
              </div>
              <span className="text-xs font-bold tracking-widest text-amber-600 uppercase">
                Registration Under Review
              </span>
              <h1 className="text-3xl font-bold text-slate-900 mt-2">
                You're on the list!
              </h1>
              <p className="text-sm text-slate-500 max-w-md mt-2">
                Your registration is currently being verified against college records by IMCC administrators. We will email you once approved.
              </p>
              <Link to="/login" className="mt-6">
                <Button variant="outline">Back to Sign In</Button>
              </Link>
            </div>
          }
        />

        {/* Default Redirect to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Fallback 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
              <h1 className="text-4xl font-bold text-slate-900">404</h1>
              <p className="text-sm text-slate-500 mt-2">Page not found</p>
              <Link to="/login" className="mt-4 text-xs font-semibold text-brand-iris hover:underline">
                Back to Sign In
              </Link>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
