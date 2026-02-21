import React from 'react';
import {
    Book, MessageSquare,
    Search, Phone, Mail, ChevronRight, FileText,
    Zap, Shield, Database, Users, Building, AlertCircle
} from 'lucide-react';

interface Article {
    id: string;
    title: string;
    summary: string;
    content: string;
    tag: string;
    time: string;
}

const HelpPage: React.FC = () => {
    const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null);

    const properArticles = [
        {
            id: 'onboarding',
            title: "Partner Onboarding & KYC Protocol",
            summary: "Specific guidelines for validating Aadhaar and PAN cards during partner onboarding to prevent fraud.",
            content: `
                ### Document Audit Checklist
                When reviewing partner applications, admins must verify the following:
                1. **Aadhaar QR Code**: Ensure the QR code is present and the image is not blurred.
                2. **Name Matching**: The name on the Aadhaar/PAN must exactly match the registered profile name.
                3. **DOB Proof**: Verify that the partner is at least 18 years of age.
                4. **PAN Structure**: Ensure the 4th character is 'P' (for individual/personal) unless registered as a company.
                
                *Note: If any document looks doctored (uneven fonts, missing watermarks), reject the application immediately with 'Suspicious Documents' reason.*
            `,
            tag: "Onboarding",
            time: "5 min read"
        },
        {
            id: 'property',
            title: "Property Quality & Verification Standards",
            summary: "How to audit property listings, verify amenities, and ensure image quality meets TravelHub standards.",
            content: `
                ### Quality Audit Criteria
                1. **Image Clarity**: Properties must have at least 5 high-resolution images (Living, Bed, Bath, Kitchen, Exterior).
                2. **Amenities Verification**: Randomly check if listed amenities (WiFi, Pool, AC) are visible in photos.
                3. **Location Pin**: Cross-reference the provided address with the map pin for accuracy.
                4. **Pricing Audit**: Ensure the per-night rate is consistent with similar properties in the same geolocation.
            `,
            tag: "Management",
            time: "6 min read"
        },
        {
            id: 'refunds',
            title: "Managing Refund Escalations",
            summary: "Learn how to mediate between guests and hosts when a refund dispute occurs outside the policy window.",
            content: `
                ### Refund Mediation Steps
                1. **Review Policy**: Check the property's 'Cancellation Policy' (e.g., 24h before check-in).
                2. **Communication Log**: Review the chat logs between guest and host in the DB.
                3. **Partial Refunds**: Admins have the authority to issue 'Custom Partial Refunds' if the property was not as described.
                4. **Approval**: Every refund above ₹5000 requires a Head Admin sign-off via the dashboard.
            `,
            tag: "Operational",
            time: "7 min read"
        },
        {
            id: 'security',
            title: "Admin Security: Hardening Your Account",
            summary: "Detailed guide on using the Security tab to manage sessions and identify unauthorized access.",
            content: `
                ### Security Hardening
                1. **Mandatory 2FA**: Ensure your email is verified. 2FA should never be turned off for production accounts.
                2. **Session Pruning**: At the end of each work session, use the 'Log out all other sessions' feature in the Security tab.
                3. **IP Monitoring**: If you see a login from a city you haven't visited, change your password immediately.
                4. **Access Control**: Never share your admin credentials. Every admin should have their own unique login.
            `,
            tag: "Security",
            time: "4 min read"
        },
        {
            id: 'analytics',
            title: "Analytics Dictionary: Understanding Your Data",
            summary: "A guide to the metrics on your dashboard: Conversion Rates, RevPAR, and ADR.",
            content: `
                ### Metric Definitions
                1. **RevPAR**: Revenue Per Available Room. Total revenue divided by total rooms available on platform.
                2. **ADR**: Average Daily Rate. The average income per paid room occupied in a given period.
                3. **Conversion Rate**: The percentage of property viewers who complete a booking.
                4. **Partner Growth**: Month-over-month increase in active property owners.
            `,
            tag: "Analytics",
            time: "5 min read"
        },
        {
            id: 'system',
            title: "Database Logs & API Debugging",
            summary: "How to use system logs to identify failed transactions or API timeouts.",
            content: `
                ### System Troubleshooting
                1. **Error Logs**: Access the 'System' tab to see real-time error streams. Look for 5xx status codes.
                2. **API Latency**: Monitor the average response time for the Booking API. Anything above 500ms should be reported.
                3. **Deadlocks**: If a transaction hangs, check the MongoDB Atlas dashboard for long-running queries or locks.
                4. **Service Health**: Verify that the Email and SMS services are reporting 100% uptime in the Integration dashboard.
            `,
            tag: "Technical",
            time: "8 min read"
        }
    ];

    const categories = [
        { id: 'onboarding', title: 'Partner Onboarding', icon: <Users size={20} />, color: 'text-orange-500', bg: 'bg-orange-50', desc: 'Approving partner requests and verifying Aadhaar/PAN documents.' },
        { id: 'property', title: 'Property Management', icon: <Building size={20} />, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Reviewing property listings, images, and verifying physical locations.' },
        { id: 'refunds', title: 'Booking Lifecycle', icon: <FileText size={20} />, color: 'text-green-500', bg: 'bg-green-50', desc: 'Managing confirmed bookings, handling cancellations and refund requests.' },
        { id: 'security', title: 'Identity & Security', icon: <Shield size={20} />, color: 'text-red-500', bg: 'bg-red-50', desc: 'Configuring 2FA, managing admin sessions, and password recovery.' },
        { id: 'analytics', title: 'System Analytics', icon: <Zap size={20} />, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Interpreting dashboard metrics, conversion rates, and revenue reports.' },
        { id: 'system', title: 'Database & API', icon: <Database size={20} />, color: 'text-gray-500', bg: 'bg-gray-50', desc: 'Managing system logs, API integrations, and data exports.' },
    ];

    const handleOpenArticle = (id: string) => {
        const article = properArticles.find(a => a.id === id);
        if (article) {
            setSelectedArticle(article);
            // Scroll to reader
            setTimeout(() => {
                document.getElementById('article-reader')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const faqs = [
        {
            q: "How do I verify a partner's Aadhaar/PAN?",
            a: "Go to 'Partner Applications', click 'View Documents'. Ensure the name matches the profile and the images are clear. Use the 'Verify' button to enable their property uploading capabilities."
        },
        {
            q: "How do I handle a pending refund request?",
            a: "Refund requests appear in 'Bookings -> Cancellations'. Review the reason and the booking amount. Once satisfied, click 'Process Refund' to trigger the payment gateway reversal."
        },
        {
            q: "Can I manually update a property's status?",
            a: "Yes. In 'Properties Management', select a property and use the 'Status Toggle'. This allows you to hide properties that violate terms or feature misleading images."
        },
        {
            q: "What is the 2FA lockout policy?",
            a: "If an admin fails 2FA verification 5 times, the account is temporarily locked for 30 minutes. You can manually unlock an admin account from the 'Accounts' section."
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Hero Section */}
            <div className="relative p-10 bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 rounded-3xl text-white overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">
                        <AlertCircle size={14} />
                        Admin Documentation v3.0
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">TravelHub Command Center Help</h1>
                    <p className="text-blue-100 text-lg opacity-90 leading-relaxed">
                        Find detailed technical guides, operational workflows, and security protocols to manage the TravelHub platform effectively.
                    </p>
                    <div className="relative pt-4">
                        <Search className="absolute left-4 top-[30px] text-indigo-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search guides (e.g., 'Aadhaar verification' or 'Refund logs')..."
                            className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-blue-200 outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                        />
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl"></div>
            </div>

            {/* Knowledge Base Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleOpenArticle(cat.id)}
                        className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${cat.bg} ${cat.color} p-3 rounded-xl shadow-inner`}>{cat.icon}</div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors tracking-tight">{cat.title}</h3>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">{cat.desc}</p>
                        <div className="mt-4 flex items-center text-blue-600 text-xs font-bold gap-1 transition-opacity">
                            Open Reference Guide <ChevronRight size={14} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Featured Articles Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Book className="text-indigo-600" size={28} />
                        Active Operational Guides
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-50">
                    {properArticles.slice(0, 3).map((article) => (
                        <div key={article.id} className="p-8 hover:bg-gray-50/50 transition-all cursor-pointer group flex flex-col justify-between" onClick={() => setSelectedArticle(article)}>
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded tracking-wider">{article.tag}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">{article.time}</span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-3 leading-snug">{article.title}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-2">
                                    {article.summary}
                                </p>
                            </div>
                            <div className="flex items-center text-blue-600 text-sm font-bold gap-2">
                                Open Article <ChevronRight size={16} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Article Reader Modal-like Section (Inline for UX) */}
            {selectedArticle && (
                <div id="article-reader" className="bg-gray-900 rounded-3xl p-10 text-white animate-in zoom-in duration-300 relative shadow-2xl ring-1 ring-white/10">
                    <button
                        onClick={() => setSelectedArticle(null)}
                        className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        <ChevronRight size={20} className="rotate-180" />
                    </button>
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full">{selectedArticle.tag}</span>
                            <span className="text-gray-400 text-sm">{selectedArticle.time}</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-6">{selectedArticle.title}</h2>
                        <div className="prose prose-invert max-w-none text-gray-300">
                            {selectedArticle.content.split('\n').map((line: string, i: number) => {
                                if (line.trim().startsWith('###')) {
                                    return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-4">{line.replace('###', '').trim()}</h3>;
                                }
                                if (line.trim().startsWith('*')) {
                                    return <p key={i} className="italic text-gray-400 mt-4">{line.trim()}</p>;
                                }
                                if (line.match(/^\d+\./)) {
                                    return <div key={i} className="flex gap-4 mt-3 pl-2"><span className="text-blue-400 font-bold">{line.split('.')[0]}.</span><span>{line.split('.').slice(1).join('.').trim()}</span></div>;
                                }
                                return <p key={i} className="mt-2 text-gray-300 leading-relaxed">{line.trim()}</p>;
                            })}
                        </div>
                        <button
                            onClick={() => setSelectedArticle(null)}
                            className="mt-12 px-8 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg"
                        >
                            Done Reading
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* FAQ Section */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                        <MessageSquare className="text-blue-600" size={28} />
                        Operational FAQs
                    </h2>
                    <div className="space-y-8">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="group p-4 rounded-2xl hover:bg-blue-50/50 transition-colors">
                                <h4 className="font-bold text-gray-900 flex items-start gap-2">
                                    <span className="text-blue-600">Q:</span>
                                    {faq.q}
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed mt-2 pl-6">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support & Resources */}
                <div className="space-y-6">
                    <div className="p-8 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Phone size={20} />
                                Technical Support
                            </h3>
                            <p className="text-blue-50 text-sm opacity-90 leading-relaxed max-w-xs">
                                Facing a system-level issue or data discrepancy? Our engineering support is available for administrative troubleshooting.
                            </p>
                            <div className="mt-6 space-y-3">
                                <button className="w-full py-3.5 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/40">
                                    Contact Admin Support
                                </button>
                                <div className="flex flex-col gap-2 pt-2">
                                    <div className="flex items-center gap-2 text-xs font-medium">
                                        <Mail size={14} className="opacity-70" />
                                        admin-support@travelhub.com
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium">
                                        <Phone size={14} className="opacity-70" />
                                        Emergency: +91 98765 43210
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative circle */}
                        <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    </div>

                    <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Book size={20} className="text-indigo-600" />
                            Admin Handbook & Legal
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Admin Operating Procedures', desc: 'Standard workflows for daily management.' },
                                { name: 'Security & Privacy Policy', desc: 'Guidelines for handling user PII data.' },
                                { name: 'Refund & Dispute Resolution', desc: 'Legal framework for handling partner disputes.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="space-y-1">
                                        <span className="text-sm font-bold text-gray-800">{item.name}</span>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{item.desc}</p>
                                    </div>
                                    <FileText size={14} className="text-gray-400 mt-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
