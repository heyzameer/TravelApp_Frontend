"use client";

import Link from 'next/link';
import { Search, MapPin, Star, ShieldCheck, TreePine, Compass } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPublicProperties } from '@/services/propertyService';
import { dummyProperties } from '@/data/dummyProperties';
import { Property } from '@/types/property';

const destinations = [
  {
    id: 1,
    name: 'Dandeli',
    location: 'Uttara Kannada',
    image: 'https://images.unsplash.com/photo-1750353127516-87bd2c25c21d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=80&w=800',
    description: 'Experience the wild adventure.'
  },
  {
    id: 2,
    name: 'Coorg',
    location: 'Kodagu',
    image: 'https://images.unsplash.com/photo-1634874634941-78abc0a00298?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=80&w=800',
    description: 'The Scotland of India.'
  },
  {
    id: 3,
    name: 'Gokarna',
    location: 'Kumta',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=800',
    description: 'Beaches & Spiritual vibes.'
  },
];

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const data = await getPublicProperties(1, 6);
      let mergedProperties: Property[] = [];

      if (data && data.properties && data.properties.data && data.properties.data.length > 0) {
        // We have real properties, use them first    
        mergedProperties = data.properties.data;
      }

      // If we have fewer than 6 properties, fill with dummies
      if (mergedProperties.length < 6) {
        const needed = 6 - mergedProperties.length;
        mergedProperties = [...mergedProperties, ...dummyProperties.slice(0, needed)];
      }

      setProperties(mergedProperties);
      setLoading(false);
    };
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full">
      {/* Hero Section */}
      <div className="relative h-[500px] md:h-[600px] w-full flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2070"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20">
            <TreePine className="h-4 w-4 text-emerald-300" />
            <span>Discover Nature's Best Kept Secrets</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Find Your Perfect <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">Nature Retreat</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-100 mb-10 max-w-2xl mx-auto font-medium">
            Book unique homestays, cottages, and villas verified for quality and authenticity across Karnataka's most beautiful destinations.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-3 rounded-2xl shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-2 transition-transform hover:scale-[1.01] duration-300">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus-within:ring-2 ring-primary/20 transition-all">
              <MapPin className="h-5 w-5 text-slate-400" />
              <div className="text-left w-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Where</p>
                <input className="w-full bg-transparent outline-none text-slate-900 font-semibold placeholder:text-slate-400" placeholder="Search destinations" />
              </div>
            </div>

            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus-within:ring-2 ring-primary/20 transition-all">
              <Compass className="h-5 w-5 text-slate-400" />
              <div className="text-left w-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Type</p>
                <input className="w-full bg-transparent outline-none text-slate-900 font-semibold placeholder:text-slate-400" placeholder="All Stays" />
              </div>
            </div>

            <button className="bg-primary hover:bg-primary-hover text-white px-8 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/25 active:scale-95 flex items-center justify-center gap-2 md:w-auto w-full py-4 md:py-0">
              <Search className="h-5 w-5" />
              <span className="md:hidden">Search</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-20">

        {/* Popular Destinations */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Popular Destinations</h2>
              <p className="text-slate-500">Explore the most loved nature retreats</p>
            </div>
            <Link href="/destinations" className="text-primary font-bold hover:text-primary-hover transition-colors hidden md:block">
              View all destinations →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <div key={dest.id} className="group relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">{dest.name}</h3>
                  <p className="text-white/80 flex items-center gap-1.5 text-sm mb-2">
                    <MapPin className="h-3.5 w-3.5" /> {dest.location}
                  </p>
                  <p className="text-white/60 text-sm line-clamp-1 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
                    {dest.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 md:hidden text-center">
            <Link href="/destinations" className="text-primary font-bold hover:text-primary-hover transition-colors">
              View all destinations →
            </Link>
          </div>
        </section>

        {/* Featured Stays */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Top Rated Stays</h2>
              <p className="text-slate-500">Handpicked verified stays with authentic local experiences</p>
            </div>
            <Link href="/stays" className="text-primary font-bold hover:text-primary-hover transition-colors hidden md:block">
              View all stays →
            </Link>
          </div>

          {/* Stays Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading Skeletons
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden h-[400px] animate-pulse">
                  <div className="h-64 bg-slate-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              properties.map((prop) => (
                <div key={prop._id} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={typeof prop.coverImage === 'string' ? prop.coverImage : (prop.images?.[0] || '')}
                      alt={prop.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm font-bold text-xs text-slate-800">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      {prop.rating || 4.5}
                    </div>
                    {prop.isVerified && (
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-md">
                        <ShieldCheck className="h-3 w-3" /> VERIFIED
                      </div>
                    )}
                  </div>

                  {/* Ensure consistent card content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-primary transition-colors">{prop.name}</h3>
                    <p className="text-slate-500 text-sm mb-4 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {prop.address.city}, {prop.address.state}
                    </p>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">₹{prop.basePrice}</p>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Per Night</p>
                      </div>
                      <Link href={`/stays/${prop._id || prop.id}`} className="bg-slate-50 hover:bg-primary text-primary hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link href="/stays" className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all inline-block w-full">
              View all stays →
            </Link>
          </div>
        </section>

        {/* Trust/Features Section */}
        <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="text-center max-w-3xl mx-auto mb-12 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose NatureStay?</h2>
            <p className="text-slate-500 text-lg">We verify every property to ensure your safety and comfort</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="text-center group">
              <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">100% Verified Stays</h3>
              <p className="text-slate-500 leading-relaxed">Every homestay is physically verified by our team for safety, hygiene, and authenticity.</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Curated Experiences</h3>
              <p className="text-slate-500 leading-relaxed">Book local activities like coffee plantation tours, river rafting, and trekking directly.</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TreePine className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Eco-Friendly</h3>
              <p className="text-slate-500 leading-relaxed">We promote sustainable tourism that benefits local communities and preserves nature.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
