import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface IDestination {
    _id: string;
    name: string;
    slug: string;
    description: string;
    coverImage: string;
    propertyCount?: number;
}

export const consumerApi = {
    getTrendingDestinations: async (): Promise<IDestination[]> => {
        const response = await api.get('/destinations/trending');
        return response.data.data;
    },

    getAllDestinations: async (): Promise<IDestination[]> => {
        const response = await api.get('/destinations');
        return response.data.data;
    },

    getDestinationBySlug: async (slug: string): Promise<IDestination> => {
        const response = await api.get(`/destinations/${slug}`);
        return response.data.data;
    },

    // Property & Room Methods
    getPropertyById: async (id: string) => {
        const response = await api.get(`/properties/details/${id}`);
        return response.data.data.property;
    },

    getPropertyRooms: async (propertyId: string) => {
        const response = await api.get(`/properties/${propertyId}/rooms`);
        return response.data.data;
    },

    checkRoomAvailability: async (roomId: string, startDate: string, endDate: string) => {
        const response = await api.get(`/rooms/${roomId}/availability`, {
            params: { startDate, endDate }
        });
        return response.data.data;
    },

    // Booking Methods
    createBooking: async (bookingData: Record<string, unknown>) => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },

    getUserBookings: async () => {
        const response = await api.get('/bookings/my-bookings');
        return response.data.data;
    },

    // Auth Headers helper
    setAuthToken: (token: string) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    clearAuthToken: () => {
        delete api.defaults.headers.common['Authorization'];
    }
};
