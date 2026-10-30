import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { FullPageLoader } from '../components/common/FullPageLoader';

const LandingPage = lazy(() =>
  import('../pages/public/LandingPage').then((module) => ({ default: module.LandingPage })),
);
const NotFoundPage = lazy(() =>
  import('../pages/public/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);
const LoginPage = lazy(() =>
  import('../pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('../pages/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })),
);
const VerifyEmailPage = lazy(() =>
  import('../pages/auth/VerifyEmailPage').then((module) => ({ default: module.VerifyEmailPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('../pages/auth/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import('../pages/auth/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  })),
);
const DashboardOverviewPage = lazy(() =>
  import('../pages/dashboard/DashboardOverviewPage').then((module) => ({
    default: module.DashboardOverviewPage,
  })),
);
const ProfilePage = lazy(() =>
  import('../pages/dashboard/ProfilePage').then((module) => ({ default: module.ProfilePage })),
);
const SecurityPage = lazy(() =>
  import('../pages/dashboard/SecurityPage').then((module) => ({ default: module.SecurityPage })),
);
const SessionsPage = lazy(() =>
  import('../pages/dashboard/SessionsPage').then((module) => ({ default: module.SessionsPage })),
);

export const AppRoutes = () => (
  <Suspense fallback={<FullPageLoader label="Loading interface" />}>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
      </Route>

      <Route
        element={
          <PublicOnlyRoute>
            <AuthLayout />
          </PublicOnlyRoute>
        }
      >
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardOverviewPage />} />
        <Route path="dashboard/profile" element={<ProfilePage />} />
        <Route path="dashboard/security" element={<SecurityPage />} />
        <Route path="dashboard/sessions" element={<SessionsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);
