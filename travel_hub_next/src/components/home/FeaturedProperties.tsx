'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Star, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const FeaturedProperties = () => {
    const [properties, setProperties] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProps = async () => {
            try {
                setLoading(true);
                // Fetch first 6 properties from the public API
                const response = await api.get('/properties/public?page=1&limit=6');

                if (response.data?.data?.properties?.data) {
                    setProperties(response.data.data.properties.data);
                } else if (Array.isArray(response.data?.data)) {
                    setProperties(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch featured properties:', error);
                // Keep empty array on error
            } finally {
                setLoading(false);
            }
        };
        fetchProps();
    }, []);

    if (loading) {
        return (
            <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto bg-gray-50/50" suppressHydrationWarning>
                <div className="flex items-center justify-center py-20" suppressHydrationWarning>
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto bg-gray-50/50" suppressHydrationWarning>
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Featured Stays</h2>
                <p className="text-gray-500 font-medium">Handpicked properties for your next adventure</p>
            </div>

            {properties.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg mb-4">No properties available at the moment</p>
                    <p className="text-gray-400">Check back soon for amazing stays!</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" suppressHydrationWarning>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {properties.map((prop: any) => (
                            <Link href={`/properties/${prop._id}`} key={prop._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <Image
                                        src={prop.coverImage && prop.coverImage.length > 5 ? prop.coverImage : 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                                        alt={prop.propertyName}
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        suppressHydrationWarning
                                        unoptimized
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-gray-900 flex items-center gap-1 shadow-sm" suppressHydrationWarning>
                                        <Star size={12} className="text-yellow-500 fill-yellow-500" /> {prop.averageRating || prop.rating || 'New'}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">{prop.propertyName}</h3>
                                            <p className="text-gray-400 text-sm font-bold flex items-center gap-1">
                                                <MapPin size={14} /> {prop.address?.city || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                        <div className="text-gray-500 text-sm font-medium">Starts from</div>
                                        <div className="text-xl font-black text-gray-900">₹{prop.pricePerNight || prop.basePrice || 0}<span className="text-base text-gray-400 font-medium">/night</span></div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/properties"
                            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            View All Properties
                        </Link>
                    </div>
                </>
            )}
        </section>
    );
};
