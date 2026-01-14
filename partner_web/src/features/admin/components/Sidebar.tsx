import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    Users,
    User,
    Building2,
    Calendar,
    BarChart2,
    Settings,
    Shield,
    HelpCircle,
    LogOut,
    ChevronLeft,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks';
import { logoutUser } from '../../../store/slices/authSlice';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

interface SidebarItemProps {
    icon: React.ReactNode;
    title: string;
    to?: string;
    hasDropdown?: boolean;
    isExpanded?: boolean;
    onClick?: () => void;
    badge?: number;
    sidebarOpen: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    icon,
    title,
    to,
    hasDropdown = false,
    isExpanded = false,
    onClick,
    badge,
    sidebarOpen,
}) => {
    const content = (
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <span className={`${sidebarOpen ? 'mr-3' : ''} ${!sidebarOpen ? 'mx-auto' : ''}`}>
                    {icon}
                </span>
                {sidebarOpen && <span>{title}</span>}
            </div>
            {sidebarOpen && (
                <div className="flex items-center">
                    {badge && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1 mr-2">
                            {badge}
                        </span>
                    )}
                    {hasDropdown &&
                        (isExpanded ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        ))}
                </div>
            )}
        </div>
    );

    if (to) {
        return (
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex items-center px-4 py-3 cursor-pointer transition-all duration-200 ease-in-out rounded-md mb-1 ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                }
            >
                {content}
            </NavLink>
        );
    }

    return (
        <div
            className="flex items-center px-4 py-3 cursor-pointer transition-all duration-200 ease-in-out rounded-md mb-1 text-gray-700 hover:bg-gray-100"
            onClick={onClick}
        >
            {content}
        </div>
    );
};

interface DropdownItemProps {
    title: string;
    to: string;
    badge?: number;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ title, to, badge }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ml-7 text-sm flex items-center justify-between ${isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
            }
        >
            <span>{title}</span>
            {badge && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                    {badge}
                </span>
            )}
        </NavLink>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

    const toggleDropdown = (item: string) => {
        setExpandedItems(
            expandedItems.includes(item)
                ? expandedItems.filter((i) => i !== item)
                : [...expandedItems, item]
        );
    };

    const isDropdownExpanded = (item: string) => expandedItems.includes(item);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/admin');
    };

    return (
        <div
            className={`h-full transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-16'
                } bg-white shadow-lg flex flex-col`}
        >
            {/* Logo */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                    {sidebarOpen && (
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg shadow-sm">
                            <Building2 size={20} />
                        </div>
                    )}
                    {sidebarOpen && (
                        <h1
                            onClick={() => navigate('/')}
                            className="ml-3 text-xl font-semibold cursor-pointer"
                        >
                            Travel<span className="text-blue-500 font-bold">Hub</span>
                        </h1>
                    )}
                    {!sidebarOpen && (
                        <div className="flex justify-center w-full">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-1 rounded-lg shadow-sm">
                                <Building2 size={18} />
                            </div>
                        </div>
                    )}
                </div>
                <button
                    className={`text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none ${!sidebarOpen && 'hidden'
                        }`}
                    onClick={() => setSidebarOpen(false)}
                    title="Toggle sidebar"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            {/* Sidebar content */}
            <div className={`p-3 flex-1 overflow-y-auto ${!sidebarOpen && 'overflow-visible'}`}>
                <div className="mb-6">
                    <SidebarItem
                        icon={<Home size={18} />}
                        title="Dashboard"
                        to="/admin/dashboard"
                        sidebarOpen={sidebarOpen}
                    />
                </div>

                {sidebarOpen && (
                    <div className="mb-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                            Management
                        </p>
                    </div>
                )}

                {/* Users section */}
                <div className="mb-2">
                    <SidebarItem
                        icon={<Users size={18} />}
                        title="Guests"
                        to="/admin/users"
                        sidebarOpen={sidebarOpen}
                    />

                    {/* Partners section */}
                    <SidebarItem
                        icon={<User size={18} />}
                        title="Property Owners"
                        hasDropdown={true}
                        isExpanded={isDropdownExpanded('Partners')}
                        onClick={() => toggleDropdown('Partners')}
                        sidebarOpen={sidebarOpen}
                    />

                    {isDropdownExpanded('Partners') && sidebarOpen && (
                        <div className="my-1 transition-all duration-300 ease-in-out">
                            <DropdownItem title="All Owners" to="/admin/partners" />
                            <DropdownItem title="Applications" to="/admin/partners/requests" />
                        </div>
                    )}

                    {/* Properties section */}
                    <SidebarItem
                        icon={<Building2 size={18} />}
                        title="Properties"
                        to="/admin/properties"
                        sidebarOpen={sidebarOpen}
                    />

                    {/* Bookings section */}
                    <SidebarItem
                        icon={<Calendar size={18} />}
                        title="Bookings"
                        hasDropdown={true}
                        isExpanded={isDropdownExpanded('Bookings')}
                        onClick={() => toggleDropdown('Bookings')}
                        sidebarOpen={sidebarOpen}
                    />

                    {isDropdownExpanded('Bookings') && sidebarOpen && (
                        <div className="my-1 transition-all duration-300 ease-in-out">
                            <DropdownItem title="All Bookings" to="/admin/bookings" />
                            <DropdownItem title="Pending" to="/admin/bookings/pending" />
                            <DropdownItem title="Confirmed" to="/admin/bookings/confirmed" />
                        </div>
                    )}
                </div>

                {sidebarOpen && (
                    <div className="mb-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                            Analytics & System
                        </p>
                    </div>
                )}

                <div className="mb-6">
                    <SidebarItem
                        icon={<BarChart2 size={18} />}
                        title="Analytics"
                        to="/admin/analytics"
                        sidebarOpen={sidebarOpen}
                    />
                </div>

                <div>
                    <SidebarItem
                        icon={<Settings size={18} />}
                        title="Settings"
                        to="/admin/settings"
                        sidebarOpen={sidebarOpen}
                    />

                    <SidebarItem
                        icon={<Shield size={18} />}
                        title="Security"
                        to="/admin/security"
                        sidebarOpen={sidebarOpen}
                    />

                    <SidebarItem
                        icon={<HelpCircle size={18} />}
                        title="Help & Support"
                        to="/admin/help"
                        sidebarOpen={sidebarOpen}
                    />
                </div>
            </div>

            {/* User profile section */}
            {sidebarOpen ? (
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center mr-3 shadow-sm">
                            A
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium">Admin User</h4>
                            <p className="text-xs text-gray-500">System Administrator</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-2 border-t border-gray-200 flex justify-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm cursor-pointer">
                        A
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
