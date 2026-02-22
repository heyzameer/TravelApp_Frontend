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
    Map,
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
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
                <span className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} transition-transform duration-300 group-hover:scale-110`}>
                    {icon}
                </span>
                {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{title}</span>}
            </div>
            {sidebarOpen && (
                <div className="flex items-center">
                    {badge && (
                        <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1 mr-2 shadow-sm">
                            {badge}
                        </span>
                    )}
                    {hasDropdown &&
                        (isExpanded ? (
                            <ChevronDown size={14} className="text-gray-400 group-hover:text-blue-500" />
                        ) : (
                            <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-500" />
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
                    `flex items-center px-4 py-3 cursor-pointer transition-all duration-300 ease-in-out rounded-xl mb-1.5 group ${isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-200 translate-x-1'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1'
                    }`
                }
                title={!sidebarOpen ? title : ''}
            >
                {content}
            </NavLink>
        );
    }

    return (
        <div
            className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-300 ease-in-out rounded-xl mb-1.5 group ${isExpanded && sidebarOpen
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1'
                }`}
            onClick={onClick}
            title={!sidebarOpen ? title : ''}
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
                `px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 ml-9 text-[13px] flex items-center justify-between group/sub ${isActive
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-blue-500 hover:translate-x-1'
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
        if (!sidebarOpen) {
            setSidebarOpen(true);
            setExpandedItems([item]);
            return;
        }
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
            onClick={() => !sidebarOpen && setSidebarOpen(true)}
            className={`h-full transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20 cursor-pointer hover:bg-gray-50'
                } bg-white shadow-xl flex flex-col z-30`}
        >
            {/* Logo */}
            <div className={`p-4 border-b border-gray-100 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                <div className="flex items-center">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200 ring-2 ring-white">
                        <Building2 size={sidebarOpen ? 20 : 22} />
                    </div>
                    {sidebarOpen && (
                        <h1
                            onClick={(e) => { e.stopPropagation(); navigate('/admin/dashboard'); }}
                            className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight cursor-pointer"
                        >
                            Travel<span className="text-blue-600">Hub</span>
                        </h1>
                    )}
                </div>
                {sidebarOpen && (
                    <button
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 focus:outline-none"
                        onClick={(e) => { e.stopPropagation(); setSidebarOpen(false); }}
                        title="Collapse menu"
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                )}
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

                    {/* Destinations section */}
                    <SidebarItem
                        icon={<Map size={18} />}
                        title="Destinations"
                        to="/admin/destinations"
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
                        hasDropdown={true}
                        isExpanded={isDropdownExpanded('Properties')}
                        onClick={() => toggleDropdown('Properties')}
                        sidebarOpen={sidebarOpen}
                    />

                    {isDropdownExpanded('Properties') && sidebarOpen && (
                        <div className="my-1 transition-all duration-300 ease-in-out">
                            <DropdownItem title="All Properties" to="/admin/properties" />
                            <DropdownItem title="Applications" to="/admin/properties/applications" />
                        </div>
                    )}

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
                            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                            className="h-9 w-9 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all duration-300 group/logout"
                            title="Logout"
                        >
                            <LogOut size={18} className="group-hover/logout:translate-x-0.5 transition-transform" />
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
