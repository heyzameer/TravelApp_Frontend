'use client';

import React, { useEffect, useState } from 'react';
import { consumerApi } from '@/services/consumerApi';
import { Users, CheckCircle, BedDouble, ArrowRight } from 'lucide-react';
import { RoomDetailModal } from './RoomDetailModal';
import Image from 'next/image';

// Updated interface based on API response
interface Room {
    _id: string;
    roomType: string; // was type
    sharingType: string;
    basePricePerNight: number; // was price
    amenities: string[];
    description?: string;
    images: { url: string }[] | string[];
    baseOccupancy: number;
    maxOccupancy: number; // was capacity
    bedConfiguration: string;
    hasSelfCooking: boolean;
    roomName?: string;
    isActive: boolean;
}

interface RoomListProps {
    propertyId: string;
    onRoomSelect: (room: Room) => void;
    selectedRoomId?: string;
}

export const RoomList: React.FC<RoomListProps> = ({ propertyId, onRoomSelect, selectedRoomId }) => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedDetailRoom, setSelectedDetailRoom] = useState<Room | null>(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await consumerApi.getPropertyRooms(propertyId);
                // Map API data to component state if needed, but the interface now matches structure generally
                setRooms(data || []);

                // Select first room by default if none selected
                if (data && data.length > 0 && !selectedRoomId) {
                    onRoomSelect(data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch rooms", error);
            } finally {
                setLoading(false);
            }
        };

        if (propertyId) fetchRooms();
    }, [propertyId, onRoomSelect, selectedRoomId]);

    const handleRoomClick = (room: Room) => {
        onRoomSelect(room);
    };

    const openRoomDetails = (e: React.MouseEvent, room: Room) => {
        e.stopPropagation();
        setSelectedDetailRoom(room);
        setDetailModalOpen(true);
    };

    if (loading) return (
        <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded-lg w-1/3 animate-pulse"></div>
            <div className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
            <div className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
        </div>
    );

    if (rooms.length === 0) return (
        <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No rooms available for this property.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                Choose your room
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{rooms.length} Available</span>
            </h3>

            <div className="space-y-4">
                {rooms.map((room) => {
                    const isSelected = selectedRoomId === room._id;
                    const price = room.basePricePerNight;
                    // Handle image structure which can be object or string
                    const firstImage = room.images && room.images.length > 0
                        ? (typeof room.images[0] === 'string' ? room.images[0] : room.images[0].url)
                        : null;

                    return (
                        <div
                            key={room._id}
                            onClick={() => handleRoomClick(room)}
                            className={`group relative border-2 rounded-3xl p-4 cursor-pointer transition-all duration-300 ${isSelected
                                ? 'border-emerald-500 bg-emerald-50/10 shadow-lg shadow-emerald-100'
                                : 'border-transparent bg-white shadow-sm hover:shadow-md hover:border-gray-200'
                                }`}
                        >
                            <div className="flex gap-4 md:gap-6">
                                {/* Room Image Thumbnail */}
                                <div className="hidden sm:block w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-2xl overflow-hidden bg-gray-100 relative">
                                    {firstImage ? (
                                        <Image
                                            src={firstImage}
                                            alt={room.roomType}
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            fill
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <BedDouble size={24} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900 capitalize flex items-center gap-2 truncate">
                                                {room.roomName || `${room.roomType} Room`}
                                                {isSelected && <CheckCircle size={18} className="text-emerald-500 shrink-0" />}
                                            </h4>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                    {room.sharingType}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                    {room.bedConfiguration}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                            <span className="text-2xl font-black text-emerald-600 block">₹{price}</span>
                                            <span className="text-xs text-gray-400 font-bold">PER NIGHT</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Users size={16} className="text-gray-400" />
                                                Max {room.maxOccupancy} Guests
                                            </span>
                                            {room.hasSelfCooking && (
                                                <span className="hidden sm:flex items-center gap-1.5">
                                                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                                    Self Cooking
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={(e) => openRoomDetails(e, room)}
                                            className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline transition-all"
                                        >
                                            View Details <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedDetailRoom && (
                <RoomDetailModal
                    room={selectedDetailRoom}
                    isOpen={detailModalOpen}
                    onClose={() => setDetailModalOpen(false)}
                    onSelect={() => handleRoomClick(selectedDetailRoom)}
                    isSelected={selectedRoomId === selectedDetailRoom._id}
                />
            )}
        </div>
    );
};
