'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import destinationService, { Destination } from '@/services/destinationService';
import propertyService from '@/services/propertyService';
import { Property } from '@/types/property';

export const Hero = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<{ destinations: Destination[], properties: Property[] }>({ destinations: [], properties: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                setLoading(true);
                try {
                    const [destRes, propRes] = await Promise.all([
                        destinationService.searchDestinations(searchQuery),
                        propertyService.searchProperties(searchQuery)
                    ]);
                    setSuggestions({
                        destinations: destRes.slice(0, 3) || [],
                        properties: propRes.slice(0, 4) || []
                    });
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setSuggestions({ destinations: [], properties: [] });
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
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
                <div className="relative max-w-3xl mx-auto" ref={dropdownRef}>
                    <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md border border-white/20 p-2 md:p-3 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-2 relative z-20" suppressHydrationWarning>
                        <div className="flex-1 bg-white rounded-2xl flex items-center px-6 py-3 md:py-4" suppressHydrationWarning>
                            <Search className="text-gray-400 mr-3 shrink-0" size={20} />
                            <input
                                type="text"
                                placeholder="Where do you want to go?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => { if (searchQuery.length > 1) setShowSuggestions(true); }}
                                className="w-full bg-transparent outline-none text-gray-800 font-bold placeholder:text-gray-400"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 md:py-4 px-8 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
                        >
                            SEARCH
                        </button>
                    </form>

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl overflow-hidden z-50 text-left border border-slate-100 flex flex-col max-h-[60vh] overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-slate-500 font-medium">Searching...</div>
                            ) : (suggestions.destinations.length === 0 && suggestions.properties.length === 0) ? (
                                <div className="p-4 text-center text-slate-500 font-medium">No destinations or stays found</div>
                            ) : (
                                <div className="py-2">
                                    {suggestions.destinations.length > 0 && (
                                        <div className="mb-2">
                                            <div className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-wider bg-slate-50 border-y border-slate-100 mb-1">
                                                Destinations & Places
                                            </div>
                                            {suggestions.destinations.map((dest) => (
                                                <Link
                                                    key={dest._id}
                                                    href={`/destinations/${dest.slug}`}
                                                    onClick={() => setShowSuggestions(false)}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0">
                                                        <Image
                                                            src={dest.coverImage || dest.images?.[0] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470'}
                                                            alt={dest.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{dest.name}</p>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                                            <MapPin size={10} /> Destination
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {suggestions.properties.length > 0 && (
                                        <div>
                                            <div className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-wider bg-slate-50 border-y border-slate-100 mb-1">
                                                Stays & Properties
                                            </div>
                                            {suggestions.properties.map((prop) => (
                                                <Link
                                                    key={prop._id}
                                                    href={`/properties/${prop._id}`}
                                                    onClick={() => setShowSuggestions(false)}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0">
                                                        <Image
                                                            src={prop.coverImage || prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                                                            alt={prop.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 truncate">
                                                        <p className="font-bold text-slate-800 truncate">{prop.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1">
                                                            <Home size={10} /> {prop.address?.city}
                                                        </p>
                                                    </div>
                                                    <div className="font-bold text-emerald-600 text-sm whitespace-nowrap">
                                                        ₹{prop.basePrice}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
