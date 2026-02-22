import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { partnerAuthService } from "../../services/partnerAuth";
import type { Property } from "../../types";
import {
    ArrowLeft, Building2, MapPin, FileText, CreditCard, Image as ImageIcon,
    Edit2, AlertTriangle, CheckCircle2, XCircle, Clock, Loader2, Compass, Package as PackageIcon, Utensils
} from "lucide-react";

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

                    <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">Disapproval Notice</h2>
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-10">Verification Feedback</p>

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

const PropertyDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditWarning, setShowEditWarning] = useState(false);
    const [showRejectionPopup, setShowRejectionPopup] = useState(false);

    const fetchPropertyDetails = useCallback(async () => {
        try {
            setLoading(true);
            const properties = await partnerAuthService.getPartnerProperties();
            const found = properties.find((p: Property) => p._id === id);
            if (found) {
                setProperty(found);
            } else {
                toast.error("Property not found");
                navigate("/partner/dashboard");
            }
        } catch (error) {
            toast.error("Failed to load property details");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchPropertyDetails();
    }, [fetchPropertyDetails]);

    const handleEdit = () => {
        if (property?.verificationStatus === 'verified') {
            setShowEditWarning(true);
        } else {
            navigate(`/partner/dashboard`, { state: { editPropertyId: property?._id } });
        }
    };

    const confirmEdit = () => {
        navigate(`/partner/dashboard`, { state: { editPropertyId: property?._id } });
    };

    const getStatusBadge = (status: string) => {
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
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Property not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 md:px-6">
            {/* Header */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <button
                            onClick={() => navigate("/partner/dashboard")}
                            className="mt-1 p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <div className="flex flex-wrap items-center gap-4 mb-3">
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">
                                    {property.propertyName}
                                </h1>
                                {getStatusBadge(property.verificationStatus)}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">
                                <MapPin size={16} className="text-red-500" />
                                <span>{property.address.city}, {property.address.state}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex items-center gap-3">
                        <Link
                            to={`/partner/property/${property._id}/rooms`}
                            className="px-4 py-3 bg-white border border-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col items-center justify-center gap-2 text-center"
                        >
                            <Building2 size={20} className="text-blue-500" />
                            Rooms
                        </Link>
                        <Link
                            to={`/partner/property/${property._id}/activities`}
                            className="px-4 py-3 bg-white border border-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col items-center justify-center gap-2 text-center"
                        >
                            <Compass size={20} className="text-purple-500" />
                            Activities
                        </Link>
                        <Link
                            to={`/partner/property/${property._id}/meal-plans`}
                            className="px-4 py-3 bg-white border border-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col items-center justify-center gap-2 text-center"
                        >
                            <Utensils size={20} className="text-orange-500" />
                            Meals
                        </Link>
                        <Link
                            to={`/partner/property/${property._id}/packages`}
                            className="px-4 py-3 bg-white border border-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col items-center justify-center gap-2 text-center"
                        >
                            <PackageIcon size={20} className="text-green-500" />
                            Packages
                        </Link>
                        <button
                            onClick={handleEdit}
                            className="col-span-2 sm:col-span-4 lg:ml-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-gray-200 active:scale-95"
                        >
                            <Edit2 size={18} />
                            Edit Property
                        </button>
                    </div>
                </div>

                {/* Rejection Reason */}
                {property.verificationStatus === 'rejected' && property.overallRejectionReason && (
                    <div className="mt-6 p-6 bg-red-50 border-2 border-red-100 rounded-[2.5rem] flex items-center justify-between gap-4">
                        <div className="flex gap-4 items-center">
                            <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                                <XCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-red-900 uppercase tracking-[0.2em] mb-1">
                                    DISAPPROVED by Admin
                                </p>
                                <p className="text-sm text-red-700 font-bold opacity-80 line-clamp-1 max-w-md">
                                    {property.overallRejectionReason}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowRejectionPopup(true)}
                            className="px-6 py-3 bg-white text-red-600 border border-red-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm shrink-0"
                        >
                            See Why
                        </button>
                    </div>
                )}
            </div>

            {/* Rejection Reason Modal */}
            {showRejectionPopup && property.overallRejectionReason && (
                <RejectionModal
                    reason={property.overallRejectionReason}
                    onClose={() => setShowRejectionPopup(false)}
                />
            )}

            {/* Property Images */}
            {(property.coverImage || (property.images && property.images.length > 0)) && (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-2xl">
                            <ImageIcon className="text-red-500" size={24} />
                        </div>
                        PROPERTY GALLERY
                    </h2>

                    {property.coverImage && (
                        <div className="mb-8">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Cover Image</p>
                            <img
                                src={property.coverImage}
                                alt="Cover"
                                className="w-full aspect-[21/9] object-cover rounded-[2rem] border border-gray-100 shadow-sm"
                            />
                        </div>
                    )}

                    {property.images && property.images.length > 0 && (
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Gallery Collection</p>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {property.images.map((img, idx) => (
                                    <div key={idx} className="group overflow-hidden rounded-[1.5rem] bg-gray-50 border border-gray-100 aspect-square">
                                        <img
                                            src={typeof img === 'string' ? img : img.url}
                                            alt={`Gallery ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Property Details */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                        <Building2 className="text-blue-500" size={24} />
                    </div>
                    PROPERTY DETAILS
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <InfoField label="Property Name" value={property.propertyName} />
                    <InfoField label="Property Type" value={property.propertyType} className="capitalize" />
                    <InfoField label="Price Per Night" value={`₹${property.pricePerNight}`} />
                    <InfoField label="Max Guests" value={(property.maxGuests || 0).toString()} />
                    <InfoField label="Total Rooms" value={(property.totalRooms || 0).toString()} />
                    <InfoField label="Available Rooms" value={(property.availableRooms || 0).toString()} />
                    <div className="md:col-span-3">
                        <InfoField label="Description" value={property.description || "No description provided"} />
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-2xl">
                        <MapPin className="text-purple-500" size={24} />
                    </div>
                    LOCATION & ADDRESS
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                        <InfoField label="Street Address" value={property.address.street} />
                    </div>
                    <InfoField label="City" value={property.address.city} />
                    <InfoField label="State" value={property.address.state} />
                    <InfoField label="Pincode" value={property.address.pincode} />
                    <InfoField label="Country" value={property.address.country} />
                </div>
            </div>

            {/* Ownership Documents */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-2xl">
                            <FileText className="text-orange-500" size={24} />
                        </div>
                        OWNERSHIP DOCUMENTS
                    </h2>
                    <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl tracking-widest ${property.ownershipDocuments?.ownershipProofStatus === 'approved'
                        ? 'bg-green-50 text-green-700'
                        : property.ownershipDocuments?.ownershipProofStatus === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                        {property.ownershipDocuments?.ownershipProofStatus || 'N/A'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DocumentPreview label="Ownership Proof" url={property.ownershipDocuments?.ownershipProof || ""} />
                    <DocumentPreview label="Owner KYC" url={property.ownershipDocuments?.ownerKYC || ""} />
                </div>

                {property.ownershipDocuments?.rejectionReason && (
                    <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-[1.5rem]">
                        <p className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertTriangle size={14} /> Rejection Reason
                        </p>
                        <p className="text-sm text-red-700 font-bold opacity-80 italic">
                            "{property.ownershipDocuments.rejectionReason}"
                        </p>
                    </div>
                )}
            </div>

            {/* Tax Documents */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-2xl">
                            <FileText className="text-green-500" size={24} />
                        </div>
                        TAX INFORMATION
                    </h2>
                    <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl tracking-widest ${property.taxDocuments?.taxStatus === 'approved'
                        ? 'bg-green-50 text-green-700'
                        : property.taxDocuments?.taxStatus === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                        {property.taxDocuments?.taxStatus || 'N/A'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <InfoField label="GST Number" value={property.taxDocuments?.gstNumber || "N/A"} />
                    <InfoField label="PAN Number" value={property.taxDocuments?.panNumber || "N/A"} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DocumentPreview label="GST Certificate" url={property.taxDocuments?.gstCertificate || ""} />
                    <DocumentPreview label="PAN Card" url={property.taxDocuments?.panCard || ""} />
                </div>

                {property.taxDocuments?.rejectionReason && (
                    <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-[1.5rem]">
                        <p className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertTriangle size={14} /> Rejection Reason
                        </p>
                        <p className="text-sm text-red-700 font-bold opacity-80 italic">
                            "{property.taxDocuments.rejectionReason}"
                        </p>
                    </div>
                )}
            </div>

            {/* Banking Details */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl">
                            <CreditCard className="text-indigo-500" size={24} />
                        </div>
                        BANKING DETAILS
                    </h2>
                    <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl tracking-widest ${property.bankingDetails?.bankingStatus === 'approved'
                        ? 'bg-green-50 text-green-700'
                        : property.bankingDetails?.bankingStatus === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                        {property.bankingDetails?.bankingStatus || 'N/A'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InfoField label="Account Holder Name" value={property.bankingDetails?.accountHolderName || "N/A"} />
                    <InfoField label="Account Number" value={property.bankingDetails?.accountNumber || "N/A"} />
                    <InfoField label="IFSC Code" value={property.bankingDetails?.ifscCode || "N/A"} />
                    <InfoField label="UPI ID" value={property.bankingDetails?.upiId || 'Not provided'} />
                </div>

                {property.bankingDetails?.rejectionReason && (
                    <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-[1.5rem]">
                        <p className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertTriangle size={14} /> Rejection Reason
                        </p>
                        <p className="text-sm text-red-700 font-bold opacity-80 italic">
                            "{property.bankingDetails.rejectionReason}"
                        </p>
                    </div>
                )}
            </div>

            {/* Edit Warning Modal */}
            {showEditWarning && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] max-w-md w-full p-10 shadow-2xl scale-in-center">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="p-4 bg-yellow-50 rounded-3xl">
                                <AlertTriangle className="text-yellow-600" size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight uppercase">Re-Verification Required</h2>
                        </div>

                        <div className="space-y-4 mb-10">
                            <p className="text-gray-700 font-bold leading-relaxed">
                                This property is currently <span className="text-green-600">verified</span>.
                            </p>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                Any edits will trigger a <strong className="text-gray-900">re-verification process</strong>. Your property will be marked as <strong className="text-yellow-600">pending</strong> until approved.
                            </p>
                            <p className="bg-gray-50 p-4 rounded-2xl text-xs text-gray-600 font-bold italic border border-gray-100">
                                Note: Your property may not be visible to customers during this period.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmEdit}
                                className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                            >
                                Proceed to Edit
                            </button>
                            <button
                                onClick={() => setShowEditWarning(false)}
                                className="w-full py-5 bg-white text-gray-400 rounded-[1.5rem] font-black uppercase tracking-widest hover:text-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoField: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = "" }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{label}</label>
        <p className={`text-gray-900 font-black bg-gray-50/50 px-5 py-4 rounded-2xl border border-gray-100 shadow-sm leading-relaxed ${className}`}>
            {value}
        </p>
    </div>
);

const DocumentPreview: React.FC<{ label: string; url: string }> = ({ label, url }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{label}</label>
        {!url ? (
            <div className="aspect-video rounded-[2rem] border-2 border-dashed border-gray-100 flex items-center justify-center bg-gray-50/50">
                <span className="text-gray-300 font-black text-[10px] uppercase tracking-widest">NO DOCUMENT UPLOADED</span>
            </div>
        ) : (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-video rounded-[2rem] border border-gray-100 overflow-hidden hover:border-gray-300 transition-all group shadow-sm"
            >
                <img
                    src={url}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </a>
        )}
    </div>
);

export default PropertyDetails;
