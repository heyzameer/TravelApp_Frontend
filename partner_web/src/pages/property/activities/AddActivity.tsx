import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch } from '../../../store';
import { createActivity } from '../../../features/activities/activitySlice';
import { activityService } from '../../../services/activityService';
import { ArrowLeft, Save, Loader2, Compass } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TIME_SLOTS = [
    '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
    '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM'
];

const AddActivity: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { propertyId } = useParams<{ propertyId: string }>();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        duration: '',
        pricePerPerson: '',
        maxParticipants: '',
        availableTimeSlots: [] as string[],
        images: [] as string[]
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const url = await activityService.uploadImage(file);
            setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
            toast.success('Image uploaded');
        } catch (error) {
            console.error('Failed to upload image', error);
            toast.error('Failed to upload image');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleTimeSlot = (slot: string) => {
        setFormData(prev => {
            const slots = prev.availableTimeSlots.includes(slot)
                ? prev.availableTimeSlots.filter(s => s !== slot)
                : [...prev.availableTimeSlots, slot];
            return { ...prev, availableTimeSlots: slots };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!propertyId) return;

        // Frontend Validation
        if (!formData.name.trim()) {
            toast.error('Activity name is required');
            return;
        }
        if (!formData.category.trim()) {
            toast.error('Please specify a category');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Description is required');
            return;
        }
        if (!formData.duration || Number(formData.duration) <= 0) {
            toast.error('Please enter a valid duration');
            return;
        }
        if (!formData.pricePerPerson || Number(formData.pricePerPerson) < 0) {
            toast.error('Please enter a valid price');
            return;
        }
        if (!formData.maxParticipants || Number(formData.maxParticipants) <= 0) {
            toast.error('Please enter maximum participants');
            return;
        }
        if (formData.availableTimeSlots.length === 0) {
            toast.error('Please select at least one available time slot');
            return;
        }
        if (formData.images.length === 0) {
            toast.error('Please upload at least one image of the activity');
            return;
        }

        setLoading(true);
        try {
            await dispatch(createActivity({
                propertyId,
                data: {
                    ...formData,
                    duration: Number(formData.duration),
                    pricePerPerson: Number(formData.pricePerPerson),
                    maxParticipants: Number(formData.maxParticipants),
                    requiresBooking: true // Default
                }
            })).unwrap();

            toast.success('Activity created successfully');
            navigate(-1);
        } catch (error) {
            const err = error as { message?: string };
            console.error('Failed to create activity', err);
            toast.error(err?.message || 'Failed to create activity');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Add New Activity</h1>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mt-1 ml-1">
                        Create a new experience for your guests
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                    <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-2xl">
                            <Compass className="w-6 h-6 text-purple-600" />
                        </div>
                        ACTIVITY DETAILS
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Activity Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Morning Yoga Session"
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-bold text-gray-900 shadow-sm placeholder:text-gray-300"
                                required
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="e.g., Water Activities, Adventure"
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-bold text-gray-900 shadow-sm placeholder:text-gray-300"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-bold text-gray-900 shadow-sm placeholder:text-gray-300 italic"
                                placeholder="Describe the activity..."
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Duration (minutes)</label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-bold text-gray-900 shadow-sm placeholder:text-gray-300"
                                required
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Price Per Person</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-black">₹</span>
                                <input
                                    type="number"
                                    name="pricePerPerson"
                                    value={formData.pricePerPerson}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Max Participants</label>
                            <input
                                type="number"
                                name="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                required
                                min="1"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-3 block">Available Time Slots</label>
                            <div className="flex flex-wrap gap-3">
                                {TIME_SLOTS.map(slot => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => toggleTimeSlot(slot)}
                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.availableTimeSlots.includes(slot)
                                            ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200'
                                            : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-4 block">Activity Images</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-100 border-dashed rounded-[2rem] cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Compass className="w-8 h-8 mb-3 text-gray-300 group-hover:text-purple-500 transition-colors" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Click to upload image</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </label>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-4">
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="relative h-24 w-24 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                                        <img src={img} alt="Activity" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                            className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Save size={14} className="text-red-500 rotate-45" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pr-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-12 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Activity
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddActivity;
