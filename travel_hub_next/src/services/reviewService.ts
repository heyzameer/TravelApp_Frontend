import api from './api';

export interface Review {
    _id: string;
    reviewId: string;
    userId: {
        _id: string;
        fullName: string;
        profilePicture?: string;
    };
    propertyId: string | {
        _id: string;
        propertyName: string;
        coverImage?: string;
    };
    bookingId?: string;
    overallRating: number;
    cleanlinessRating?: number;
    serviceRating?: number;
    valueForMoneyRating?: number;
    locationRating?: number;
    amenitiesRating?: number;
    title?: string;
    reviewText: string;
    images?: Array<{
        url: string;
        caption?: string;
    }>;
    isVerified: boolean;
    verifiedPurchase: boolean;
    helpfulCount: number;
    notHelpfulCount: number;
    partnerResponse?: {
        responseText: string;
        respondedAt: string;
        respondedBy: string;
    };
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
    stayDate?: string;
    tripType?: 'solo' | 'couple' | 'family' | 'friends' | 'business';
    isEdited: boolean;
    editedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReviewData {
    propertyId: string;
    bookingId?: string;
    overallRating: number;
    cleanlinessRating?: number;
    serviceRating?: number;
    valueForMoneyRating?: number;
    locationRating?: number;
    amenitiesRating?: number;
    title?: string;
    reviewText: string;
    images?: Array<{
        url: string;
        caption?: string;
    }>;
    stayDate?: string;
    tripType?: 'solo' | 'couple' | 'family' | 'friends' | 'business';
}

export interface ReviewFilters {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'overallRating' | 'helpfulCount';
    order?: 'asc' | 'desc';
    minRating?: number;
    verifiedOnly?: boolean;
    withImages?: boolean;
}

export interface ReviewsResponse {
    message: string;
    data: {
        reviews: Review[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        ratingDistribution: Array<{
            _id: number;
            count: number;
        }>;
        averageRatings: {
            avgOverall: number;
            avgCleanliness: number;
            avgService: number;
            avgValue: number;
            avgLocation: number;
            avgAmenities: number;
        };
    };
}

class ReviewService {
    // Create a new review
    async createReview(data: CreateReviewData): Promise<Review> {
        const response = await api.post('/reviews', data);
        return response.data.data;
    }

    // Get reviews for a property
    async getPropertyReviews(propertyId: string, filters?: ReviewFilters): Promise<ReviewsResponse> {
        const params = new URLSearchParams();

        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.sortBy) params.append('sortBy', filters.sortBy);
        if (filters?.order) params.append('order', filters.order);
        if (filters?.minRating) params.append('minRating', filters.minRating.toString());
        if (filters?.verifiedOnly) params.append('verifiedOnly', 'true');
        if (filters?.withImages) params.append('withImages', 'true');

        const response = await api.get(`/reviews/property/${propertyId}?${params.toString()}`);
        return response.data;
    }

    // Get user's reviews
    async getUserReviews(page = 1, limit = 10): Promise<ReviewsResponse> {
        const response = await api.get(`/reviews/user/my-reviews?page=${page}&limit=${limit}`);
        return response.data;
    }

    // Update a review
    async updateReview(reviewId: string, data: Partial<CreateReviewData>): Promise<Review> {
        const response = await api.put(`/reviews/${reviewId}`, data);
        return response.data.data;
    }

    // Delete a review
    async deleteReview(reviewId: string): Promise<void> {
        await api.delete(`/reviews/${reviewId}`);
    }

    // Vote on a review (helpful/not helpful)
    async voteReview(reviewId: string, isHelpful: boolean): Promise<{ helpfulCount: number; notHelpfulCount: number }> {
        const response = await api.post(`/reviews/${reviewId}/vote`, { isHelpful });
        return response.data.data;
    }

    // Flag a review
    async flagReview(reviewId: string, reason: string): Promise<void> {
        await api.post(`/reviews/${reviewId}/flag`, { reason });
    }
}

export const reviewService = new ReviewService();
