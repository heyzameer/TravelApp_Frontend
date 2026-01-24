// Property type definitions for TravelHub

export interface PropertyAddress {
    street?: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface PropertyAmenity {
    name: string;
    icon?: string;
    category?: 'basic' | 'comfort' | 'entertainment' | 'outdoor';
}

export interface PropertyImage {
    url: string;
    caption?: string;
    isPrimary?: boolean;
}

export interface PropertyOwner {
    name: string;
    email?: string;
    phone?: string;
    profilePicture?: string;
}

export interface PropertyPricing {
    basePrice: number;
    weekendPrice?: number;
    currency?: string;
    discount?: {
        percentage: number;
        validUntil?: string;
    };
}

export interface PropertyReview {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    userAvatar?: string;
}

export interface Property {
    _id: string;
    id?: string;
    name: string;
    description: string;
    propertyType: 'homestay' | 'cottage' | 'villa' | 'farmhouse' | 'cabin';
    address: PropertyAddress;
    basePrice: number;
    pricing?: PropertyPricing;
    images: string[] | PropertyImage[];
    coverImage?: string;
    amenities: string[] | PropertyAmenity[];
    maxGuests: number;
    bedrooms?: number;
    bathrooms?: number;
    rating?: number;
    reviews?: PropertyReview[];
    reviewCount?: number;
    isVerified: boolean;
    owner?: PropertyOwner;
    availability?: {
        checkIn: string;
        checkOut: string;
    };
    rules?: string[];
    cancellationPolicy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PropertyFilters {
    city?: string;
    state?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    guests?: number;
    amenities?: string[];
}

export interface PropertyListResponse {
    properties: {
        data: Property[];
        total: number;
        page: number;
        limit: number;
    };
}
