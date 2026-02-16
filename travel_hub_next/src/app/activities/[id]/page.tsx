"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { consumerApi, IActivity } from "@/services/consumerApi";
import { Loader2, Clock, Users, ArrowLeft, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ActivityDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [activity, setActivity] = useState<IActivity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const data = await consumerApi.getActivityById(id);
                setActivity(data);
            } catch (error) {
                console.error("Failed to fetch activity", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchActivity();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Activity Not Found</h1>
                <button
                    onClick={() => router.back()}
                    className="text-emerald-500 hover:underline font-bold"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-medium"
                >
                    <ArrowLeft className="h-5 w-5" /> Back
                </button>

                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
                    <div className="relative h-[400px] w-full bg-slate-200">
                        <Image
                            src={activity.images?.[0] || 'https://images.unsplash.com/photo-1533929736458-ca588d080e81?q=80&w=2070&auto=format&fit=crop'}
                            alt={activity.name}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-emerald-700 shadow-sm">
                            ₹{activity.pricePerPerson} / person
                        </div>
                        {activity.category && (
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium text-sm">
                                {activity.category}
                            </div>
                        )}
                    </div>

                    <div className="p-8 md:p-10">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">{activity.name}</h1>

                        <div className="flex flex-wrap gap-6 mb-8 text-slate-600 font-medium">
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                <Clock className="h-5 w-5 text-emerald-500" />
                                {activity.duration} minutes
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                <Users className="h-5 w-5 text-emerald-500" />
                                Max {activity.maxParticipants} participants
                            </div>
                            {activity.location?.city && (
                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                    <MapPin className="h-5 w-5 text-emerald-500" />
                                    {activity.location.city}
                                </div>
                            )}
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Description</h3>
                            <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                                {activity.description}
                            </p>
                        </div>

                        {activity.availableTimeSlots && activity.availableTimeSlots.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Available Slots</h3>
                                <div className="flex flex-wrap gap-2">
                                    {activity.availableTimeSlots.map((slot: string) => (
                                        <span key={slot} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-sm border border-emerald-100">
                                            {slot}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-10 flex justify-end">
                            {activity.propertyId && typeof activity.propertyId === 'string' && (
                                <Link
                                    href={`/properties/${activity.propertyId}`}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                >
                                    Book at Property
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
