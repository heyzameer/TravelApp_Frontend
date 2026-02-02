'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/maps/PropertyMap'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 rounded-3xl animate-pulse"></div>
});

interface DestinationMapWrapperProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: any[];
}

export const DestinationMapWrapper: React.FC<DestinationMapWrapperProps> = ({ properties }) => {
    return <PropertyMap properties={properties} />;
};
