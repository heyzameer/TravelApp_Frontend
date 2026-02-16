import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import { fetchMealPlans, deleteMealPlan } from '../../../features/mealPlans/mealPlanSlice';
import { Plus, Trash2, Utensils } from 'lucide-react';
import ConfirmModal from '../../../components/common/ConfirmModal';

const MealPlanList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { propertyId } = useParams<{ propertyId: string }>();
    const { mealPlans, loading } = useSelector((state: RootState) => state.mealPlans);

    useEffect(() => {
        if (propertyId) {
            dispatch(fetchMealPlans(propertyId));
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

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Meal Plan',
            message: 'Are you sure you want to delete this meal plan? This will remove it from your offerings.',
            onConfirm: async () => {
                await dispatch(deleteMealPlan(id));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Utensils className="text-blue-600" />
                    Meal Plans
                </h1>
                <button
                    onClick={() => navigate('add')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} />
                    Add Meal Plan
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : mealPlans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Utensils className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No meal plans yet</h3>
                    <p className="text-gray-500 mb-4">Create meal plans (CP, MAP, AP) for your guests.</p>
                    <button
                        onClick={() => navigate('add')}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Create your first meal plan
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mealPlans.map((plan) => (
                        <div key={plan._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                                    <p className="text-sm text-gray-500">{plan.mealsIncluded.join(' • ')}</p>
                                </div>
                                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                    ₹{plan.pricePerPersonPerDay}/day
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{plan.description}</p>

                            <div className="flex justify-end pt-4 border-t border-gray-50 gap-2">
                                <button
                                    onClick={() => handleDelete(plan._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                                {/* Edit functionality can be added here later */}
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
        </div>
    );
};

export default MealPlanList;
