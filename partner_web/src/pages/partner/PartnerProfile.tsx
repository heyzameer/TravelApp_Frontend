import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { partnerAuthService } from "../../services/partnerAuth";
import type { PartnerProfile } from "../../types";

const PartnerProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<PartnerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await partnerAuthService.getPartnerProfile();
                setProfile(data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (!profile) {
        return <div className="text-center p-8 text-gray-500">Failed to load profile.</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-6 mb-8 border-b pb-8">
                <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-3xl font-bold">
                    {profile.fullName.charAt(0)}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
                    <p className="text-gray-500">Partner ID: {profile.partnerId}</p>
                    <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${profile.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {profile.status === 'verified' ? <CheckCircle size={14} className="mr-1" /> : <AlertCircle size={14} className="mr-1" />}
                        {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <User size={20} className="mr-2 text-gray-400" /> Personal Details
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <Mail size={20} className="text-gray-400 mr-3" />
                            <div>
                                <p className="text-xs text-gray-500">Email Address</p>
                                <p className="font-medium text-gray-800">{profile.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <Phone size={20} className="text-gray-400 mr-3" />
                            <div>
                                <p className="text-xs text-gray-500">Phone Number</p>
                                <p className="font-medium text-gray-800">{profile.phone}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <Shield size={20} className="mr-2 text-gray-400" /> Account Status
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600 font-medium">Document Verification</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${profile.personalDocuments?.aadharStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {profile.personalDocuments?.aadharStatus || 'Pending'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">Your documents are being reviewed by our team.</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Total Orders</span>
                            <span className="font-bold text-gray-900">{profile.totalOrders}</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PartnerProfilePage;
