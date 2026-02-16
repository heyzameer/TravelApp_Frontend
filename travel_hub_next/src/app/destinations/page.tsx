import React from 'react';
import Link from 'next/link';
import { consumerApi, IDestination } from '@/services/consumerApi';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'All Destinations | TravelHub',
    description: 'Explore all our handpicked destinations for your next nature getaway.',
};

export default async function AllDestinationsPage() {
    let destinations: IDestination[] = [];
    try {
        destinations = await consumerApi.getAllDestinations();
    } catch (error) {
        console.error("Failed to fetch all destinations", error);
    }

    return (
        <main className="min-h-screen bg-gray-50 py-20 px-4 md:px-8" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Explore All Destinations</h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">From misty mountains to serene beaches, find your perfect escape in these beautiful locations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {destinations.map((dest: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                        <Link href={`/destinations/${dest.slug}`} key={dest._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="relative aspect-[4/3] overflow-hidden">
                                {dest.coverImage ? (
                                    <Image
                                        src={dest.coverImage && dest.coverImage.length > 5 ? dest.coverImage : 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6'}
                                        alt={dest.name}
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        suppressHydrationWarning
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold">No Image</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                                    <h2 className="text-2xl font-black text-white mb-1">{dest.name}</h2>
                                    <div className="flex items-center gap-1 text-emerald-300 font-bold text-sm uppercase tracking-wider">
                                        <MapPin size={14} /> View Stays
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 font-medium line-clamp-3 leading-relaxed">{dest.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
