import React, { useState, useEffect } from 'react';
import {
    Globe, Shield,
    Save, Github, Twitter, Facebook, Instagram,
    CheckCircle2, AlertCircle, RefreshCw, DollarSign, Lock
} from 'lucide-react';
import { adminService } from '../../../services/admin';

interface Settings {
    platformName: string;
    supportPhone: string;
    platformFeePercent: number;
    taxPercent: number;
    maintenanceMode: boolean;
    autoApprovePartners: boolean;
    twoFactorAuth: boolean;
    socialLinks: {
        github: string;
        twitter: string;
        facebook: string;
        instagram: string;
    };
}

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [settings, setSettings] = useState<Settings>({
        platformName: '',
        supportPhone: '',
        platformFeePercent: 10,
        taxPercent: 5,
        maintenanceMode: false,
        autoApprovePartners: false,
        twoFactorAuth: false,
        socialLinks: {
            github: '',
            twitter: '',
            facebook: '',
            instagram: ''
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await adminService.getSettings();
                setSettings(response.data.settings);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminService.updateSettings(settings);
            setNotice({ type: 'success', message: 'Settings saved successfully!' });
            setTimeout(() => setNotice(null), 3000);
        } catch {
            setNotice({ type: 'error', message: 'Failed to save settings.' });
            setTimeout(() => setNotice(null), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setSettings({
                ...settings,
                [parent]: {
                    ...(settings[parent as keyof Settings] as Record<string, string>),
                    [child]: value
                }
            });
        } else {
            setSettings({
                ...settings,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                    type === 'number' ? parseFloat(value) : value
            });
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: <Globe size={18} /> },
        { id: 'financial', label: 'Financial', icon: <DollarSign size={18} /> },
        { id: 'system', label: 'System & Security', icon: <Lock size={18} /> },
        { id: 'social', label: 'Social Media', icon: <Twitter size={18} /> },
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
                    <p className="text-gray-500">Configure your platform's core parameters</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-200"
                >
                    {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {notice && (
                <div className={`p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top duration-300 ${notice.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {notice.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-medium">{notice.message}</p>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800">
                            {tabs.find(t => t.id === activeTab)?.label} Settings
                        </h2>
                    </div>

                    <div className="p-8">
                        {activeTab === 'general' && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Platform Name</label>
                                        <input
                                            name="platformName"
                                            value={settings.platformName}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all text-gray-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Support Phone</label>
                                        <input
                                            name="supportPhone"
                                            value={settings.supportPhone}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all text-gray-800"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'financial' && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Platform Fee (%)</label>
                                        <div className="relative">
                                            <input
                                                name="platformFeePercent"
                                                value={settings.platformFeePercent}
                                                onChange={handleInputChange}
                                                type="number"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Service Tax / GST (%)</label>
                                        <div className="relative">
                                            <input
                                                name="taxPercent"
                                                value={settings.taxPercent}
                                                onChange={handleInputChange}
                                                type="number"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'system' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-red-100 p-3 rounded-lg text-red-600">
                                            <Shield size={22} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-red-900">Maintenance Mode</h4>
                                            <p className="text-sm text-red-800 opacity-80">Disable user access to the platform for maintenance.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="maintenanceMode"
                                            checked={settings.maintenanceMode}
                                            onChange={handleInputChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                            <CheckCircle2 size={22} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-blue-900">Auto-Approve Partners</h4>
                                            <p className="text-sm text-blue-800 opacity-80">Automatically approve new partner applications.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="autoApprovePartners"
                                            checked={settings.autoApprovePartners}
                                            onChange={handleInputChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                                            <Shield size={22} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-purple-900">Two-Factor Authentication (2FA)</h4>
                                            <p className="text-sm text-purple-800 opacity-80">Require email OTP for administrative login.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="twoFactorAuth"
                                            checked={settings.twoFactorAuth}
                                            onChange={handleInputChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'social' && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Github size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            name="socialLinks.github"
                                            value={settings.socialLinks?.github || ''}
                                            onChange={handleInputChange}
                                            type="text" placeholder="Github URL" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Twitter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            name="socialLinks.twitter"
                                            value={settings.socialLinks?.twitter || ''}
                                            onChange={handleInputChange}
                                            type="text" placeholder="Twitter URL" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Facebook size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            name="socialLinks.facebook"
                                            value={settings.socialLinks?.facebook || ''}
                                            onChange={handleInputChange}
                                            type="text" placeholder="Facebook URL" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Instagram size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            name="socialLinks.instagram"
                                            value={settings.socialLinks?.instagram || ''}
                                            onChange={handleInputChange}
                                            type="text" placeholder="Instagram URL" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
