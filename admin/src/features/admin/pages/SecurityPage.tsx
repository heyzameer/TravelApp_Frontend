import React, { useState, useEffect } from 'react';
import {
    Lock, Eye, EyeOff,
    Mail, History, Monitor, MapPin,
    ChevronRight, Loader2
} from 'lucide-react';
import { adminService } from '../../../services/admin';
import { toast } from 'react-hot-toast';
import ConfirmDialogManager from '../../../utils/confirmDialog';

interface LoginHistory {
    device: string;
    location: string;
    type: string;
    ip: string;
    date: string;
    active?: boolean;
}

const SecurityPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [twoFA, setTwoFA] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [history, setHistory] = useState<LoginHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    // Password form state
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const fetchHistory = async () => {
        try {
            const response = await adminService.getLoginHistory();
            const historyData = response.data as any;
            setHistory(Array.isArray(historyData) ? historyData : (historyData?.history || []));
        } catch (error) {
            console.error("Failed to fetch login history:", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await adminService.getSettings();
                setTwoFA((response.data as any).settings.twoFactorAuth || false);
                await fetchHistory();
            } catch (error) {
                console.error("Failed to fetch security settings:", error);
                toast.error("Failed to load security settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleLogoutAllSessions = async () => {
        try {
            await adminService.logoutOtherSessions();
            toast.success("Successfully logged out from all other sessions");
            await fetchHistory();
        } catch (error: unknown) {
            console.error("Failed to logout other sessions:", error);
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to logout other sessions";
            toast.error(message);
        }
    };

    const handleClearHistory = async () => {
        const confirmed = await ConfirmDialogManager.getInstance().confirm(
            'Are you sure you want to clear your entire login history? This action cannot be undone.',
            {
                title: 'Clear Login History',
                confirmText: 'Clear History',
                type: 'delete'
            }
        );

        if (!confirmed) return;

        try {
            await adminService.clearLoginHistory();
            toast.success("Login history cleared completely");
            await fetchHistory();
        } catch (error: unknown) {
            console.error("Failed to clear login history:", error);
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to clear login history";
            toast.error(message);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdatePassword = async () => {
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            toast.error("Please fill in all password fields");
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            return;
        }

        setUpdatingPassword(true);
        try {
            await adminService.changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success("Password updated successfully");
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: unknown) {
            console.error("Failed to update password:", error);
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update password";
            toast.error(message);
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handleToggle2FA = async () => {
        setToggling(true);
        try {
            const newStatus = !twoFA;
            await adminService.updateSettings({ twoFactorAuth: newStatus });
            setTwoFA(newStatus);
            toast.success(`Two-Factor Authentication ${newStatus ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error("Failed to update 2FA:", error);
            toast.error("Failed to update security settings");
        } finally {
            setToggling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

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
                                    name="currentPassword"
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter current password"
                                    className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all text-gray-800"
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
                            <input
                                type="password"
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Min. 8 characters"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white text-gray-800 transition-all font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Confirm new password"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white text-gray-800 transition-all font-mono"
                            />
                        </div>
                    </div>
                    <div className="flex justify-start">
                        <button
                            onClick={handleUpdatePassword}
                            disabled={updatingPassword}
                            className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-70"
                        >
                            {updatingPassword ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 2FA Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Two-Factor Authentication (2FA)</h3>
                            <p className="text-gray-500 text-sm max-w-lg mt-1">
                                Enhance your account security by requiring a verification code sent to your registered email in addition to your password.
                            </p>
                            <div className="mt-4 flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className={`${twoFA ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-bold ${twoFA ? 'text-gray-700' : 'text-gray-400'}`}>Email Verification</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={twoFA}
                            onChange={handleToggle2FA}
                            disabled={toggling}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[21px] after:w-[21px] after:transition-all peer-checked:bg-blue-600"></div>
                        {toggling && (
                            <div className="absolute -right-8">
                                <Loader2 size={16} className="animate-spin text-blue-600" />
                            </div>
                        )}
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
                    {history.length > 0 && (
                        <div className="flex items-center gap-4">
                            {history.length > 1 && (
                                <button
                                    onClick={handleLogoutAllSessions}
                                    className="text-sm font-bold text-blue-600 hover:underline"
                                >
                                    Log out all other sessions
                                </button>
                            )}
                            <button
                                onClick={handleClearHistory}
                                className="text-sm font-bold text-red-600 hover:underline"
                            >
                                Clear History
                            </button>
                        </div>
                    )}
                </div>
                <div className="divide-y divide-gray-50">
                    {historyLoading ? (
                        <div className="p-10 flex flex-col items-center justify-center text-gray-400 gap-2">
                            <Loader2 className="animate-spin text-blue-500" size={24} />
                            <p className="text-sm">Loading activity logs...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No recent login activity found.
                        </div>
                    ) : (
                        history.map((login, idx) => (
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
                                            <span>{login.type} ({login.ip})</span>
                                            <span>•</span>
                                            <span>{new Date(login.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-gray-300" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecurityPage;
