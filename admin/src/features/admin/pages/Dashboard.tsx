import React from 'react';
import { Calendar, Users, Building2, TrendingUp } from 'lucide-react';

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
    const stats = [
        {
            title: 'Total Bookings',
            count: 1247,
            icon: <Calendar size={24} className="text-blue-600" />,
            color: 'bg-blue-100',
            trend: '+12% from last month',
        },
        {
            title: 'Active Guests',
            count: 892,
            icon: <Users size={24} className="text-green-600" />,
            color: 'bg-green-100',
            trend: '+8% from last month',
        },
        {
            title: 'Properties Listed',
            count: 156,
            icon: <Building2 size={24} className="text-purple-600" />,
            color: 'bg-purple-100',
            trend: '+5 new this week',
        },
        {
            title: 'Property Owners',
            count: 89,
            icon: <Users size={24} className="text-orange-600" />,
            color: 'bg-orange-100',
            trend: '+3 pending approval',
        },
    ];

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Welcome to TravelHub Admin
                </h2>
                <p className="text-gray-600">
                    Monitor your property bookings and manage operations
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
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

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Recent Bookings
                    </h3>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium text-gray-800">Luxury Villa #{item}</p>
                                    <p className="text-sm text-gray-500">Booked by Guest {item}</p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    Confirmed
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Pending Approvals
                    </h3>
                    <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium text-gray-800">Property Owner #{item}</p>
                                    <p className="text-sm text-gray-500">Application submitted</p>
                                </div>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                    Pending
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Occupancy Chart Placeholder */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Property Occupancy Rate
                </h3>
                <div className="h-64 w-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Chart placeholder - Property occupancy trends</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
