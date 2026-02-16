import api from './api';
import type { Package, ApiResponse } from '../types';

export const packageService = {
    getPackagesByProperty: async (propertyId: string): Promise<Package[]> => {
        const response = await api.get<ApiResponse<Package[]>>(`/properties/${propertyId}/packages`);
        return response.data.data || [];
    },

    createPackage: async (propertyId: string, data: Partial<Package>): Promise<Package> => {
        const response = await api.post<ApiResponse<Package>>(`/properties/${propertyId}/packages`, data);
        return response.data.data;
    },

    updatePackage: async (packageId: string, data: Partial<Package>): Promise<Package> => {
        const response = await api.patch<ApiResponse<Package>>(`/packages/${packageId}`, data);
        return response.data.data;
    },

    deletePackage: async (packageId: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/packages/${packageId}`);
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
