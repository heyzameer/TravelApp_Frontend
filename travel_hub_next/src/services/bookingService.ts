import api from './api';
import { IBookingPriceResponse } from './consumerApi';

export interface Booking {
    _id: string;
    bookingId: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        fullName: string;
        email: string;
        phone: string;
    } | string;
    propertyId: {
        _id: string;
        propertyName: string;
        coverImage: string;
        address?: {
            city: string;
            state: string;
            addressLine1: string;
        };
        city: string;
        state: string;
    } | string;
    partnerId: string;
    bookingType: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfNights: number;
    totalGuests: number;
    guestDetails: Array<{
        name: string;
        age: number;
        gender: string;
    }>;
    roomBookings: Array<{
        roomId: {
            _id: string;
            roomName: string;
            roomType: string;
        } | string;
        roomNumber: string;
        numberOfGuests: number;
        pricePerNight: number;
        totalRoomPrice: number;
    }>;
    mealPlanId?: {
        _id: string;
        name: string;
        description?: string;
    } | string;
    mealPlanPrice?: number;
    activityBookings?: Array<{
        activityId: {
            _id: string;
            name: string;
        } | string;
        date?: string;
        timeSlot?: string;
        participants: number;
        pricePerPerson: number;
        totalActivityPrice: number;
    }>;
    activityTotalPrice?: number;
    mealTotalPrice?: number;
    roomTotalPrice?: number;
    taxAmount?: number;
    platformFee?: number;
    packageDiscount?: number;
    finalPrice: number;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    status: 'pending_payment' | 'payment_completed' | 'confirmed' | 'rejected' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled';
    partnerApprovalStatus: 'pending' | 'approved' | 'rejected';
    refundStatus: 'not_requested' | 'requested' | 'approved' | 'rejected' | 'processed';
    refundAmount?: number;
    refundReason?: string;
    cancellationReason?: string;
    rejectionReason?: string;
    bookedAt: string;
    createdAt: string;
    updatedAt: string;
}

class BookingService {
    async getUserBookings(): Promise<Booking[]> {
        const response = await api.get('/bookings/users/me/bookings');
        return response.data.data;
    }

    async getBookingById(bookingId: string): Promise<Booking> {
        const response = await api.get(`/bookings/${bookingId}`);
        return response.data.data;
    }

    async cancelBooking(bookingId: string, reason: string): Promise<Booking> {
        const response = await api.post(`/bookings/${bookingId}/cancel`, { reason });
        return response.data.data;
    }

    async requestRefund(bookingId: string, reason: string): Promise<Booking> {
        const response = await api.post(`/bookings/${bookingId}/refund-request`, { reason });
        return response.data.data;
    }

    async calculatePrice(data: {
        propertyId: string;
        checkIn: string;
        checkOut: string;
        rooms: Array<{ roomId: string; guests: number }>;
        mealPlanId?: string;
        activityIds?: string[];
    }): Promise<IBookingPriceResponse> {
        const response = await api.post('/bookings/calculate-price', data);
        return response.data.data;
    }

    async createBooking(data: {
        propertyId: string;
        partnerId: string;
        checkIn: string;
        checkOut: string;
        rooms: Array<{ roomId: string; guests: number }>;
        mealPlanId?: string;
        activityIds?: string[];
        guestDetails: Array<{ name: string; age: number; gender: string }>;
    }): Promise<Booking> {
        const response = await api.post('/bookings', data);
        return response.data.data;
    }
}

const bookingService = new BookingService();
export default bookingService;
