"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, ShieldCheck, Share2, Heart, Calendar, Users, Wifi, Coffee, Car, Wind, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getPropertyById } from "@/services/propertyService";
import { getDummyPropertyById } from "@/data/dummyProperties";
import { Property } from "@/types/property";

export default function PropertyDetail() {
    const params = useParams();
    const id = params.id as string;
    const [selectedImage, setSelectedImage] = useState(0);
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProperty = async () => {
            setLoading(true);
            setError('');

            // Try to fetch from API
            const apiProperty = await getPropertyById(id);

            if (apiProperty) {
                setProperty(apiProperty);
            } else {
                // Fallback to dummy property
                const dummyProperty = getDummyPropertyById(id);
                if (dummyProperty) {
                    setProperty(dummyProperty);
                } else {
                    setError('Property not found');
                }
            }

            setLoading(false);
        };

        fetchProperty();
    }, [id]);

    // Helper to get amenity data
    const getAmenityDisplay = (amenity: string | { name: string; icon?: string }) => {
        if (typeof amenity === 'string') {
            return { name: amenity, icon: Wifi };  // default icon
        }
        return { name: amenity.name, icon: Wifi };
    };

    // Helper to get image URL
    const getImageUrl = (img: string | { url: string; caption?: string }, index: number): string => {
        if (typeof img === 'string') return img;
        return img.url;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Property Not Found</h1>
                <p className="text-slate-500 mb-8">The property you're looking for doesn't exist.</p>
                <Link href="/stays" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-hover transition-all">
                    Browse All Stays
                </Link>
            </div>
        );
    }

    const images = property.images || [];
    const amenities = property.amenities || [];
    const rating = property.rating || 4.5;
    const reviewCount = property.reviewCount || 0;

    return (
        <div className="pt-24 pb-12 bg-slate-50 min-h-screen">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> VERIFIED NATURESTAY
                            </span>
                            <div className="flex items-center gap-1 text-slate-500 text-sm">
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                <span className="font-bold text-slate-800">{rating}</span>
                                <span>({reviewCount} reviews)</span>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{property.name}</h1>
                        <p className="text-slate-500 flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> {property.address.city}, {property.address.state}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                            <Share2 className="h-5 w-5 text-slate-600" />
                        </button>
                        <button className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                            <Heart className="h-5 w-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Gallery */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
                    <div className="lg:col-span-2 h-[500px] overflow-hidden rounded-2xl relative shadow-lg">
                        <img src={getImageUrl(images[selectedImage], selectedImage)} className="w-full h-full object-cover transition-all duration-700" alt={property.name} />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 h-[500px]">
                        {images.slice(0, 4).map((img, idx) => (
                            <div
                                key={idx}
                                className={`overflow-hidden rounded-xl cursor-pointer relative group ${selectedImage === idx ? 'ring-4 ring-primary' : ''}`}
                                onClick={() => setSelectedImage(idx)}
                            >
                                <img src={getImageUrl(img, idx)} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" alt={`${property.name} ${idx}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold mb-4 text-slate-800">About this stay</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                {property.description}
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold mb-6 text-slate-800">What this place offers</h2>
                            <div className="grid grid-cols-2 gap-6">
                                {amenities.slice(0, 6).map((item, idx) => {
                                    const amenityData = getAmenityDisplay(item);
                                    return (
                                        <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                            <div className="bg-indigo-50 p-3 rounded-lg text-primary">
                                                <amenityData.icon className="h-6 w-6" />
                                            </div>
                                            <span className="font-semibold text-slate-700">{amenityData.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <span className="text-3xl font-bold text-slate-900">₹{property.basePrice}</span>
                                    <span className="text-slate-400"> / night</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                    {rating}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 border border-slate-200 rounded-xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Check-in</p>
                                        <div className="flex items-center gap-2 text-slate-800 font-bold">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            Add date
                                        </div>
                                    </div>
                                    <div className="p-3 border border-slate-200 rounded-xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Check-out</p>
                                        <div className="flex items-center gap-2 text-slate-800 font-bold">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            Add date
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border border-slate-200 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Guests</p>
                                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                                        <Users className="h-4 w-4 text-primary" />
                                        2 Guests
                                    </div>
                                </div>
                            </div>

                            <Link href="/payment" className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg mb-4 text-center block">
                                Reserve Stay
                            </Link>

                            <p className="text-center text-slate-400 text-sm">
                                You won't be charged yet
                            </p>

                            <div className="mt-8 space-y-4 pt-6 border-t border-slate-100">
                                <div className="flex justify-between text-slate-600 font-medium">
                                    <span>₹{property.basePrice} x 1 night</span>
                                    <span>₹{property.basePrice}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 font-medium">
                                    <span>Service fee</span>
                                    <span>₹0</span>
                                </div>
                                <div className="flex justify-between text-slate-900 font-bold text-xl pt-4 border-t border-slate-100">
                                    <span>Total</span>
                                    <span>₹{property.basePrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
