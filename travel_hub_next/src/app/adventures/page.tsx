"use client";

import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, ArrowRight, TreePine, Mountain, Waves, Bike } from 'lucide-react';
import Image from 'next/image';

const CATEGORIES = [
    { name: 'Trekking', icon: Mountain, color: 'bg-amber-100 text-amber-600' },
    { name: 'Water Sports', icon: Waves, color: 'bg-blue-100 text-blue-600' },
    { name: 'Cycling', icon: Bike, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Nature Walk', icon: TreePine, color: 'bg-lime-100 text-lime-600' },
];

const FEATURED_ADVENTURES = [
    {
        id: '1',
        name: 'Misty Mountain Trek',
        location: 'Munnar, Kerala',
        duration: '4-6 hours',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        category: 'Trekking'
    },
    {
        id: '2',
        name: 'Backwater Kayaking',
        location: 'Alleppey, Kerala',
        duration: '2 hours',
        price: 800,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        category: 'Water Sports'
    },
    {
        id: '3',
        name: 'Forest Trail Cycling',
        location: 'Coorg, Karnataka',
        duration: '3 hours',
        price: 500,
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
        category: 'Cycling'
    }
];

export default function AdventuresPage() {
    return (
        <main className="min-h-screen bg-slate-50 pt-32 pb-20" suppressHydrationWarning>
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Unforgettable Adventures</h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                        Discover the thrill of nature with our handpicked local activities. From intense treks to serene walks, find your perfect escape.
                    </p>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
                    {CATEGORIES.map((cat) => (
                        <div key={cat.name} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                            <div className={`w-12 h-12 ${cat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <cat.icon size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">{cat.name}</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Explore</p>
                        </div>
                    ))}
                </div>

                {/* Featured Adventures */}
                <section className="mb-20">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Popular Adventures</h2>
                            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">Trending this month</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {FEATURED_ADVENTURES.map((adv) => (
                            <div key={adv.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="relative h-64 overflow-hidden bg-slate-100">
                                    <Image
                                        src={adv.image}
                                        alt={adv.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        unoptimized
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-slate-900 shadow-sm" suppressHydrationWarning>
                                        {adv.category}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest mb-3">
                                        <MapPin size={14} /> {adv.location}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{adv.name}</h3>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                            <Clock size={16} /> {adv.duration}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Starting from</p>
                                            <p className="text-xl font-black text-slate-900">₹{adv.price}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Coming Soon / Call to action */}
                <div className="bg-emerald-500 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-emerald-500/20">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-700/20 rounded-full blur-3xl"></div>

                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">Have an Adventure in Mind?</h2>
                    <p className="text-emerald-50 text-lg mb-10 max-w-xl mx-auto font-medium relative z-10">
                        We&apos;re constantly adding new local experiences to our platform. Check back soon for more thrilling adventures!
                    </p>
                    <Link href="/properties" className="bg-white text-emerald-600 px-10 py-4 rounded-full font-black text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 inline-flex items-center gap-2 relative z-10 active:scale-95">
                        Book a Stay <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </main>
    );
}
