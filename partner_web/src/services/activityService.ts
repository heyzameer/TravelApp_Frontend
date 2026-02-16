import api from './api';
import type { Activity, ApiResponse } from '../types';

export const activityService = {
    getActivitiesByProperty: async (propertyId: string): Promise<Activity[]> => {
        const response = await api.get<ApiResponse<Activity[]>>(`/properties/${propertyId}/activities`);
        return response.data.data || [];
    },

    createActivity: async (propertyId: string, data: Partial<Activity>): Promise<Activity> => {
        const response = await api.post<ApiResponse<Activity>>(`/properties/${propertyId}/activities`, data);
        return response.data.data;
    },

    updateActivity: async (activityId: string, data: Partial<Activity>): Promise<Activity> => {
        const response = await api.patch<ApiResponse<Activity>>(`/activities/${activityId}`, data);
        return response.data.data;
    },

    deleteActivity: async (activityId: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/activities/${activityId}`);
    },

    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<ApiResponse<{ url: string }>>('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data.url;
    }
};
