'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import Image from 'next/image';

// Fix for default marker icons in Next.js
// Only run on client
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to update map center when properties change
const UpdateMapCenter = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 12);
    }, [center, map]);
    return null;
};

interface PropertyMapProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: any[];
    center?: [number, number];
}

const PropertyMap: React.FC<PropertyMapProps> = ({ properties, center = [12.9716, 77.5946] }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="h-[400px] w-full bg-gray-100 rounded-2xl animate-pulse"></div>;

    // Use the first property's location as center if available and no specific center provided
    const mapCenter: [number, number] = center;

    return (
        <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border-2 border-white z-0 relative">
            <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <UpdateMapCenter center={mapCenter} />

                {properties.map((prop) => (
                    prop.location?.coordinates && (
                        <Marker
                            key={prop._id}
                            position={[prop.location.coordinates[1], prop.location.coordinates[0]]}
                            icon={customIcon}
                        >
                            <Popup>
                                <div className="min-w-[200px]">
                                    <div className="w-full h-24 bg-gray-200 rounded-lg mb-2 overflow-hidden relative">
                                        <Image
                                            src={prop.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                                            alt={prop.propertyName}
                                            className="object-cover"
                                            fill
                                        />
                                    </div>
                                    <h3 className="font-bold text-gray-900">{prop.propertyName}</h3>
                                    <p className="text-gray-500 text-xs mb-2 truncate">{prop.address.city}</p>
                                    <Link
                                        href={`/properties/${prop._id}`}
                                        className="block w-full text-center bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default PropertyMap;
