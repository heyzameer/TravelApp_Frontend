import React, { useState, useEffect } from "react";
import {
    Bell,
    ChevronDown,
    ChevronRight,
    Home,
    Package,
    Settings,
    Menu,
    CheckCircle,
    Clock,
    BarChart2,
    LogOut,
    User,
    House,
    PlusCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { partnerAuthService } from "../../services/partnerAuth";
import RegisterProperty from "./RegisterProperty";
import BookingManagement from "./BookingManagement";
import PartnerProfilePage from "./PartnerProfile";

interface SidebarItemProps {
    icon: React.ReactNode;
    title: string;
    hasDropdown?: boolean;
    isActive?: boolean;
    onClick?: () => void;
    badge?: number;
    sidebarOpen: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    icon,
    title,
    hasDropdown = false,
    isActive = false,
    onClick,
    badge,
    sidebarOpen,
}) => {
    return (
        <div
            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 ease-in-out rounded-md mb-1 relative
        ${isActive
                    ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-medium shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            onClick={onClick}
        >
            <div className="flex items-center">
                <span
                    className={`${isActive ? "text-red-600" : "text-gray-500"} ${sidebarOpen ? "mr-3" : ""
                        } ${!sidebarOpen ? "mx-auto" : ""}`}
                >
                    {icon}
                </span>
                {sidebarOpen && (
                    <span className={`${isActive ? "font-medium" : ""}`}>{title}</span>
                )}
            </div>
            {sidebarOpen && (
                <div className="flex items-center">
                    {badge && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1 mr-2">
                            {badge}
                        </span>
                    )}
                    {hasDropdown &&
                        (isActive ? (
                            <ChevronDown size={16} className="text-red-600" />
                        ) : (
                            <ChevronRight size={16} className="text-gray-500" />
                        ))}
                </div>
            )}
        </div>
    );
};

const PartnerDashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const stats = [
        {
            title: "Active Properties",
            count: 2,
            icon: <House size={20} />,
            color: "text-blue-500 bg-blue-100",
        },
        {
            title: "New Bookings",
            count: 12,
            icon: <Clock size={20} />,
            color: "text-yellow-500 bg-yellow-100",
        },
        {
            title: "Completed Stays",
            count: 45,
            icon: <CheckCircle size={20} />,
            color: "text-green-500 bg-green-100",
        },
        {
            title: "Total Revenue",
            count: "₹85,400",
            icon: <BarChart2 size={20} />,
            color: "text-purple-500 bg-purple-100",
        },
    ];

    const renderMainContent = () => {
        switch (activeItem) {
            case "Register Property":
                return <RegisterProperty />;
            case "Bookings":
                return <BookingManagement />;
            case "Profile":
                return <PartnerProfilePage />;
            default:
                return (
                    <>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">
                                Welcome back, Partner!
                            </h2>
                            <p className="text-gray-600">
                                Here's what's happening with your properties today.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-gray-600 font-medium">{stat.title}</h3>
                                        <span className={`${stat.color} p-2 rounded-full`}>{stat.icon}</span>
                                    </div>
                                    <p className="text-3xl font-bold">{stat.count}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Bookings</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-400 border-b border-gray-100">
                                            <th className="pb-3 font-medium text-sm">Guest</th>
                                            <th className="pb-3 font-medium text-sm">Property</th>
                                            <th className="pb-3 font-medium text-sm">Check-In</th>
                                            <th className="pb-3 font-medium text-sm">Status</th>
                                            <th className="pb-3 font-medium text-sm">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-50 last:border-0">
                                            <td className="py-4">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 mr-3"></div>
                                                    <span className="font-medium">Amit Sharma</span>
                                                </div>
                                            </td>
                                            <td className="py-4">Sunset Villa</td>
                                            <td className="py-4">15 Jan, 2026</td>
                                            <td className="py-4">
                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">Pending</span>
                                            </td>
                                            <td className="py-4 text-red-500 cursor-pointer font-medium hover:underline">View Details</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <div
                className={`${isMobile ? "fixed" : "relative"
                    } z-20 h-full transform transition-all duration-300 ease-in-out 
        ${sidebarOpen ? "w-64 translate-x-0" : "w-16 translate-x-0 ml-0"} 
        bg-white shadow-lg flex flex-col`}
            >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                        {sidebarOpen && (
                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-lg shadow-sm">
                                <House size={20} />
                            </div>
                        )}
                        {sidebarOpen && (
                            <h1 className="ml-3 text-xl font-semibold">
                                Travel<span className="text-red-500 font-bold">Hub</span>
                            </h1>
                        )}
                        {!sidebarOpen && (
                            <div className="flex justify-center w-full">
                                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-1 rounded-lg shadow-sm">
                                    <House size={18} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-3 flex-1 overflow-y-auto">
                    <SidebarItem
                        icon={<Home size={18} />}
                        title="Dashboard"
                        isActive={activeItem === "Dashboard"}
                        onClick={() => setActiveItem("Dashboard")}
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarItem
                        icon={<PlusCircle size={18} />}
                        title="Register Property"
                        isActive={activeItem === "Register Property"}
                        onClick={() => setActiveItem("Register Property")}
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarItem
                        icon={<Package size={18} />}
                        title="Bookings"
                        isActive={activeItem === "Bookings"}
                        onClick={() => setActiveItem("Bookings")}
                        sidebarOpen={sidebarOpen}
                        badge={2}
                    />
                    <SidebarItem
                        icon={<User size={18} />}
                        title="Profile"
                        isActive={activeItem === "Profile"}
                        onClick={() => setActiveItem("Profile")}
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarItem
                        icon={<Settings size={18} />}
                        title="Settings"
                        isActive={activeItem === "Settings"}
                        onClick={() => setActiveItem("Settings")}
                        sidebarOpen={sidebarOpen}
                    />
                </div>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => {
                            partnerAuthService.clearTokens();
                            navigate("/partner/login");
                        }}
                        className={`flex items-center text-gray-700 hover:text-red-600 transition-colors w-full px-4 py-2 ${!sidebarOpen && "justify-center"}`}
                    >
                        <LogOut size={18} />
                        {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
                    <div className="flex items-center">
                        <button className="text-gray-500 mr-4" onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800">{activeItem}</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Bell size={20} className="text-gray-600 cursor-pointer" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">2</span>
                        </div>
                        <div className="flex items-center border-l pl-4">
                            <div className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center mr-2">P</div>
                            <span className="text-gray-700 font-medium hidden md:inline">Partner</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <div className="container mx-auto px-6 py-8">
                        {renderMainContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PartnerDashboard;
