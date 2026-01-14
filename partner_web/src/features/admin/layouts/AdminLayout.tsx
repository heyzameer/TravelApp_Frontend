import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    // Check screen size and adjust sidebar for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // Get page title from route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/users')) return 'Guests Management';
        if (path.includes('/partners/requests')) return 'Partner Applications';
        if (path.includes('/partners')) return 'Property Owners';
        if (path.includes('/properties')) return 'Properties Management';
        if (path.includes('/bookings/pending')) return 'Pending Bookings';
        if (path.includes('/bookings/confirmed')) return 'Confirmed Bookings';
        if (path.includes('/bookings')) return 'Bookings Management';
        if (path.includes('/analytics')) return 'Analytics';
        if (path.includes('/settings')) return 'Settings';
        if (path.includes('/security')) return 'Security';
        if (path.includes('/help')) return 'Help & Support';
        return 'Dashboard';
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar - Always visible on desktop, overlay on mobile */}
            <div
                className={`${isMobile ? 'fixed' : 'relative'
                    } z-20 h-full transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'
                    }`}
            >
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10"
                    onClick={toggleSidebar}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <Header
                    sidebarOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                    title={getPageTitle()}
                />

                {/* Main Content - Changes based on route */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="container mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
