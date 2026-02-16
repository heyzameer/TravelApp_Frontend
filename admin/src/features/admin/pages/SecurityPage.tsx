import React, { useState } from 'react';
import {
    Lock, Eye, EyeOff,
    Smartphone, Mail, History, Monitor, MapPin,
    AlertTriangle, CheckCircle2, ChevronRight
} from 'lucide-react';

const SecurityPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [twoFA, setTwoFA] = useState(true);

    const loginHistory = [
        { device: 'MacBook Pro 16"', location: 'Mumbai, India', date: 'Just now', type: 'Chrome', active: true },
        { device: 'iPhone 15', location: 'Delhi, India', date: '2 hours ago', type: 'Safari', active: false },
        { device: 'Windows Desktop', location: 'Bangalore, India', date: '2 days ago', type: 'Firefox', active: false },
    ];

    return (
        <div className="max-w-4xl space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Security & Privacy</h1>
                <p className="text-gray-500">Manage your administrative security and login activity</p>
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Lock size={18} className="text-blue-500" />
                        Password Management
                    </h2>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white"
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">New Password</label>
                            <input type="password" placeholder="Min. 8 characters" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                            <input type="password" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white" />
                        </div>
                    </div>
                    <div className="flex justify-start">
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-100">
                            Update Password
                        </button>
                    </div>
                </div>
            </div>

            {/* 2FA Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Two-Factor Authentication (2FA)</h3>
                            <p className="text-gray-500 text-sm max-w-lg mt-1">
                                Enhance your account security by requiring a verification code in addition to your password.
                            </p>
                            <div className="mt-4 flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    <span className="text-xs font-bold text-gray-700">SMS Verification</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-blue-500" />
                                    <span className="text-xs font-bold text-gray-700">Email Verification</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={twoFA} onChange={() => setTwoFA(!twoFA)} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[21px] after:w-[21px] after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            {/* Login History */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <History size={18} className="text-purple-500" />
                        Login History
                    </h2>
                    <button className="text-sm font-bold text-blue-600 hover:underline">Log out all other sessions</button>
                </div>
                <div className="divide-y divide-gray-50">
                    {loginHistory.map((login, idx) => (
                        <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                            <div className="flex gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                    <Monitor size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-800">{login.device}</h4>
                                        {login.active && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Current</span>}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            {login.location}
                                        </div>
                                        <span>•</span>
                                        <span>{login.type}</span>
                                        <span>•</span>
                                        <span>{login.date}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-300" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-8">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-red-900">Deactivate Administrator Access</h3>
                        <p className="text-red-800 opacity-70 text-sm mt-1">
                            Deactivating your admin access will immediately revoke your permissions and log you out. This action requires another super admin to reactivate.
                        </p>
                        <button className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red-200">
                            Deactivate Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityPage;
