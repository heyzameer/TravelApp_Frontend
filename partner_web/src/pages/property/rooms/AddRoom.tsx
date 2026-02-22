import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/index';
import { createRoom, fetchRooms, updateRoom, uploadRoomImages } from '../../../features/rooms/roomSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { CategorizedImageUpload } from '../../../components/property/CategorizedImageUpload';
import { ArrowLeft, Save, Loader2, BedDouble, Layers, Utensils, Home, Users, IndianRupee } from 'lucide-react';
import { toast } from 'react-hot-toast';

import type { ImageFile, Room } from '../../../types';

const ROOM_TYPES = ['Deluxe', 'Standard', 'Suite', 'Dormitory', 'Cottage', 'Villa', 'Apartment'];
const SHARING_TYPES = ['Private', '2-Sharing', '3-Sharing', '4-Sharing', '6-Sharing', '8-Sharing', '10-Sharing'];
const AMENITIES_LIST = ['WiFi', 'AC', 'TV', 'Heater', 'Balcony', 'Room Service', 'Iron', 'Kettle', 'Work Desk'];

const AddRoom: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>();
    const isEdit = Boolean(roomId);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);

    const { rooms = [] } = useSelector((state: RootState) => state.rooms);

    // Form State
    const [formData, setFormData] = useState({
        roomName: '',
        quantity: 1,
        roomNumbers: [''],
        roomType: 'Deluxe',
        sharingType: 'Private',
        baseOccupancy: 2,
        minOccupancy: 1,
        maxOccupancy: 3,
        basePricePerNight: '',
        extraPersonCharge: '0',
        bedConfiguration: 'Double Bed',
        hasSelfCooking: false,
        amenities: [] as string[]
    });

    const [categorizedImages, setCategorizedImages] = useState<ImageFile[]>([]);

    useEffect(() => {
        if (isEdit && roomId) {
            const fetchRoom = async () => {
                try {
                    setFetching(true);
                    const room = (rooms as Room[]).find((r) => r._id === roomId);
                    if (room) {
                        setFormData({
                            roomName: room.roomName || '',
                            quantity: 1,
                            roomNumbers: [room.roomNumber || ''],
                            roomType: room.roomType,
                            sharingType: room.sharingType,
                            baseOccupancy: room.baseOccupancy,
                            minOccupancy: room.minOccupancy,
                            maxOccupancy: room.maxOccupancy,
                            basePricePerNight: room.basePricePerNight.toString(),
                            extraPersonCharge: room.extraPersonCharge.toString(),
                            bedConfiguration: room.bedConfiguration,
                            hasSelfCooking: room.hasSelfCooking,
                            amenities: room.amenities
                        });
                        if (room.images) {
                            setCategorizedImages(room.images.map((img: { url: string; category: string; label?: string }) => ({
                                url: img.url,
                                category: img.category,
                                label: img.label || '',
                                file: null,
                                preview: img.url
                            } as ImageFile)));
                        }
                    } else if (propertyId) {
                        await dispatch(fetchRooms(propertyId));
                    }
                } catch (error) {
                    console.error('Failed to fetch room details:', error);
                    toast.error('Failed to load room details');
                } finally {
                    setFetching(false);
                }
            };
            fetchRoom();
        }
    }, [isEdit, roomId, rooms, propertyId, dispatch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === 'quantity') {
            const newQuantity = Math.max(1, parseInt(value) || 1);
            const newRoomNumbers = Array(newQuantity).fill('').map((_, i) => formData.roomNumbers[i] || '');
            setFormData(prev => ({
                ...prev,
                quantity: newQuantity,
                roomNumbers: newRoomNumbers
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
            }));
        }
    };

    const handleRoomNumberChange = (index: number, value: string) => {
        const newRoomNumbers = [...formData.roomNumbers];
        newRoomNumbers[index] = value;
        setFormData(prev => ({ ...prev, roomNumbers: newRoomNumbers }));
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!propertyId) { toast.error("Property ID missing"); return; }
        if (categorizedImages.length === 0) { toast.error("Please add at least one image"); return; }

        setLoading(true);
        try {
            const apiData = {
                ...formData,
                basePricePerNight: Number(formData.basePricePerNight),
                extraPersonCharge: Number(formData.extraPersonCharge),
                baseOccupancy: Number(formData.baseOccupancy),
                minOccupancy: Number(formData.minOccupancy),
                maxOccupancy: Number(formData.maxOccupancy),
                hasSelfCooking: Boolean(formData.hasSelfCooking)
            };

            if (isEdit && roomId) {
                await dispatch(updateRoom({ roomId, data: apiData })).unwrap();
                const newFiles = categorizedImages.filter(img => img.file);
                if (newFiles.length > 0) {
                    await dispatch(uploadRoomImages({ roomId, images: newFiles })).unwrap();
                }
            } else {
                await dispatch(createRoom({ propertyId, data: apiData, images: categorizedImages })).unwrap();
            }
            navigate(`/partner/property/${propertyId}/rooms`);
        } catch (error) {
            console.error('Failed to save room:', error);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-rose-500 rounded-full animate-spin"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Retaining unit configuration...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
            {/* Header Section */}
            <div className="flex items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-4">
                        <div className="p-2 bg-rose-50 rounded-xl">
                            <Home className="text-rose-600" size={24} />
                        </div>
                        {isEdit ? 'EDIT ROOM' : 'ADD NEW ROOM'}
                    </h1>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mt-1 ml-1">
                        {isEdit ? 'Update existing stay inventory' : 'Initialize a new unit'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                {/* Structural Details */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                    <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl">
                            <Layers className="w-6 h-6 text-blue-600" />
                        </div>
                        ROOM DETAILS
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Room Name</label>
                            <input
                                type="text"
                                name="roomName"
                                value={formData.roomName}
                                onChange={handleInputChange}
                                placeholder="e.g., Deluxe Ocean Suite"
                                required
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm placeholder:text-gray-300"
                            />
                        </div>

                        {!isEdit && (
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Batch Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    min="1"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                />
                            </div>
                        )}

                        <div className={isEdit ? 'col-span-2' : ''}>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Room Category</label>
                            <select
                                name="roomType"
                                value={formData.roomType}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                            >
                                {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-3 block">Room Number(s)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {formData.roomNumbers.map((num, idx) => (
                                    <div key={idx} className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">#{idx + 1}</span>
                                        <input
                                            type="text"
                                            value={num}
                                            onChange={(e) => handleRoomNumberChange(idx, e.target.value)}
                                            placeholder="101"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Occupancy & Layout */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                    <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-2xl">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        CAPACITY & LAYOUT
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Base Guests</label>
                            <input
                                type="number"
                                name="baseOccupancy"
                                value={formData.baseOccupancy}
                                onChange={handleInputChange}
                                min="1"
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Max Threshold</label>
                            <input
                                type="number"
                                name="maxOccupancy"
                                value={formData.maxOccupancy}
                                onChange={handleInputChange}
                                min="1"
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Sharing Model</label>
                            <select
                                name="sharingType"
                                value={formData.sharingType}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                            >
                                {SHARING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Bed Configuration</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">
                                    <BedDouble size={20} />
                                </span>
                                <input
                                    type="text"
                                    name="bedConfiguration"
                                    value={formData.bedConfiguration}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2 Queen Beds or 1 King Size Bed"
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm placeholder:text-gray-300"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                    <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl">
                            <IndianRupee className="w-6 h-6 text-emerald-600" />
                        </div>
                        PRICING
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Base Price Per Night</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-black">₹</span>
                                <input
                                    type="number"
                                    name="basePricePerNight"
                                    value={formData.basePricePerNight}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Extra Person Charge</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-black">₹</span>
                                <input
                                    type="number"
                                    name="extraPersonCharge"
                                    value={formData.extraPersonCharge}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Amenities */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                    <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-2xl">
                            <Utensils className="w-6 h-6 text-orange-600" />
                        </div>
                        AMENITIES
                    </h2>

                    <div className="flex flex-wrap gap-3">
                        {AMENITIES_LIST.map(amenity => (
                            <button
                                key={amenity}
                                type="button"
                                onClick={() => toggleAmenity(amenity)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3 ${formData.amenities.includes(amenity)
                                    ? 'bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-200'
                                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                                    }`}
                            >
                                {amenity}
                                {formData.amenities.includes(amenity) && <Save size={14} className="opacity-0" />} {/* Just for spacing consistency if needed */}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                    <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl">
                            <Layers className="w-6 h-6 text-blue-600" />
                        </div>
                        ROOM IMAGES
                    </h2>
                    <CategorizedImageUpload
                        images={categorizedImages}
                        onChange={setCategorizedImages}
                    />
                </div>

                <div className="flex justify-end pr-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-12 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isEdit ? 'Update Room Detail' : 'Save New Room'}
                    </button>
                </div>
            </form>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                div { font-family: 'Outfit', sans-serif; }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>
        </div>
    );
};

export default AddRoom;
