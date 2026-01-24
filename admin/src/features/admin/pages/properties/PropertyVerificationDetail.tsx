
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, MapPin, Building, DollarSign, Home, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchPropertyById, updatePropertyDocumentStatus, verifyProperty } from '../../../../store/slices/propertiesSlice';
import DocumentViewer from '../../components/DocumentViewer';
import VerificationStatusBadge from '../../components/VerificationStatusBadge';
import RejectionReasonModal from '../../components/RejectionReasonModal';
import { toast } from 'react-hot-toast';

const PropertyVerificationDetail: React.FC = () => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedProperty, isLoading, error } = useAppSelector((state) => state.properties);

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectSection, setRejectSection] = useState<'ownership' | 'tax' | 'banking' | 'final' | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (propertyId) {
            dispatch(fetchPropertyById(propertyId));
        }
    }, [dispatch, propertyId]);

    const handleDocumentAction = async (section: 'ownership' | 'tax' | 'banking', status: 'approved' | 'rejected', reason?: string) => {
        if (!propertyId) return;

        setIsActionLoading(true);
        try {
            await dispatch(updatePropertyDocumentStatus({
                propertyId,
                section,
                status,
                rejectionReason: reason
            })).unwrap();
            toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} documents updated`);
            setIsRejectModalOpen(false);
            setRejectSection(null);
        } catch (err: any) {
            toast.error(err || `Failed to update ${section} status`);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleFinalVerify = async (status: 'verified' | 'rejected', reason?: string) => {
        if (!propertyId) return;

        setIsActionLoading(true);
        try {
            await dispatch(verifyProperty({
                propertyId,
                status,
                rejectionReason: reason
            })).unwrap();
            toast.success(`Property ${status} successfully`);
            setIsRejectModalOpen(false);
            setRejectSection(null);
        } catch (err: any) {
            toast.error(err || 'Failed to verify property');
        } finally {
            setIsActionLoading(false);
        }
    };

    const openRejectModal = (section: 'ownership' | 'tax' | 'banking' | 'final') => {
        setRejectSection(section);
        setIsRejectModalOpen(true);
    };

    const handleRejectSubmit = async (reason: string) => {
        if (!rejectSection) return;

        if (rejectSection === 'final') {
            await handleFinalVerify('rejected', reason);
        } else {
            await handleDocumentAction(rejectSection as any, 'rejected', reason);
        }
    };

    if (isLoading && !selectedProperty) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !selectedProperty) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <p className="text-red-500 text-lg mb-4">Error loading property details</p>
                <button
                    onClick={() => navigate('/admin/properties')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Properties
                </button>
            </div>
        );
    }

    const {
        propertyName,
        propertyType,
        description,
        address,
        pricePerNight,
        maxGuests,
        totalRooms,
        availableRooms,
        ownershipDocuments,
        taxDocuments,
        bankingDetails,
        verificationStatus,
        coverImage,
        images
    } = selectedProperty;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/properties')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Properties
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{propertyName}</h1>
                            <VerificationStatusBadge status={verificationStatus === 'verified' ? 'approved' : verificationStatus === 'pending' ? 'manual_review' : verificationStatus as any} />
                        </div>
                        <div className="flex items-center gap-4 text-gray-600">
                            <span className="flex items-center gap-1.5 capitalize">
                                <Building size={18} className="text-gray-400" />
                                {propertyType}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MapPin size={18} className="text-gray-400" />
                                {address?.city}, {address?.state}
                            </span>
                        </div>
                    </div>

                    {verificationStatus === 'pending' && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => openRejectModal('final')}
                                disabled={isActionLoading}
                                className="px-6 py-2.5 bg-red-50 text-red-700 font-semibold rounded-xl border border-red-200 hover:bg-red-100 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isActionLoading && <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>}
                                Reject Property
                            </button>
                            <button
                                onClick={() => handleFinalVerify('verified')}
                                disabled={isActionLoading}
                                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isActionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                Approve Property
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Media Section */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="aspect-[21/9] relative">
                            <img
                                src={coverImage || images?.[0] || '/hero-prop.jpg'}
                                alt={propertyName}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-blue-700 shadow-sm border border-white">
                                Cover Image
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Property Gallery</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {images?.map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-xl overflow-hidden cursor-pointer border border-gray-100 group">
                                        <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Ownership Documents Section */}
                    <SectionBox
                        title="Ownership & KYC Documents"
                        status={ownershipDocuments?.ownershipProofStatus}
                        onApprove={() => handleDocumentAction('ownership', 'approved')}
                        onReject={() => openRejectModal('ownership')}
                        isActionLoading={isActionLoading}
                        rejectionReason={ownershipDocuments?.rejectionReason}
                    >
                        <DocumentViewer
                            title="Property Ownership"
                            documentType="Agreement/Title"
                            frontImageUrl={ownershipDocuments?.ownershipProof}
                            backImageUrl={ownershipDocuments?.ownerKYC}
                        />
                    </SectionBox>

                    {/* Tax Documents Section */}
                    <SectionBox
                        title="Tax & Legal Documents"
                        status={taxDocuments?.taxStatus}
                        onApprove={() => handleDocumentAction('tax', 'approved')}
                        onReject={() => openRejectModal('tax')}
                        isActionLoading={isActionLoading}
                        rejectionReason={taxDocuments?.rejectionReason}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <InfoCard label="GST Number" value={taxDocuments?.gstNumber} />
                            <InfoCard label="PAN Number" value={taxDocuments?.panNumber} />
                        </div>
                        <DocumentViewer
                            title="Govt. Certificates"
                            documentType="PDF/Image"
                            frontImageUrl={taxDocuments?.gstCertificate}
                            backImageUrl={taxDocuments?.panCard}
                        />
                    </SectionBox>

                    {/* Banking Details Section */}
                    <SectionBox
                        title="Banking & Payout Details"
                        status={bankingDetails?.bankingStatus}
                        onApprove={() => handleDocumentAction('banking', 'approved')}
                        onReject={() => openRejectModal('banking')}
                        isActionLoading={isActionLoading}
                        rejectionReason={bankingDetails?.rejectionReason}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard label="Account Holder" value={bankingDetails?.accountHolderName} />
                            <InfoCard label="Account Number" value={bankingDetails?.accountNumber} />
                            <InfoCard label="IFSC Code" value={bankingDetails?.ifscCode} />
                            <InfoCard label="UPI ID" value={bankingDetails?.upiId} />
                        </div>
                    </SectionBox>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="space-y-6">
                        {/* Partner Details Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Partner Details</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                                    {selectedProperty.partner?.profilePicture ? (
                                        <img src={selectedProperty.partner.profilePicture} alt="Partner" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-lg">
                                            {selectedProperty.partner?.fullName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{selectedProperty.partner?.fullName || 'Unknown Partner'}</p>
                                    <p className="text-xs text-gray-500">Property Owner</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Property Overview</h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price per night</p>
                                        <p className="text-lg font-bold text-gray-900">₹{pricePerNight}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                        <Home size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Capacity</p>
                                        <p className="font-semibold text-gray-900">{maxGuests} Guests • {totalRooms} Rooms</p>
                                        <p className="text-xs text-emerald-600 font-medium">{availableRooms} Currently Vacant</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Description</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {description}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Location</p>
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        <p className="text-sm text-gray-700 font-medium mb-1">{address?.street}</p>
                                        <p className="text-sm text-gray-500">{address?.city}, {address?.state} - {address?.pincode}</p>
                                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 bg-white border border-blue-100 px-3 py-2 rounded-lg inline-block">
                                            <MapPin size={14} />
                                            VIEW ON MAP
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RejectionReasonModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onSubmit={handleRejectSubmit}
                isSubmitting={isActionLoading}
            />
        </div>
    );
};

const SectionBox: React.FC<{
    title: string;
    status?: string;
    children: React.ReactNode;
    onApprove: () => void;
    onReject: () => void;
    isActionLoading: boolean;
    rejectionReason?: string;
}> = ({ title, status, children, onApprove, onReject, isActionLoading, rejectionReason }) => {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <SectionStatus status={status || 'incomplete'} />
            </div>

            <div className="p-6">
                {children}

                {status === 'rejected' && rejectionReason && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                        <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-700">{rejectionReason}</p>
                    </div>
                )}

                {status === 'pending' && (
                    <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-50">
                        <button
                            onClick={onReject}
                            disabled={isActionLoading}
                            className="px-6 py-2 bg-gray-50 text-red-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isActionLoading && <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>}
                            Reject Section
                        </button>
                        <button
                            onClick={onApprove}
                            disabled={isActionLoading}
                            className="bg-blue-50 text-blue-700 px-6 py-2 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-50"
                        >
                            {isActionLoading ? (
                                <div className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Check size={16} strokeWidth={3} />
                            )}
                            Approve Section
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const SectionStatus: React.FC<{ status: string }> = ({ status }) => {
    switch (status) {
        case 'approved':
            return <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><CheckCircle2 size={14} /> Approved</div>;
        case 'rejected':
            return <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><X size={14} /> Rejected</div>;
        case 'pending':
            return <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono tracking-tighter italic">Pending Review</div>;
        default:
            return <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">Incomplete</div>;
    }
};

const InfoCard: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-700">{value || 'N/A'}</p>
    </div>
);

export default PropertyVerificationDetail;
