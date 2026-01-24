import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const PartnerDashboard = lazy(() => import('../pages/partner/PartnerDashboard'));
const PropertyDetails = lazy(() => import('../pages/partner/PropertyDetails'));

const Loader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>
);

const PartnerRoutes = () => {
    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                <Route path="dashboard" element={<PartnerDashboard />} />
                <Route path="property/:id" element={<PropertyDetails />} />
                <Route path="register-property" element={<PartnerDashboard />} /> {/* These are handled by specific state in Dashboard based on implementation, or could be subroutes */}
                <Route path="bookings" element={<PartnerDashboard />} />
                <Route path="*" element={<PartnerDashboard />} />
            </Routes>
        </Suspense>
    );
};

export default PartnerRoutes;
