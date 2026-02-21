
import React, { useState, useRef } from 'react';
import { Mail, X, Paperclip, Send, Loader2, FileText, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ComposeEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientEmail: string;
    recipientName: string;
    onSend: (data: FormData) => Promise<void>;
}

const ComposeEmailModal: React.FC<ComposeEmailModalProps> = ({
    isOpen,
    onClose,
    recipientEmail,
    recipientName,
    onSend
}) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAttachments(prev => [...prev, ...newFiles]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!subject.trim() || !message.trim()) {
            toast.error('Please fill in both subject and message');
            return;
        }

        setIsSending(true);
        const formData = new FormData();
        formData.append('to', recipientEmail);
        formData.append('subject', subject);
        formData.append('message', message);
        attachments.forEach(file => {
            formData.append('attachments', file);
        });

        try {
            await onSend(formData);
            toast.success('Email sent successfully');
            onClose();
            // Clear form
            setSubject('');
            setMessage('');
            setAttachments([]);
        } catch (error: unknown) {
            toast.error((error as { message?: string })?.message || 'Failed to send email');
        } finally {
            setIsSending(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-8 text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold italic tracking-tight">Compose Email</h2>
                            <p className="text-indigo-100 text-sm opacity-80 font-medium">Drafting response to {recipientName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-xl transition-all hover:rotate-90 duration-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* To Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Recipient</label>
                        <div className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 font-bold flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            {recipientEmail}
                        </div>
                    </div>

                    {/* Subject Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Type clearly defined subject here..."
                            className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300 shadow-sm"
                            required
                        />
                    </div>

                    {/* Message Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Message Body</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your professional message here..."
                            className="w-full h-48 px-6 py-6 rounded-[2rem] bg-white border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300 shadow-sm resize-none"
                            required
                        />
                    </div>

                    {/* Attachments Section */}
                    {attachments.length > 0 && (
                        <div className="space-y-3 px-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Attachments ({attachments.length})</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl group hover:bg-indigo-50 transition-all">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                                <FileText size={16} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-bold text-gray-700 truncate">{file.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-600 border-2 border-gray-100 rounded-2xl font-extrabold hover:bg-gray-50 hover:border-indigo-200 hover:text-indigo-600 transition-all group scale-100 active:scale-95"
                            >
                                <Paperclip size={18} className="group-hover:rotate-45 transition-transform" />
                                Attach Files
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple
                                className="hidden"
                            />
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 sm:flex-none px-8 py-3 text-gray-400 font-bold hover:text-gray-600 transition-all uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSending}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-2xl font-black shadow-[0_10px_30px_-10px_rgba(79,70,229,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                            >
                                {isSending ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        <span>SEND MESSAGE</span>
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComposeEmailModal;
