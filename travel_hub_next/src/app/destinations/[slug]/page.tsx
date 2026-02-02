import React from 'react';
import { consumerApi } from '@/services/consumerApi';
import { DestinationHero } from '@/components/destinations/DestinationHero';
import { PropertyCard } from '@/components/properties/PropertyCard';
import axios from 'axios';

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
        return res.data.data.data || [];
    } catch (error) {
        console.error("Failed to fetch properties", error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const destination = await getDestination(params.slug);
    if (!destination) return { title: 'Destination Not Found - TravelHub' };

    return {
        title: `${destination.name} Stays & Resorts | TravelHub`,
        description: `Find the best stays in ${destination.name}. ${destination.description}`,
    };
}

export default async function DestinationPage({ params }: { params: { slug: string } }) {
    const destination = await getDestination(params.slug);

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
        <main className="min-h-screen bg-white pb-20">
            <DestinationHero
                name={destination.name}
                description={destination.description}
                coverImage={destination.coverImage}
            />

            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Properties */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">{properties.length} Stays Found</h2>
                                <p className="text-sm text-gray-500 font-medium">in {destination.name}</p>
                            </div>
                            {/* Filter Buttons Placeholder */}
                            <div className="flex gap-2">
                                <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">Sort by</button>
                                <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">Filters</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {properties.map((prop: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                <PropertyCard key={prop._id} property={prop} />
                            ))}
                        </div>

                        {properties.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-400 font-medium">No properties found in this destination yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Map */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <DestinationMapWrapper properties={properties} />

                            <div className="mt-6 bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                                <h3 className="font-bold text-gray-900 mb-2">Why visit {destination.name}?</h3>
                                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                    {destination.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
