'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, IndianRupee, Clock, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import destinationService, { Destination, PlaceToVisit } from '@/services/destinationService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Image from 'next/image';

// Fix for default marker icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function PlaceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const destinationSlug = params.slug as string;
    const placeSlug = params.placeSlug as string;

    const [destination, setDestination] = useState<Destination | null>(null);
    const [place, setPlace] = useState<PlaceToVisit | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const destData = await destinationService.getDestinationBySlug(destinationSlug);
            setDestination(destData);

            const foundPlace = destData.placesToVisit.find(p => p.slug === placeSlug);
            setPlace(foundPlace || null);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [destinationSlug, placeSlug]);

    useEffect(() => {
        if (destinationSlug) {
            fetchData();
        }
    }, [destinationSlug, fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    if (!place || !destination) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Place Not Found</h1>
                <button
                    onClick={() => router.push(`/destinations/${destinationSlug}`)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Back to Destination
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto max-w-6xl px-4 py-4">
                    <button
                        onClick={() => router.push(`/destinations/${destinationSlug}`)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
                    >
                        <ArrowLeft size={20} />
                        Back to {destination.name}
                    </button>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Images */}
                        {place.images && place.images.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="relative h-96">
                                    <Image
                                        src={place.images[0]}
                                        alt={place.name}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                                {place.images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2 p-4">
                                        {place.images.slice(1, 5).map((img, index) => (
                                            <div key={index} className="relative h-24 rounded overflow-hidden">
                                                <Image
                                                    src={img}
                                                    alt={`${place.name} ${index + 2}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Details */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{place.name}</h1>
                                    {place.category && (
                                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                                            {place.category.charAt(0).toUpperCase() + place.category.slice(1)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-6">{place.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {place.entryFee !== undefined && (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <IndianRupee className="text-indigo-600" size={24} />
                                        <div>
                                            <p className="text-sm text-gray-600">Entry Fee</p>
                                            <p className="font-semibold text-gray-900">
                                                {place.entryFee === 0 ? 'Free' : `₹${place.entryFee}`}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {place.timings && (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <Clock className="text-indigo-600" size={24} />
                                        <div>
                                            <p className="text-sm text-gray-600">Timings</p>
                                            <p className="font-semibold text-gray-900">{place.timings}</p>
                                        </div>
                                    </div>
                                )}
                                {place.bestTimeToVisit && (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <Calendar className="text-indigo-600" size={24} />
                                        <div>
                                            <p className="text-sm text-gray-600">Best Time to Visit</p>
                                            <p className="font-semibold text-gray-900">{place.bestTimeToVisit}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <MapPin className="text-indigo-600" size={24} />
                                    <div>
                                        <p className="text-sm text-gray-600">Location</p>
                                        <p className="font-semibold text-gray-900">
                                            {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Map */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="h-64">
                                    <MapContainer
                                        center={[place.coordinates.lat, place.coordinates.lng]}
                                        zoom={14}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker position={[place.coordinates.lat, place.coordinates.lng]}>
                                            <Popup>{place.name}</Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                                <div className="p-4">
                                    <a
                                        href={`https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                    >
                                        Open in Google Maps
                                    </a>
                                </div>
                            </div>

                            {/* Destination Info */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Part of {destination.name}</h3>
                                <p className="text-sm text-gray-600 mb-4">{destination.description}</p>
                                <button
                                    onClick={() => router.push(`/destinations/${destinationSlug}`)}
                                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                                >
                                    Explore More Places
                                </button>
                            </div>

                            {/* Nearby Stays */}
                            <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                                <h3 className="font-semibold text-gray-900 mb-2">Looking for Stays?</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Find properties near {place.name}
                                </p>
                                <button
                                    onClick={() => router.push('/properties')}
                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                >
                                    Browse Properties
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
