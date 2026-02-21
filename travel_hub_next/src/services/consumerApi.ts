import api from './api';

export interface IDestination {
    _id: string;
    name: string;
    slug: string;
    description: string;
    coverImage: string;
    propertyCount?: number;
    coordinates?: {
        lat: number;
        lng: number;
    };
    placesToVisit?: {
        _id: string;
        name: string;
        slug: string;
        description: string;
        images: string[];
        coordinates: {
            lat: number;
            lng: number;
        };
        category?: string;
        entryFee?: number;
        timings?: string;
        bestTimeToVisit?: string;
    }[];
}

export interface IActivity {
    _id: string;
    name: string;
    description: string;
    images: string[];
    pricePerPerson: number;
    duration: number;
    maxParticipants: number;
    category?: string;
    location: {
        city: string;
        address?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    availableTimeSlots?: string[];
    propertyId?: string;
}

export interface IBookingPriceResponse {
    roomTotal: number;
    mealPlanPrice: number;
    activityTotal: number;
    subtotal: number;
    taxes: number;
    platformFee: number;
    finalPrice: number;
    roomPrices: {
        roomId: string;
        roomName: string;
        nights: number;
        pricePerNight: number;
        totalGuests: number;
        subtotal: number;
    }[];
    activityPrices: {
        activityId: string;
        activityName: string;
        participants: number;
        pricePerPerson: number;
        subtotal: number;
    }[];
    breakdown?: {
        basePrice: number;
        taxes: number;
        discounts: number;
        [key: string]: number;
    };
}

export interface IMealPlanDetail {
    _id: string;
    name: string;
    description: string;
    pricePerPersonPerDay: number;
    mealsIncluded: string[];
}

export interface IActivityDetail {
    _id: string;
    name: string;
    description: string;
    pricePerPerson: number;
    duration: number;
    category?: string;
}

export interface IProperty {
    _id: string;
    propertyName: string;
    description: string;
    coverImage: string;
    images: { url: string; _id: string }[];
    partnerId: string;
    location: {
        address: string;
        city: string;
        state: string;
        street: string;
        country: string;
        postalCode: string;
        coordinates?: [number, number];
    };
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    amenities: string[];
    propertyType: string;
    isVerified?: boolean;
    averageRating?: number;
    totalReviews?: number;
    mealPlans?: IMealPlanDetail[];
    activities?: IActivityDetail[];
    packages?: IPackage[];
}

export interface IRoom {
    _id: string;
    propertyId: string;
    roomType: string;
    roomName: string;
    basePricePerNight: number;
    maxOccupancy: number;
    sharingType: string;
    baseOccupancy: number;
    bedConfiguration: string;
    hasSelfCooking: boolean;
    amenities: string[];
    images: { url: string }[] | string[];
}

export interface IMealPlan {
    _id: string;
    name: string;
    description: string;
    price?: number;
}

export interface IPackage {
    _id: string;
    packageName: string;
    description: string;
    images: string[];
    packagePricePerPerson: number;
    propertyId: {
        _id: string;
        propertyName: string;
        coverImage: string;
    };
    numberOfNights: number;
    numberOfDays: number;
    minPersons: number;
    maxPersons: number;
    remainingSlots: number;
    validUntil: string;
    roomTypes: string[];
    mealPlanId?: IMealPlan;
    includedActivities?: {
        activityId: {
            _id: string;
            name: string;
        };
        pricePerPerson?: number;
    }[];
}

export interface IBooking {
    _id: string;
    bookingId: string;
    propertyId: string | IProperty;
    roomId: string | IRoom;
    userId: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    status: string;
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
    getPropertyById: async (id: string): Promise<IProperty> => {
        const response = await api.get(`/properties/details/${id}`);
        return response.data.data.property;
    },

    getPropertyRooms: async (propertyId: string): Promise<IRoom[]> => {
        const response = await api.get(`/properties/${propertyId}/rooms`);
        return response.data.data;
    },

    checkRoomAvailability: async (roomId: string, startDate: string, endDate: string) => {
        const response = await api.get(`/rooms/${roomId}/availability`, {
            params: { startDate, endDate }
        });
        return response.data.data;
    },

    getActivityById: async (activityId: string): Promise<IActivity> => {
        const response = await api.get(`/activities/${activityId}`);
        return response.data.data;
    },

    getPackageById: async (packageId: string, checkIn?: string): Promise<IPackage> => {
        const response = await api.get(`/packages/${packageId}`, {
            params: { checkIn }
        });
        return response.data.data;
    },

    // Booking Methods
    calculateBookingPrice: async (data: Record<string, unknown>): Promise<IBookingPriceResponse> => {
        const response = await api.post('/bookings/calculate-price', data);
        return response.data.data;
    },

    createBooking: async (bookingData: Record<string, unknown>): Promise<{ data: IBooking }> => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },

    getUserBookings: async () => {
        const response = await api.get('/bookings/users/me/bookings');
        return response.data.data;
    },

    cancelBooking: async (bookingId: string, reason: string) => {
        const response = await api.post(`/bookings/${bookingId}/cancel`, { reason });
        return response.data;
    },

    // Wishlist Methods
    toggleWishlist: async (propertyId: string) => {
        const response = await api.post('/users/wishlist/toggle', { propertyId });
        return response.data.data;
    },

    getWishlist: async () => {
        const response = await api.get('/users/wishlist');
        return response.data.data.wishlist;
    },

    // Payment Methods
    createPaymentOrder: async (data: { bookingId: string, amount: number, currency?: string }) => {
        const response = await api.post('/payments/create-order', data);
        return response.data.data;
    },

    verifyPayment: async (data: {
        bookingId: string,
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string
    }) => {
        const response = await api.post('/payments/verify', data);
        return response.data;
    }
};
