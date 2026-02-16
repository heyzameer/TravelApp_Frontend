'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import WishlistButton from '../shared/WishlistButton';

interface PropertyCardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    property: any;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    return (
        <Link href={`/properties/${property._id}`} className="group block bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <Image
                    src={property.coverImage && property.coverImage.length > 5 ? property.coverImage : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070'}
                    alt={property.propertyName}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    suppressHydrationWarning
                    unoptimized
                />

                <WishlistButton
                    propertyId={property._id}
                    className="absolute top-4 right-4 p-2.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors z-10"
                />

                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-gray-900 flex items-center gap-1 shadow-sm">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" /> {property.rating || 'New'} ({property.totalReviews || 0})
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-emerald-600 transition-colors">{property.propertyName}</h3>
                        <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                            <MapPin size={14} /> {property.address.city}
                        </p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-end justify-between">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">STARTS FROM</p>
                        <p className="text-gray-900 font-black text-xl">
                            ₹{property.pricePerNight || 4500}
                            <span className="text-sm text-gray-400 font-medium ml-1">/night</span>
                        </p>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg">
                        View Details
                    </span>
                </div>
            </div>
        </Link>
    );
};
