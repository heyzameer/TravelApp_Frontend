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
    _id?: string;
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

export interface CreateDestinationDto {
    name: string;
    description: string;
    coverImage: string;
    images?: string[];
    coordinates: {
        lat: number;
        lng: number;
    };
    trending?: boolean;
    isActive?: boolean;
    placesToVisit?: PlaceToVisit[];
}

class DestinationService {
    async getAllDestinations(): Promise<Destination[]> {
        const response = await api.get('/destinations');
        return response.data.data;
    }

    async getAdminDestinations(): Promise<Destination[]> {
        const response = await api.get('/destinations/admin/all');
        return response.data.data;
    }

    async getDestinationById(id: string): Promise<Destination> {
        const response = await api.get(`/destinations/id/${id}`);
        return response.data.data;
    }

    async createDestination(data: CreateDestinationDto): Promise<Destination> {
        const response = await api.post('/destinations', data);
        return response.data.data;
    }

    async updateDestination(id: string, data: Partial<CreateDestinationDto>): Promise<Destination> {
        const response = await api.patch(`/destinations/${id}`, data);
        return response.data.data;
    }

    async deleteDestination(id: string): Promise<void> {
        await api.delete(`/destinations/${id}`);
    }

    async addPlaceToVisit(destinationId: string, place: Omit<PlaceToVisit, '_id' | 'slug'>): Promise<Destination> {
        const response = await api.post(`/destinations/${destinationId}/places`, place);
        return response.data.data;
    }

    async updatePlaceToVisit(destinationId: string, placeId: string, placeData: Partial<PlaceToVisit>): Promise<Destination> {
        const response = await api.patch(`/destinations/${destinationId}/places/${placeId}`, placeData);
        return response.data.data;
    }

    async removePlaceToVisit(destinationId: string, placeId: string): Promise<Destination> {
        const response = await api.delete(`/destinations/${destinationId}/places/${placeId}`);
        return response.data.data;
    }
}

export default new DestinationService();
