import api from './api';
import type { Booking, ApiResponse } from '../types';

class PartnerBookingService {
    /**
     * Get all bookings for the partner
     * @param filters Optional filters for status and approvalStatus
     */
    async getPartnerBookings(filters?: { status?: string; approvalStatus?: string }): Promise<Booking[]> {
        const response = await api.get<ApiResponse<Booking[]>>('/partner/bookings', { params: filters });
        return response.data.data;
    }

    /**
     * Get details of a specific booking
     * @param bookingId Booking ID
     */
    async getBookingDetails(bookingId: string): Promise<Booking> {
        const response = await api.get<ApiResponse<Booking>>(`/partner/bookings/${bookingId}`);
        return response.data.data;
    }

    /**
     * Approve a booking
     * @param bookingId Booking ID
     */
    async approveBooking(bookingId: string): Promise<Booking> {
        const response = await api.patch<ApiResponse<Booking>>(`/partner/bookings/${bookingId}/approve`);
        return response.data.data;
    }

    /**
     * Reject a booking
     * @param bookingId Booking ID
     * @param reason Reason for rejection
     */
    async rejectBooking(bookingId: string, reason: string): Promise<Booking> {
        const response = await api.patch<ApiResponse<Booking>>(`/partner/bookings/${bookingId}/reject`, { reason });
        return response.data.data;
    }
}

export const partnerBookingService = new PartnerBookingService();
