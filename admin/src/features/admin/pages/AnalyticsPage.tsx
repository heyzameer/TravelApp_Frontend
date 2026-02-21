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

interface AnalyticsData {
    stats: {
        platformGrowth: string;
        activeUsers: string;
        newProperties: string;
        revenueGrowth: string;
    };
    growthData: { name: string; bookings: number }[];
    propertyTypeData: { name: string; value: number }[];
    userGrowthData: { name: string; users: number; partners: number }[];
    marketInsights: { title: string; value: string; progress: number; color: string }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const AnalyticsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState('Last 6 Months');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await adminService.getAnalyticsData(timeRange);
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    const { stats, growthData, propertyTypeData, userGrowthData, marketInsights } = data || {};

    const handleExportReport = () => {
        if (!data) return;

        // Prepare CSV Content
        let csvContent = "data:text/csv;charset=utf-8,";

        // 1. Summary Stats
        csvContent += "SECTION: SUMMARY STATISTICS\n";
        csvContent += "Metric,Value\n";
        csvContent += `Platform Growth,${stats?.platformGrowth}\n`;
        csvContent += `Active Users,${stats?.activeUsers}\n`;
        csvContent += `New Properties,${stats?.newProperties}\n`;
        csvContent += `Revenue Growth,${stats?.revenueGrowth}\n\n`;

        // 2. Booking Growth
        csvContent += "SECTION: BOOKING VOLUME TREND\n";
        csvContent += "Period,Bookings\n";
        growthData?.forEach((row: { name: string; bookings: number }) => {
            csvContent += `${row.name},${row.bookings}\n`;
        });
        csvContent += "\n";

        // 3. Stay Types
        csvContent += "SECTION: STAY TYPES DISTRIBUTION\n";
        csvContent += "Type,Count\n";
        propertyTypeData?.forEach((row: { name: string; value: number }) => {
            csvContent += `${row.name},${row.value}\n`;
        });
        csvContent += "\n";

        // 4. Market Insights
        csvContent += "SECTION: MARKET INSIGHTS\n";
        csvContent += "Metric,Value,Percentage\n";
        marketInsights?.forEach((row: { title: string; value: string; progress: number }) => {
            csvContent += `${row.title},${row.value},${row.progress}%\n`;
        });

        // Download Trigger
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `travel_hub_analytics_${timeRange.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                    <button
                        onClick={handleExportReport}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {[
                    { label: 'Platform Growth', value: stats?.platformGrowth || '0%', icon: <TrendingUp size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Users', value: stats?.activeUsers || '0', icon: <Users size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'New Properties', value: stats?.newProperties || '0', icon: <Home size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Revenue Growth', value: stats?.revenueGrowth || '0%', icon: <ShoppingBag size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
                        <div className={`${item.bg} ${item.color} p-3 rounded-lg`}>
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{item.label}</p>
                            <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                        </div>
                        {loading && (
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center">
                                <RefreshCw className="animate-spin text-gray-300" size={16} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Main Charts Section */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
                {/* Booking Revenue & Growth */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Calendar size={18} className="text-blue-500" />
                            Booking Volume
                        </h2>
                        {loading && <RefreshCw className="animate-spin text-blue-500" size={16} />}
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                            <AreaChart data={growthData || []}>
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
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Box size={18} className="text-purple-500" />
                            Stay Types
                        </h2>
                        {loading && <RefreshCw className="animate-spin text-purple-500" size={16} />}
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
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
                                    {propertyTypeData?.map((_item, index: number) => (
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
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
                {/* User & Partner Growth */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Users size={18} className="text-green-500" />
                            User Acquisition
                        </h2>
                        {loading && <RefreshCw className="animate-spin text-green-500" size={16} />}
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                            <BarChart data={userGrowthData || []}>
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
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp size={18} className="text-orange-500" />
                            Market Insights
                        </h2>
                        {loading && <RefreshCw className="animate-spin text-orange-500" size={16} />}
                    </div>
                    <div className="space-y-4">
                        {(marketInsights || []).map((stat, idx: number) => (
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
