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
    };
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
        };
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
    roomTotalPrice?: number;
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

export interface PriceBreakdown {
    roomPrices: Array<{
        roomId: string;
        roomName: string;
        nights: number;
        pricePerNight: number;
        totalGuests: number;
        subtotal: number;
    }>;
    roomTotal: number;
    mealPlanPrice: number;
    activityPrices: Array<{
        activityId: string;
        activityName: string;
        participants: number;
        pricePerPerson: number;
        subtotal: number;
    }>;
    activityTotal: number;
    subtotal: number;
    taxes: number;
    finalPrice: number;
}
