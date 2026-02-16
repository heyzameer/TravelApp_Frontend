import React from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import type { ImageFile } from '../../types';
import { toast } from 'react-hot-toast';

interface CategorizedImageUploadProps {
    images: ImageFile[];
    onChange: (images: ImageFile[]) => void;
    maxImages?: number;
    error?: string;
}

const CATEGORIES = [
    'Facade', 'Entrance', 'Living Room', 'Bedroom', 'Bathroom',
    'Kitchen', 'Dining', 'Terrace', 'Parking', 'Pool', 'Washroom', 'Others'
];

export const CategorizedImageUpload: React.FC<CategorizedImageUploadProps> = ({
    images,
    onChange,
    maxImages = 20,
    error
}) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file),
                category: 'Others',
                label: ''
            }));

            if (images.length + newFiles.length > maxImages) {
                toast.error(`You can upload a maximum of ${maxImages} images`);
                return;
            }

            onChange([...images, ...newFiles]);
        }
    };

    const updateImageMetadata = (index: number, field: 'category' | 'label', value: string) => {
        const updatedImages = [...images];
        updatedImages[index] = { ...updatedImages[index], [field]: value };
        onChange(updatedImages);
    };

    const removeImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        onChange(updatedImages);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-black text-gray-700 uppercase tracking-widest">
                    Property Gallery (Max {maxImages} photos) *
                </label>
                <span className={`text-xs font-black ${images.length >= maxImages ? 'text-red-600' : 'text-gray-500'}`}>
                    {images.length}/{maxImages}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                    <div key={idx} className="relative bg-gray-50 rounded-2xl p-2 border border-gray-100 group">
                        <div className="aspect-video rounded-xl overflow-hidden mb-2 bg-white">
                            <img src={img.preview} className="w-full h-full object-cover" alt="Preview" />
                        </div>

                        <div className="space-y-2">
                            <select
                                value={img.category}
                                onChange={(e) => updateImageMetadata(idx, 'category', e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-red-500 font-bold text-gray-700"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                placeholder="Label (e.g. Master Bedroom)"
                                value={img.label}
                                onChange={(e) => updateImageMetadata(idx, 'label', e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-red-500 font-medium text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md text-red-500 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <label className={`aspect-video rounded-2xl border-2 border-dashed bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-red-200 hover:bg-red-50/10 transition-colors ${error ? 'border-red-500' : 'border-gray-200'}`}>
                        <div className="p-3 bg-white rounded-full shadow-sm mb-2">
                            <Upload className="text-gray-400" size={20} />
                        </div>
                        <span className="text-xs font-black text-gray-400 uppercase">Add Photos</span>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>

            {error && (
                <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                    <AlertCircle size={14} /> {error}
                </p>
            )}
        </div>
    );
};
