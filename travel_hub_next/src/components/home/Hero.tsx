'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export const Hero = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push('/properties');
        }
    };

    return (
        <div className="relative h-[80vh] w-full bg-gray-900 flex items-center justify-center overflow-hidden" suppressHydrationWarning>
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0" suppressHydrationWarning>
                <Image
                    src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
                    alt="Hero Background"
                    className="object-cover opacity-60"
                    fill
                    priority
                    loading="eager"
                    sizes="100vw"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" suppressHydrationWarning />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl w-full" suppressHydrationWarning>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-lg tracking-tight">
                    Find Your Perfect <span className="text-emerald-400">Escape</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium">
                    Discover handpicked stays in nature&apos;s most beautiful locations.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md border border-white/20 p-2 md:p-3 rounded-full shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row gap-2" suppressHydrationWarning>
                    <div className="flex-1 bg-white rounded-full flex items-center px-6 py-3 md:py-4" suppressHydrationWarning>
                        <Search className="text-gray-400 mr-3" size={20} />
                        <input
                            type="text"
                            placeholder="Where do you want to go?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent outline-none text-gray-800 font-bold placeholder:text-gray-400"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 md:py-4 px-8 rounded-full transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
                    >
                        SEARCH
                    </button>
                </form>
            </div>
        </div>
    );
};
