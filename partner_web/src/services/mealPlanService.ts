import api from './api';
import type { MealPlan, ApiResponse } from '../types';

export const mealPlanService = {
    getMealPlansByProperty: async (propertyId: string): Promise<MealPlan[]> => {
        const response = await api.get<ApiResponse<MealPlan[]>>(`/properties/${propertyId}/meal-plans`);
        return response.data.data || [];
    },

    createMealPlan: async (propertyId: string, data: Partial<MealPlan>): Promise<MealPlan> => {
        const response = await api.post<ApiResponse<MealPlan>>(`/properties/${propertyId}/meal-plans`, data);
        return response.data.data;
    },

    updateMealPlan: async (mealPlanId: string, data: Partial<MealPlan>): Promise<MealPlan> => {
        const response = await api.patch<ApiResponse<MealPlan>>(`/meal-plans/${mealPlanId}`, data);
        return response.data.data;
    },

    deleteMealPlan: async (mealPlanId: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/meal-plans/${mealPlanId}`);
    }
};
