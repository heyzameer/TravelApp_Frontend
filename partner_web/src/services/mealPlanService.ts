import api from './api';
import type { MealPlan, ApiResponse } from '../types';

export const mealPlanService = {
    getMealPlansByProperty: async (propertyId: string): Promise<MealPlan[]> => {
        const response = await api.get<ApiResponse<{ mealPlans: MealPlan[] }>>(`/properties/${propertyId}/meal-plans`);
        return response.data.data.mealPlans || [];
    },

    createMealPlan: async (propertyId: string, data: Partial<MealPlan>): Promise<MealPlan> => {
        const response = await api.post<ApiResponse<{ mealPlan: MealPlan }>>(`/properties/${propertyId}/meal-plans`, data);
        return response.data.data.mealPlan;
    },

    updateMealPlan: async (mealPlanId: string, data: Partial<MealPlan>): Promise<MealPlan> => {
        const response = await api.patch<ApiResponse<{ mealPlan: MealPlan }>>(`/meal-plans/${mealPlanId}`, data);
        return response.data.data.mealPlan;
    },

    deleteMealPlan: async (mealPlanId: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/meal-plans/${mealPlanId}`);
    }
};
