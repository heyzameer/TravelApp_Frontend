import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../features/admin/layouts/AdminLayout';
import Dashboard from '../features/admin/pages/Dashboard';
import UsersList from '../features/admin/pages/users/UsersList';
import ProtectedRoute from './ProtectedRoute';

import PartnersList from '../features/admin/pages/partners/PartnersList';
import PropertiesList from '../features/admin/pages/properties/PropertiesList';
import BookingsList from '../features/admin/pages/bookings/BookingsList';

// Placeholder components - will be created later
const UserDetailPage = () => <div className="p-6 bg-white rounded-lg shadow">User Detail - Coming Soon</div>;
const PartnersRequestsPage = () => <div className="p-6 bg-white rounded-lg shadow">Partner Applications - Coming Soon</div>;
const PartnerDetailPage = () => <div className="p-6 bg-white rounded-lg shadow">Partner Detail - Coming Soon</div>;
const PropertyDetailPage = () => <div className="p-6 bg-white rounded-lg shadow">Property Detail - Coming Soon</div>;
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
                    <Route path="users/:id" element={<UserDetailPage />} />

                    {/* Partners/Property Owners Routes */}
                    <Route path="partners" element={<PartnersList />} />
                    <Route path="partners/requests" element={<PartnersRequestsPage />} />
                    <Route path="partners/:id" element={<PartnerDetailPage />} />

                    {/* Properties Routes */}
                    <Route path="properties" element={<PropertiesList />} />
                    <Route path="properties/:id" element={<PropertyDetailPage />} />

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
