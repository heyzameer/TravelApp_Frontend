import React from 'react';
import Link from 'next/link';
import { consumerApi, IProperty } from '@/services/consumerApi';
import { DestinationHero } from '@/components/destinations/DestinationHero';
import { PropertyCard } from '@/components/properties/PropertyCard';
import axios from 'axios';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

import { DestinationMapWrapper } from '@/components/destinations/DestinationMapWrapper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

async function getDestination(slug: string) {
    try {
        const data = await consumerApi.getDestinationBySlug(slug);
        return data;
    } catch {
        return null;
    }
}

async function getPropertiesForDestination(destinationId: string) {
    try {
        // Fetch properties filtered by destinationId, verified, and active
        const res = await axios.get(`${API_URL}/properties/search`, {
            params: {
                destinationId,
                status: 'verified', // Backend expects 'verified' or similar based on impl
                isActive: true
            }
        });
        return res.data.data.results.data || [];
    } catch (error) {
        console.error("Failed to fetch properties", error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const destination = await getDestination(slug);
    if (!destination) return { title: 'Destination Not Found - TravelHub' };

    return {
        title: `${destination.name} Stays & Resorts | TravelHub`,
        description: `Find the best stays in ${destination.name}. ${destination.description}`,
    };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const destination = await getDestination(slug);

    if (!destination) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Destination Not Found</h1>
                    <p className="text-gray-500">We couldn&apos;t find the destination you&apos;re looking for.</p>
                </div>
            </div>
        );
    }

    const properties = await getPropertiesForDestination(destination._id);

    return (
        <main className="min-h-screen bg-white pb-20" suppressHydrationWarning>
            <DestinationHero
                name={destination.name}
                coverImage={destination.coverImage}
            />

            {/* Destination Info & Quick Stats */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-30 -mt-16">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100 mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl font-black text-gray-900 mb-6 leading-tight">About {destination.name}</h2>
                            <p className="text-gray-600 font-medium leading-[1.8] text-lg">
                                {destination.description}
                            </p>
                        </div>
                        <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100/50">
                            <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                <span className="p-2 bg-emerald-500 rounded-lg text-white"><MapPin size={20} /></span>
                                Explore Info
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex justify-between items-center py-2 border-b border-emerald-100/50">
                                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Properties</span>
                                    <span className="text-emerald-700 font-black">{properties.length} Active</span>
                                </li>
                                <li className="flex justify-between items-center py-2 border-b border-emerald-100/50">
                                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Attractions</span>
                                    <span className="text-emerald-700 font-black">{destination.placesToVisit?.length || 0} Listed</span>
                                </li>
                                <li className="flex justify-between items-center py-2">
                                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Coordinate</span>
                                    <span className="text-emerald-700 font-black text-xs">
                                        {destination.coordinates?.lat.toFixed(2)}°N, {destination.coordinates?.lng.toFixed(2)}°E
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Properties */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-end pb-4 border-b-2 border-gray-50">
                            <div>
                                <h2 className="text-4xl font-black text-gray-900 leading-none mb-2">Available Stays</h2>
                                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Handpicked for {destination.name}</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-gray-100 transition-colors">Sort</button>
                                <button className="px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-gray-100 transition-colors">Filters</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {properties.map((prop: IProperty) => (
                                <PropertyCard key={prop._id} property={prop} />
                            ))}
                        </div>

                        {properties.length === 0 && (
                            <div className="bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100 p-16 text-center">
                                <div className="max-w-sm mx-auto">
                                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-gray-300">
                                        <MapPin size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-400 mb-2">No Stays Found</h3>
                                    <p className="text-gray-400 font-medium">We haven&apos;t added any verified properties in {destination.name} yet. Check back soon!</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Interaction & Places */}
                    <div className="lg:col-span-1 space-y-10">
                        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/50 border-4 border-white">
                            <DestinationMapWrapper
                                properties={properties}
                                center={destination.coordinates ? [destination.coordinates.lat, destination.coordinates.lng] : undefined}
                                placesToVisit={destination.placesToVisit}
                            />
                        </div>

                        {destination.placesToVisit && destination.placesToVisit.length > 0 && (
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-gray-900 leading-none">Must Visit</h3>
                                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">Map Icons</span>
                                </div>
                                <div className="space-y-6">
                                    {destination.placesToVisit.map((place) => (
                                        <Link href={`/destinations/${slug}/places/${place.slug}`} key={place._id} className="group cursor-pointer block">
                                            <div className="flex gap-5">
                                                {place.images?.[0] && (
                                                    <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 relative shadow-sm group-hover:shadow-md transition-shadow">
                                                        <Image src={place.images[0]} alt={place.name} fill className="object-cover transition-transform group-hover:scale-110" sizes="96px" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col justify-center">
                                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">{place.category || 'Sightseeing'}</span>
                                                    <h4 className="font-black text-gray-900 text-lg leading-tight group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{place.name}</h4>
                                                    <p className="text-xs text-gray-400 font-medium line-clamp-2 mt-2 leading-relaxed">{place.description}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
