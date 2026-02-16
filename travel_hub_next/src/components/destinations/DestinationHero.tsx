import React from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

interface DestinationHeroProps {
    name: string;
    description: string;
    coverImage?: string;
}

export const DestinationHero: React.FC<DestinationHeroProps> = ({ name, description, coverImage }) => {
    return (
        <div className="relative h-[60vh] w-full bg-gray-900 flex items-end">
            <div className="absolute inset-0 z-0">
                <Image
                    src={coverImage || "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070"}
                    alt={name}
                    className="object-cover"
                    fill
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
            </div>

            <div className="relative z-10 px-4 md:px-8 pb-12 w-full max-w-7xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-300 font-bold px-4 py-1.5 rounded-full mb-4 text-sm uppercase tracking-wider">
                    <MapPin size={14} /> Destination
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">{name}</h1>
                <p className="text-lg text-gray-200 max-w-2xl font-medium leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};
