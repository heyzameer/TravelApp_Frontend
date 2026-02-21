'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ThumbsUp, ThumbsDown, Flag, CheckCircle, MessageSquare, Calendar, Trash2, Edit2 } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { type Review } from '@/services/reviewService';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface ReviewCardProps {
    review: Review;
    onVote?: (reviewId: string, isHelpful: boolean) => Promise<void>;
    onFlag?: (reviewId: string, reason: string) => Promise<void>;
    onDelete?: (reviewId: string) => Promise<void>;
    onEdit?: (review: Review) => void;
    showPropertyInfo?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
    review,
    onVote,
    onFlag,
    onDelete,
    onEdit,
    showPropertyInfo = false
}) => {
    const { user } = useAuth();
    const [isVoting, setIsVoting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showFlagModal, setShowFlagModal] = useState(false);
    const [flagReason, setFlagReason] = useState('');
    const [showAllImages, setShowAllImages] = useState(false);
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    const handleVote = async (isHelpful: boolean) => {
        if (!onVote || isVoting) return;
        setIsVoting(true);
        try {
            await onVote(review._id, isHelpful);
        } finally {
            setIsVoting(false);
        }
    };

    const handleFlag = async () => {
        if (!onFlag || !flagReason.trim()) return;
        try {
            await onFlag(review._id, flagReason);
            setShowFlagModal(false);
            setFlagReason('');
        } catch (error) {
            console.error('Error flagging review:', error);
        }
    };

    const handleDelete = async () => {
        if (!onDelete || isDeleting) return;
        if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            setIsDeleting(true);
            try {
                await onDelete(review._id);
            } catch (error) {
                console.error('Error deleting review:', error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const getTripTypeIcon = (tripType?: string) => {
        switch (tripType) {
            case 'solo': return '🧳';
            case 'couple': return '💑';
            case 'family': return '👨‍👩‍👧‍👦';
            case 'friends': return '👥';
            case 'business': return '💼';
            default: return null;
        }
    };

    const getTripTypeLabel = (tripType?: string) => {
        if (!tripType) return null;
        return tripType.charAt(0).toUpperCase() + tripType.slice(1);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {review.userId?.profilePicture ? (
                            <Image
                                src={review.userId.profilePicture}
                                alt={review.userId.fullName || 'User'}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <span>{(review.userId?.fullName || 'A').charAt(0).toUpperCase()}</span>
                        )}
                    </div>

                    {/* User Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">{review.userId?.fullName || 'Anonymous User'}</h4>
                            {review.isVerified && (
                                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                    <CheckCircle size={12} />
                                    <span>Verified Stay</span>
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
                            {review.tripType && (
                                <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <span>{getTripTypeIcon(review.tripType)}</span>
                                        <span>{getTripTypeLabel(review.tripType)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Delete/Edit Buttons (only for author and only if they are a customer) */}
                    {user && user.role === 'customer' && (user.id === review.userId?._id || (user as any)._id === review.userId?._id) && (
                        <>
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(review)}
                                    className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                                    title="Edit review"
                                >
                                    <Edit2 size={18} />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-gray-400 hover:text-red-600 transition-colors p-2 disabled:opacity-50"
                                    title="Delete review"
                                >
                                    <Trash2 size={18} className={isDeleting ? 'animate-pulse' : ''} />
                                </button>
                            )}
                        </>
                    )}

                    {/* Flag Button */}
                    {onFlag && (
                        <button
                            onClick={() => setShowFlagModal(true)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                            title="Report review"
                        >
                            <Flag size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Property Info (if showing in user's reviews) */}
            {showPropertyInfo && typeof review.propertyId === 'object' && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700">{review.propertyId.propertyName}</p>
                </div>
            )}

            {/* Rating */}
            <div className="mb-4">
                <RatingStars rating={review.overallRating} size={20} showValue />
            </div>

            {/* Title */}
            {review.title && (
                <h3 className="text-lg font-bold text-gray-900 mb-2">{review.title}</h3>
            )}

            {/* Review Text */}
            <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                {review.reviewText}
            </p>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
                <div className="mb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {review.images.slice(0, showAllImages ? undefined : 4).map((image, index) => (
                            <div
                                key={index}
                                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                                onClick={() => setSelectedImage(index)}
                            >
                                <Image
                                    src={image.url}
                                    alt={image.caption || `Review image ${index + 1}`}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform"
                                />
                                {index === 3 && !showAllImages && review.images!.length > 4 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">
                                            +{review.images!.length - 4}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {review.images.length > 4 && !showAllImages && (
                        <button
                            onClick={() => setShowAllImages(true)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Show all {review.images.length} photos
                        </button>
                    )}
                </div>
            )}

            {/* Partner Response */}
            {review.partnerResponse && (
                <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                        <MessageSquare size={16} className="text-blue-600 mt-1" />
                        <div>
                            <p className="text-sm font-bold text-blue-900">Response from Property</p>
                            <p className="text-xs text-blue-600">
                                {format(new Date(review.partnerResponse.respondedAt), 'MMM dd, yyyy')}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {review.partnerResponse.responseText}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Was this review helpful?</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleVote(true)}
                        disabled={isVoting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-colors disabled:opacity-50"
                    >
                        <ThumbsUp size={16} />
                        <span className="text-sm font-medium">{review.helpfulCount}</span>
                    </button>
                    <button
                        onClick={() => handleVote(false)}
                        disabled={isVoting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-500 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                        <ThumbsDown size={16} />
                        <span className="text-sm font-medium">{review.notHelpfulCount}</span>
                    </button>
                </div>
            </div>

            {/* Flag Modal */}
            {showFlagModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Report Review</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Please tell us why you&apos;re reporting this review:
                        </p>
                        <textarea
                            value={flagReason}
                            onChange={(e) => setFlagReason(e.target.value)}
                            placeholder="Enter reason..."
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            rows={4}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowFlagModal(false);
                                    setFlagReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFlag}
                                disabled={!flagReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Lightbox */}
            {selectedImage !== null && review.images && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
                        <Image
                            src={review.images[selectedImage].url}
                            alt={review.images[selectedImage].caption || `Review image ${selectedImage + 1}`}
                            fill
                            className="object-contain"
                        />
                        {review.images[selectedImage].caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 text-center">
                                {review.images[selectedImage].caption}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
