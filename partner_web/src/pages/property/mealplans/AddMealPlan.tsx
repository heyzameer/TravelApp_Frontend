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

        // Frontend Validation
        if (!formData.name.trim()) {
            toast.error('Meal plan name is required');
            return;
        }
        if (formData.mealsIncluded.length === 0) {
            toast.error('Please select at least one meal to include in this plan');
            return;
        }
        if (!formData.pricePerPersonPerDay || Number(formData.pricePerPersonPerDay) < 0) {
            toast.error('Please enter a valid price per person');
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

            toast.success('Meal plan created successfully');
            navigate(-1);
        } catch (error) {
            const err = error as { message?: string };
            console.error('Failed to create meal plan', err);
            toast.error(err?.message || 'Failed to create meal plan');
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
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Add Meal Plan</h1>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mt-1 ml-1">
                        Define a new dining package
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
                    <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl">
                            <Utensils className="w-6 h-6 text-blue-600" />
                        </div>
                        PLAN DETAILS
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Plan Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., CP Plan (Breakfast Only)"
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm placeholder:text-gray-300"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-3 block">Included Meals</label>
                            <div className="flex flex-wrap gap-3">
                                {MEAL_TYPES.map(meal => (
                                    <button
                                        key={meal}
                                        type="button"
                                        onClick={() => toggleMeal(meal)}
                                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3 ${formData.mealsIncluded.includes(meal)
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                                            }`}
                                    >
                                        {meal}
                                        {formData.mealsIncluded.includes(meal) && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                            {formData.mealsIncluded.length === 0 && (
                                <p className="mt-3 text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">Please select at least one meal type</p>
                            )}
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Price Per Person (Daily)</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-black">₹</span>
                                <input
                                    type="number"
                                    name="pricePerPersonPerDay"
                                    value={formData.pricePerPersonPerDay}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Description (Optional)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm placeholder:text-gray-300 italic"
                                placeholder="Describe inclusions/excludes..."
                            />
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
                        Save Meal Plan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddMealPlan;
