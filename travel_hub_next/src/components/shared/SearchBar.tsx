'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Building2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import destinationService, { Destination } from '@/services/destinationService';
import propertyService from '@/services/propertyService';
import Image from 'next/image';
import { Property } from '@/types/property';

interface SearchResult {
    type: 'destination' | 'property';
    id: string;
    name: string;
    description: string;
    image?: string;
    slug?: string;
}

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = useCallback(async () => {
        try {
            setLoading(true);
            const [destinations, properties] = await Promise.all([
                destinationService.searchDestinations(query),
                propertyService.searchProperties(query).catch(() => [])
            ]);

            const destinationResults: SearchResult[] = (destinations as Destination[]).map(d => ({
                type: 'destination',
                id: d._id,
                name: d.name,
                description: d.description,
                image: d.coverImage,
                slug: d.slug
            }));

            const propertyResults: SearchResult[] = (properties as Property[]).map(p => ({
                type: 'property',
                id: p._id || '',
                name: p.name,
                description: p.address?.city ? `${p.address.city}, ${p.address.state || ''}` : p.description,
                image: p.coverImage,
                slug: p._id
            }));

            setResults([...destinationResults, ...propertyResults]);
            setIsOpen(true);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    }, [query]);

    useEffect(() => {
        const searchDebounce = setTimeout(() => {
            if (query.trim().length >= 2) {
                performSearch();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(searchDebounce);
    }, [query, performSearch]);

    const handleResultClick = (result: SearchResult) => {
        if (result.type === 'destination') {
            router.push(`/destinations/${result.slug}`);
        } else {
            router.push(`/properties/${result.slug}`);
        }
        setIsOpen(false);
        setQuery('');
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-2xl">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Search destinations or properties..."
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {isOpen && (query.length >= 2) && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            {results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}-${index}`}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left transition"
                                >
                                    {result.image ? (
                                        <div className="relative w-12 h-12 shrink-0">
                                            <Image
                                                src={result.image}
                                                alt={result.name}
                                                className="object-cover rounded"
                                                fill
                                                sizes="48px"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                            {result.type === 'destination' ? (
                                                <MapPin size={20} className="text-gray-400" />
                                            ) : (
                                                <Building2 size={20} className="text-gray-400" />
                                            )}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{result.name}</h4>
                                            <span className={`text-xs px-2 py-0.5 rounded ${result.type === 'destination'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {result.type === 'destination' ? 'Destination' : 'Property'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-1">{result.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            No results found for &quot;{query}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
