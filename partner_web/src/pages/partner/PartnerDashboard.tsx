import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
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
    User as UserIcon,
    House,
    PlusCircle,
    ShieldCheck,
    Star,
    TrendingUp,
    MapPin,
    ArrowUpRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { partnerAuthService } from "../../services/partnerAuth";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateUser } from "../../store/slices/authSlice";
import RegisterProperty from "./RegisterProperty";
import BookingManagement from "./BookingManagement";
import PartnerProfilePage from "./PartnerProfile";
import AadharVerification from "./AadharVerification";
import AllProperties from "./AllProperties";
import { socketService } from "../../services/socketService";
import type { VerificationStatusResponse, Booking, Property } from "../../types";
import { toast } from "react-hot-toast";
import { fetchPartnerBookings } from "../../store/slices/bookingsSlice";
import { PartnerReviewsList } from "../../components/reviews";
import { DataTable, type Column } from "../../components/common/DataTable";

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
            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-300 ease-out rounded-xl mb-1 group
        ${isActive
                    ? "bg-slate-900 text-white font-semibold shadow-lg shadow-gray-200 translate-x-1"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            onClick={onClick}
        >
            <div className="flex items-center">
                <span
                    className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-red-500"} transition-colors ${sidebarOpen ? "mr-3" : ""
                        } ${!sidebarOpen ? "mx-auto" : ""}`}
                >
                    {icon}
                </span>
                {sidebarOpen && (
                    <span className="text-sm tracking-tight">{title}</span>
                )}
            </div>
            {sidebarOpen && (
                <div className="flex items-center">
                    {badge !== undefined && (
                        <span className={`text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1.5 mr-2 ${isActive ? 'bg-white text-slate-900' : 'bg-red-500 text-white'}`}>
                            {badge}
                        </span>
                    )}
                    {hasDropdown &&
                        (isActive ? (
                            <ChevronDown size={16} className="text-white" />
                        ) : (
                            <ChevronRight size={16} className="text-gray-400" />
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
    const [properties, setProperties] = useState<Property[]>([]);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatusResponse | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const { bookings, loading: loadingBookings } = useAppSelector((state) => state.bookings);

    useEffect(() => {
        if (location.state?.editPropertyId) {
            setEditId(location.state.editPropertyId);
            setActiveItem("Register Property");
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const initializeDashboard = async () => {
            try {
                const profile = await partnerAuthService.getPartnerProfile();
                let pDocs = profile.personalDocuments || {};

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
                    ...profile,
                    isVerified: profile.status === 'verified' || profile.status === 'active',
                    aadhaarVerified: pDocs.aadharStatus === 'approved' || pDocs.aadharStatus === 'verified',
                    aadharStatus: pDocs.aadharStatus as 'not_submitted' | 'pending' | 'manual_review' | 'verified' | 'rejected' | 'approved',
                    personalDocuments: pDocs
                }));

                const status = await partnerAuthService.getVerificationStatus();
                setVerificationStatus(status);

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

                dispatch(fetchPartnerBookings(undefined));

                // Fetch Properties
                setLoadingProperties(true);
                const props = await partnerAuthService.getPartnerProperties();
                setProperties(props);
                setLoadingProperties(false);

            } catch (error) {
                console.error("Dashboard initialization failed", error);
                setLoadingProperties(false);
            }
        };

        if (user?.id) {
            initializeDashboard();
        }

        return () => {
            socketService.off('PARTNER_VERIFICATION_APPROVED');
            socketService.off('PARTNER_VERIFICATION_REJECTED');
        };
    }, [dispatch, user?.id]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const stats = [
        {
            title: "Properties",
            count: user?.totalProperties || properties.length || 0,
            icon: <House size={20} />,
            color: "text-blue-600 bg-blue-50 border-blue-100",
            trend: "Active listings"
        },
        {
            title: "New Bookings",
            count: bookings.filter(b => b.partnerApprovalStatus === 'pending' && b.status !== 'cancelled').length,
            icon: <Clock size={20} />,
            color: "text-amber-600 bg-amber-50 border-amber-100",
            trend: "Action required"
        },
        {
            title: "Active Stays",
            count: bookings.filter(b => b.status === 'checked_in').length,
            icon: <CheckCircle size={20} />,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100",
            trend: "Currently staying"
        },
        {
            title: "Total Revenue",
            count: `₹${bookings.filter(b => ['confirmed', 'checked_in', 'checked_out', 'completed'].includes(b.status)).reduce((sum, b) => sum + b.finalPrice, 0).toLocaleString()}`,
            icon: <BarChart2 size={20} />,
            color: "text-indigo-600 bg-indigo-50 border-indigo-100",
            trend: "All time earnings"
        },
    ];

    const handleRegisterPropertyClick = () => {
        if (user?.isActive === false) {
            toast.error("Your account is deactivated. You cannot register properties.");
            return;
        }
        const canAdd = verificationStatus?.canAddProperty;
        if (!canAdd) {
            setActiveItem("Identity Verification");
            toast.error("Please complete identity verification to register properties.");
            return;
        }
        setActiveItem("Register Property");
    };

    const topProperties = useMemo(() => {
        const propertyStats = properties.map(prop => {
            const propBookings = bookings.filter(b =>
                (typeof b.propertyId === 'string' ? b.propertyId === prop._id : b.propertyId?._id === prop._id) &&
                ['confirmed', 'checked_in', 'checked_out', 'completed'].includes(b.status)
            );
            const revenue = propBookings.reduce((sum, b) => sum + b.finalPrice, 0);
            return {
                ...prop,
                revenue,
                bookingCount: propBookings.length
            };
        });
        return propertyStats.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [properties, bookings]);

    const bookingColumns: Column<Booking>[] = [
        {
            header: 'GUEST',
            key: 'userId',
            render: (booking) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-semibold border border-slate-200">
                        {(booking.userId && typeof booking.userId === 'object' ? booking.userId.fullName : 'G')[0]}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-900">
                            {booking.userId && typeof booking.userId === 'object' ? booking.userId.fullName : 'Guest'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            #{booking.bookingId}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'STAY',
            key: 'checkInDate',
            render: (booking) => (
                <div className="text-xs font-medium text-slate-600">
                    {format(new Date(booking.checkInDate), 'dd MMM')} - {booking.checkOutDate ? format(new Date(booking.checkOutDate), 'dd MMM') : 'N/A'}
                </div>
            )
        },
        {
            header: 'AMOUNT',
            key: 'finalPrice',
            render: (booking) => (
                <div className="text-sm font-bold text-slate-900">
                    ₹{booking.finalPrice.toLocaleString()}
                </div>
            )
        },
        {
            header: 'STATUS',
            key: 'status',
            render: (booking) => (
                <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${booking.partnerApprovalStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    booking.partnerApprovalStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    {booking.partnerApprovalStatus === 'pending' ? 'Pending' : booking.partnerApprovalStatus}
                </span>
            )
        },
        {
            header: '',
            key: 'actions',
            className: 'text-right',
            render: (booking) => (
                <button
                    onClick={() => navigate(`/partner/bookings/${booking.bookingId}`)}
                    className="text-red-500 hover:text-red-600 font-black text-[10px] uppercase tracking-tighter hover:underline"
                >
                    View
                </button>
            )
        }
    ];

    const propertyColumns: Column<Property & { revenue: number; bookingCount: number }>[] = [
        {
            header: 'PROPERTY',
            key: 'propertyName',
            render: (prop) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
                        <House size={18} />
                    </div>
                    <div>
                        <div className="text-sm font-black text-gray-800 line-clamp-1">{prop.propertyName}</div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                            <MapPin size={10} />
                            {prop.address.city}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'BOOKINGS',
            key: 'bookingCount',
            render: (prop) => (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900">{prop.bookingCount}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Confirmed</span>
                </div>
            )
        },
        {
            header: 'REVENUE',
            key: 'revenue',
            render: (prop) => (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-emerald-600">₹{prop.revenue.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Earnings</span>
                </div>
            )
        },
        {
            header: 'STATUS',
            key: 'verificationStatus',
            render: (prop) => (
                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${prop.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    prop.verificationStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    {prop.verificationStatus}
                </span>
            )
        }
    ];

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
            case "Identity Verification":
                return <AadharVerification />;
            case "Reviews":
                return <PartnerReviewsList />;
            default:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {user?.isActive === false && (
                            <div className="bg-red-600 p-6 rounded-[2rem] shadow-2xl shadow-red-200 border-4 border-white flex items-center gap-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <ShieldCheck size={120} />
                                </div>
                                <div className="shrink-0 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <ShieldCheck className="text-white" size={32} />
                                </div>
                                <div className="z-10 text-white">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">Account Deactivated</h2>
                                    <p className="font-bold opacity-90 text-sm">Please contact support. Property registration and booking management are currently restricted.</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                    Welcome, {user?.fullName?.split(' ')[0] || 'Partner'}!
                                </h2>
                                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                                    Live Sync Active
                                </div>
                            </div>
                            <p className="text-slate-500 font-medium text-sm">
                                Here&apos;s a quick overview of your hospitality portal today.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-2xl border transition-colors duration-300 ${stat.color}`}>
                                            {stat.icon}
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                                            <TrendingUp size={14} className="text-slate-300 group-hover:text-slate-600" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{stat.title}</p>
                                    <div className="flex items-baseline gap-2">
                                        <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.count}</h4>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium mt-3 border-t border-slate-50 pt-3 flex items-center gap-1">
                                        <ArrowUpRight size={10} className="text-emerald-500" />
                                        {stat.trend}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* Recent Bookings */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>

                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Latest 5 Bookings</p>
                                    </div>
                                    <button
                                        onClick={() => setActiveItem("Bookings")}
                                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-all active:scale-95"
                                    >
                                        View All
                                    </button>
                                </div>

                                <DataTable
                                    columns={bookingColumns}
                                    data={bookings.slice(0, 5)}
                                    loading={loadingBookings}
                                    emptyMessage="No bookings yet. Start your journey!"
                                    className="border-none"
                                />
                            </div>

                            {/* Top Performing Properties */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
                                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>

                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 text-emerald-600">Top Listings</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Based on Revenue</p>
                                    </div>
                                    <button
                                        onClick={() => setActiveItem("All Properties")}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all active:scale-95"
                                    >
                                        Manage
                                    </button>
                                </div>

                                <DataTable
                                    columns={propertyColumns}
                                    data={topProperties}
                                    loading={loadingProperties}
                                    emptyMessage="List your first property to see stats!"
                                    className="border-none"
                                />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans selection:bg-red-50 overflow-hidden">
            {/* Mobile Backdrop */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`z-50 h-full bg-white flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) border-r border-gray-100
                ${isMobile ? 'fixed inset-y-0 left-0 w-72' : 'relative'}
                ${isMobile
                        ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-none')
                        : (sidebarOpen ? 'w-72 translate-x-0' : 'w-24 translate-x-0')
                    }
                ${sidebarOpen ? 'shadow-2xl shadow-gray-200/50' : 'shadow-none'}
                `}
            >
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white p-2.5 rounded-2xl shadow-lg shadow-gray-200 transition-transform duration-500">
                            <House size={24} />
                        </div>
                        {sidebarOpen && (
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Nature<span className="text-red-500">Stay</span>
                            </h1>
                        )}
                    </div>
                </div>

                <div className="px-4 py-8 flex-1 overflow-y-auto scrollbar-hide space-y-1">
                    <SidebarItem
                        icon={<Home size={20} />}
                        title="Dashboard"
                        isActive={activeItem === "Dashboard"}
                        onClick={() => { setActiveItem("Dashboard"); if (isMobile) setSidebarOpen(false); }}
                        sidebarOpen={sidebarOpen}
                    />

                    <SidebarItem
                        icon={<ShieldCheck size={20} />}
                        title="Identity Verification"
                        isActive={activeItem === "Identity Verification"}
                        onClick={() => { setActiveItem("Identity Verification"); if (isMobile) setSidebarOpen(false); }}
                        sidebarOpen={sidebarOpen}
                        badge={verificationStatus && !verificationStatus.canAddProperty ? 1 : undefined}
                    />

                    <div className="pt-4 pb-2 px-6">
                        {sidebarOpen ? (
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Management</p>
                        ) : (
                            <div className="h-[1px] bg-gray-100 mx-2"></div>
                        )}
                    </div>

                    <SidebarItem
                        icon={<PlusCircle size={20} />}
                        title="Add Property"
                        isActive={activeItem === "Register Property"}
                        onClick={() => { handleRegisterPropertyClick(); if (isMobile) setSidebarOpen(false); }}
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarItem
                        icon={<House size={20} />}
                        title="My Properties"
                        isActive={activeItem === "All Properties"}
                        onClick={() => { setActiveItem("All Properties"); if (isMobile) setSidebarOpen(false); }}
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarItem
                        icon={<Package size={20} />}
                        title="Bookings"
                        isActive={activeItem === "Bookings"}
                        onClick={() => { setActiveItem("Bookings"); if (isMobile) setSidebarOpen(false); }}
                        sidebarOpen={sidebarOpen}
                        badge={bookings.filter(b => b.partnerApprovalStatus === 'pending' && b.status !== 'cancelled').length || undefined}
                    />
                    <SidebarItem
                        icon={<Star size={20} />}
                        title="Guest Reviews"
                        isActive={activeItem === "Reviews"}
                        onClick={() => { setActiveItem("Reviews"); if (isMobile) setSidebarOpen(false); }}
                        sidebarOpen={sidebarOpen}
                    />

                    <div className="pt-4 pb-2 px-6">
                        {sidebarOpen ? (
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personal</p>
                        ) : (
                            <div className="h-[1px] bg-gray-100 mx-2"></div>
                        )}
                    </div>

                    <SidebarItem
                        icon={<UserIcon size={20} />}
                        title="My Profile"
                        isActive={activeItem === "Profile"}
                        onClick={() => { setActiveItem("Profile"); if (isMobile) setSidebarOpen(false); }}
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarItem
                        icon={<Settings size={20} />}
                        title="Settings"
                        isActive={activeItem === "Settings"}
                        onClick={() => { setActiveItem("Settings"); if (isMobile) setSidebarOpen(false); }}
                        sidebarOpen={sidebarOpen}
                    />
                </div>

                <div className="p-6 border-t border-gray-50">
                    <button
                        onClick={() => {
                            partnerAuthService.clearTokens();
                            navigate("/partner/login");
                        }}
                        className={`flex items-center gap-3 text-gray-500 hover:text-red-600 transition-all font-bold text-sm w-full px-4 py-3 rounded-xl hover:bg-red-50 group ${!sidebarOpen && "justify-center"}`}
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        {sidebarOpen && <span className="uppercase tracking-widest text-xs">Sign Out</span>}
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white/80 backdrop-blur-md h-20 flex items-center justify-between px-8 z-30 sticky top-0 border-b border-gray-100">
                    <div className="flex items-center gap-6">
                        <button
                            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                            onClick={toggleSidebar}
                        >
                            <Menu size={22} />
                        </button>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{activeItem}</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Partner Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group p-2.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                            <Bell size={20} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                            <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-white shadow-sm animate-bounce">2</span>
                        </div>

                        <div className="h-10 w-[1px] bg-gray-100 mx-2 hidden sm:block"></div>

                        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">{user?.fullName || 'Partner'}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{user?.role || 'Host'}</p>
                            </div>
                            <div className="h-11 w-11 rounded-2xl bg-slate-100 p-[2px] shadow-sm">
                                <div className="h-full w-full rounded-[0.8rem] bg-white flex items-center justify-center text-slate-900 font-bold text-lg border border-slate-200">
                                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'P'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth">
                    <div className="max-w-[1600px] mx-auto px-8 py-10">
                        {renderMainContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PartnerDashboard;
