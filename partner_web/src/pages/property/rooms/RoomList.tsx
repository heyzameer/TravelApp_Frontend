import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/index';
import { fetchRooms, deleteRoom } from '../../../features/rooms/roomSlice';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Home, Users, CheckCircle, XCircle, ArrowLeft, BedDouble, Calendar, Utensils } from 'lucide-react';
import type { Room } from '../../../types';

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

    const handleDelete = async (roomId: string) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            await dispatch(deleteRoom(roomId));
            if (propertyId) {
                dispatch(fetchRooms(propertyId));
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 p-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(`/partner/property/${propertyId}`)}
                className="flex items-center text-gray-500 hover:text-gray-900 font-bold mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" /> Back to Property Details
            </button>

            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">ROOM MANAGEMENT</h1>
                        <p className="text-gray-500 font-medium mt-1">Manage your property's rooms, pricing, and availability</p>
                    </div>
                    <Link
                        to={`/partner/property/${propertyId}/rooms/add`}
                        className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                    >
                        <Plus size={20} />
                        ADD NEW ROOM
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Home className="text-red-600" size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Rooms Added Yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Start by adding your first room to start accepting bookings.</p>
                        <Link
                            to={`/partner/property/${propertyId}/rooms/add`}
                            className="inline-flex items-center gap-2 text-red-600 font-bold hover:underline"
                        >
                            <Plus size={18} /> Add Room Now
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room: Room) => (
                            <div key={room._id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                                {room.images && room.images.length > 0 ? (
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={room.images[0].url}
                                            alt={room.roomNumber}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                to={`/partner/property/${propertyId}/rooms/edit/${room._id}`}
                                                className="p-2 bg-white/90 backdrop-blur rounded-full text-gray-700 hover:text-blue-600 shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(room._id)}
                                                className="p-2 bg-white/90 backdrop-blur rounded-full text-gray-700 hover:text-red-600 shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <Home className="text-gray-400" size={48} />
                                    </div>
                                )}

                                <div className="p-6 space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-black text-gray-900">{room.roomName || room.roomNumber}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${room.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {room.isActive ? <CheckCircle size={14} className="inline mr-1" /> : <XCircle size={14} className="inline mr-1" />}
                                                {room.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">Room #{room.roomNumber}</p>
                                        <p className="text-sm text-gray-600 font-bold mt-1">{room.roomType} • {room.sharingType}</p>
                                    </div>

                                    {/* Room Structure */}
                                    <div className="space-y-2 py-3 border-y border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <BedDouble size={16} className="text-gray-400" />
                                            <span className="font-medium">{room.bedConfiguration}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Users size={16} className="text-gray-400" />
                                            <span className="font-medium">{room.minOccupancy}-{room.maxOccupancy} Guests (Base: {room.baseOccupancy})</span>
                                        </div>
                                        {room.hasSelfCooking && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Utensils size={16} className="text-gray-400" />
                                                <span className="font-medium">Self Cooking Available</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Amenities */}
                                    {room.amenities && room.amenities.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Amenities</p>
                                            <div className="flex flex-wrap gap-1">
                                                {room.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                                                    <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg font-medium">
                                                        {amenity}
                                                    </span>
                                                ))}
                                                {room.amenities.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg font-medium">
                                                        +{room.amenities.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Pricing */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-red-600 font-black text-lg">
                                            ₹{room.basePricePerNight}/night
                                        </div>
                                        {room.extraPersonCharge > 0 && (
                                            <div className="text-xs text-gray-500">
                                                +₹{room.extraPersonCharge}/extra guest
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 space-y-2">
                                        <Link
                                            to={`/partner/property/${propertyId}/rooms/${room._id}/availability`}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg transition-colors"
                                        >
                                            <Calendar size={16} />
                                            Manage Availability
                                        </Link>
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/partner/property/${propertyId}/rooms/edit/${room._id}`}
                                                className="flex-1 py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-lg text-center transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(room._id)}
                                                className="flex-1 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomList;
