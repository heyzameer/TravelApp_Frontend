import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import { createPackage } from '../../../features/packages/packageSlice';
import { packageService } from '../../../services/packageService';
import { fetchMealPlans } from '../../../features/mealPlans/mealPlanSlice';
import { fetchActivities } from '../../../features/activities/activitySlice';
import { ArrowLeft, Save, Loader2, Package as PackageIcon, Plus, Trash2, Utensils, Compass } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AddPackage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { propertyId } = useParams<{ propertyId: string }>();
    const [loading, setLoading] = useState(false);

    const { mealPlans } = useSelector((state: RootState) => state.mealPlans);
    const { activities } = useSelector((state: RootState) => state.activities);

    useEffect(() => {
        if (propertyId) {
            dispatch(fetchMealPlans(propertyId));
            dispatch(fetchActivities(propertyId));
        }
    }, [dispatch, propertyId]);

    const [formData, setFormData] = useState({
        packageName: '',
        description: '',
        roomTypes: [] as string[], // Placeholder for simple string input or selection if we fetched rooms
        numberOfNights: '',
        mealPlanId: '',
        includedActivities: [] as { activityId: string; sessionsIncluded: number }[],
        packagePricePerPerson: '',
        minPersons: '',
        maxPersons: '',
        validFrom: '',
        validUntil: ''
    });

    // Temp state for adding activity
    const [selectedActivity, setSelectedActivity] = useState('');

    const [images, setImages] = useState<string[]>([]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const url = await packageService.uploadImage(file);
            setImages(prev => [...prev, url]);
            toast.success('Image uploaded');
        } catch (error) {
            console.error('Failed to upload image', error);
            toast.error('Failed to upload image');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Simple comma separated for now, or just single input
        const types = e.target.value.split(',').map(s => s.trim()).filter(s => s);
        setFormData(prev => ({ ...prev, roomTypes: types }));
    };

    const addActivityToPackage = () => {
        if (!selectedActivity) return;
        if (formData.includedActivities.some(a => a.activityId === selectedActivity)) {
            toast.error('Activity already added');
            return;
        }
        setFormData(prev => ({
            ...prev,
            includedActivities: [...prev.includedActivities, { activityId: selectedActivity, sessionsIncluded: 1 }]
        }));
        setSelectedActivity('');
    };

    const removeActivity = (activityId: string) => {
        setFormData(prev => ({
            ...prev,
            includedActivities: prev.includedActivities.filter(a => a.activityId !== activityId)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!propertyId) return;

        // Frontend Validation
        if (!formData.packageName.trim()) {
            toast.error('Package name is required');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Description is required');
            return;
        }
        if (!formData.validFrom || !formData.validUntil) {
            toast.error('Validity dates are required');
            return;
        }
        if (new Date(formData.validUntil) <= new Date(formData.validFrom)) {
            toast.error('End date must be after start date');
            return;
        }
        if (!formData.numberOfNights || Number(formData.numberOfNights) <= 0) {
            toast.error('Number of nights must be at least 1');
            return;
        }
        if (!formData.packagePricePerPerson || Number(formData.packagePricePerPerson) <= 0) {
            toast.error('Please enter a valid price per person');
            return;
        }
        if (!formData.minPersons || Number(formData.minPersons) <= 0) {
            toast.error('Min persons must be at least 1');
            return;
        }
        if (Number(formData.maxPersons) < Number(formData.minPersons)) {
            toast.error('Max persons cannot be less than min persons');
            return;
        }
        if (images.length === 0) {
            toast.error('Please upload at least one image of the package');
            return;
        }

        setLoading(true);
        try {
            await dispatch(createPackage({
                propertyId,
                data: {
                    ...formData,
                    numberOfNights: Number(formData.numberOfNights),
                    packagePricePerPerson: Number(formData.packagePricePerPerson),
                    minPersons: Number(formData.minPersons),
                    maxPersons: Number(formData.maxPersons),
                    roomTypes: formData.roomTypes.length ? formData.roomTypes : ['Standard'], // Default if empty
                    mealPlanId: formData.mealPlanId || undefined,
                    images: images
                }
            })).unwrap();

            toast.success('Package created successfully');
            navigate(-1);
        } catch (error) {
            const err = error as { message?: string };
            console.error('Failed to create package', err);
            toast.error(err?.message || 'Failed to create package');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Create Package</h1>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mt-1 ml-1">
                        Combine rooms, meals, and activities
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Section */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                    <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-2xl">
                            <PackageIcon className="w-6 h-6 text-green-600" />
                        </div>
                        BASIC INFORMATION
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Package Name</label>
                            <input
                                type="text"
                                name="packageName"
                                value={formData.packageName}
                                onChange={handleChange}
                                placeholder="e.g., Honeymoon Special - 3 Nights"
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-bold text-gray-900 shadow-sm placeholder:text-gray-300"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Package Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-bold text-gray-900 shadow-sm placeholder:text-gray-300 italic"
                                placeholder="Describe why guests should book this package..."
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Validity Start Date</label>
                            <input
                                type="date"
                                name="validFrom"
                                value={formData.validFrom}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Validity End Date</label>
                            <input
                                type="date"
                                name="validUntil"
                                value={formData.validUntil}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing & Duration */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                    <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-2xl">
                            <Utensils className="w-6 h-6 text-orange-600" />
                        </div>
                        PRICING & DURATION
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Number of Nights</label>
                            <input
                                type="number"
                                name="numberOfNights"
                                value={formData.numberOfNights}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
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
                                    name="packagePricePerPerson"
                                    value={formData.packagePricePerPerson}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Min Persons</label>
                            <input
                                type="number"
                                name="minPersons"
                                value={formData.minPersons}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                required
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Max Persons</label>
                            <input
                                type="number"
                                name="maxPersons"
                                value={formData.maxPersons}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                required
                                min="1"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Included Room Types (Comma separated)</label>
                            <input
                                type="text"
                                placeholder="Deluxe Room, Suite"
                                onChange={handleRoomTypeChange}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Inclusions */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                    <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-2xl">
                            <Compass className="w-6 h-6 text-purple-600" />
                        </div>
                        PACKAGE INCLUSIONS
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Meal Plan</label>
                            <select
                                name="mealPlanId"
                                value={formData.mealPlanId}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-bold text-gray-900 shadow-sm cursor-pointer"
                            >
                                <option value="">Select Meal Plan</option>
                                {mealPlans.map(plan => (
                                    <option key={plan._id} value={plan._id}>{plan.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Add Activity</label>
                            <div className="flex gap-4">
                                <select
                                    value={selectedActivity}
                                    onChange={(e) => setSelectedActivity(e.target.value)}
                                    className="flex-1 px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-bold text-gray-900 shadow-sm cursor-pointer"
                                >
                                    <option value="">Select Activity</option>
                                    {activities.map(act => (
                                        <option key={act._id} value={act._id}>{act.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={addActivityToPackage}
                                    className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                        </div>

                        {formData.includedActivities.length > 0 && (
                            <div className="col-span-2 bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Included Activities</h3>
                                <div className="space-y-4">
                                    {formData.includedActivities.map((inclusion, idx) => {
                                        const activity = activities.find(a => a._id === inclusion.activityId);
                                        return (
                                            <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-gray-700 uppercase">{activity?.name}</span>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SESSIONS</span>
                                                        <input
                                                            type="number"
                                                            value={inclusion.sessionsIncluded}
                                                            onChange={(e) => {
                                                                const newActivities = [...formData.includedActivities];
                                                                newActivities[idx] = { ...newActivities[idx], sessionsIncluded: parseInt(e.target.value) };
                                                                setFormData(prev => ({ ...prev, includedActivities: newActivities }));
                                                            }}
                                                            className="w-16 px-3 py-1 border border-gray-100 rounded-lg text-center font-bold text-gray-900"
                                                            min="1"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeActivity(inclusion.activityId)}
                                                    className="p-2 text-red-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-4 block">Package Images</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-100 border-dashed rounded-[2rem] cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <PackageIcon className="w-8 h-8 mb-3 text-gray-300 group-hover:text-green-500 transition-colors" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Click to upload image</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </label>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative h-24 w-24 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                                        <img src={img} alt="Package" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <button
                                            type="button"
                                            onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} className="text-red-500" />
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
                        Create Package
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPackage;
