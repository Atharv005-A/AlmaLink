import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Role } from "@almalink/shared";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { StaffOnboardingPage } from "@/pages/auth/StaffOnboardingPage";
import { RegistrationPendingPage } from "@/pages/alumni/RegistrationPendingPage";
import { AlumniHomePage } from "@/pages/alumni/AlumniHomePage";
import { VerificationQueuePage } from "@/pages/admin/VerificationQueuePage";
import { VerificationReviewPage } from "@/pages/admin/VerificationReviewPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { CoordinatorDashboardPage } from "@/pages/coordinator/CoordinatorDashboardPage";
import { ActivitiesListPage } from "@/pages/coordinator/ActivitiesListPage";
import { CreateActivityPage } from "@/pages/coordinator/CreateActivityPage";
import { FindAndInvitePage } from "@/pages/coordinator/FindAndInvitePage";
import { InvitationTrackingPage } from "@/pages/coordinator/InvitationTrackingPage";
import { InvitationsHubPage } from "@/pages/alumni/InvitationsHubPage";

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
          {/* Module 1 & 2: Public Authentication & Registration Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/onboarding/staff" element={<StaffOnboardingPage />} />

          {/* Module 2: Alumni Registration Status & Admin Verification Queue */}
          <Route path="/alumni/pending" element={<RegistrationPendingPage />} />
          <Route
            path="/admin/verifications"
            element={
              <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.COLLEGE_ADMIN]}>
                <VerificationQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verifications/:id"
            element={
              <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.COLLEGE_ADMIN]}>
                <VerificationReviewPage />
              </ProtectedRoute>
            }
          />

          {/* Module 3 & 4: Activity & Event Management (Cell Coordinator Workspace) */}
          <Route
            path="/coordinator/activities"
            element={
              <ProtectedRoute
                allowedRoles={[Role.SUPER_ADMIN, Role.COLLEGE_ADMIN, Role.CELL_COORDINATOR]}
              >
                <ActivitiesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/activities/create"
            element={
              <ProtectedRoute
                allowedRoles={[Role.SUPER_ADMIN, Role.COLLEGE_ADMIN, Role.CELL_COORDINATOR]}
              >
                <CreateActivityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/activities/:id/invite"
            element={
              <ProtectedRoute
                allowedRoles={[Role.SUPER_ADMIN, Role.COLLEGE_ADMIN, Role.CELL_COORDINATOR]}
              >
                <FindAndInvitePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/activities/:id/invitations"
            element={
              <ProtectedRoute
                allowedRoles={[Role.SUPER_ADMIN, Role.COLLEGE_ADMIN, Role.CELL_COORDINATOR]}
              >
                <InvitationTrackingPage />
              </ProtectedRoute>
            }
          />
          {/* Module 4: Alumni Invitations Hub (Alumni Portal) */}
          <Route
            path="/alumni/invitations"
            element={
              <ProtectedRoute allowedRoles={[Role.ALUMNI, Role.SUPER_ADMIN, Role.COLLEGE_ADMIN]}>
                <InvitationsHubPage />
              </ProtectedRoute>
            }
          />

          {/* Post-Login Workspaces */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.COLLEGE_ADMIN]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[Role.SUPER_ADMIN, Role.COLLEGE_ADMIN, Role.CELL_COORDINATOR]}
              >
                <CoordinatorDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/alumni/home"
            element={
              <ProtectedRoute allowedRoles={[Role.ALUMNI, Role.SUPER_ADMIN, Role.COLLEGE_ADMIN]}>
                <AlumniHomePage />
              </ProtectedRoute>
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
                <Link
                  to="/login"
                  className="mt-4 text-xs font-semibold text-brand-iris hover:underline"
                >
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
