import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/index';
import { fetchRooms, deleteRoom } from '../../../features/rooms/roomSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Home, Users, ArrowLeft, BedDouble, Calendar } from 'lucide-react';

import ConfirmModal from '../../../components/common/ConfirmModal';

const RoomList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { propertyId } = useParams<{ propertyId: string }>();
    const { rooms = [], loading } = useSelector((state: RootState) => state.rooms);

    useEffect(() => {
        if (propertyId) {
            dispatch(fetchRooms(propertyId));
        }
    }, [dispatch, propertyId]);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const handleDelete = (roomId: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Room',
            message: 'Are you sure you want to delete this room? This action cannot be undone and will remove all associated data.',
            onConfirm: async () => {
                await dispatch(deleteRoom(roomId));
                if (propertyId) {
                    dispatch(fetchRooms(propertyId));
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };



    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(`/partner/property/${propertyId}`)}
                        className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-4">
                            <div className="p-2 bg-rose-50 rounded-xl">
                                <Home className="text-rose-600" size={24} />
                            </div>
                            Rooms
                        </h1>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mt-1 ml-1">
                            Manage inventory and pricing
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('add')}
                    className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-gray-200 active:scale-95"
                >
                    <Plus size={20} />
                    Add New Room
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
                </div>
            ) : rooms.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Home className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">No rooms added yet</h3>
                    <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">Start adding rooms to your property to accept bookings.</p>
                    <button
                        onClick={() => navigate('add')}
                        className="text-rose-600 font-black text-sm uppercase tracking-widest hover:underline"
                    >
                        Add your first room
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room) => (
                        <div key={room._id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                            {/* Image Section */}
                            <div className="relative h-56 overflow-hidden">
                                {room.images && room.images.length > 0 ? (
                                    <img
                                        src={room.images[0].url}
                                        alt={room.roomName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                        <Home className="text-slate-200" size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-black text-gray-900 border border-gray-100">
                                    ₹{room.basePricePerNight}/night
                                </div>
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    <span className="bg-rose-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                        {room.roomType}
                                    </span>
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${room.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                        {room.isActive ? 'Active' : 'Hidden'}
                                    </span>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase group-hover:text-rose-600 transition-colors">
                                            {room.roomName || `Room #${room.roomNumber}`}
                                        </h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
                                            Unit: {room.roomNumber} • {room.sharingType}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 mb-6">
                                    <div className="flex items-center gap-3">
                                        <Users size={16} className="text-gray-400" />
                                        <span className="text-xs font-bold text-gray-600">{room.maxOccupancy} Guests</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <BedDouble size={16} className="text-gray-400" />
                                        <span className="text-xs font-bold text-gray-600 truncate">{room.bedConfiguration}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <button
                                        onClick={() => navigate(`${room._id}/availability`)}
                                        className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                                    >
                                        <Calendar size={14} />
                                        Availability
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`edit/${room._id}`)}
                                            className="p-3 text-blue-500 hover:bg-blue-50 rounded-2xl transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room._id)}
                                            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                variant="danger"
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                div { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
};

export default RoomList;
