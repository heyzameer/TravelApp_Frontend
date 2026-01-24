
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Shield, Calendar, Mail, Phone, MapPin, Pencil } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchPartnerVerificationDetails, verifyPartnerAadhaar, updatePartner } from '../../../../store/slices/partnersSlice';
import DocumentViewer from '../../components/DocumentViewer';
import VerificationStatusBadge from '../../components/VerificationStatusBadge';
import RejectionReasonModal from '../../components/RejectionReasonModal';
import EditVerificationModal from '../../components/EditVerificationModal';
import { toast } from 'react-hot-toast';

const PartnerVerificationDetail: React.FC = () => {
    const { partnerId } = useParams<{ partnerId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedPartner, isLoading, error } = useAppSelector((state) => state.partners);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isRejectionExpanded, setIsRejectionExpanded] = useState(false);

    useEffect(() => {
        if (partnerId) {
            dispatch(fetchPartnerVerificationDetails(partnerId));
        }
    }, [dispatch, partnerId]);

    const handleApprove = async () => {
        if (!partnerId) return;

        setIsActionLoading(true);
        try {
            await dispatch(verifyPartnerAadhaar({
                partnerId,
                action: 'approve'
            })).unwrap();
            toast.success('Partner Aadhaar verified successfully');
        } catch (err) {
            toast.error('Failed to approve verification');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async (reason: string) => {
        if (!partnerId) return;

        setIsActionLoading(true);
        try {
            await dispatch(verifyPartnerAadhaar({
                partnerId,
                action: 'reject',
                reason
            })).unwrap();
            toast.success('Partner Aadhaar verification rejected');
            setIsRejectModalOpen(false);
        } catch (err) {
            toast.error('Failed to reject verification');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUpdateDetails = async (data: any) => {
        if (!partnerId) return;

        setIsActionLoading(true);
        try {
            await dispatch(updatePartner({
                partnerId,
                partnerData: data
            })).unwrap();
            toast.success('Partner details updated successfully');
            setIsEditModalOpen(false);
        } catch (err) {
            toast.error('Failed to update details');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading && !selectedPartner) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !selectedPartner) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <p className="text-red-500 text-lg mb-4">Failed to load partner details</p>
                <button
                    onClick={() => navigate('/admin/partners')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
                >
                    <ArrowLeft size={20} />
                    Back to Partners
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/partners')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Partners
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex flex-wrap items-center gap-3">
                            Verification Details
                            <VerificationStatusBadge status={selectedPartner.personalDocuments?.aadharStatus || 'not_submitted'} />
                        </h1>
                        <p className="text-gray-600 mt-1">Review partner documents and verify identity</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {selectedPartner.personalDocuments?.aadharStatus === 'manual_review' && (
                            <>
                                <button
                                    onClick={() => setIsRejectModalOpen(true)}
                                    disabled={isActionLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-700 font-semibold rounded-xl border border-red-200 hover:bg-red-100 transition-all disabled:opacity-50"
                                >
                                    <X size={20} />
                                    Reject
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isActionLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-100 transition-all disabled:opacity-70"
                                >
                                    <Check size={20} />
                                    Approve Verification
                                </button>
                            </>
                        )}
                        {selectedPartner.personalDocuments?.aadharStatus === 'rejected' && (
                            <div className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-xl border border-red-200 max-w-full md:max-w-md">
                                <div className="flex items-center gap-3">
                                    <div className="line-clamp-1 text-sm">
                                        <span className="font-bold text-xs uppercase tracking-wider opacity-70">Reason:</span> {selectedPartner.personalDocuments?.rejectionReason || 'No reason provided'}
                                    </div>
                                    <button
                                        onClick={() => setIsRejectionExpanded(true)}
                                        className="text-xs font-bold underline whitespace-nowrap hover:text-red-900 shrink-0"
                                    >
                                        View Full
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Partner Profile */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all shadow-sm"
                            title="Edit Details"
                        >
                            <Pencil size={18} />
                        </button>
                        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                            {/* Banner */}
                        </div>
                        <div className="px-6 pb-6 mt-[-3rem]">
                            <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-md bg-white overflow-hidden mb-4">
                                <img
                                    src={selectedPartner.profilePicture || selectedPartner.profileImage || '/profile3.png'}
                                    alt={selectedPartner.fullName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/profile3.png'; }}
                                />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{selectedPartner.fullName}</h2>
                            <p className="text-sm text-gray-500 mb-6">Partner since {new Date(selectedPartner.createdAt).getFullYear()}</p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="p-2 bg-gray-50 rounded-lg text-blue-600">
                                        <Mail size={18} />
                                    </div>
                                    <span className="text-sm font-medium">{selectedPartner.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="p-2 bg-gray-50 rounded-lg text-purple-600">
                                        <Phone size={18} />
                                    </div>
                                    <span className="text-sm font-medium">{selectedPartner.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="p-2 bg-gray-50 rounded-lg text-emerald-600">
                                        <Shield size={18} />
                                    </div>
                                    <span className="text-sm font-medium align-middle">
                                        ID: <span className="font-mono bg-gray-100 px-1 rounded">{selectedPartner.personalDocuments?.aadharNumber || 'Not provided'}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="p-2 bg-gray-50 rounded-lg text-orange-600">
                                        <Calendar size={18} />
                                    </div>
                                    <span className="text-sm font-medium">DOB: {new Date(selectedPartner.dateOfBirth).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Document Viewer */}
                <div className="lg:col-span-2 space-y-6">
                    <DocumentViewer
                        title="Aadhaar Card Verification"
                        documentType="Aadhaar Card"
                        frontImageUrl={selectedPartner.personalDocuments?.aadharFrontUrl || selectedPartner.personalDocuments?.aadharFront}
                        backImageUrl={selectedPartner.personalDocuments?.aadharBackUrl || selectedPartner.personalDocuments?.aadharBack}
                    />

                    {/* Additional Details (Placeholder for other docs like PAN/License if needed later) */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-gray-400" />
                            Location Details
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            {/* Map placeholder or address details from PartnerUser */}
                            <p className="text-gray-500 text-sm">Location verification is handled automatically based on current GPS coordinates during active duty.</p>
                        </div>
                    </div>
                </div>
            </div>

            <RejectionReasonModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onSubmit={handleReject}
                isSubmitting={isActionLoading}
            />

            <EditVerificationModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateDetails}
                partner={selectedPartner}
                isSubmitting={isActionLoading}
            />

            {/* Rejection Reason View Modal */}
            {isRejectionExpanded && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
                            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                                <Shield className="text-red-600" size={20} />
                                Rejection Reason
                            </h3>
                            <button
                                onClick={() => setIsRejectionExpanded(false)}
                                className="p-2 hover:bg-red-100 rounded-full text-red-400 hover:text-red-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {selectedPartner.personalDocuments?.rejectionReason}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setIsRejectionExpanded(false)}
                                className="px-6 py-2 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors shadow-sm"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerVerificationDetail;
