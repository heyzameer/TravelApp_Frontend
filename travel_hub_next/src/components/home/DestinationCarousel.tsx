'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import { consumerApi, IDestination } from '@/services/consumerApi';

export const DestinationCarousel = () => {
    const [destinations, setDestinations] = useState<IDestination[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const data = await consumerApi.getTrendingDestinations();
                setDestinations(data);
            } catch (error) {
                console.error("Failed to fetch destinations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    if (loading) {
        return <div className="py-20 text-center text-gray-400">Loading destinations...</div>;
    }

    return (
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Trending Destinations</h2>
                    <p className="text-gray-500 font-medium">Most popular places to stay this month</p>
                </div>
                <Link href="/destinations" className="hidden md:flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                    View All <ArrowRight size={20} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((dest) => (
                    <Link href={`/destinations/${dest.slug}`} key={dest._id} className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="absolute inset-0 bg-gray-200">
                            {dest.coverImage ? (
                                <Image
                                    src={dest.coverImage}
                                    alt={dest.name}
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    fill
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold">No Image</div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                            <h3 className="text-2xl font-black text-white mb-1 group-hover:text-emerald-400 transition-colors">{dest.name}</h3>
                            <p className="text-white/80 font-medium text-sm line-clamp-2 mb-2">{dest.description}</p>
                            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                <MapPin size={14} /> EXPLORE PROPERTIES
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-8 text-center md:hidden">
                <Link href="/destinations" className="inline-flex items-center gap-2 text-emerald-600 font-bold">
                    View All Destinations <ArrowRight size={20} />
                </Link>
            </div>
        </section>
    );
};
