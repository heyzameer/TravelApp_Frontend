import api from './api';
import type { Package, ApiResponse } from '../types';

export const packageService = {
    getPackagesByProperty: async (propertyId: string): Promise<Package[]> => {
        const response = await api.get<ApiResponse<{ packages: Package[] }>>(`/properties/${propertyId}/packages`);
        return response.data.data.packages || [];
    },

    createPackage: async (propertyId: string, data: Partial<Package>): Promise<Package> => {
        const response = await api.post<ApiResponse<{ package: Package }>>(`/properties/${propertyId}/packages`, data);
        return response.data.data.package;
    },

    updatePackage: async (packageId: string, data: Partial<Package>): Promise<Package> => {
        const response = await api.patch<ApiResponse<{ package: Package }>>(`/packages/${packageId}`, data);
        return response.data.data.package;
    },

    deletePackage: async (packageId: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/packages/${packageId}`);
    }
};
