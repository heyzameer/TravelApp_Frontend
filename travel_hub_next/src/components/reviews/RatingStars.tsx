'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
    rating: number;
    maxRating?: number;
    size?: number;
    interactive?: boolean;
    onChange?: (rating: number) => void;
    showValue?: boolean;
    className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    maxRating = 5,
    size = 20,
    interactive = false,
    onChange,
    showValue = false,
    className = ''
}) => {
    const [hoverRating, setHoverRating] = React.useState<number | null>(null);

    const handleClick = (value: number) => {
        if (interactive && onChange) {
            onChange(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (interactive) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(null);
        }
    };

    const displayRating = hoverRating !== null ? hoverRating : rating;

    const renderStar = (index: number) => {
        const starValue = index + 1;
        const fillPercentage = Math.min(Math.max(displayRating - index, 0), 1);

        if (fillPercentage === 0) {
            // Empty star
            return (
                <Star
                    key={index}
                    size={size}
                    className={`${interactive ? 'cursor-pointer' : ''} text-gray-300 transition-colors`}
                    onClick={() => handleClick(starValue)}
                    onMouseEnter={() => handleMouseEnter(starValue)}
                    onMouseLeave={handleMouseLeave}
                />
            );
        } else if (fillPercentage === 1) {
            // Full star
            return (
                <Star
                    key={index}
                    size={size}
                    className={`${interactive ? 'cursor-pointer hover:scale-110' : ''} text-yellow-400 fill-yellow-400 transition-all`}
                    onClick={() => handleClick(starValue)}
                    onMouseEnter={() => handleMouseEnter(starValue)}
                    onMouseLeave={handleMouseLeave}
                />
            );
        } else {
            // Half star
            return (
                <div key={index} className="relative inline-block">
                    <Star
                        size={size}
                        className="text-gray-300"
                    />
                    <div
                        className="absolute top-0 left-0 overflow-hidden"
                        style={{ width: `${fillPercentage * 100}%` }}
                    >
                        <Star
                            size={size}
                            className="text-yellow-400 fill-yellow-400"
                        />
                    </div>
                </div>
            );
        }
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex items-center">
                {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
            </div>
            {showValue && (
                <span className="ml-2 text-sm font-semibold text-gray-700">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

interface RatingInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    required?: boolean;
}

export const RatingInput: React.FC<RatingInputProps> = ({
    label,
    value,
    onChange,
    required = false
}) => {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <RatingStars
                rating={value}
                interactive
                onChange={onChange}
                size={28}
                showValue
            />
        </div>
    );
};
