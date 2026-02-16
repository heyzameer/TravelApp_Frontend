import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, Users, Home, Calendar, Download,
    ChevronDown, RefreshCw, Box, ShoppingBag
} from 'lucide-react';
import { adminService } from '../../../services/admin';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const AnalyticsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any>(null);
    const [timeRange, setTimeRange] = useState('Last 6 Months');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // For now, using dashboard stats for basic data
                // In a real app, we'd have a specific analytics endpoint
                const response = await adminService.getDashboardStats();
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Mock data for more advanced charts since we only have basic stats
    const propertyTypeData = [
        { name: 'Hotels', value: 45 },
        { name: 'Villas', value: 25 },
        { name: 'Apartments', value: 20 },
        { name: 'Resorts', value: 10 },
    ];

    const userGrowthData = [
        { name: 'Jan', users: 400, partners: 20 },
        { name: 'Feb', users: 600, partners: 35 },
        { name: 'Mar', users: 800, partners: 50 },
        { name: 'Apr', users: 1100, partners: 65 },
        { name: 'May', users: 1400, partners: 80 },
        { name: 'Jun', users: 1800, partners: 100 },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw size={40} className="text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Platform Analytics</h1>
                    <p className="text-gray-500">Track your platform's performance and growth</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option>Last 30 Days</option>
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                            <option>All Time</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Platform Growth', value: '+24%', icon: <TrendingUp size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Users', value: data?.stats[1]?.count || '1.2k', icon: <Users size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'New Properties', value: '+18', icon: <Home size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Revenue Growth', value: '+12.5%', icon: <ShoppingBag size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`${item.bg} ${item.color} p-3 rounded-lg`}>
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{item.label}</p>
                            <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Booking Revenue & Growth */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Calendar size={18} className="text-blue-500" />
                            Booking Volume
                        </h2>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.growthData || []}>
                                <defs>
                                    <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorB)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Property Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Box size={18} className="text-purple-500" />
                        Stay Types
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={propertyTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {propertyTypeData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User & Partner Growth */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Users size={18} className="text-green-500" />
                        User Acquisition
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="partners" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Insights */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-orange-500" />
                        Market Insights
                    </h2>
                    <div className="space-y-4">
                        {[
                            { title: 'Customer Satisfaction', value: '4.8/5.0', progress: 96, color: 'bg-blue-500' },
                            { title: 'Repeat Booking Rate', value: '32%', progress: 32, color: 'bg-green-500' },
                            { title: 'Booking Conversion', value: '8.4%', progress: 78, color: 'bg-purple-500' },
                            { title: 'Partner Growth Rate', value: '12%', progress: 65, color: 'bg-orange-500' },
                        ].map((stat, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 font-medium">{stat.title}</span>
                                    <span className="text-gray-900 font-bold">{stat.value}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${stat.color} transition-all duration-1000`}
                                        style={{ width: `${stat.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
