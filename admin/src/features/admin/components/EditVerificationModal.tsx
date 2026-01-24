import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { PartnerUser } from '../../../types';

interface EditVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<PartnerUser>) => void;
    partner: PartnerUser;
    isSubmitting: boolean;
}

const EditVerificationModal: React.FC<EditVerificationModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    partner,
    isSubmitting
}) => {
    const [formData, setFormData] = useState({
        fullName: '',
        aadharNumber: '',
        dateOfBirth: '',
        gender: ''
    });

    useEffect(() => {
        if (partner && isOpen) {
            setFormData({
                fullName: partner.fullName || '',
                aadharNumber: partner.personalDocuments?.aadharNumber || '',
                dateOfBirth: partner.dateOfBirth ? new Date(partner.dateOfBirth).toISOString().split('T')[0] : '', // Format YYYY-MM-DD
                gender: partner.gender || ''
            });
        }
    }, [partner, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare payload - only include changed fields or all fields
        const payload: any = {
            fullName: formData.fullName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            // We need to structure aadharNumber inside personalDocuments for the update to work as expected by frontend view
            // assuming the backend handles dot notation or deep merge, 
            // but usually we might need to send the whole object or specialized keys.
            // Let's rely on the service/thunk to handle it, or send it flattened if backend supports it.
            // For now, let's send a specific structure that matches what we want to update.
            personalDocuments: {
                ...partner.personalDocuments,
                aadharNumber: formData.aadharNumber
            }
        };

        onSubmit(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">Edit Verification Details</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name (as per Aadhaar)
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            placeholder="Enter full name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Aadhaar Number
                        </label>
                        <input
                            type="text"
                            value={formData.aadharNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, aadharNumber: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                            placeholder="XXXX XXXX XXXX"
                            maxLength={14} // Allow for spaces
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gender
                            </label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVerificationModal;
