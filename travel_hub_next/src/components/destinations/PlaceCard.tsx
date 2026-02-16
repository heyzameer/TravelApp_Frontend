'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, IndianRupee, Clock, Calendar } from 'lucide-react';
import { PlaceToVisit } from '@/services/destinationService';
import Image from 'next/image';

interface PlaceCardProps {
    place: PlaceToVisit;
    destinationSlug: string;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, destinationSlug }) => {
    const router = useRouter();

    const getCategoryColor = (category?: string) => {
        const colors: Record<string, string> = {
            temple: 'bg-purple-100 text-purple-700',
            beach: 'bg-blue-100 text-blue-700',
            museum: 'bg-amber-100 text-amber-700',
            viewpoint: 'bg-green-100 text-green-700',
            park: 'bg-emerald-100 text-emerald-700',
            monument: 'bg-red-100 text-red-700',
            waterfall: 'bg-cyan-100 text-cyan-700',
            fort: 'bg-orange-100 text-orange-700',
        };
        return colors[category || ''] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div
            onClick={() => router.push(`/destinations/${destinationSlug}/places/${place.slug}`)}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden group"
        >
            <div className="relative h-48">
                {place.images && place.images.length > 0 ? (
                    <Image
                        src={place.images[0]}
                        alt={place.name}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <MapPin size={48} className="text-indigo-300" />
                    </div>
                )}
                {place.category && (
                    <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(place.category)}`}>
                            {place.category.charAt(0).toUpperCase() + place.category.slice(1)}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{place.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{place.description}</p>

                <div className="space-y-2">
                    {place.entryFee !== undefined && place.entryFee > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <IndianRupee size={14} className="text-indigo-600" />
                            <span className="font-semibold">₹{place.entryFee}</span>
                            <span className="text-gray-500">entry fee</span>
                        </div>
                    )}
                    {place.entryFee === 0 && (
                        <div className="flex items-center gap-2 text-sm text-green-700">
                            <IndianRupee size={14} className="text-green-600" />
                            <span className="font-semibold">Free Entry</span>
                        </div>
                    )}
                    {place.timings && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} className="text-gray-400" />
                            <span>{place.timings}</span>
                        </div>
                    )}
                    {place.bestTimeToVisit && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} className="text-gray-400" />
                            <span>{place.bestTimeToVisit}</span>
                        </div>
                    )}
                </div>

                <button className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-semibold text-sm">
                    View Details
                </button>
            </div>
        </div>
    );
};

export default PlaceCard;
