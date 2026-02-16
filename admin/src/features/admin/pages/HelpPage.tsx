import React from 'react';
import {
    Book, MessageSquare, ExternalLink,
    Search, Phone, Mail, ChevronRight, FileText,
    Zap, Shield, Database, Users, Building
} from 'lucide-react';

const HelpPage: React.FC = () => {
    const categories = [
        { title: 'Getting Started', icon: <Zap size={20} />, count: 12, color: 'text-orange-500', bg: 'bg-orange-50' },
        { title: 'User Management', icon: <Users size={20} />, count: 8, color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'Property Listings', icon: <Building size={20} />, count: 15, color: 'text-purple-500', bg: 'bg-purple-50' },
        { title: 'Security & Access', icon: <Shield size={20} />, count: 5, color: 'text-red-500', bg: 'bg-red-50' },
        { title: 'Booking Workflow', icon: <FileText size={20} />, count: 10, color: 'text-green-500', bg: 'bg-green-50' },
        { title: 'API Reference', icon: <Database size={20} />, count: 24, color: 'text-gray-500', bg: 'bg-gray-50' },
    ];

    const faqs = [
        { q: "How do I approve a new partner?", a: "Navigate to the Partners section, select 'Partner Requests', and review the uploaded Aadhaar documents. You can then approve or reject with a reason." },
        { q: "Can I edit a property's verification status?", a: "Yes, you can go to the property details and manually override the status if all documents meet platform requirements." },
        { q: "How are refunds processed?", a: "When a user requests a refund for a cancelled booking, it appears in your 'Approvals Needed' section on the dashboard." },
        { q: "What should I do if a system error occurs?", a: "Check the server logs or the 'Settings -> API & Integration' section for any service connectivity issues." }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Hero Section */}
            <div className="relative p-10 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-3xl text-white overflow-hidden shadow-xl">
                <div className="relative z-10 max-w-2xl space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight">How can we help you?</h1>
                    <p className="text-blue-100 text-lg opacity-80">
                        Welcome to the TravelHub Admin Help Center. Search our documentation or contact support for assistance.
                    </p>
                    <div className="relative pt-4">
                        <Search className="absolute left-4 top-[30px] text-indigo-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search articles, guides, or keywords..."
                            className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-blue-200 outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                        />
                    </div>
                </div>
                {/* Decorative background circle */}
                <div className="absolute top-[-50px] right-[-50px] w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Quick Links Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, idx) => (
                    <div
                        key={idx}
                        className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${cat.bg} ${cat.color} p-3 rounded-xl`}>{cat.icon}</div>
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{cat.count} Articles</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors uppercase tracking-wide text-sm">{cat.title}</h3>
                        <p className="text-sm text-gray-500 mt-2">Comprehensive guides and troubleshooting for {cat.title.toLowerCase()}.</p>
                        <div className="mt-4 flex items-center text-blue-600 text-xs font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            View Articles <ChevronRight size={14} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* FAQ Section */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <MessageSquare className="text-blue-500" />
                        Common Questions
                    </h2>
                    <div className="space-y-6">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="space-y-2">
                                <h4 className="font-bold text-gray-800">{faq.q}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Contact */}
                <div className="space-y-6">
                    <div className="p-8 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-200">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Phone size={20} />
                            Need more assistance?
                        </h3>
                        <p className="text-blue-100 text-sm opacity-90 leading-relaxed">
                            Our technical support team is available 24/7 for platform emergencies and administrative support.
                        </p>
                        <div className="mt-6 space-y-3">
                            <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-xl shadow-blue-800/20">
                                Start Live Chat
                            </button>
                            <div className="flex items-center justify-center gap-4 pt-2">
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    <Mail size={14} />
                                    support@travelhub.com
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    <Phone size={14} />
                                    +1 (555) 000-1122
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Book size={18} className="text-indigo-500" />
                            Official Resources
                        </h3>
                        <div className="space-y-3">
                            <a href="#" className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-white transition-all shadow-sm group">
                                <span className="text-sm text-gray-600 group-hover:text-blue-600 font-medium">Developer Documentation</span>
                                <ExternalLink size={14} className="text-gray-400" />
                            </a>
                            <a href="#" className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-white transition-all shadow-sm group">
                                <span className="text-sm text-gray-600 group-hover:text-blue-600 font-medium">Terms of Service</span>
                                <ExternalLink size={14} className="text-gray-400" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
