import api from './api';
import { Property, PropertyAddress } from '@/types/property';

const mapBackendToFrontend = (backendProp: any): Property => {
    // Handle address mapping
    const address: PropertyAddress = {
        street: backendProp.address?.street || '',
        city: backendProp.address?.city || '',
        state: backendProp.address?.state || '',
        country: backendProp.address?.country || 'India',
        zipCode: backendProp.address?.pincode || '',
        coordinates: backendProp.location?.coordinates ? {
            longitude: backendProp.location.coordinates[0],
            latitude: backendProp.location.coordinates[1]
        } : undefined
    };

    return {
        _id: backendProp._id,
        id: backendProp._id,
        name: backendProp.propertyName || backendProp.name, // Fallback to name if propertyName missing
        description: backendProp.description,
        propertyType: backendProp.propertyType || 'homestay',
        address: address,
        basePrice: backendProp.pricePerNight || backendProp.basePrice || 0, // Map pricePerNight to basePrice
        images: backendProp.images || [],
        coverImage: backendProp.coverImage,
        amenities: backendProp.amenities || [],
        maxGuests: backendProp.maxGuests || 0,
        rating: backendProp.averageRating || backendProp.rating || 0,
        reviewCount: backendProp.totalReviews || backendProp.reviews || 0,
        isVerified: backendProp.isVerified || false,
        // Map other fields as necessary
        availability: {
            checkIn: '12:00 PM', // Default if not in backend
            checkOut: '11:00 AM'
        }
    };
};

export const getPublicProperties = async (page = 1, limit = 12) => {
    try {
        const response = await api.get(`/properties/public?page=${page}&limit=${limit}`);
        if (response.data?.data?.properties?.data) {
            const mappedProps = response.data.data.properties.data.map(mapBackendToFrontend);
            return { properties: { ...response.data.data.properties, data: mappedProps } };
        } else if (Array.isArray(response.data?.data)) {
            // Fallback for some API versions
            return response.data.data.map(mapBackendToFrontend);
        }
        return { properties: { data: [], total: 0 } };
    } catch (error) {
        console.error('Failed to fetch public properties:', error);
        return { properties: { data: [], total: 0 } };
    }
};

export const getPropertyById = async (id: string) => {
    try {
        // Use the public route
        const response = await api.get(`/properties/details/${id}`);
        if (response.data?.data?.property) {
            return mapBackendToFrontend(response.data.data.property);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch property ${id}:`, error);
        return null;
    }
};
