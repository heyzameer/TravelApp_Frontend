import api from './api';
import type { Booking, ApiResponse } from '../types';

class PartnerBookingService {
    /**
     * Get all bookings for the partner
     * @param filters Optional filters for status and approvalStatus
     */
    async getPartnerBookings(filters?: {
        status?: string;
        approvalStatus?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
    }): Promise<Booking[]> {
        // Filter out undefined values to prevent them from being sent as 'undefined' strings
        const cleanFilters = filters ? Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
        ) : {};

        const response = await api.get<ApiResponse<Booking[]>>('/partner/bookings', { params: cleanFilters });
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

    /**
     * Mark a booking as checked in
     * @param bookingId Booking ID
     */
    async checkInBooking(bookingId: string): Promise<Booking> {
        const response = await api.patch<ApiResponse<Booking>>(`/partner/bookings/${bookingId}/check-in`);
        return response.data.data;
    }

    /**
     * Mark a booking as checked out
     * @param bookingId Booking ID
     */
    async checkOutBooking(bookingId: string): Promise<Booking> {
        const response = await api.patch<ApiResponse<Booking>>(`/partner/bookings/${bookingId}/check-out`);
        return response.data.data;
    }

    /**
     * Mark a booking as completed
     * @param bookingId Booking ID
     */
    async completeBooking(bookingId: string): Promise<Booking> {
        const response = await api.patch<ApiResponse<Booking>>(`/partner/bookings/${bookingId}/complete`);
        return response.data.data;
    }

    /**
     * Process a refund request
     * @param bookingId Booking ID
     * @param approved Whether to approve or reject the refund
     * @param note Optional note
     */
    async processRefund(bookingId: string, approved: boolean, note?: string): Promise<Booking> {
        const response = await api.patch<ApiResponse<Booking>>(`/partner/bookings/${bookingId}/refund`, { approved, note });
        return response.data.data;
    }

    /**
     * Delete a booking (Admin only usually, but slice uses it)
     * @param bookingId Booking ID
     */
    async deleteBooking(bookingId: string): Promise<void> {
        await api.delete(`/admin/bookings/${bookingId}`); // Note: path might be different, but matching slice expectations
    }
}

export const partnerBookingService = new PartnerBookingService();
