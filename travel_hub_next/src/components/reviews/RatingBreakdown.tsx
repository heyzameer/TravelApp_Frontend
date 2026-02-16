'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingBreakdownProps {
    ratingDistribution: Array<{
        _id: number;
        count: number;
    }>;
    totalReviews: number;
    onFilterByRating?: (rating: number) => void;
}

export const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
    ratingDistribution,
    totalReviews,
    onFilterByRating
}) => {
    // Create a map for easy lookup
    const distributionMap = new Map(
        ratingDistribution.map(item => [item._id, item.count])
    );

    // Generate data for all ratings (5 to 1)
    const ratings = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: distributionMap.get(rating) || 0,
        percentage: totalReviews > 0 ? ((distributionMap.get(rating) || 0) / totalReviews) * 100 : 0
    }));

    return (
        <div className="space-y-3">
            {ratings.map(({ rating, count, percentage }) => (
                <button
                    key={rating}
                    onClick={() => onFilterByRating?.(rating)}
                    className={`w-full flex items-center gap-3 group ${onFilterByRating ? 'hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors' : ''}`}
                    disabled={!onFilterByRating}
                >
                    {/* Rating label */}
                    <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium text-gray-700">{rating}</span>
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    </div>

                    {/* Progress bar */}
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>

                    {/* Count and percentage */}
                    <div className="w-16 text-right">
                        <span className="text-sm font-medium text-gray-600">
                            {count}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">
                            ({percentage.toFixed(0)}%)
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
};

interface DetailedRatingsProps {
    averageRatings: {
        avgCleanliness?: number;
        avgService?: number;
        avgValue?: number;
        avgLocation?: number;
        avgAmenities?: number;
    };
}

export const DetailedRatings: React.FC<DetailedRatingsProps> = ({ averageRatings }) => {
    const ratings = [
        { label: 'Cleanliness', value: averageRatings.avgCleanliness },
        { label: 'Service', value: averageRatings.avgService },
        { label: 'Value for Money', value: averageRatings.avgValue },
        { label: 'Location', value: averageRatings.avgLocation },
        { label: 'Amenities', value: averageRatings.avgAmenities }
    ].filter(item => item.value !== undefined && item.value !== null);

    if (ratings.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ratings.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                                style={{ width: `${((value || 0) / 5) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                            {value?.toFixed(1)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
