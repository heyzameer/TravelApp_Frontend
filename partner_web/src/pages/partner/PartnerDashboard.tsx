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
    ShieldCheck, // Added Icon
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { partnerAuthService } from "../../services/partnerAuth";
import { useAppSelector, useAppDispatch } from "../../store/hooks"; // Added dispatch
import { updateUser } from "../../store/slices/authSlice"; // Added action
import RegisterProperty from "./RegisterProperty";
import BookingManagement from "./BookingManagement";
import PartnerProfilePage from "./PartnerProfile";
import AadharVerification from "./AadharVerification"; // Added import
import AllProperties from "./AllProperties"; // Added import
import { socketService } from "../../services/socketService"; // Added import
import type { VerificationStatusResponse } from "../../types"; // Added import
import { toast } from "react-hot-toast"; // Added import

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
    const location = useLocation();
    const { user } = useAppSelector((state) => state.auth); // Get user from Redux
    const dispatch = useAppDispatch(); // Added dispatch
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatusResponse | null>(null);
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        if (location.state?.editPropertyId) {
            setEditId(location.state.editPropertyId);
            setActiveItem("Register Property");
            // Clear state after reading to avoid re-triggering
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);

        // Check for adhar status on load
        if (user) {
            const aadharStatus = user.aadharStatus || user.personalDocuments?.aadharStatus;
            const isVerified = user.isVerified || user.aadhaarVerified || aadharStatus === 'verified' || aadharStatus === 'approved';

            if (!isVerified) {
                // Optionally redirect or set active item to verification if critical
                // For now, we just ensure they can access the page.
                // If the user navigates here specifically, they might see Dashboard first.
                // We could force it:
                // setActiveItem("Identity Verification");
            }
        }

        return () => window.removeEventListener("resize", handleResize);
    }, [user, dispatch]);

    // Unified initial data fetch
    useEffect(() => {
        const initializeDashboard = async () => {
            try {
                // 1. Fetch profile and update status
                const profile = await partnerAuthService.getPartnerProfile();
                let pDocs = profile.personalDocuments || {};

                // Only fetch extra docs if needed (status is pending or review)
                if (pDocs.aadharStatus && pDocs.aadharStatus !== 'not_submitted' && pDocs.aadharStatus !== 'approved' && pDocs.aadharStatus !== 'verified') {
                    try {
                        const docs = await partnerAuthService.getAadhaarDocuments();
                        if (docs) {
                            pDocs = { ...pDocs, ...docs };
                        }
                    } catch (docError) {
                        console.warn("Could not fetch separate aadhaar documents", docError);
                    }
                }

                dispatch(updateUser({
                    ...user,
                    ...profile,
                    isVerified: profile.status === 'verified' || profile.status === 'active',
                    aadhaarVerified: pDocs.aadharStatus === 'approved' || pDocs.aadharStatus === 'verified',
                    aadharStatus: pDocs.aadharStatus as any,
                    personalDocuments: pDocs
                }));

                // 2. Fetch verification status summary
                const status = await partnerAuthService.getVerificationStatus();
                setVerificationStatus(status);

                // 3. Setup Socket
                const token = partnerAuthService.getAccessToken();
                if (token) {
                    socketService.connect(token);
                    socketService.onVerificationApproved(() => {
                        partnerAuthService.getVerificationStatus().then(setVerificationStatus);
                    });
                    socketService.onVerificationRejected(() => {
                        partnerAuthService.getVerificationStatus().then(setVerificationStatus);
                    });
                }
            } catch (error) {
                console.error("Dashboard initialization failed", error);
            }
        };

        if (user) {
            initializeDashboard();
        }

        return () => {
            socketService.off('PARTNER_VERIFICATION_APPROVED');
            socketService.off('PARTNER_VERIFICATION_REJECTED');
        };
    }, [dispatch]); // Removed user from dependency to prevent re-runs on state update

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

    const handleRegisterPropertyClick = () => {
        // 1. Check if account is active
        if (user?.isActive === false) {
            toast.error("Your account is deactivated. You cannot register properties.");
            return;
        }

        // 2. Check verification status
        const canAdd = verificationStatus?.canAddProperty;

        if (!canAdd) {
            setActiveItem("Identity Verification");
            toast.error("Please complete identity verification to register properties.");
            return;
        }
        setActiveItem("Register Property");
    };

    const renderMainContent = () => {
        switch (activeItem) {
            case "Register Property":
                return <RegisterProperty propertyId={editId || undefined} onCancel={() => {
                    setEditId(null);
                    setActiveItem("Dashboard");
                }} />;
            case "All Properties":
                return <AllProperties />;
            case "Bookings":
                return <BookingManagement />;
            case "Profile":
                return <PartnerProfilePage />;
            case "Identity Verification": // Added case
                return <AadharVerification />;
            default:
                return (
                    <>
                        {user?.isActive === false && (
                            <div className="mb-6 bg-red-600 p-6 rounded-2xl shadow-xl border-4 border-white animate-pulse">
                                <div className="flex items-center gap-4 text-white">
                                    <ShieldCheck className="shrink-0" size={40} />
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Account Deactivated</h2>
                                        <p className="font-bold opacity-90 mt-1">Please contact support. You cannot register properties or manage bookings while deactivated.</p>
                                    </div>
                                </div>
                            </div>
                        )}
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
            {/* Mobile Backdrop */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`z-50 h-full bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out
                ${isMobile ? 'fixed inset-y-0 left-0 w-64' : 'relative'}
                ${isMobile
                        ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
                        : (sidebarOpen ? 'w-64 translate-x-0' : 'w-16 translate-x-0')
                    }
                `}
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
                        {!sidebarOpen && !isMobile && (
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

                    {/* Identity Verification Item */}
                    <SidebarItem
                        icon={<ShieldCheck size={18} />}
                        title="Identity Verification"
                        isActive={activeItem === "Identity Verification"}
                        onClick={() => setActiveItem("Identity Verification")}
                        sidebarOpen={sidebarOpen}
                        badge={verificationStatus && !verificationStatus.canAddProperty ? 1 : undefined} // Show badge if pending
                    />

                    <SidebarItem
                        icon={<PlusCircle size={18} />}
                        title="Register Property"
                        isActive={activeItem === "Register Property"}
                        onClick={handleRegisterPropertyClick} // Use protected handler
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarItem
                        icon={<House size={18} />}
                        title="All Properties"
                        isActive={activeItem === "All Properties"}
                        onClick={() => setActiveItem("All Properties")}
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
                            <div className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center mr-2">
                                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'P'}
                            </div>
                            <span className="text-gray-700 font-medium hidden md:inline">
                                {user?.fullName || 'Partner'}
                            </span>
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
