import api from './api';

export interface PartnerReview {
    _id: string;
    reviewId: string;
    userId: {
        _id: string;
        fullName: string;
        profilePicture?: string;
    };
    propertyId: {
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
    createdAt: string;
    updatedAt: string;
}

export interface PartnerReviewsResponse {
    message: string;
    data: {
        reviews: PartnerReview[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        stats: {
            avgRating: number;
            totalReviews: number;
            verifiedReviews: number;
            needsResponse: number;
        };
    };
}

class PartnerReviewService {
    // Get all reviews for partner's properties
    async getPartnerReviews(page = 1, limit = 10, propertyId?: string, needsResponse?: boolean): Promise<PartnerReviewsResponse> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (propertyId) params.append('propertyId', propertyId);
        if (needsResponse) params.append('needsResponse', 'true');

        const response = await api.get(`/reviews/partner/reviews?${params.toString()}`);
        return response.data;
    }

    // Add response to a review
    async addResponse(reviewId: string, responseText: string): Promise<PartnerReview> {
        const response = await api.post(`/reviews/${reviewId}/partner-response`, { responseText });
        return response.data.data;
    }
}

export const partnerReviewService = new PartnerReviewService();
