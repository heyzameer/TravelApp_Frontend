import React from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

interface DestinationHeroProps {
    name: string;
    description?: string;
    coverImage?: string;
}

export const DestinationHero: React.FC<DestinationHeroProps> = ({ name, coverImage }) => {
    return (
        <div className="relative h-[50vh] w-full bg-gray-900 flex items-center justify-center overflow-hidden" suppressHydrationWarning>
            <div className="absolute inset-0 z-0">
                <Image
                    src={coverImage && coverImage.length > 5 ? coverImage : "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070"}
                    alt={name}
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    fill
                    priority
                    sizes="100vw"
                    suppressHydrationWarning
                    unoptimized
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
            </div>

            <div className="relative z-10 px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold px-5 py-2 rounded-full mb-6 text-xs uppercase tracking-[0.2em]">
                    <MapPin size={14} className="text-emerald-400" /> Discover
                </div>
                <h1 className="text-6xl md:text-9xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">
                    {name}
                </h1>
            </div>
        </div>
    );
};
