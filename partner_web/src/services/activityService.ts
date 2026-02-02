import api from './api';
import type { Activity, ApiResponse } from '../types';

export const activityService = {
    getActivitiesByProperty: async (propertyId: string): Promise<Activity[]> => {
        const response = await api.get<ApiResponse<{ activities: Activity[] }>>(`/properties/${propertyId}/activities`);
        return response.data.data.activities || [];
    },

    createActivity: async (propertyId: string, data: Partial<Activity>): Promise<Activity> => {
        const response = await api.post<ApiResponse<{ activity: Activity }>>(`/properties/${propertyId}/activities`, data);
        return response.data.data.activity;
    },

    updateActivity: async (activityId: string, data: Partial<Activity>): Promise<Activity> => {
        const response = await api.patch<ApiResponse<{ activity: Activity }>>(`/activities/${activityId}`, data);
        return response.data.data.activity;
    },

    deleteActivity: async (activityId: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/activities/${activityId}`);
    }
};
