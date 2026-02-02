import api from './api';
import type { Room, ApiResponse } from '../types';

export const roomService = {
    // Simplified Create (JSON only)
    createRoomDetails: async (propertyId: string, data: Partial<Room>): Promise<Room> => {
        const response = await api.post<ApiResponse<{ room: Room }>>(`/properties/${propertyId}/rooms`, data);
        return response.data.data.room;
    },

    // Upload Images
    uploadRoomImages: async (roomId: string, formData: FormData): Promise<Room> => {
        const response = await api.post<ApiResponse<{ room: Room }>>(`/rooms/${roomId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data.room;
    },

    getRoomsByProperty: async (propertyId: string): Promise<Room[]> => {
        const response = await api.get<ApiResponse<{ rooms: Room[] }>>(`/properties/${propertyId}/rooms`);
        return response.data.data.rooms || [];
    },

    getRoomById: async (roomId: string): Promise<Room> => {
        const response = await api.get<ApiResponse<{ room: Room }>>(`/rooms/${roomId}`);
        return response.data.data.room;
    },

    updateRoom: async (roomId: string, data: Partial<Room>): Promise<Room> => {
        const response = await api.patch<ApiResponse<{ room: Room }>>(`/rooms/${roomId}`, data);
        return response.data.data.room;
    },

    deleteRoom: async (roomId: string): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/rooms/${roomId}`);
    }
};
