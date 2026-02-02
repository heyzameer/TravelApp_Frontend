import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const PartnerDashboard = lazy(() => import('../pages/partner/PartnerDashboard'));
const PropertyDetails = lazy(() => import('../pages/partner/PropertyDetails'));
const RoomList = lazy(() => import('../pages/property/rooms/RoomList'));
const AddRoom = lazy(() => import('../pages/property/rooms/AddRoom'));
const MealPlanList = lazy(() => import('../pages/property/mealplans/MealPlanList'));
const AddMealPlan = lazy(() => import('../pages/property/mealplans/AddMealPlan'));
const AvailabilityCalendar = lazy(() => import('../pages/property/rooms/AvailabilityCalendar'));
const ActivityList = lazy(() => import('../pages/property/activities/ActivityList'));
const AddActivity = lazy(() => import('../pages/property/activities/AddActivity'));
const PackageList = lazy(() => import('../pages/property/packages/PackageList'));
const AddPackage = lazy(() => import('../pages/property/packages/AddPackage'));
const BookingDetailsPage = lazy(() => import('../pages/BookingDetailsPage'));

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
                <Route path="property/:propertyId/rooms" element={<RoomList />} />
                <Route path="property/:propertyId/rooms/add" element={<AddRoom />} />
                <Route path="property/:propertyId/rooms/:roomId/availability" element={<AvailabilityCalendar />} />
                <Route path="property/:propertyId/meal-plans" element={<MealPlanList />} />
                <Route path="property/:propertyId/meal-plans/add" element={<AddMealPlan />} />
                <Route path="property/:propertyId/activities" element={<ActivityList />} />
                <Route path="property/:propertyId/activities/add" element={<AddActivity />} />
                <Route path="property/:propertyId/packages" element={<PackageList />} />
                <Route path="property/:propertyId/packages/add" element={<AddPackage />} />
                <Route path="register-property" element={<PartnerDashboard />} /> {/* These are handled by specific state in Dashboard based on implementation, or could be subroutes */}
                <Route path="bookings" element={<PartnerDashboard />} />
                <Route path="bookings/:id" element={<BookingDetailsPage />} />
                <Route path="*" element={<PartnerDashboard />} />
            </Routes>
        </Suspense>
    );
};

export default PartnerRoutes;
