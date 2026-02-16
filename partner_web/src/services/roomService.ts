import api from './api';
import type { Room, ApiResponse } from '../types';

export const roomService = {
    // Simplified Create (JSON only)
    createRoomDetails: async (propertyId: string, data: Partial<Room>): Promise<Room> => {
        const response = await api.post<ApiResponse<Room>>(`/properties/${propertyId}/rooms`, data);
        return response.data.data;
    },

    // Upload Images
    uploadRoomImages: async (roomId: string, formData: FormData): Promise<Room> => {
        const response = await api.post<ApiResponse<Room>>(`/rooms/${roomId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    },

    getRoomsByProperty: async (propertyId: string): Promise<Room[]> => {
        const response = await api.get<ApiResponse<Room[]>>(`/properties/${propertyId}/rooms`);
        return response.data.data || [];
    },

    getRoomById: async (roomId: string): Promise<Room> => {
        const response = await api.get<ApiResponse<Room>>(`/rooms/${roomId}`);
        return response.data.data;
    },

    updateRoom: async (roomId: string, data: Partial<Room>): Promise<Room> => {
        const response = await api.patch<ApiResponse<Room>>(`/rooms/${roomId}`, data);
        return response.data.data;
    },

    deleteRoom: async (roomId: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/rooms/${roomId}`);
    }
};
