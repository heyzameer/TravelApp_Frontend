'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { IProperty, IDestination } from '@/services/consumerApi';

const PropertyMap = dynamic(() => import('@/components/maps/PropertyMap'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 rounded-3xl animate-pulse"></div>
});

type PlaceToVisit = NonNullable<IDestination['placesToVisit']>[number];

interface DestinationMapWrapperProps {
    properties: IProperty[];
    center?: [number, number];
    placesToVisit?: PlaceToVisit[];
}

export const DestinationMapWrapper: React.FC<DestinationMapWrapperProps> = ({ properties, center, placesToVisit }) => {
    // Transform and filter properties to match the expected PropertyInMap type
    // specifically filtering out properties without coordinates
    const mapProperties = properties
        .filter(prop => prop.location?.coordinates && prop.location.coordinates.length === 2)
        .map(prop => ({
            _id: prop._id,
            propertyName: prop.propertyName,
            coverImage: prop.coverImage,
            location: {
                coordinates: prop.location.coordinates as [number, number]
            },
            address: {
                city: prop.location.city
            }
        }));

    return <PropertyMap properties={mapProperties} center={center} placesToVisit={placesToVisit} />;
};
