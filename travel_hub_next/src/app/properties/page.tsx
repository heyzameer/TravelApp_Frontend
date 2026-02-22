'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight, MapPin, ArrowRight, Building2 } from 'lucide-react';
import destinationService, { Destination } from '@/services/destinationService';
import Link from 'next/link';
import Image from 'next/image';

const DestinationCard = ({ destination }: { destination: Destination }) => (
    <Link
        href={`/destinations/${destination.slug}`}
        className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
    >
        <div className="absolute inset-0 bg-slate-200">
            {destination.coverImage ? (
                <Image
                    src={destination.coverImage}
                    alt={destination.name}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                />
            ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <MapPin size={48} className="opacity-20" />
                </div>
            )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                    Destination
                </span>
            </div>
            <h3 className="text-2xl font-black text-white mb-1 group-hover:text-emerald-400 transition-colors">{destination.name}</h3>
            <p className="text-white/80 font-medium text-sm line-clamp-2 mb-2">{destination.description}</p>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                EXPLORE <ArrowRight size={14} />
            </div>
        </div>
    </Link>
);

function PropertiesContent() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const [properties, setProperties] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);

    // Local input states for filters
    const [filters, setFilters] = useState({
        search: searchQuery,
        minPrice: '',
        maxPrice: '',
        guests: '',
        propertyType: ''
    });

    // Filters that are actually applied to the API request
    const [appliedFilters, setAppliedFilters] = useState({
        search: searchQuery,
        minPrice: '',
        maxPrice: '',
        guests: '',
        propertyType: ''
    });

    const [showFilters, setShowFilters] = useState(false);

    const fetchResults = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Properties
            const propertyParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: '12'
            });

            if (appliedFilters.search) propertyParams.append('search', appliedFilters.search);
            if (appliedFilters.minPrice) propertyParams.append('minPrice', appliedFilters.minPrice);
            if (appliedFilters.maxPrice) propertyParams.append('maxPrice', appliedFilters.maxPrice);
            if (appliedFilters.guests) propertyParams.append('guests', appliedFilters.guests);
            if (appliedFilters.propertyType) propertyParams.append('propertyType', appliedFilters.propertyType);

            const propertyPromise = api.get(`/properties/public?${propertyParams.toString()}`);

            // Fetch Destinations if there is a search query
            let destinationPromise: Promise<{ data: { data: Destination[] } }> = Promise.resolve({ data: { data: [] } });
            if (appliedFilters.search && currentPage === 1) {
                destinationPromise = destinationService.searchDestinations(appliedFilters.search).then(data => ({ data: { data } }));
            }

            const [propertyResponse, destinationResponse] = await Promise.all([propertyPromise, destinationPromise]);

            // Handle Properties
            if (propertyResponse.data?.data?.properties?.data) {
                setProperties(propertyResponse.data.data.properties.data);
                setTotalPages(propertyResponse.data.data.properties.pagination?.totalPages || 1);
                setTotalProperties(propertyResponse.data.data.properties.pagination?.total || 0);
            } else if (Array.isArray(propertyResponse.data?.data)) {
                setProperties(propertyResponse.data.data);
                setTotalProperties(propertyResponse.data.data.length);
                setTotalPages(1);
            } else {
                setProperties([]);
                setTotalProperties(0);
                setTotalPages(1);
            }

            // Handle Destinations
            setDestinations(destinationResponse.data.data || []);

        } catch (error) {
            console.error('Failed to fetch results:', error);
            setProperties([]);
            setTotalProperties(0);
            setDestinations([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, appliedFilters]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        setCurrentPage(1);
        setAppliedFilters(filters);
        setShowFilters(false);
    };

    const clearFilters = () => {
        const resetFilters = {
            search: '',
            minPrice: '',
            maxPrice: '',
            guests: '',
            propertyType: ''
        };
        setFilters(resetFilters);
        setAppliedFilters(resetFilters);
        setCurrentPage(1);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl" suppressHydrationWarning>
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
                    {appliedFilters.search ? `Results for "${appliedFilters.search}"` : 'Explore Stays'}
                </h1>
                <div className="flex flex-wrap gap-4 text-slate-500 font-bold text-sm uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                        <MapPin size={16} className="text-emerald-500" />
                        {destinations.length} {destinations.length === 1 ? 'Destination' : 'Destinations'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 self-center" />
                    <span className="flex items-center gap-1.5">
                        <Building2 size={16} className="text-emerald-500" />
                        {totalProperties} {totalProperties === 1 ? 'Stay' : 'Stays'}
                    </span>
                </div>
            </div>

            {/* Filters Toggle */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-emerald-500 transition-all"
                >
                    <SlidersHorizontal size={20} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                {(filters.minPrice || filters.maxPrice || filters.guests || filters.propertyType) && (
                    <button
                        onClick={clearFilters}
                        className="text-emerald-600 font-bold hover:underline"
                    >
                        Clear All Filters
                    </button>
                )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="mb-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                            <input
                                type="text"
                                placeholder="City or destination"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Min Price */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Min Price</label>
                            <input
                                type="number"
                                placeholder="₹ 0"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Max Price */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Max Price</label>
                            <input
                                type="number"
                                placeholder="₹ 10000"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Guests */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Guests</label>
                            <input
                                type="number"
                                placeholder="Number of guests"
                                value={filters.guests}
                                onChange={(e) => handleFilterChange('guests', e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Property Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Property Type</label>
                            <select
                                value={filters.propertyType}
                                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            >
                                <option value="">All Types</option>
                                <option value="resort">Resort</option>
                                <option value="homestay">Homestay</option>
                                <option value="hotel">Hotel</option>
                                <option value="villa">Villa</option>
                                <option value="camp">Camp</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={applyFilters}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-slate-300 transition-all"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Results Section */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
                </div>
            ) : properties.length === 0 && destinations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                    <Search className="h-20 w-20 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tight">Nothing found</h3>
                    <p className="text-slate-500 mb-8 font-bold text-lg">We couldn&apos;t find any destinations or stays matching your search.</p>
                    <button
                        onClick={clearFilters}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-10 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-100 uppercase tracking-widest text-sm"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <>
                    {/* Destinations Section */}
                    {destinations.length > 0 && (
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Destinations</h2>
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Matched your search query</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {destinations.map((destination) => (
                                    <DestinationCard key={destination._id} destination={destination} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Properties/Stays Section */}
                    {properties.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Available Stays</h2>
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Handpicked for your comfort</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {properties.map((property) => (
                                    <PropertyCard key={property._id} property={property} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pb-12">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={20} />
                                Previous
                            </button>

                            <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-12 h-12 rounded-xl font-bold transition-all ${currentPage === pageNum
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-500'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <div className="pt-24 pb-12 bg-slate-50 min-h-screen" suppressHydrationWarning>
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
                </div>
            }>
                <PropertiesContent />
            </Suspense>
        </div>
    );
}
