
import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface RejectionReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void>;
    isSubmitting: boolean;
}

const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting
}) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;
        await onSubmit(reason);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 bg-red-50 border-b border-red-100 flex items-center gap-4">
                    <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Reject Verification</h3>
                        <p className="text-sm text-red-600">This action cannot be undone immediately.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Rejection <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Please explain why the document was rejected (e.g., blurry image, incorrect document type)..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !reason.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                'Confirm Rejection'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RejectionReasonModal;
