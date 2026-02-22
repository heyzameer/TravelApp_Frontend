import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../features/admin/layouts/AdminLayout';
import DestinationsPage from '../pages/admin/DestinationsPage';
import DestinationFormPage from '../pages/admin/DestinationFormPage';
import Dashboard from '../features/admin/pages/Dashboard';
import UsersList from '../features/admin/pages/users/UsersList';
import UserDetail from '../features/admin/pages/users/UserDetail';
import UserEdit from '../features/admin/pages/users/UserEdit';
import ProtectedRoute from './ProtectedRoute';

import PartnersList from '../features/admin/pages/partners/PartnersList';
import PropertiesList from '../features/admin/pages/properties/PropertiesList';
import PropertyApplications from '../features/admin/pages/properties/PropertyApplications';
import PropertyDetail from '../features/admin/pages/properties/PropertyDetail';
import BookingsList from '../features/admin/pages/bookings/BookingsList';
import BookingDetail from '../features/admin/pages/bookings/BookingDetail';
import PartnerVerificationDetail from '../features/admin/pages/partners/PartnerVerificationDetail';
import PropertyVerificationDetail from '../features/admin/pages/properties/PropertyVerificationDetail';
import PropertyEditPage from '../features/admin/pages/properties/PropertyEditPage';
import PartnerRequests from '../features/admin/pages/partners/PartnerRequests';
import AnalyticsPage from '../features/admin/pages/AnalyticsPage';
import SettingsPage from '../features/admin/pages/SettingsPage';
import SecurityPage from '../features/admin/pages/SecurityPage';
import HelpPage from '../features/admin/pages/HelpPage';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route element={<AdminLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />

                    {/* Users/Guests Routes */}
                    <Route path="users" element={<UsersList />} />
                    <Route path="users/:id" element={<UserDetail />} />
                    <Route path="users/:id/edit" element={<UserEdit />} />

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
                    <Route path="properties/:id/edit" element={<PropertyEditPage />} />
                    <Route path="properties/:propertyId/verify" element={<PropertyVerificationDetail />} />

                    {/* Bookings Routes */}
                    <Route path="bookings" element={<BookingsList />} />
                    <Route path="bookings/:status" element={<BookingsList />} />
                    <Route path="bookings/detail/:id" element={<BookingDetail />} />

                    {/* Destination Management Routes */}
                    <Route path="destinations" element={<DestinationsPage />} />
                    <Route path="destinations/new" element={<DestinationFormPage />} />
                    <Route path="destinations/edit/:id" element={<DestinationFormPage />} />

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
