'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

function PropertiesContent() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const [properties, setProperties] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);

    // Filter states
    const [filters, setFilters] = useState({
        search: searchQuery,
        minPrice: '',
        maxPrice: '',
        guests: '',
        propertyType: ''
    });

    const [showFilters, setShowFilters] = useState(false);

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '12'
            });

            if (filters.search) params.append('search', filters.search);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.guests) params.append('guests', filters.guests);
            if (filters.propertyType) params.append('propertyType', filters.propertyType);

            const response = await api.get(`/properties/public?${params.toString()}`);

            if (response.data?.data?.properties?.data) {
                setProperties(response.data.data.properties.data);
                setTotalPages(response.data.data.properties.totalPages || 1);
                setTotalProperties(response.data.data.properties.total || 0);
            } else if (Array.isArray(response.data?.data)) {
                setProperties(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch properties:', error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        setCurrentPage(1);
        fetchProperties();
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            minPrice: '',
            maxPrice: '',
            guests: '',
            propertyType: ''
        });
        setCurrentPage(1);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl" suppressHydrationWarning>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'All Properties'}
                </h1>
                <p className="text-slate-500 font-medium">
                    {totalProperties} {totalProperties === 1 ? 'property' : 'properties'} found
                </p>
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

            {/* Properties Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
                </div>
            ) : properties.length === 0 ? (
                <div className="text-center py-20">
                    <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No properties found</h3>
                    <p className="text-slate-500 mb-6">Try adjusting your filters or search criteria</p>
                    <button
                        onClick={clearFilters}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {properties.map((property) => (
                            <PropertyCard key={property._id} property={property} />
                        ))}
                    </div>

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
