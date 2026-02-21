import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { partnerAuthService } from "../../services/partnerAuth";
import {
    Building2, Clock, CheckCircle2, XCircle, AlertCircle,
    Eye, FileText, CreditCard, Loader2, Edit2, Search,
    Power, ToggleRight, ToggleLeft
} from "lucide-react";
import type { Property } from "../../types";



interface AllPropertiesProps {
    searchQuery?: string;
}

const AllProperties: React.FC<AllPropertiesProps> = ({ searchQuery = "" }) => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [showRejectionPopup, setShowRejectionPopup] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const [propertyToToggle, setPropertyToToggle] = useState<Property | null>(null);
    const [showToggleConfirm, setShowToggleConfirm] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const data = await partnerAuthService.getPartnerProperties();
            // Show ALL properties, not just completed ones
            setProperties(data);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error("Failed to fetch properties");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (property: Property) => {
        try {
            setIsUpdatingStatus(true);
            const nextStatus = !property.isListedByPartner;
            await partnerAuthService.togglePropertyStatus(property._id, nextStatus);
            toast.success(nextStatus ? `${property.propertyName} is set to listed!` : `${property.propertyName} has been delisted.`);
            await fetchProperties();
            setShowToggleConfirm(false);
            setPropertyToToggle(null);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || "Failed to update property status";
            toast.error(message);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const getStatusBadge = (status: string, onboardingCompleted: boolean) => {
        if (!onboardingCompleted) {
            return (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full">
                    <AlertCircle className="text-slate-600" size={14} />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Incomplete</span>
                </div>
            );
        }

        switch (status) {
            case 'verified':
                return (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                        <CheckCircle2 className="text-emerald-600" size={14} />
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Verified</span>
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

    const filteredProperties = properties.filter(p => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            p.propertyName.toLowerCase().includes(query) ||
            p.address.city.toLowerCase().includes(query) ||
            p.address.state.toLowerCase().includes(query) ||
            (p.propertyId && p.propertyId.toLowerCase().includes(query))
        );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                <Building2 className="mx-auto text-slate-200" size={64} />
                <h3 className="mt-6 text-xl font-bold text-slate-900">No Properties Submitted</h3>
                <p className="mt-2 text-slate-500 font-medium">
                    Complete property onboarding to see your submissions here.
                </p>
            </div>
        );
    }

    if (filteredProperties.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                <Search size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-900">No Matching Properties</h3>
                <p className="mt-2 text-slate-500 font-medium">
                    We couldn't find any properties matching "{searchQuery}"
                </p>
                <button
                    onClick={() => {/* This is tricky since search is in parent */ }}
                    className="mt-6 text-blue-600 font-bold hover:underline"
                >
                    Clear Search
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">All Properties</h2>
                <p className="text-slate-500 font-medium mt-1">View verification status and details</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredProperties.map((property) => (
                    <div
                        key={property._id}
                        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="p-8 group-hover:bg-slate-50/30 transition-colors">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Building2 className="text-slate-900" size={28} />
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{property.propertyName}</h3>
                                            <p className="text-sm text-slate-400 font-medium tracking-tight">
                                                {property.propertyType} • {property.address.city}, {property.address.state}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 mt-6">
                                        {getStatusBadge(property.verificationStatus, property.onboardingCompleted)}
                                        <div className="flex items-center gap-4 py-2 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                ID: {property.propertyId || property._id.slice(-8).toUpperCase()}
                                            </span>
                                            {property.pricePerNight && (
                                                <span className="text-sm text-slate-900 font-black">
                                                    ₹{property.pricePerNight.toLocaleString()} / <span className="text-[10px] text-slate-400 uppercase">night</span>
                                                </span>
                                            )}
                                        </div>

                                        {property.onboardingCompleted && (
                                            <div className="flex items-center gap-3">
                                                <div className="h-4 w-[1px] bg-slate-200"></div>
                                                <button
                                                    onClick={() => {
                                                        if (property.isListedByPartner) {
                                                            setPropertyToToggle(property);
                                                            setShowToggleConfirm(true);
                                                        } else {
                                                            handleToggleStatus(property);
                                                        }
                                                    }}
                                                    disabled={isUpdatingStatus}
                                                    className={`group flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${property.isListedByPartner
                                                        ? 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'
                                                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                                                        }`}
                                                >
                                                    <div className="relative">
                                                        {property.isListedByPartner ? (
                                                            <ToggleRight className="text-blue-600" size={24} />
                                                        ) : (
                                                            <ToggleLeft className="text-slate-300" size={24} />
                                                        )}
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${property.isListedByPartner ? 'text-blue-700' : 'text-slate-500'}`}>
                                                        {property.isListedByPartner ? 'Listed' : 'Delisted'}
                                                    </span>
                                                </button>
                                            </div>
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
                                                        Your property is currently being reviewed by our admin team. You&apos;ll receive an email once the verification is complete.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 min-w-[180px]">
                                    <button
                                        onClick={() => navigate(`/partner/property/${property._id}`)}
                                        className="px-6 py-3.5 bg-slate-900 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:shadow-xl hover:shadow-gray-200 transition-all flex items-center justify-center gap-3 active:scale-95 shrink-0"
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>
                                    {(property.verificationStatus === 'rejected' || !property.onboardingCompleted) && (
                                        <button
                                            onClick={() => navigate('/partner/dashboard', { state: { editPropertyId: property._id } })}
                                            className="px-6 py-3.5 bg-white text-blue-600 border border-blue-100 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95 shrink-0"
                                        >
                                            <Edit2 size={16} />
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
                                                {getDocumentStatusIcon(selectedProperty.ownershipDocuments?.ownershipProofStatus || 'pending')}
                                                <span className="text-sm font-bold text-gray-600 capitalize">
                                                    {selectedProperty.ownershipDocuments?.ownershipProofStatus || 'pending'}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedProperty.ownershipDocuments?.rejectionReason && (
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
                                                {getDocumentStatusIcon(selectedProperty.taxDocuments?.taxStatus || 'pending')}
                                                <span className="text-sm font-bold text-gray-600 capitalize">
                                                    {selectedProperty.taxDocuments?.taxStatus || 'pending'}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedProperty.taxDocuments?.rejectionReason && (
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
                                                {getDocumentStatusIcon(selectedProperty.bankingDetails?.bankingStatus || 'pending')}
                                                <span className="text-sm font-bold text-gray-600 capitalize">
                                                    {selectedProperty.bankingDetails?.bankingStatus || 'pending'}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedProperty.bankingDetails?.rejectionReason && (
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
            {/* Deactivation Confirmation Modal */}
            {showToggleConfirm && propertyToToggle && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl scale-in-center">
                        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                            <Power className="text-amber-600" size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 text-center mb-4 tracking-tight">Deactivate Property?</h2>
                        <p className="text-slate-500 font-medium text-center mb-8 leading-relaxed">
                            Are you sure you want to delist <span className="text-slate-900 font-bold">"{propertyToToggle.propertyName}"</span>?
                            It will no longer be visible to guests on the platform.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleToggleStatus(propertyToToggle)}
                                disabled={isUpdatingStatus}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                            >
                                {isUpdatingStatus ? 'Updating...' : 'Yes, Delist Property'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowToggleConfirm(false);
                                    setPropertyToToggle(null);
                                }}
                                className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                            >
                                Cancel
                            </button>
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

                    <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Verification Feedback</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10 text-red-500">Unsatisfactory documents</p>

                    <div className="w-full bg-slate-50 rounded-3xl p-8 border border-slate-100 text-left relative group">
                        <p className="text-slate-700 font-medium leading-relaxed text-lg italic">
                            &quot;{displayText}&quot;
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
                        className="mt-10 w-full py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl font-bold uppercase tracking-wider hover:shadow-lg transition-all shadow-md active:scale-95"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllProperties;
