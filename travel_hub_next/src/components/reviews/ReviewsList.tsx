'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Star, Filter, CheckCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { RatingBreakdown, DetailedRatings } from './RatingBreakdown';
import { WriteReview } from './WriteReview';
import { reviewService, type Review, type ReviewFilters, type CreateReviewData } from '@/services/reviewService';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';
import { useAuth } from '@/context/AuthContext';

interface ReviewsListProps {
    propertyId: string;
    propertyName: string;
    userHasCompletedBooking?: boolean;
    bookingId?: string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
    propertyId,
    propertyName,
    userHasCompletedBooking = false,
    bookingId
}) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWriteReview, setShowWriteReview] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editReviewData, setEditReviewData] = useState<Review | null>(null);
    const [filters, setFilters] = useState<ReviewFilters>({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc'
    });
    const [stats, setStats] = useState({
        total: 0,
        totalPages: 0,
        averageRating: 0,
        ratingDistribution: [] as Array<{ _id: number; count: number }>,
        averageRatings: {
            avgCleanliness: 0,
            avgService: 0,
            avgValue: 0,
            avgLocation: 0,
            avgAmenities: 0
        }
    });

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await reviewService.getPropertyReviews(propertyId, filters);
            setReviews(response.data.reviews);
            setStats({
                total: response.data.pagination.total,
                totalPages: response.data.pagination.totalPages,
                averageRating: response.data.averageRatings.avgOverall || 0,
                ratingDistribution: response.data.ratingDistribution,
                averageRatings: response.data.averageRatings
            });
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [propertyId, filters]); // Added filters to dependencies

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleWriteReview = async (data: CreateReviewData) => {
        try {
            if (isEditing && editReviewData) {
                // If we are in edit mode, call updateReview instead
                // Find reviewId from state or data
                const reviewId = (editReviewData as Review)._id;
                if (reviewId) {
                    await reviewService.updateReview(reviewId, data);
                    toast.success('Review updated successfully!');
                } else {
                    throw new Error('Review ID not found for update');
                }
            } else {
                await reviewService.createReview(data);
                toast.success('Review submitted successfully!');
            }
            setShowWriteReview(false);
            setIsEditing(false);
            setEditReviewData(null);
            fetchReviews(); // Refresh reviews
        } catch (error: unknown) {
            console.error('Error submitting review:', error);
            const axiosError = error as AxiosError<{ message?: string, data?: Review }>;

            if (axiosError.response?.data?.message !== 'You have already reviewed this property') {
                toast.error(axiosError.response?.data?.message || 'Failed to submit review');
            }
            throw error;
        }
    };

    const handleVote = async (reviewId: string, isHelpful: boolean) => {
        try {
            const result = await reviewService.voteReview(reviewId, isHelpful);
            // Update the review in the list
            setReviews(prev => prev.map(review =>
                review._id === reviewId
                    ? { ...review, helpfulCount: result.helpfulCount, notHelpfulCount: result.notHelpfulCount }
                    : review
            ));
            toast.success('Thank you for your feedback!');
        } catch (error) {
            console.error('Error voting on review:', error);
            toast.error('Failed to record your vote');
        }
    };

    const handleFlag = async (reviewId: string, reason: string) => {
        try {
            await reviewService.flagReview(reviewId, reason);
            toast.success('Review has been flagged for moderation');
        } catch (error) {
            console.error('Error flagging review:', error);
            toast.error('Failed to flag review');
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        try {
            await reviewService.deleteReview(reviewId);
            toast.success('Review deleted successfully');
            fetchReviews(); // Refresh list
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    const handleFilterChange = (newFilters: Partial<ReviewFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-8">
            {/* Header with Overall Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Overall Rating */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-lg mb-4">
                            <div className="text-center">
                                <div className="text-4xl font-black text-gray-900">
                                    {stats.averageRating.toFixed(1)}
                                </div>
                                <div className="flex justify-center mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={i < Math.round(stats.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Based on <span className="font-bold">{stats.total}</span> reviews
                        </p>
                        {user?.role === 'customer' && userHasCompletedBooking && (
                            <button
                                onClick={() => setShowWriteReview(true)}
                                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold transition-all shadow-lg hover:shadow-xl"
                            >
                                Write a Review
                            </button>
                        )}
                    </div>

                    {/* Rating Distribution */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Distribution</h3>
                        <RatingBreakdown
                            ratingDistribution={stats.ratingDistribution}
                            totalReviews={stats.total}
                            onFilterByRating={(rating) => handleFilterChange({ minRating: rating })}
                        />
                    </div>
                </div>

                {/* Detailed Ratings */}
                {stats.total > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Ratings</h3>
                        <DetailedRatings averageRatings={stats.averageRatings} />
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Filter size={18} />
                    <span>Filter:</span>
                </div>

                <button
                    onClick={() => handleFilterChange({ verifiedOnly: !filters.verifiedOnly })}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all ${filters.verifiedOnly
                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-500'
                        }`}
                >
                    <CheckCircle size={16} />
                    <span>Verified Only</span>
                </button>

                <button
                    onClick={() => handleFilterChange({ withImages: !filters.withImages })}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${filters.withImages
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-500'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <ImageIcon size={16} />
                        <span>With Photos</span>
                    </div>
                </button>

                <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as ReviewFilters['sortBy'] })}
                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 focus:border-blue-500 outline-none"
                >
                    <option value="createdAt">Most Recent</option>
                    <option value="overallRating">Highest Rated</option>
                    <option value="helpfulCount">Most Helpful</option>
                </select>

                {(filters.verifiedOnly || filters.withImages || filters.minRating) && (
                    <button
                        onClick={() => setFilters({ page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' })}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                        <Star size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600 mb-6">
                        {userHasCompletedBooking
                            ? 'Be the first to share your experience!'
                            : 'This property hasn\'t received any reviews yet.'}
                    </p>
                    {userHasCompletedBooking && (
                        <button
                            onClick={() => setShowWriteReview(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold transition-all"
                        >
                            Write the First Review
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map(review => (
                        <ReviewCard
                            key={review._id}
                            review={review}
                            onVote={handleVote}
                            onFlag={handleFlag}
                            onDelete={handleDeleteReview}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {stats.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => handlePageChange(filters.page! - 1)}
                        disabled={filters.page === 1}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-1">
                        {[...Array(stats.totalPages)].map((_, i) => {
                            const page = i + 1;
                            if (
                                page === 1 ||
                                page === stats.totalPages ||
                                (page >= filters.page! - 1 && page <= filters.page! + 1)
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${page === filters.page
                                            ? 'bg-blue-600 text-white'
                                            : 'border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (page === filters.page! - 2 || page === filters.page! + 2) {
                                return <span key={page} className="px-2">...</span>;
                            }
                            return null;
                        })}
                    </div>
                    <button
                        onClick={() => handlePageChange(filters.page! + 1)}
                        disabled={filters.page === stats.totalPages}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Write Review Modal */}
            {showWriteReview && (
                <WriteReview
                    propertyId={propertyId}
                    propertyName={propertyName}
                    bookingId={bookingId}
                    initialData={editReviewData || undefined}
                    isEditing={isEditing}
                    onSubmit={handleWriteReview}
                    onEditExistingReview={(review) => {
                        setEditReviewData(review);
                        setIsEditing(true);
                    }}
                    onDeleteExistingReview={handleDeleteReview}
                    onCancel={() => {
                        setShowWriteReview(false);
                        setIsEditing(false);
                        setEditReviewData(null);
                    }}
                />
            )}
        </div>
    );
};
