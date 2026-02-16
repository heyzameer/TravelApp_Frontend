import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import { createPackage } from '../../../features/packages/packageSlice';
import { packageService } from '../../../services/packageService';
import { fetchMealPlans } from '../../../features/mealPlans/mealPlanSlice';
import { fetchActivities } from '../../../features/activities/activitySlice';
import { ArrowLeft, Save, Loader2, Package as PackageIcon, Plus, Trash2 } from 'lucide-react';
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
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Create New Package</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <PackageIcon className="w-5 h-5 text-green-600" />
                        Package Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                            <input
                                type="text"
                                name="packageName"
                                value={formData.packageName}
                                onChange={handleChange}
                                placeholder="e.g., Honeymoon Special"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                            <input
                                type="date"
                                name="validFrom"
                                value={formData.validFrom}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                            <input
                                type="date"
                                name="validUntil"
                                value={formData.validUntil}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Nights</label>
                            <input
                                type="number"
                                name="numberOfNights"
                                value={formData.numberOfNights}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                required
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Person</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                <input
                                    type="number"
                                    name="packagePricePerPerson"
                                    value={formData.packagePricePerPerson}
                                    onChange={handleChange}
                                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Persons</label>
                            <input
                                type="number"
                                name="minPersons"
                                value={formData.minPersons}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                required
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Persons</label>
                            <input
                                type="number"
                                name="maxPersons"
                                value={formData.maxPersons}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                required
                                min="1"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Included Rooms (comma separated types)</label>
                            <input
                                type="text"
                                placeholder="Deluxe Room, Suite"
                                onChange={handleRoomTypeChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Inclusions */}
                        <div className="col-span-2 border-t pt-4 mt-2">
                            <h3 className="text-md font-semibold text-gray-800 mb-3">Inclusions</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Plan</label>
                                    <select
                                        name="mealPlanId"
                                        value={formData.mealPlanId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="">None</option>
                                        {mealPlans.map(mp => (
                                            <option key={mp._id} value={mp._id}>{mp.name} (₹{mp.pricePerPersonPerDay}/day)</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Add Activities</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={selectedActivity}
                                            onChange={(e) => setSelectedActivity(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        >
                                            <option value="">Select Activity</option>
                                            {activities.map(act => (
                                                <option key={act._id} value={act._id}>{act.name} (₹{act.pricePerPerson})</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={addActivityToPackage}
                                            className="px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>

                                    {/* Selected Activities List */}
                                    <div className="mt-3 space-y-2">
                                        {formData.includedActivities.map((item, idx) => {
                                            const act = activities.find(a => a._id === item.activityId);
                                            return (
                                                <div key={idx} className="flex justify-between items-center bg-purple-50 px-3 py-2 rounded-lg text-sm text-purple-700 border border-purple-100">
                                                    <span>{act?.name}</span>
                                                    <button type="button" onClick={() => removeActivity(item.activityId)} className="text-red-500 hover:text-red-700">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Package Images</label>
                            <input
                                type="file"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-green-50 file:text-green-700
                                hover:file:bg-green-100"
                            />
                            <div className="mt-4 flex flex-wrap gap-2">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative h-24 w-24 rounded-md overflow-hidden border">
                                        <img src={img} alt="Package" className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
