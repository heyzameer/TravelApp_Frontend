import React, { useState, useEffect } from 'react';
import { Calendar, Users, Building2, TrendingUp, Loader2, Check, X } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { adminService } from '../../../services/admin';
import { toast } from 'react-hot-toast';

interface StatItem {
    title: string;
    count: number;
    trend?: string;
    icon?: React.ReactNode;
    color?: string;
}

interface DashboardItem {
    id: string;
    title: string;
    subtitle: string;
    status: string;
    statusColor: string;
}

interface DashboardData {
    stats: StatItem[];
    recentBookings: DashboardItem[];
    pendingApprovals: DashboardItem[];
    growthData: { name: string; bookings: number }[];
}

interface StatsCardProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, count, icon, color, trend }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium text-sm">{title}</h3>
                <span className={`${color} p-3 rounded-full`}>{icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-2">{count}</p>
            {trend && (
                <div className="flex items-center text-sm text-green-600">
                    <TrendingUp size={16} className="mr-1" />
                    <span>{trend}</span>
                </div>
            )}
        </div>
    );
};


const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [monthRange, setMonthRange] = useState(6);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            const response = await adminService.getDashboardStats({ months: monthRange });
            setDashboardData(response.data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthRange]);

    const handleApproval = async (item: DashboardItem, approved: boolean) => {
        setActionLoading(`${item.id}-${approved ? 'approve' : 'reject'}`);
        try {
            if (item.status === 'Refund Requested') {
                await adminService.processRefund(item.id, approved);
                toast.success(approved ? 'Refund approved' : 'Refund rejected');
            } else if (item.status === 'Property Pending') {
                await adminService.verifyProperty(item.id, approved ? 'verified' : 'rejected');
                toast.success(approved ? 'Property approved' : 'Property rejected');
            } else if (item.status === 'Owner Pending') {
                await adminService.verifyPartnerAadhaar(item.id, approved ? 'approve' : 'reject');
                toast.success(approved ? 'Owner approved' : 'Owner rejected');
            } else {
                toast.error('Action not implemented for this type');
                return;
            }
            // Refresh data
            await fetchStats();
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to process request';
            toast.error(message);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading && !dashboardData) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-blue-600 animate-spin" />
                    <p className="text-gray-500 font-medium text-lg">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const { stats = [], recentBookings = [], pendingApprovals = [], growthData = [] } = dashboardData || {};

    // Map icons to backend stats
    const statsWithIcons = stats.map((stat: StatItem, index: number) => {
        const icons = [
            <Calendar size={24} className="text-blue-600" />,
            <Users size={24} className="text-green-600" />,
            <Building2 size={24} className="text-purple-600" />,
            <Users size={24} className="text-orange-600" />
        ];
        const colors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100'];

        return {
            ...stat,
            icon: icons[index % icons.length],
            color: colors[index % colors.length]
        };
    });

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            {/* Welcome Section */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white shadow-lg">
                <h2 className="text-3xl font-bold mb-2">
                    Welcome back, Admin!
                </h2>
                <p className="text-blue-100 text-lg opacity-90">
                    Here's what's happening on TravelHub today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsWithIcons.map((stat, index: number) => (
                    <StatsCard
                        key={index}
                        title={stat.title}
                        count={stat.count}
                        icon={stat.icon}
                        color={stat.color}
                        trend={stat.trend}
                    />
                ))}
            </div>

            {/* Growth Chart */}
            <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-600" />
                            Platform Growth Insights
                        </h3>
                        <select
                            value={monthRange}
                            onChange={(e) => setMonthRange(Number(e.target.value))}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
                        >
                            <option value={3}>Last 3 Months</option>
                            <option value={6}>Last 6 Months</option>
                            <option value={12}>Last 12 Months</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            Bookings
                        </span>
                    </div>
                </div>
                <div className="h-72 w-full">
                    {growthData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="bookings"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorBookings)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                            <TrendingUp size={48} className="mb-2 opacity-20" />
                            <p>No growth data available yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-blue-600" />
                        Recent Bookings
                    </h3>
                    <div className="space-y-3 flex-1">
                        {recentBookings.length > 0 ? recentBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div>
                                    <p className="font-bold text-gray-800">{booking.title}</p>
                                    <p className="text-sm text-gray-500">{booking.subtitle}</p>
                                </div>
                                <span className={`px-3 py-1 ${booking.statusColor} rounded-full text-xs font-bold`}>
                                    {booking.status}
                                </span>
                            </div>
                        )) : (
                            <div className="flex items-center justify-center h-full text-gray-400 py-10">
                                No recent bookings found
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Building2 size={20} className="text-orange-500" />
                        Approvals Needed
                    </h3>
                    <div className="space-y-3 flex-1">
                        {pendingApprovals.length > 0 ? pendingApprovals.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{item.title}</p>
                                    <p className="text-sm text-gray-500">{item.subtitle}</p>
                                    <div className="mt-1">
                                        <span className={`px-2 py-0.5 ${item.statusColor} rounded-full text-[10px] font-bold`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleApproval(item, true)}
                                        disabled={!!actionLoading}
                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
                                        title="Approve"
                                    >
                                        {actionLoading === `${item.id}-approve` ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Check size={16} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleApproval(item, false)}
                                        disabled={!!actionLoading}
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                        title="Reject"
                                    >
                                        {actionLoading === `${item.id}-reject` ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <X size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="flex items-center justify-center h-full text-gray-400 py-10">
                                All clear! No pending approvals.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
