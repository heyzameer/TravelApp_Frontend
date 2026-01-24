import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { partnerAuthService } from "../../services/partnerAuth";
import {
    Building2, Clock, CheckCircle2, XCircle, AlertCircle,
    Eye, FileText, CreditCard, Loader2, Edit2
} from "lucide-react";

interface Property {
    _id: string;
    propertyId: string;
    propertyName: string;
    propertyType: string;
    verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
    onboardingCompleted: boolean;
    overallRejectionReason?: string;
    ownershipDocuments: {
        ownershipProofStatus: string;
        ownerKYCStatus: string;
        rejectionReason?: string;
    };
    taxDocuments: {
        taxStatus: string;
        rejectionReason?: string;
    };
    bankingDetails: {
        bankingStatus: string;
        rejectionReason?: string;
    };
    address: {
        city: string;
        state: string;
    };
    pricePerNight: number;
    submittedForVerificationAt?: string;
    verifiedAt?: string;
}

const AllProperties: React.FC = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [showRejectionPopup, setShowRejectionPopup] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const data = await partnerAuthService.getPartnerProperties();
            // Show ALL properties, not just completed ones
            setProperties(data);
        } catch (error: any) {
            toast.error("Failed to fetch properties");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string, onboardingCompleted: boolean) => {
        if (!onboardingCompleted) {
            return (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-2xl">
                    <AlertCircle className="text-blue-600" size={18} />
                    <span className="text-xs font-black text-blue-700 uppercase tracking-wider">Incomplete</span>
                </div>
            );
        }

        switch (status) {
            case 'verified':
                return (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-2xl">
                        <CheckCircle2 className="text-green-600" size={18} />
                        <span className="text-xs font-black text-green-700 uppercase tracking-wider">Verified</span>
                    </div>
                );
            case 'pending':
                return (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-2xl">
                        <Clock className="text-yellow-600" size={18} />
                        <span className="text-xs font-black text-yellow-700 uppercase tracking-wider">Pending Review</span>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-2xl">
                        <XCircle className="text-red-600" size={18} />
                        <span className="text-xs font-black text-red-700 uppercase tracking-wider">Rejected</span>
                    </div>
                );
            case 'suspended':
                return (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl">
                        <AlertCircle className="text-gray-600" size={18} />
                        <span className="text-xs font-black text-gray-700 uppercase tracking-wider">Suspended</span>
                    </div>
                );
            default:
                return null;
        }
    };

    const getDocumentStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="text-green-600" size={16} />;
            case 'pending':
                return <Clock className="text-yellow-600" size={16} />;
            case 'rejected':
                return <XCircle className="text-red-600" size={16} />;
            default:
                return <AlertCircle className="text-gray-400" size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                <Building2 className="mx-auto text-gray-300" size={64} />
                <h3 className="mt-6 text-xl font-black text-gray-900">No Properties Submitted</h3>
                <p className="mt-2 text-gray-500 font-medium">
                    Complete property onboarding to see your submissions here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">ALL PROPERTIES</h2>
                <p className="text-gray-500 font-medium mt-1">View verification status and details</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {properties.map((property) => (
                    <div
                        key={property._id}
                        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="p-8">
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Building2 className="text-red-600" size={28} />
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900">{property.propertyName}</h3>
                                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                                                {property.propertyType} • {property.address.city}, {property.address.state}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-4">
                                        {getStatusBadge(property.verificationStatus, property.onboardingCompleted)}
                                        <span className="text-sm text-gray-500 font-bold">
                                            ID: {property.propertyId || property._id.slice(-8).toUpperCase()}
                                        </span>
                                        {property.pricePerNight && (
                                            <span className="text-sm text-gray-500 font-bold">
                                                ₹{property.pricePerNight}/night
                                            </span>
                                        )}
                                    </div>

                                    {/* Incomplete Message */}
                                    {!property.onboardingCompleted && (
                                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                                            <div className="flex gap-3">
                                                <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
                                                <div>
                                                    <p className="text-sm font-black text-blue-900 uppercase tracking-wider mb-1">
                                                        Incomplete Submission
                                                    </p>
                                                    <p className="text-sm text-blue-700 font-medium leading-relaxed">
                                                        Complete all sections to submit your property for verification.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {property.verificationStatus === 'rejected' && property.overallRejectionReason && (
                                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-4">
                                            <div className="flex gap-3 items-center">
                                                <XCircle className="text-red-600 shrink-0" size={20} />
                                                <div>
                                                    <p className="text-sm font-black text-red-900 uppercase tracking-widest mb-0.5">
                                                        Rejection Reason
                                                    </p>
                                                    <p className="text-sm text-red-700 font-medium line-clamp-1">
                                                        {property.overallRejectionReason}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedReason(property.overallRejectionReason || "");
                                                    setShowRejectionPopup(true);
                                                }}
                                                className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors shrink-0 shadow-sm"
                                            >
                                                See Reason
                                            </button>
                                        </div>
                                    )}

                                    {/* Pending Message */}
                                    {property.verificationStatus === 'pending' && property.onboardingCompleted && (
                                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                                            <div className="flex gap-3">
                                                <Clock className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                                                <div>
                                                    <p className="text-sm font-black text-yellow-900 uppercase tracking-wider mb-1">
                                                        Under Review
                                                    </p>
                                                    <p className="text-sm text-yellow-700 font-medium leading-relaxed">
                                                        Your property is currently being reviewed by our admin team. You'll receive an email once the verification is complete.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => navigate(`/partner/property/${property._id}`)}
                                        className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Eye size={18} />
                                        View Details
                                    </button>
                                    {(property.verificationStatus === 'rejected' || !property.onboardingCompleted) && (
                                        <button
                                            onClick={() => navigate('/partner/dashboard', { state: { editPropertyId: property._id } })}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit2 size={18} />
                                            {property.onboardingCompleted ? 'Edit & Resubmit' : 'Continue Editing'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Property Details Modal */}
            {selectedProperty && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[40px] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">{selectedProperty.propertyName}</h2>
                                    <p className="text-gray-500 font-medium mt-1">Verification Details</p>
                                </div>
                                <button
                                    onClick={() => setSelectedProperty(null)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <XCircle className="text-gray-400" size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Overall Status */}
                            <div>
                                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Overall Status</h3>
                                {getStatusBadge(selectedProperty.verificationStatus, selectedProperty.onboardingCompleted)}
                            </div>

                            {/* Document Verification Status */}
                            <div>
                                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-4">Document Verification</h3>
                                <div className="space-y-4">
                                    {/* Ownership Documents */}
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FileText className="text-gray-600" size={20} />
                                                <span className="font-bold text-gray-900">Ownership Documents</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getDocumentStatusIcon(selectedProperty.ownershipDocuments.ownershipProofStatus)}
                                                <span className="text-sm font-bold text-gray-600 capitalize">
                                                    {selectedProperty.ownershipDocuments.ownershipProofStatus}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedProperty.ownershipDocuments.rejectionReason && (
                                            <p className="mt-2 text-sm text-red-600 font-medium pl-8">
                                                {selectedProperty.ownershipDocuments.rejectionReason}
                                            </p>
                                        )}
                                    </div>

                                    {/* Tax Documents */}
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FileText className="text-gray-600" size={20} />
                                                <span className="font-bold text-gray-900">Tax Documents</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getDocumentStatusIcon(selectedProperty.taxDocuments.taxStatus)}
                                                <span className="text-sm font-bold text-gray-600 capitalize">
                                                    {selectedProperty.taxDocuments.taxStatus}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedProperty.taxDocuments.rejectionReason && (
                                            <p className="mt-2 text-sm text-red-600 font-medium pl-8">
                                                {selectedProperty.taxDocuments.rejectionReason}
                                            </p>
                                        )}
                                    </div>

                                    {/* Banking Details */}
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="text-gray-600" size={20} />
                                                <span className="font-bold text-gray-900">Banking Details</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getDocumentStatusIcon(selectedProperty.bankingDetails.bankingStatus)}
                                                <span className="text-sm font-bold text-gray-600 capitalize">
                                                    {selectedProperty.bankingDetails.bankingStatus}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedProperty.bankingDetails.rejectionReason && (
                                            <p className="mt-2 text-sm text-red-600 font-medium pl-8">
                                                {selectedProperty.bankingDetails.rejectionReason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="pt-6 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {selectedProperty.submittedForVerificationAt && (
                                        <div>
                                            <p className="text-gray-500 font-bold">Submitted</p>
                                            <p className="text-gray-900 font-black">
                                                {new Date(selectedProperty.submittedForVerificationAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    {selectedProperty.verifiedAt && (
                                        <div>
                                            <p className="text-gray-500 font-bold">Verified</p>
                                            <p className="text-gray-900 font-black">
                                                {new Date(selectedProperty.verifiedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Rejection Reason Modal */}
            {showRejectionPopup && (
                <RejectionModal
                    reason={selectedReason}
                    onClose={() => setShowRejectionPopup(false)}
                />
            )}
        </div>
    );
};

const RejectionModal: React.FC<{ reason: string; onClose: () => void }> = ({ reason, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = reason.length > 200;
    const displayText = isExpanded || !shouldTruncate ? reason : reason.slice(0, 200) + '...';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] max-w-lg w-full p-10 shadow-2xl scale-in-center overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8">
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8">
                        <XCircle className="text-red-600" size={40} />
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase text-red-600">Disapproved</h2>
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-10">Admin Feedback</p>

                    <div className="w-full bg-gray-50 rounded-[2rem] p-8 border border-gray-100 text-left relative group">
                        <p className="text-gray-700 font-bold leading-relaxed text-lg italic">
                            "{displayText}"
                        </p>

                        {shouldTruncate && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-4 text-red-600 font-black text-xs uppercase tracking-widest hover:underline"
                            >
                                {isExpanded ? 'See Less' : 'See More'}
                            </button>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-10 w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllProperties;
