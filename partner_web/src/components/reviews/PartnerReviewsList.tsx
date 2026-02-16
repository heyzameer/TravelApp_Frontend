import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, CheckCircle, Calendar, Loader2 } from 'lucide-react';
import { partnerReviewService, type PartnerReview } from '../../services/partnerReviewService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface PartnerReviewsListProps {
    propertyId?: string;
}

export const PartnerReviewsList: React.FC<PartnerReviewsListProps> = ({ propertyId }) => {
    const [reviews, setReviews] = useState<PartnerReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        totalPages: 0,
        avgRating: 0,
        totalReviews: 0,
        verifiedReviews: 0,
        needsResponse: 0
    });
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [responseText, setResponseText] = useState('');

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await partnerReviewService.getPartnerReviews(page, 10, propertyId);
            setReviews(response.data.reviews);
            setStats({
                total: response.data.pagination.total,
                totalPages: response.data.pagination.totalPages,
                avgRating: response.data.stats.avgRating || 0,
                totalReviews: response.data.stats.totalReviews || 0,
                verifiedReviews: response.data.stats.verifiedReviews || 0,
                needsResponse: response.data.stats.needsResponse || 0
            });
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [page, propertyId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleAddResponse = async (reviewId: string) => {
        if (!responseText.trim()) {
            toast.error('Please enter a response');
            return;
        }

        try {
            await partnerReviewService.addResponse(reviewId, responseText);
            toast.success('Response added successfully!');
            setRespondingTo(null);
            setResponseText('');
            fetchReviews(); // Refresh reviews
        } catch (error) {
            console.error('Error adding response:', error);
            toast.error('Failed to add response');
        }
    };

    const RatingStars: React.FC<{ rating: number }> = ({ rating }) => (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={16}
                    className={`${i < Math.round(rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                        }`}
                />
            ))}
            <span className="ml-2 text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <Star className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 font-semibold">Avg Rating</p>
                            <p className="text-2xl font-black text-blue-900">{stats.avgRating.toFixed(1)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-purple-600 font-semibold">Total Reviews</p>
                            <p className="text-2xl font-black text-purple-900">{stats.totalReviews}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                            <CheckCircle className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-green-600 font-semibold">Verified</p>
                            <p className="text-2xl font-black text-green-900">{stats.verifiedReviews}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-orange-600 font-semibold">Needs Response</p>
                            <p className="text-2xl font-black text-orange-900">{stats.needsResponse}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                        <Star size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600">Your properties haven't received any reviews yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div
                            key={review._id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    {/* User Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                        {review.userId.fullName.charAt(0).toUpperCase()}
                                    </div>

                                    {/* User Info */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900">{review.userId.fullName}</h4>
                                            {review.isVerified && (
                                                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                    <CheckCircle size={12} />
                                                    <span>Verified</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span>{format(new Date(review.createdAt), 'MMM dd, yyyy')}</span>
                                            {review.stayDate && (
                                                <>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        <span>Stayed {format(new Date(review.stayDate), 'MMM yyyy')}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Needs Response Badge */}
                                {!review.partnerResponse && (
                                    <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        Needs Response
                                    </div>
                                )}
                            </div>

                            {/* Property Name */}
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-semibold text-gray-700">
                                    {review.propertyId.propertyName}
                                </p>
                            </div>

                            {/* Rating */}
                            <div className="mb-3">
                                <RatingStars rating={review.overallRating} />
                            </div>

                            {/* Title */}
                            {review.title && (
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{review.title}</h3>
                            )}

                            {/* Review Text */}
                            <p className="text-gray-700 leading-relaxed mb-4">{review.reviewText}</p>

                            {/* Review Images */}
                            {review.images && review.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {review.images.slice(0, 4).map((image, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                            <img
                                                src={image.url}
                                                alt={image.caption || `Review image ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Partner Response or Response Form */}
                            {review.partnerResponse ? (
                                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                                    <div className="flex items-start gap-2 mb-2">
                                        <MessageSquare size={16} className="text-blue-600 mt-1" />
                                        <div>
                                            <p className="text-sm font-bold text-blue-900">Your Response</p>
                                            <p className="text-xs text-blue-600">
                                                {format(new Date(review.partnerResponse.respondedAt), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {review.partnerResponse.responseText}
                                    </p>
                                </div>
                            ) : respondingTo === review._id ? (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Response
                                    </label>
                                    <textarea
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        placeholder="Thank the guest and address their feedback..."
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                        rows={4}
                                    />
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => {
                                                setRespondingTo(null);
                                                setResponseText('');
                                            }}
                                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleAddResponse(review._id)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                                        >
                                            Submit Response
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setRespondingTo(review._id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                                >
                                    <MessageSquare size={18} />
                                    <span>Respond to Review</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {stats.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(p => p - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 font-semibold text-gray-700">
                        Page {page} of {stats.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page === stats.totalPages}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};
