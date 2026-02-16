"use client";

import { useEffect, useState } from "react";
import { consumerApi, IProperty } from "@/services/consumerApi";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { Heart, Loader2, Compass } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<IProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const data = await consumerApi.getWishlist();
                setWishlist(data);
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [isAuthenticated]);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 pt-24 pb-12">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-red-50 rounded-3xl">
                            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900">My Wishlist</h1>
                            <p className="text-slate-500 font-medium">Your favorite nature stays, all in one place.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-4" />
                            <p className="text-slate-500 font-bold">Loading your favorites...</p>
                        </div>
                    ) : wishlist.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {wishlist.map((property) => (
                                <PropertyCard key={property._id} property={property} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[40px] p-12 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Compass className="h-12 w-12 text-slate-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your wishlist is empty</h2>
                            <p className="text-slate-500 mb-8 font-medium">Explore beautiful homestays and save them to your wishlist to plan your next adventure.</p>
                            <Link
                                href="/destinations"
                                className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-200"
                            >
                                Start Exploring
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
