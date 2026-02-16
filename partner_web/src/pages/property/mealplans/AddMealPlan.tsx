import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch } from '../../../store';
import { createMealPlan } from '../../../features/mealPlans/mealPlanSlice';
import { ArrowLeft, Save, Loader2, Utensils, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'High Tea'];

const AddMealPlan: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { propertyId } = useParams<{ propertyId: string }>();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pricePerPersonPerDay: '',
        mealsIncluded: [] as string[]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleMeal = (meal: string) => {
        setFormData(prev => {
            const meals = prev.mealsIncluded.includes(meal)
                ? prev.mealsIncluded.filter(m => m !== meal)
                : [...prev.mealsIncluded, meal];
            return { ...prev, mealsIncluded: meals };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!propertyId) return;

        if (formData.mealsIncluded.length === 0) {
            toast.error('Please select at least one meal');
            return;
        }

        setLoading(true);
        try {
            await dispatch(createMealPlan({
                propertyId,
                data: {
                    ...formData,
                    pricePerPersonPerDay: Number(formData.pricePerPersonPerDay)
                }
            })).unwrap();

            navigate(-1);
        } catch (error) {
            console.error('Failed to create meal plan', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Add New Meal Plan</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-blue-600" />
                        Plan Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., CP Plan (Breakfast Only)"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Included Meals</label>
                            <div className="flex flex-wrap gap-3">
                                {MEAL_TYPES.map(meal => (
                                    <button
                                        key={meal}
                                        type="button"
                                        onClick={() => toggleMeal(meal)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${formData.mealsIncluded.includes(meal)
                                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {meal}
                                        {formData.mealsIncluded.includes(meal) && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Person (Daily)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                <input
                                    type="number"
                                    name="pricePerPersonPerDay"
                                    value={formData.pricePerPersonPerDay}
                                    onChange={handleChange}
                                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Describe includes/excludes..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Create Meal Plan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddMealPlan;
