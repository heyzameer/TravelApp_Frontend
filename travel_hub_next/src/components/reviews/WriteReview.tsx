'use client';

import React, { useState } from 'react';
import { X, Upload, Loader2, AlertCircle } from 'lucide-react';
import { RatingInput } from './RatingStars';
import { type CreateReviewData, type Review } from '@/services/reviewService';
import { AxiosError } from 'axios';
import Image from 'next/image';

interface WriteReviewProps {
    propertyId: string;
    propertyName: string;
    bookingId?: string;
    initialData?: Review;
    isEditing?: boolean;
    onSubmit: (data: CreateReviewData) => Promise<void>;
    onCancel: () => void;
    onEditExistingReview?: (review: Review) => void;
    onDeleteExistingReview?: (reviewId: string) => Promise<void>;
}

export const WriteReview: React.FC<WriteReviewProps> = ({
    propertyId,
    propertyName,
    bookingId,
    initialData,
    isEditing = false,
    onSubmit,
    onCancel,
    onEditExistingReview,
    onDeleteExistingReview
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreateReviewData>(initialData ? {
        propertyId: typeof initialData.propertyId === 'string' ? initialData.propertyId : initialData.propertyId._id,
        bookingId: initialData.bookingId,
        overallRating: initialData.overallRating,
        cleanlinessRating: initialData.cleanlinessRating,
        serviceRating: initialData.serviceRating,
        valueForMoneyRating: initialData.valueForMoneyRating,
        locationRating: initialData.locationRating,
        amenitiesRating: initialData.amenitiesRating,
        title: initialData.title || '',
        reviewText: initialData.reviewText,
        images: initialData.images || [],
        tripType: initialData.tripType,
        stayDate: initialData.stayDate
    } : {
        propertyId,
        bookingId,
        overallRating: 0,
        cleanlinessRating: 0,
        serviceRating: 0,
        valueForMoneyRating: 0,
        locationRating: 0,
        amenitiesRating: 0,
        title: '',
        reviewText: '',
        images: [],
        tripType: undefined,
        stayDate: undefined
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [imagePreviews, setImagePreviews] = useState<string[]>(
        initialData?.images?.map(img => img.url) || []
    );
    const [duplicateReview, setDuplicateReview] = useState<Review | null>(null);

    const handleRatingChange = (field: keyof CreateReviewData, value: number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleInputChange = (field: keyof CreateReviewData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPreviews: string[] = [];
        const newImages: Array<{ url: string; caption?: string }> = [];

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                newPreviews.push(result);
                newImages.push({ url: result });

                if (newPreviews.length === files.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                    setFormData(prev => ({
                        ...prev,
                        images: [...(prev.images || []), ...newImages]
                    }));
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index)
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (formData.overallRating === 0) {
            newErrors.overallRating = 'Overall rating is required';
        }
        if (!formData.reviewText.trim()) {
            newErrors.reviewText = 'Review text is required';
        } else if (formData.reviewText.trim().length < 10) {
            newErrors.reviewText = 'Review must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            // Filter out 0 ratings for optional fields to avoid Mongoose validation errors (min: 1)
            const submitData = { ...formData };
            if (submitData.cleanlinessRating === 0) delete submitData.cleanlinessRating;
            if (submitData.serviceRating === 0) delete submitData.serviceRating;
            if (submitData.valueForMoneyRating === 0) delete submitData.valueForMoneyRating;
            if (submitData.locationRating === 0) delete submitData.locationRating;
            if (submitData.amenitiesRating === 0) delete submitData.amenitiesRating;

            // Ensure stayDate and tripType are undefined if empty strings
            if (!submitData.stayDate) submitData.stayDate = undefined;
            if (!submitData.tripType) submitData.tripType = undefined;

            await onSubmit(submitData);
        } catch (error: unknown) {
            console.error('Error submitting review:', error);
            const axiosError = error as AxiosError<{ message?: string, data?: Review }>;
            if (axiosError.response?.data?.message === 'You have already reviewed this property' && axiosError.response?.data?.data) {
                setDuplicateReview(axiosError.response.data.data);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative z-[100]">
            {/* Background Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" aria-hidden="true" />

            {/* Scrollable Container */}
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
                    {/* Modal Panel */}
                    <div className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all relative">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">{isEditing ? 'Edit Your Review' : 'Write a Review'}</h2>
                                <p className="text-sm text-gray-600 mt-1">{propertyName}</p>
                            </div>
                            <button
                                onClick={onCancel}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {duplicateReview && (
                            <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                                <div className="flex-1">
                                    <h4 className="text-amber-900 font-bold mb-1">Already Reviewed</h4>
                                    <p className="text-amber-800 text-sm mb-3">
                                        You have already submitted a review for this property. Would you like to edit your existing review instead?
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (onEditExistingReview) {
                                                    onEditExistingReview(duplicateReview);
                                                    setDuplicateReview(null);
                                                }
                                            }}
                                            className="bg-amber-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors shadow-sm shadow-amber-200"
                                        >
                                            Edit Existing Review
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (onDeleteExistingReview) {
                                                    await onDeleteExistingReview(duplicateReview._id);
                                                    setDuplicateReview(null);
                                                }
                                            }}
                                            className="bg-white text-red-600 border border-red-200 px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors shadow-sm"
                                        >
                                            Delete Existing Instead
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Overall Rating */}
                            <div>
                                <RatingInput
                                    label="Overall Rating"
                                    value={formData.overallRating}
                                    onChange={(value) => handleRatingChange('overallRating', value)}
                                    required
                                />
                                {errors.overallRating && (
                                    <p className="text-red-500 text-sm mt-1">{errors.overallRating}</p>
                                )}
                            </div>

                            {/* Detailed Ratings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                                <RatingInput
                                    label="Cleanliness"
                                    value={formData.cleanlinessRating || 0}
                                    onChange={(value) => handleRatingChange('cleanlinessRating', value)}
                                />
                                <RatingInput
                                    label="Service"
                                    value={formData.serviceRating || 0}
                                    onChange={(value) => handleRatingChange('serviceRating', value)}
                                />
                                <RatingInput
                                    label="Value for Money"
                                    value={formData.valueForMoneyRating || 0}
                                    onChange={(value) => handleRatingChange('valueForMoneyRating', value)}
                                />
                                <RatingInput
                                    label="Location"
                                    value={formData.locationRating || 0}
                                    onChange={(value) => handleRatingChange('locationRating', value)}
                                />
                                <RatingInput
                                    label="Amenities"
                                    value={formData.amenitiesRating || 0}
                                    onChange={(value) => handleRatingChange('amenitiesRating', value)}
                                />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Review Title (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Summarize your experience"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    maxLength={100}
                                />
                            </div>

                            {/* Review Text */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Your Review <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.reviewText}
                                    onChange={(e) => handleInputChange('reviewText', e.target.value)}
                                    placeholder="Share your experience with other travelers..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                    rows={6}
                                    maxLength={2000}
                                />
                                <div className="flex justify-between mt-1">
                                    {errors.reviewText ? (
                                        <p className="text-red-500 text-sm">{errors.reviewText}</p>
                                    ) : (
                                        <span className="text-xs text-gray-400">Minimum 10 characters</span>
                                    )}
                                    <span className="text-xs text-gray-400">
                                        {formData.reviewText.length}/2000
                                    </span>
                                </div>
                            </div>

                            {/* Trip Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Trip Type
                                    </label>
                                    <select
                                        value={formData.tripType || ''}
                                        onChange={(e) => handleInputChange('tripType', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="">Select trip type</option>
                                        <option value="solo">Solo</option>
                                        <option value="couple">Couple</option>
                                        <option value="family">Family</option>
                                        <option value="friends">Friends</option>
                                        <option value="business">Business</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Stay Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.stayDate || ''}
                                        onChange={(e) => handleInputChange('stayDate', e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Add Photos (Optional)
                                </label>
                                <div className="space-y-3">
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                                    <Image
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                        <Upload className="text-gray-400 mb-2" size={32} />
                                        <span className="text-sm text-gray-600">Click to upload photos</span>
                                        <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>{isEditing ? 'Updating...' : 'Submitting...'}</span>
                                        </>
                                    ) : (
                                        <span>{isEditing ? 'Update Review' : 'Submit Review'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
