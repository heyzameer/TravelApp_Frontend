import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../features/admin/layouts/AdminLayout';
import Dashboard from '../features/admin/pages/Dashboard';
import UsersList from '../features/admin/pages/users/UsersList';
import UserDetail from '../features/admin/pages/users/UserDetail';
import ProtectedRoute from './ProtectedRoute';

import PartnersList from '../features/admin/pages/partners/PartnersList';
import PropertiesList from '../features/admin/pages/properties/PropertiesList';
import PropertyApplications from '../features/admin/pages/properties/PropertyApplications';
import PropertyDetail from '../features/admin/pages/properties/PropertyDetail';
import BookingsList from '../features/admin/pages/bookings/BookingsList';
import PartnerVerificationDetail from '../features/admin/pages/partners/PartnerVerificationDetail';
import PropertyVerificationDetail from '../features/admin/pages/properties/PropertyVerificationDetail';
import PartnerRequests from '../features/admin/pages/partners/PartnerRequests';

// Placeholder components - will be created later
// PartnerDetailPage replaced by PartnerVerificationDetail
const PendingBookingsPage = () => <div className="p-6 bg-white rounded-lg shadow">Pending Bookings - Coming Soon</div>;
const ConfirmedBookingsPage = () => <div className="p-6 bg-white rounded-lg shadow">Confirmed Bookings - Coming Soon</div>;
const BookingDetailPage = () => <div className="p-6 bg-white rounded-lg shadow">Booking Detail - Coming Soon</div>;
const AnalyticsPage = () => <div className="p-6 bg-white rounded-lg shadow">Analytics - Coming Soon</div>;
const SettingsPage = () => <div className="p-6 bg-white rounded-lg shadow">Settings - Coming Soon</div>;
const SecurityPage = () => <div className="p-6 bg-white rounded-lg shadow">Security - Coming Soon</div>;
const HelpPage = () => <div className="p-6 bg-white rounded-lg shadow">Help & Support - Coming Soon</div>;

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route element={<AdminLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />

                    {/* Users/Guests Routes */}
                    <Route path="users" element={<UsersList />} />
                    <Route path="users/:id" element={<UserDetail />} />

                    {/* Partners/Property Owners Routes */}
                    <Route path="partners" element={<PartnersList />} />
                    <Route path="partners/requests" element={<PartnerRequests />} />
                    <Route path="partners/:partnerId/verify" element={<PartnerVerificationDetail />} />
                    {/* Fallback for old link structure if needed */}
                    <Route path="partners/:partnerId" element={<PartnerVerificationDetail />} />

                    {/* Properties Routes */}
                    <Route path="properties" element={<PropertiesList />} />
                    <Route path="properties/applications" element={<PropertyApplications />} />
                    <Route path="properties/:id" element={<PropertyDetail />} />
                    <Route path="properties/:propertyId/verify" element={<PropertyVerificationDetail />} />

                    {/* Bookings Routes */}
                    <Route path="bookings" element={<BookingsList />} />
                    <Route path="bookings/pending" element={<PendingBookingsPage />} />
                    <Route path="bookings/confirmed" element={<ConfirmedBookingsPage />} />
                    <Route path="bookings/:id" element={<BookingDetailPage />} />

                    {/* Other Routes */}
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="security" element={<SecurityPage />} />
                    <Route path="help" element={<HelpPage />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AdminRoutes;
