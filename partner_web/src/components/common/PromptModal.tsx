import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';

interface PromptModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    placeholder?: string;
    initialValue?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    required?: boolean;
}

const PromptModal: React.FC<PromptModalProps> = ({
    isOpen,
    title,
    message,
    placeholder = 'Type here...',
    initialValue = '',
    onConfirm,
    onCancel,
    confirmText = 'Submit',
    cancelText = 'Cancel',
    isLoading = false,
    required = true
}) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
        }
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (required && !value.trim()) return;
        onConfirm(value);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="relative p-8 text-center">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 transform rotate-3">
                            <MessageSquare size={40} />
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase tracking-tight">
                            {title}
                        </h2>

                        <p className="text-gray-500 font-medium text-lg leading-relaxed mb-6">
                            {message}
                        </p>

                        <div className="text-left space-y-2">
                            <textarea
                                autoFocus
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={placeholder}
                                rows={4}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-bold transition-all text-gray-800 placeholder:text-gray-400"
                            />
                            {required && !value.trim() && (
                                <p className="text-red-500 text-xs font-black uppercase tracking-widest px-2">
                                    This field is required
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-8 pt-0 flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all border border-transparent disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || (required && !value.trim())}
                            className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : null}
                            {confirmText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PromptModal;
