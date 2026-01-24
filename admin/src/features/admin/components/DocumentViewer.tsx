
import React, { useState } from 'react';
import { ZoomIn, Eye, Image as ImageIcon, X } from 'lucide-react';

interface DocumentViewerProps {
    frontImageUrl?: string;
    backImageUrl?: string;
    documentType: string;
    title: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
    frontImageUrl,
    backImageUrl,
    documentType,
    title
}) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const DocumentCard: React.FC<{ url?: string; label: string }> = ({ url, label }) => (
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
            {url ? (
                <div
                    className="relative group aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
                    onClick={() => setSelectedImage(url)}
                >
                    <img
                        src={url}
                        alt={`${documentType} ${label}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/90 p-2 rounded-full shadow-lg">
                            <ZoomIn size={20} className="text-gray-700" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-sm">No image uploaded</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <Eye size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">{title}</h3>
            </div>

            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <DocumentCard url={frontImageUrl} label="Front View" />
                    <DocumentCard url={backImageUrl} label="Back View" />
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Document Full View"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default DocumentViewer;
