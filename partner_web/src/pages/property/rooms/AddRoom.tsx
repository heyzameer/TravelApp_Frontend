import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store/index';
import { createRoom } from '../../../features/rooms/roomSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { CategorizedImageUpload } from '../../../components/property/CategorizedImageUpload';
import { ArrowLeft, Save, Loader2, BedDouble, Users, IndianRupee, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';

import type { ImageFile } from '../../../types';

const ROOM_TYPES = ['Deluxe', 'Standard', 'Suite', 'Dormitory', 'Cottage', 'Villa', 'Apartment'];
const SHARING_TYPES = ['Private', '2-Sharing', '3-Sharing', '4-Sharing', '6-Sharing', '8-Sharing', '10-Sharing'];
const AMENITIES_LIST = ['WiFi', 'AC', 'TV', 'Heater', 'Balcony', 'Room Service', 'Iron', 'Kettle', 'Work Desk'];

const AddRoom: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { propertyId } = useParams<{ propertyId: string }>();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        roomName: '', // e.g., "Ocean View Deluxe"
        quantity: 1, // Number of rooms to create
        roomNumbers: [''], // Array of room numbers
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

    // Images State
    const [categorizedImages, setCategorizedImages] = useState<ImageFile[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name === 'quantity') {
            const newQuantity = parseInt(value) || 1;
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

        if (!propertyId) {
            toast.error("Property ID missing");
            return;
        }

        if (categorizedImages.length === 0) {
            toast.error("Please add at least one image");
            return;
        }

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

            await dispatch(createRoom({
                propertyId,
                data: apiData,
                images: categorizedImages
            })).unwrap();

            navigate(`/partner/property/${propertyId}/rooms`);
        } catch (error) {
            console.error('Failed to create room:', error);
            // Error handling is in slice
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 p-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-gray-900 font-bold mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" /> Back to Rooms
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <h1 className="text-2xl font-black text-gray-900">ADD NEW ROOM</h1>
                    <p className="text-gray-500 font-medium">Configure room details, pricing and photos</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Basic Info */}
                    <section className="space-y-6">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <Layers size={20} className="text-red-600" /> BASIC DETAILS
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Room Name *</label>
                                <input
                                    type="text"
                                    name="roomName"
                                    value={formData.roomName}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Ocean View Deluxe, Garden Suite"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none font-bold"
                                />
                                <p className="text-xs text-gray-400">A descriptive name for this room type</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Number of Rooms *</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="50"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none font-bold"
                                />
                                <p className="text-xs text-gray-400">How many rooms of this type do you want to create?</p>
                            </div>

                            {/* Dynamic Room Number Inputs */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Room Numbers *</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {formData.roomNumbers.map((roomNumber, index) => (
                                        <div key={index} className="space-y-1">
                                            <label className="text-xs font-medium text-gray-400">Room {index + 1}</label>
                                            <input
                                                type="text"
                                                value={roomNumber}
                                                onChange={(e) => handleRoomNumberChange(index, e.target.value)}
                                                placeholder={`e.g., 10${index + 1}`}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none font-bold"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Room Type *</label>
                                <select
                                    name="roomType"
                                    value={formData.roomType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none font-bold"
                                >
                                    {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Sharing Type *</label>
                                <select
                                    name="sharingType"
                                    value={formData.sharingType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none font-bold"
                                >
                                    {SHARING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Bed Configuration *</label>
                                <input
                                    type="text"
                                    name="bedConfiguration"
                                    value={formData.bedConfiguration}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 1 King Bed or 2 Twin Beds"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none font-bold"
                                />
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Occupancy */}
                    <section className="space-y-6">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <Users size={20} className="text-red-600" /> OCCUPANCY
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Base Occupancy *</label>
                                <input type="number" name="baseOccupancy" value={formData.baseOccupancy} onChange={handleInputChange} min="1" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none font-bold" />
                                <p className="text-xs text-gray-400">Included in base price</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Min Occupancy *</label>
                                <input type="number" name="minOccupancy" value={formData.minOccupancy} onChange={handleInputChange} min="1" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Max Occupancy *</label>
                                <input type="number" name="maxOccupancy" value={formData.maxOccupancy} onChange={handleInputChange} min="1" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none font-bold" />
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Pricing */}
                    <section className="space-y-6">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <IndianRupee size={20} className="text-red-600" /> PRICING
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Base Price Per Night (₹) *</label>
                                <input type="number" name="basePricePerNight" value={formData.basePricePerNight} onChange={handleInputChange} min="0" required placeholder="2000" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Extra Person Charge (₹) *</label>
                                <input type="number" name="extraPersonCharge" value={formData.extraPersonCharge} onChange={handleInputChange} min="0" required placeholder="500" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none font-bold" />
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Amenities & Features */}
                    <section className="space-y-6">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <BedDouble size={20} className="text-red-600" /> AMENITIES
                        </h3>

                        <div className="space-y-4">
                            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    name="hasSelfCooking"
                                    checked={formData.hasSelfCooking}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hasSelfCooking: e.target.checked }))}
                                    className="w-5 h-5 accent-red-600 rounded"
                                />
                                <span className="font-bold text-gray-700">Self Cooking Allowed</span>
                            </label>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {AMENITIES_LIST.map(amenity => (
                                    <button
                                        key={amenity}
                                        type="button"
                                        onClick={() => toggleAmenity(amenity)}
                                        className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${formData.amenities.includes(amenity)
                                            ? 'bg-red-50 border-red-500 text-red-700'
                                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                            }`}
                                    >
                                        {amenity}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Images */}
                    <section className="space-y-6">
                        <CategorizedImageUpload
                            images={categorizedImages}
                            onChange={setCategorizedImages}
                        />
                    </section>

                    <div className="pt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            SAVE ROOM
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRoom;
