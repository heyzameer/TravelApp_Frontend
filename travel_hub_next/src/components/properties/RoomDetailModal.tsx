'use client';

import React, { useState } from 'react';
import { X, Users, BedDouble, CheckCircle, Maximize, Utensils, Wifi, Tv, Wind, Coffee, Shirt } from 'lucide-react';
import Image from 'next/image';

interface Room {
    _id: string;
    roomType: string;
    sharingType: string;
    basePricePerNight: number;
    baseOccupancy: number;
    maxOccupancy: number;
    amenities: string[];
    bedConfiguration: string;
    images: { url: string }[] | string[];
    roomName?: string;
    hasSelfCooking?: boolean;
    description?: string;
    agreementType?: string;
}

interface RoomDetailModalProps {
    room: Room;
    isOpen: boolean;
    onClose: () => void;
    onSelect: () => void;
    isSelected: boolean;
}

const getAmenityIcon = (amenity: string) => {
    const text = amenity.toLowerCase();
    if (text.includes('wifi')) return <Wifi size={18} />;
    if (text.includes('tv')) return <Tv size={18} />;
    if (text.includes('ac') || text.includes('air')) return <Wind size={18} />;
    if (text.includes('food') || text.includes('cook') || text.includes('kitchen')) return <Utensils size={18} />;
    if (text.includes('kettle') || text.includes('coffee')) return <Coffee size={18} />;
    if (text.includes('iron') || text.includes('laundry')) return <Shirt size={18} />;
    return <CheckCircle size={18} />;
};

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({ room, isOpen, onClose, onSelect, isSelected }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    if (!isOpen) return null;

    // Normalize images to array of strings
    const images = room.images?.map(img => typeof img === 'string' ? img : img.url) || [];
    const displayImage = images.length > 0 ? images[activeImageIndex] : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[800px] animate-in fade-in zoom-in-95 duration-200">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Left Side - Image Gallery */}
                <div className="w-full md:w-1/2 bg-gray-100 flex flex-col relative">
                    <div className="flex-1 relative min-h-[300px] md:min-h-full">
                        {displayImage ? (
                            <Image
                                src={displayImage}
                                alt={room.roomType}
                                className="object-cover"
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <Maximize size={48} opacity={0.5} />
                            </div>
                        )}

                        <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${idx === activeImageIndex ? 'border-white ring-2 ring-black/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <Image src={img} alt="" fill className="object-cover" sizes="100px" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Details */}
                <div className="w-full md:w-1/2 flex flex-col bg-white overflow-y-auto">
                    <div className="p-6 md:p-8 flex-1">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full">
                                    {room.agreementType || room.sharingType}
                                </span>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-gray-900">₹{room.basePricePerNight}</span>
                                    <span className="text-sm text-gray-500 font-medium">/night</span>
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 leading-tight mb-2">
                                {room.roomName || `${room.roomType} Room`}
                            </h2>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                {room.description || `Experience comfort and luxury in our ${room.roomType}. Perfect for up to ${room.maxOccupancy} guests.`}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3 text-gray-900 font-bold mb-1">
                                    <Users className="text-emerald-600" size={20} />
                                    <span>Occupancy</span>
                                </div>
                                <p className="text-sm text-gray-500 pl-8">
                                    Max {room.maxOccupancy} Guests
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3 text-gray-900 font-bold mb-1">
                                    <BedDouble className="text-emerald-600" size={20} />
                                    <span>Bedding</span>
                                </div>
                                <p className="text-sm text-gray-500 pl-8">
                                    {room.bedConfiguration || 'Standard Bed'}
                                </p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">
                                Amenities & Features
                            </h3>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                {room.amenities.map((amenity, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-gray-600 font-medium">
                                        <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500">
                                            {getAmenityIcon(amenity)}
                                        </div>
                                        {amenity}
                                    </div>
                                ))}
                                {room.hasSelfCooking && (
                                    <div className="flex items-center gap-3 text-gray-600 font-medium">
                                        <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500">
                                            <Utensils size={18} />
                                        </div>
                                        Self Cooking Allowed
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-3">
                        {isSelected ? (
                            <button
                                disabled
                                className="w-full py-4 bg-emerald-100 text-emerald-700 rounded-xl font-black text-lg uppercase tracking-wider flex items-center justify-center gap-2 cursor-default"
                            >
                                <CheckCircle size={24} />
                                Selected
                            </button>
                        ) : (
                            <button
                                onClick={() => { onSelect(); onClose(); }}
                                className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-lg uppercase tracking-wider hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-95"
                            >
                                Select This Room
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
