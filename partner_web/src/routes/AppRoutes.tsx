import { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import PartnerRoutes from './PartnerRoutes';

const PartnerLoginPage = lazy(() => import('../pages/auth/PartnerLogin'));
const PartnerRegisterPage = lazy(() => import('../pages/auth/PartnerRegister'));
const PartnerVerifyOtpPage = lazy(() => import('../pages/auth/PartnerVerifyOtp'));

// Fallback UI while components load
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/partner/login" element={<PartnerLoginPage />} />
        <Route path="/partner/register" element={<PartnerRegisterPage />} />
        <Route path="/partner/verify-otp" element={<PartnerVerifyOtpPage />} />

        {/* Partner Dashboard Routes */}
        <Route path="/partner/*" element={<PartnerRoutes />} />

        {/* Redirect Root to Login */}
        <Route path="/" element={<Navigate to="/partner/login" replace />} />

        {/* Fallback Route */}
        <Route path="*" element={<div className="flex items-center justify-center min-h-screen text-xl">Page Not Found</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
