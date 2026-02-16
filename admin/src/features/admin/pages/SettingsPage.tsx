import React, { useState } from 'react';
import {
    Globe, Mail, Bell, Shield, Database,
    Save, Github, Twitter, Facebook, Instagram,
    CheckCircle2, AlertCircle
} from 'lucide-react';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setNotice({ type: 'success', message: 'Settings saved successfully!' });
            setTimeout(() => setNotice(null), 3000);
        }, 1000);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: <Globe size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'email', label: 'Email Configuration', icon: <Mail size={18} /> },
        { id: 'api', label: 'API & Integration', icon: <Database size={18} /> },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
                <p className="text-gray-500">Configure your platform's core parameters</p>
            </div>

            {notice && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${notice.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
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
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">
                            {tabs.find(t => t.id === activeTab)?.label} Settings
                        </h2>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
                        >
                            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'general' && (
                            <div className="space-y-8 max-w-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Platform Name</label>
                                        <input type="text" defaultValue="TravelHub" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Support Email</label>
                                        <input type="email" defaultValue="support@travelhub.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Site Description</label>
                                    <textarea rows={3} defaultValue="The premium platform for global stay management and property listing." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all"></textarea>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Social Profiles</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Github size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="text" placeholder="Github URL" className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white" />
                                        </div>
                                        <div className="relative">
                                            <Twitter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="text" placeholder="Twitter URL" className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white" />
                                        </div>
                                        <div className="relative">
                                            <Facebook size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="text" placeholder="Facebook URL" className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white" />
                                        </div>
                                        <div className="relative">
                                            <Instagram size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="text" placeholder="Instagram URL" className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                {[
                                    { title: 'New User Registration', desc: 'Receive alert when a new user joins the platform' },
                                    { title: 'Partner Applications', desc: 'Get notified when a new partner applies for verification' },
                                    { title: 'New Booking Confirmations', desc: 'Alert admins on every successful booking' },
                                    { title: 'System Security Alerts', desc: 'Immediate notification on suspicious login attempts' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{item.title}</h4>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'email' && (
                            <div className="space-y-6 max-w-xl">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">SMTP Host</label>
                                        <input type="text" defaultValue="smtp.travelhub.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Port</label>
                                            <input type="text" defaultValue="587" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Encryption</label>
                                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                                <option>TLS</option>
                                                <option>SSL</option>
                                                <option>None</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button className="text-blue-600 text-sm font-bold hover:underline">Send Test Email</button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'api' && (
                            <div className="space-y-6">
                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-blue-900">Admin API Access</h4>
                                            <p className="text-sm text-blue-800 opacity-80">Use these keys to integrate with external dashboards and analytics tools.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <code className="flex-1 p-2 bg-white rounded border border-blue-200 text-xs text-blue-900 font-mono select-all">
                                            th_live_51P2c9H2vK3m8z7xQ...
                                        </code>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Regenerate</button>
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

const RefreshCw = ({ size, className }: { size: number, className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
        <path d="M3 21v-5h5"></path>
    </svg>
);

export default SettingsPage;
