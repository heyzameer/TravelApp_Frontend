import api from './api';

export interface Destination {
    _id: string;
    name: string;
    slug: string;
    description: string;
    coverImage: string;
    images: string[];
    isActive: boolean;
    coordinates: {
        lat: number;
        lng: number;
    };
    trending: boolean;
    placesToVisit: PlaceToVisit[];
    createdAt: string;
    updatedAt: string;
}

export interface PlaceToVisit {
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
}

class DestinationService {
    async getAllDestinations(): Promise<Destination[]> {
        const response = await api.get('/destinations');
        return response.data.data;
    }

    async getTrendingDestinations(): Promise<Destination[]> {
        const response = await api.get('/destinations/trending');
        return response.data.data;
    }

    async getDestinationBySlug(slug: string): Promise<Destination> {
        const response = await api.get(`/destinations/${slug}`);
        return response.data.data;
    }

    async searchDestinations(query: string): Promise<Destination[]> {
        const response = await api.get(`/destinations/search?q=${encodeURIComponent(query)}`);
        return response.data.data;
    }
}

const destinationService = new DestinationService();
export default destinationService;
