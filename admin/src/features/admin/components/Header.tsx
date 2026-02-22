import React from 'react';
import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, toggleSidebar, title = 'Dashboard' }) => {
    return (
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
            {/* Mobile menu toggle / Desktop toggle when collapsed */}
            {!sidebarOpen && (
                <button
                    className="p-2 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-all duration-200 mr-4 group"
                    onClick={toggleSidebar}
                    title="Expand menu"
                >
                    <Menu size={22} className="group-hover:scale-110 transition-transform" />
                </button>
            )}

            <h1 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h1>

            <div className="flex items-center space-x-6">

                {/* Notifications */}
                <div className="relative">
                    <Bell
                        size={20}
                        className="text-gray-600 cursor-pointer hover:text-blue-500 transition-colors duration-200"
                    />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        2
                    </span>
                </div>

                {/* User avatar */}
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center mr-2 shadow-sm">
                        A
                    </div>
                    <span className="text-gray-700 font-medium hidden md:inline">
                        Admin
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Header;
