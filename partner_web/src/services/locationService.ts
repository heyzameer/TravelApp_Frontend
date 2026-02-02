import api from './api';
import type { Destination, ApiResponse } from '../types';

export const locationService = {
    getAllDestinations: async (): Promise<Destination[]> => {
        const response = await api.get<ApiResponse<Destination[]>>('/destinations');
        return response.data.data;
    },

    getTrendingDestinations: async (): Promise<Destination[]> => {
        const response = await api.get<ApiResponse<Destination[]>>('/destinations/trending');
        return response.data.data;
    }
};
