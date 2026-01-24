import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { partnerAuthService } from "../../services/partnerAuth";
import {
    ArrowLeft, Building2, MapPin, FileText, CreditCard, Image as ImageIcon,
    Edit2, AlertTriangle, CheckCircle2, XCircle, Clock, Loader2
} from "lucide-react";

interface Property {
    _id: string;
    propertyId: string;
    propertyName: string;
    propertyType: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    totalRooms: number;
    availableRooms: number;
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
    ownershipDocuments: {
        ownershipProof: string;
        ownerKYC: string;
        ownershipProofStatus: string;
        rejectionReason?: string;
    };
    taxDocuments: {
        gstNumber: string;
        panNumber: string;
        gstCertificate: string;
        panCard: string;
        taxStatus: string;
        rejectionReason?: string;
    };
    bankingDetails: {
        accountHolderName: string;
        accountNumber: string;
        ifscCode: string;
        upiId?: string;
        bankingStatus: string;
        rejectionReason?: string;
    };
    coverImage?: string;
    images: string[];
    verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
    onboardingCompleted: boolean;
    overallRejectionReason?: string;
}

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

    useEffect(() => {
        fetchPropertyDetails();
    }, [id]);

    const fetchPropertyDetails = async () => {
        try {
            setLoading(true);
            const properties = await partnerAuthService.getPartnerProperties();
            const found = properties.find((p: any) => p._id === id);
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
    };

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

    const canEdit = property?.verificationStatus === 'rejected' || property?.verificationStatus === 'verified';

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
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <button
                    onClick={() => navigate("/partner/dashboard")}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to All Properties
                </button>

                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <Building2 className="text-red-600" size={32} />
                            <div>
                                <h1 className="text-3xl font-black text-gray-900">{property.propertyName}</h1>
                                <p className="text-gray-500 font-medium uppercase tracking-wider">
                                    {property.propertyType} • ID: {property.propertyId}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {getStatusBadge(property.verificationStatus)}
                        </div>
                    </div>

                    {canEdit && (
                        <button
                            onClick={handleEdit}
                            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Edit2 size={18} />
                            Edit Property
                        </button>
                    )}
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
            {
                (property.coverImage || property.images.length > 0) && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <ImageIcon className="text-red-600" size={24} />
                            PROPERTY GALLERY
                        </h2>

                        {property.coverImage && (
                            <div className="mb-6">
                                <p className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Cover Image</p>
                                <img
                                    src={property.coverImage}
                                    alt="Cover"
                                    className="w-full aspect-[21/9] object-cover rounded-3xl border border-gray-100"
                                />
                            </div>
                        )}

                        {property.images.length > 0 && (
                            <div>
                                <p className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Gallery</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {property.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Gallery ${idx + 1}`}
                                            className="aspect-square object-cover rounded-2xl border border-gray-100"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Property Details */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <Building2 className="text-red-600" size={24} />
                    PROPERTY DETAILS
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Property Name" value={property.propertyName} />
                    <InfoField label="Property Type" value={property.propertyType} className="capitalize" />
                    <InfoField label="Price Per Night" value={`₹${property.pricePerNight}`} />
                    <InfoField label="Max Guests" value={property.maxGuests.toString()} />
                    <InfoField label="Total Rooms" value={property.totalRooms.toString()} />
                    <InfoField label="Available Rooms" value={property.availableRooms.toString()} />
                    <div className="md:col-span-2">
                        <InfoField label="Description" value={property.description} />
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="text-red-600" size={24} />
                    LOCATION & ADDRESS
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <FileText className="text-red-600" size={24} />
                    OWNERSHIP DOCUMENTS
                    <span className={`ml-auto text-xs font-black uppercase px-3 py-1 rounded-full ${property.ownershipDocuments.ownershipProofStatus === 'approved'
                        ? 'bg-green-50 text-green-700'
                        : property.ownershipDocuments.ownershipProofStatus === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                        {property.ownershipDocuments.ownershipProofStatus}
                    </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DocumentPreview label="Ownership Proof" url={property.ownershipDocuments.ownershipProof} />
                    <DocumentPreview label="Owner KYC" url={property.ownershipDocuments.ownerKYC} />
                </div>

                {property.ownershipDocuments.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700 font-medium">
                            <strong>Rejection Reason:</strong> {property.ownershipDocuments.rejectionReason}
                        </p>
                    </div>
                )}
            </div>

            {/* Tax Documents */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <FileText className="text-red-600" size={24} />
                    TAX INFORMATION
                    <span className={`ml-auto text-xs font-black uppercase px-3 py-1 rounded-full ${property.taxDocuments.taxStatus === 'approved'
                        ? 'bg-green-50 text-green-700'
                        : property.taxDocuments.taxStatus === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                        {property.taxDocuments.taxStatus}
                    </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <InfoField label="GST Number" value={property.taxDocuments.gstNumber} />
                    <InfoField label="PAN Number" value={property.taxDocuments.panNumber} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DocumentPreview label="GST Certificate" url={property.taxDocuments.gstCertificate} />
                    <DocumentPreview label="PAN Card" url={property.taxDocuments.panCard} />
                </div>

                {property.taxDocuments.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700 font-medium">
                            <strong>Rejection Reason:</strong> {property.taxDocuments.rejectionReason}
                        </p>
                    </div>
                )}
            </div>

            {/* Banking Details */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <CreditCard className="text-red-600" size={24} />
                    BANKING DETAILS
                    <span className={`ml-auto text-xs font-black uppercase px-3 py-1 rounded-full ${property.bankingDetails.bankingStatus === 'approved'
                        ? 'bg-green-50 text-green-700'
                        : property.bankingDetails.bankingStatus === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                        {property.bankingDetails.bankingStatus}
                    </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Account Holder Name" value={property.bankingDetails.accountHolderName} />
                    <InfoField label="Account Number" value={property.bankingDetails.accountNumber} />
                    <InfoField label="IFSC Code" value={property.bankingDetails.ifscCode} />
                    <InfoField label="UPI ID" value={property.bankingDetails.upiId || 'Not provided'} />
                </div>

                {property.bankingDetails.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700 font-medium">
                            <strong>Rejection Reason:</strong> {property.bankingDetails.rejectionReason}
                        </p>
                    </div>
                )}
            </div>

            {/* Edit Warning Modal */}
            {
                showEditWarning && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <div className="bg-white rounded-[40px] max-w-md w-full p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-yellow-50 rounded-2xl">
                                    <AlertTriangle className="text-yellow-600" size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900">Re-Verification Required</h2>
                            </div>

                            <p className="text-gray-700 font-medium leading-relaxed mb-6">
                                This property is currently <strong className="text-green-600">verified</strong>. If you edit any details,
                                your property will be submitted for <strong>re-verification</strong> and will be marked as <strong className="text-yellow-600">pending</strong> until
                                the admin reviews your changes.
                            </p>

                            <p className="text-gray-700 font-medium leading-relaxed mb-8">
                                During re-verification, your property may not be visible to customers. Are you sure you want to proceed?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEditWarning(false)}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmEdit}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-blue-700 transition-colors"
                                >
                                    Proceed to Edit
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

const InfoField: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = "" }) => (
    <div className="space-y-2">
        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{label}</label>
        <p className={`text-gray-900 font-bold bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 ${className}`}>
            {value}
        </p>
    </div>
);

const DocumentPreview: React.FC<{ label: string; url: string }> = ({ label, url }) => (
    <div className="space-y-2">
        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{label}</label>
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block aspect-video rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-red-300 transition-colors group"
        >
            <img
                src={url}
                alt={label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
        </a>
    </div>
);


export default PropertyDetails;
