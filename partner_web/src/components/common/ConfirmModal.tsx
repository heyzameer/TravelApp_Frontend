import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false
}) => {
    if (!isOpen) return null;

    const variantClasses = {
        danger: 'bg-red-600 hover:bg-red-700 shadow-red-200 text-white',
        warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 text-white',
        info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 text-white'
    };

    const iconClasses = {
        danger: 'bg-red-50 text-red-600',
        warning: 'bg-amber-50 text-amber-600',
        info: 'bg-blue-50 text-blue-600'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-8 text-center">
                    <button
                        onClick={onCancel}
                        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>

                    <div className={`w-20 h-20 ${iconClasses[variant]} rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 transform -rotate-3`}>
                        <AlertTriangle size={40} />
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase tracking-tight">
                        {title}
                    </h2>

                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="p-8 pt-0 flex gap-4">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all border border-transparent disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-6 py-4 ${variantClasses[variant]} rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : null}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
