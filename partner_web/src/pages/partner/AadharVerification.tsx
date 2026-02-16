import React, { useState, useEffect, useRef } from 'react';
import { Upload, Check, AlertCircle, RefreshCw, FileText, User as UserIcon, Eye, ChevronRight, Info, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { partnerAuthService } from '../../services/partnerAuth';
import { socketService } from '../../services/socketService';
import { updateUser } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';

const AadharVerification: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    // Local state for file uploads (File objects)
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);

    // Previews (URLs)
    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [backPreview, setBackPreview] = useState<string | null>(null);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDocs, setIsLoadingDocs] = useState(false);
    const [showDocuments, setShowDocuments] = useState(false);
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [documentUrls, setDocumentUrls] = useState<{ aadharFront?: string; aadharBack?: string; profilePicture?: string }>({});

    // Tracks if we have already loaded the initial previews from the server
    const initialLoadDone = useRef(false);

    // Determine status: prefer top-level aadharStatus, fallback to nested
    const status = user?.personalDocuments?.aadharStatus || user?.aadharStatus || 'not_submitted';
    const isRejected = status === 'rejected';
    const rejectionReason = user?.personalDocuments?.rejectionReason || user?.personalDocuments?.aadharRejectionReason || user?.aadharRejectionReason;
    const isReadOnly = (status === 'manual_review' || status === 'verified' || status === 'approved') && !isRejected;
    const isDeactivated = user?.isActive === false;

    // Initialize previews from Redux state instead of fetching again
    useEffect(() => {
        if (user && !initialLoadDone.current) {
            const pDocs = user.personalDocuments || {};

            if (user.profilePicture) setProfilePreview(user.profilePicture);
            else if (pDocs.profilePicture) setProfilePreview(pDocs.profilePicture);

            if (pDocs.aadharFront) setFrontPreview(pDocs.aadharFront);
            if (pDocs.aadharBack) setBackPreview(pDocs.aadharBack);

            if (user.profilePicture || pDocs.aadharFront) {
                initialLoadDone.current = true;
            }
        }
    }, [user]);

    // 2. Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'front' | 'back' | 'profile') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);

            if (fileType === 'front') {
                setFrontFile(file);
                setFrontPreview(previewUrl);
            } else if (fileType === 'back') {
                setBackFile(file);
                setBackPreview(previewUrl);
            } else if (fileType === 'profile') {
                setProfileFile(file);
                setProfilePreview(previewUrl);
            }
        }
    };

    // 3. Open confirmation modal
    const handleSubmitClick = (e: React.FormEvent) => {
        e.preventDefault();

        if (isDeactivated) {
            toast.error('Account is deactivated. Submission is disabled.');
            return;
        }

        // Check if we have all 3 either from new files or existing server files
        const hasFront = frontFile || user?.personalDocuments?.aadharFront;
        const hasBack = backFile || user?.personalDocuments?.aadharBack;
        const hasProfile = profileFile || user?.profilePicture || user?.personalDocuments?.profilePicture;

        if (!hasFront || !hasBack || !hasProfile) {
            toast.error('Please upload all required documents: Profile Picture, ID Front, and ID Back.');
            return;
        }

        setIsConfirmModalOpen(true);
    };

    // 4. Final Final Submit
    const handleFinalSubmit = async () => {
        if (isDeactivated) {
            toast.error('Account is deactivated.');
            setIsConfirmModalOpen(false);
            return;
        }
        setIsConfirmModalOpen(false);
        setIsSubmitting(true);
        console.log('Final Submit Started', { frontFile, backFile, profileFile });
        const formData = new FormData();
        if (frontFile) formData.append('aadharFront', frontFile);
        if (backFile) formData.append('aadharBack', backFile);
        if (profileFile) formData.append('profilePicture', profileFile);

        // Include dob if stored in user state
        if (user?.dateOfBirth) {
            formData.append('dateOfBirth', user.dateOfBirth);
        }

        try {
            const response = await partnerAuthService.verifyAdhar(formData);
            if (response.success) {
                toast.success('Documents submitted successfully!');

                // Refresh local state with updated profile
                const profileData = await partnerAuthService.getPartnerProfile();
                const profile = profileData;
                dispatch(updateUser(profile));

                // Clear local files after successful submission
                setFrontFile(null);
                setBackFile(null);
                setProfileFile(null);
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error('Submission error:', err);
            toast.error(err.response?.data?.message || 'Failed to submit documents. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. Socket listeners for real-time status updates
    useEffect(() => {
        const token = partnerAuthService.getAccessToken();
        if (!token) return;

        socketService.connect(token);

        socketService.onVerificationApproved(() => {
            toast.success('🎉 Your verification has been approved!');
            partnerAuthService.getPartnerProfile().then(p => dispatch(updateUser(p)));
        });

        socketService.onVerificationRejected((data) => {
            toast.error(`Verification rejected: ${data.reason}`);
            partnerAuthService.getPartnerProfile().then(p => dispatch(updateUser(p)));
        });

        return () => {
            socketService.off('PARTNER_VERIFICATION_APPROVED');
            socketService.off('PARTNER_VERIFICATION_REJECTED');
        };
    }, [dispatch]);

    // 6. Viewing current server-side documents
    const handleViewDocuments = async () => {
        setIsLoadingDocs(true);
        try {
            console.log('Fetching aadhaar documents...');
            const docs = await partnerAuthService.getAadhaarDocuments();
            console.log('Docs received:', docs);
            // Inject profile picture if available from user state
            const enrichedDocs = {
                ...docs,
                profilePicture: user?.profilePicture || user?.personalDocuments?.profilePicture
            };
            setDocumentUrls(enrichedDocs);
            setShowDocuments(true);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error('Failed to retrieve docs:', err);
            const msg = err.response?.data?.message || 'Could not retrieve uploaded documents from server.';
            toast.error(msg);
        } finally {
            setIsLoadingDocs(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-lg border border-gray-100 my-4 md:my-8">
            {/* Deactivation Banner */}
            {isDeactivated && (
                <div className="mb-8 bg-black p-6 rounded-2xl border-4 border-red-600 shadow-2xl animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600 rounded-xl">
                            <ShieldCheck className="text-white" size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white leading-none uppercase tracking-tighter">Account Deactivated</h2>
                            <p className="text-red-400 font-bold text-sm mt-1">Your account has been deactivated by an administrator. Verification is currently suspended.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="border-b border-gray-100 pb-6 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <UserIcon className="text-red-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">IDENTITY VERIFICATION</h1>
                        <p className="text-gray-500 text-sm">Securely verify your documents to start hosting on TravelHub.</p>
                    </div>
                </div>
            </div>

            {/* Status Feedback Banners */}
            <div className="space-y-4 mb-8">
                {isRejected && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl shadow-sm">
                        <div className="flex items-start">
                            <AlertCircle className="text-red-500 mr-4 flex-shrink-0 mt-0.5" size={24} />
                            <div className="flex-1">
                                <h3 className="font-bold text-red-900 text-lg">Submission Rejected</h3>
                                <div className="mt-2 text-red-800">
                                    <p className="text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-none">
                                        {(rejectionReason as string) || 'Your documents were rejected. Please update the necessary images and re-submit.'}
                                    </p>
                                    {rejectionReason && (
                                        <button
                                            onClick={() => setIsReasonModalOpen(true)}
                                            className="mt-2 text-red-700 font-black text-xs uppercase tracking-wider flex items-center hover:text-red-900"
                                        >
                                            View Detailed Reason <ChevronRight size={14} className="ml-1" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'manual_review' && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-r-xl shadow-sm">
                        <div className="flex items-start">
                            <RefreshCw className="text-yellow-600 mr-4 flex-shrink-0 mt-0.5 animate-spin-slow" size={24} />
                            <div>
                                <h3 className="font-bold text-yellow-900 text-lg">Pending Manual Review</h3>
                                <p className="text-yellow-800 mt-1 text-sm">Our team is manually verifying your documents. This usually takes 24 hours.</p>
                            </div>
                        </div>
                    </div>
                )}

                {(status === 'verified' || status === 'approved') && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-r-xl shadow-sm">
                        <div className="flex items-start">
                            <Check className="text-green-600 mr-4 flex-shrink-0 mt-0.5" size={24} />
                            <div>
                                <h3 className="font-bold text-green-900 text-lg">Account Verified</h3>
                                <p className="text-green-800 mt-1 text-sm">Congratulations! Your identity is verified and you can now register properties.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Always show View Submissions button if we have data */}
            {(status !== 'not_submitted') && (
                <div className="mb-8 flex justify-end">
                    <button
                        onClick={handleViewDocuments}
                        disabled={isLoadingDocs}
                        className="flex items-center px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-all border border-gray-200 shadow-sm disabled:opacity-50"
                    >
                        <Eye size={18} className="mr-2" />
                        {isLoadingDocs ? 'FETCHING...' : 'VIEW CURRENT SUBMISSIONS'}
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmitClick} className="space-y-10">
                {/* 1. Profile Picture Section */}
                <div className="group">
                    <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-2 text-[10px]">01</span>
                        Profile Information
                    </h2>
                    <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                        <div className="relative">
                            <div className="h-32 w-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-xl flex items-center justify-center ring-2 ring-gray-100">
                                {profilePreview ? (
                                    <img src={profilePreview} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="text-gray-300 h-16 w-16" />
                                )}
                            </div>
                            {!isReadOnly && !isDeactivated && (
                                <label className="absolute bottom-1 right-1 p-2 bg-red-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-red-700 transition-colors border-2 border-white">
                                    <Upload size={16} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
                                </label>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="font-bold text-gray-800 text-lg">Selfie or Profile Picture</h3>
                            <p className="text-gray-500 text-sm mt-1 mb-4 italic">Make sure your face is clearly visible and well-lit.</p>
                            {!isReadOnly && !isDeactivated && (
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <label className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-700 cursor-pointer shadow-md transition-all">
                                        <Upload size={14} className="mr-2" />
                                        CHANGE PROFILE PICTURE
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
                                    </label>
                                    <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-all uppercase tracking-widest">
                                        <RefreshCw size={14} className="mr-2" />
                                        RETRY UPLOAD
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Aadhaar Documents Section */}
                <div>
                    <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-2 text-[10px]">02</span>
                        Identity Documents (Aadhaar)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Front Card */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-bold text-gray-700 uppercase">Front Side</span>
                                {frontFile && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">NEW SELECTION</span>}
                            </div>
                            <label className={`block relative border-2 border-dashed rounded-2xl overflow-hidden transition-all group ${isReadOnly || isDeactivated ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-red-400 cursor-pointer bg-gray-50/30'}`}>
                                {!isReadOnly && !isDeactivated && <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} />}
                                <div className="aspect-video flex items-center justify-center p-2">
                                    {frontPreview ? (
                                        <div className="relative w-full h-full">
                                            <img src={frontPreview} alt="Aadhaar Front" className="w-full h-full object-contain drop-shadow-md" />
                                            {!isReadOnly && !isDeactivated && (
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                                                    <Upload size={32} className="mb-2 animate-bounce-slow" />
                                                    <span className="font-black text-sm tracking-tighter text-center px-4">CLICK TO REPLACE FRONT SIDE</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-3">
                                                <FileText className="text-gray-400" size={32} />
                                            </div>
                                            <span className="text-sm font-black text-gray-600">UPLOAD FRONT SIDE</span>
                                            <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">JPG, PNG ONLY</span>
                                        </div>
                                    )}
                                </div>
                            </label>
                            {!isReadOnly && !isDeactivated && frontPreview && <p className="text-center text-[10px] font-black text-red-500 tracking-widest uppercase">Tap image to re-upload</p>}
                        </div>

                        {/* Back Card */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-bold text-gray-700 uppercase">Back Side</span>
                                {backFile && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">NEW SELECTION</span>}
                            </div>
                            <label className={`block relative border-2 border-dashed rounded-2xl overflow-hidden transition-all group ${isReadOnly || isDeactivated ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-red-400 cursor-pointer bg-gray-50/30'}`}>
                                {!isReadOnly && !isDeactivated && <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} />}
                                <div className="aspect-video flex items-center justify-center p-2">
                                    {backPreview ? (
                                        <div className="relative w-full h-full">
                                            <img src={backPreview} alt="Aadhaar Back" className="w-full h-full object-contain drop-shadow-md" />
                                            {!isReadOnly && !isDeactivated && (
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                                                    <Upload size={32} className="mb-2 animate-bounce-slow" />
                                                    <span className="font-black text-sm tracking-tighter text-center px-4">CLICK TO REPLACE BACK SIDE</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-3">
                                                <FileText className="text-gray-400" size={32} />
                                            </div>
                                            <span className="text-sm font-black text-gray-600">UPLOAD BACK SIDE</span>
                                            <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">JPG, PNG ONLY</span>
                                        </div>
                                    )}
                                </div>
                            </label>
                            {!isReadOnly && !isDeactivated && backPreview && <p className="text-center text-[10px] font-black text-red-500 tracking-widest uppercase">Tap image to re-upload</p>}
                        </div>
                    </div>
                </div>

                {/* Submit Logic */}
                {!isReadOnly && !isDeactivated && (
                    <div className="pt-8 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-200 hover:bg-red-700 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-tighter`}
                        >
                            {isSubmitting ? (
                                <>
                                    <RefreshCw className="animate-spin" size={24} />
                                    PROCESSING DOCUMENTS...
                                </>
                            ) : (
                                <>
                                    <Upload size={24} />
                                    {isRejected ? 'REVIEW & RE-SUBMIT DOCUMENTS' : 'REVIEW & START VERIFICATION'}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </form>

            {/* --- MODALS --- */}

            {/* 1. Document Viewer Modal */}
            {showDocuments && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] p-4 backdrop-blur-md" onClick={() => setShowDocuments(false)}>
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-black text-gray-900">SERVER SUBMISSIONS</h2>
                            <button onClick={() => setShowDocuments(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                                <span className="text-2xl">✕</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-12 pb-12">
                            {/* Profile Pic in Submissions */}
                            <div className="flex flex-col items-center border-b border-gray-50 pb-8">
                                <h3 className="font-black text-gray-500 text-[10px] uppercase mb-4 tracking-widest">Submitted Profile Picture</h3>
                                <div className="h-40 w-40 rounded-full overflow-hidden border-8 border-gray-50 shadow-inner">
                                    {documentUrls.profilePicture ? (
                                        <img src={documentUrls.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                            <UserIcon size={40} className="text-gray-300" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-black text-gray-500 text-xs uppercase mb-3 flex items-center gap-2">
                                        <div className="w-5 h-5 bg-red-50 text-red-600 text-[10px] rounded-full flex items-center justify-center">1</div>
                                        Aadhaar Front Side
                                    </h3>
                                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-2 overflow-hidden shadow-inner min-h-[150px] flex items-center justify-center">
                                        {documentUrls.aadharFront ? (
                                            <img src={documentUrls.aadharFront} alt="Aadhaar Front" className="w-full rounded-xl" />
                                        ) : (
                                            <p className="text-gray-300 text-xs italic">No server-side copy found.</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-500 text-xs uppercase mb-3 flex items-center gap-2">
                                        <div className="w-5 h-5 bg-red-50 text-red-600 text-[10px] rounded-full flex items-center justify-center">2</div>
                                        Aadhaar Back Side
                                    </h3>
                                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-2 overflow-hidden shadow-inner min-h-[150px] flex items-center justify-center">
                                        {documentUrls.aadharBack ? (
                                            <img src={documentUrls.aadharBack} alt="Aadhaar Back" className="w-full rounded-xl" />
                                        ) : (
                                            <p className="text-gray-300 text-xs italic">No server-side copy found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-50 bg-gray-50 flex justify-center">
                            <button
                                onClick={() => setShowDocuments(false)}
                                className="px-12 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg"
                            >
                                CLOSE VIEWER
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Rejection Detail Modal */}
            {isReasonModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[150] p-4 backdrop-blur-md" onClick={() => setIsReasonModalOpen(false)}>
                    <div className="bg-white rounded-[40px] max-w-lg w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="pt-10 pb-6 px-10 text-center">
                            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[30px] flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                                <AlertCircle size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 leading-none">REJECTION REASON</h2>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-3">Ref: Verification Service</p>
                        </div>
                        <div className="px-10 pb-10">
                            <div className="bg-gray-50 p-8 rounded-[30px] border border-gray-200 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 font-black text-gray-100 text-6xl leading-none select-none">&quot;</div>
                                <p className="text-gray-800 text-lg leading-relaxed italic font-medium relative z-10 whitespace-pre-wrap">
                                    {(rejectionReason as string)}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsReasonModalOpen(false)}
                                className="w-full mt-10 py-5 bg-red-600 text-white rounded-3xl font-black text-xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 transform active:scale-95"
                            >
                                I UNDERSTAND
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Pre-upload Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[160] p-4 backdrop-blur-xl" onClick={() => setIsConfirmModalOpen(false)}>
                    <div className="bg-white rounded-[40px] max-w-2xl w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 text-yellow-700 rounded-xl">
                                    <Info size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">REVIEW YOUR SUBMISSION</h2>
                            </div>
                            <button onClick={() => setIsConfirmModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                <span className="text-2xl font-light">✕</span>
                            </button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                            <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100 flex items-start gap-4">
                                <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={24} />
                                <div className="text-sm text-blue-900 font-bold leading-relaxed">
                                    Please ensure all documents are clearly visible. Our AI and manual review team will cross-check these details.
                                    <span className="block mt-2 text-red-600 uppercase text-[10px] tracking-widest">Warning: Frequent rejections may cause temporary account suspension.</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Profile</span>
                                    <div className="aspect-square rounded-2xl overflow-hidden border-4 border-gray-50 shadow-md">
                                        <img src={profilePreview!} alt="P" className="w-full h-full object-cover" />
                                    </div>
                                    {profileFile && <div className="text-[8px] bg-green-500 text-white px-2 py-0.5 rounded-full text-center font-bold">REPLACING</div>}
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">ID Front</span>
                                    <div className="aspect-square rounded-2xl overflow-hidden border-4 border-gray-50 shadow-md">
                                        <img src={frontPreview!} alt="F" className="w-full h-full object-cover" />
                                    </div>
                                    {frontFile && <div className="text-[8px] bg-green-500 text-white px-2 py-0.5 rounded-full text-center font-bold">REPLACING</div>}
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">ID Back</span>
                                    <div className="aspect-square rounded-2xl overflow-hidden border-4 border-gray-50 shadow-md">
                                        <img src={backPreview!} alt="B" className="w-full h-full object-cover" />
                                    </div>
                                    {backFile && <div className="text-[8px] bg-green-500 text-white px-2 py-0.5 rounded-full text-center font-bold">REPLACING</div>}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                GO BACK & EDIT
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                className="py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100"
                            >
                                CONFIRM & UPLOAD
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AadharVerification;
