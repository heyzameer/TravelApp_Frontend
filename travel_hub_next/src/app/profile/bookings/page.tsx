'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { consumerApi } from '@/services/consumerApi';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Calendar, MapPin, Loader2, ArrowRight, CheckCircle, Users } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import Image from 'next/image';

export default function MyBookings() {
    const searchParams = useSearchParams();
    const success = searchParams.get('success');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await consumerApi.getUserBookings();
                setBookings(data || []);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <ProtectedRoute>
            <div className="pt-24 pb-12 bg-slate-50 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
                    {/* Success Message */}
                    {success === 'true' && (
                        <div className="mb-8 bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 flex items-start gap-4">
                            <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-xl font-black text-emerald-900 mb-2">Booking Confirmed!</h3>
                                <p className="text-emerald-700 font-medium">
                                    Your reservation has been successfully confirmed. You&apos;ll receive a confirmation email shortly.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-black text-slate-900">My Trips</h1>
                        <Link href="/destinations" className="text-emerald-600 font-bold hover:underline">
                            Explore more
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm">
                            <div className="relative w-48 h-32 mx-auto mb-6">
                                <Image
                                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021"
                                    className="object-cover rounded-2xl opacity-80"
                                    alt="No trips"
                                    fill
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">No trips booked... yet!</h2>
                            <p className="text-gray-500 mb-8 font-medium">Time to dust off those bags and start planning your next adventure.</p>
                            <Link href="/destinations" className="inline-block bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl">
                                Start Exploring
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {bookings.map((booking) => {
                                const checkIn = parseISO(booking.checkInDate);
                                const checkOut = parseISO(booking.checkOutDate);
                                const isPastTrip = isPast(checkOut);

                                return (
                                    <div key={booking._id} className={`bg-white rounded-3xl overflow-hidden border shadow-sm transition-all hover:shadow-md ${isPastTrip ? 'opacity-75 grayscale-[0.3] border-gray-200' : 'border-emerald-100'}`}>
                                        <div className="flex flex-col md:flex-row">
                                            <div className="md:w-64 h-48 md:h-auto relative">
                                                <Image
                                                    src={booking.property?.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                                                    className="object-cover"
                                                    alt={booking.property?.propertyName || 'Property image'}
                                                    fill
                                                />
                                                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.bookingStatus)}`}>
                                                    {booking.bookingStatus}
                                                </div>
                                            </div>
                                            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-xl font-black text-slate-900 line-clamp-1">{booking.property?.propertyName || 'NatureStay Property'}</h3>
                                                        <span className="font-mono font-bold text-slate-900">₹{booking.totalAmount}</span>
                                                    </div>
                                                    <p className="text-gray-500 font-medium flex items-center gap-1 mb-4 text-sm">
                                                        <MapPin size={14} /> {booking.property?.address?.city || 'Location'}, India
                                                    </p>

                                                    <div className="flex flex-wrap gap-4 text-sm">
                                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                                            <Calendar size={16} className="text-emerald-500" />
                                                            <span className="font-bold text-slate-700">
                                                                {format(checkIn, 'MMM dd')} - {format(checkOut, 'MMM dd, yyyy')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                                            <span className="text-gray-400 font-bold text-xs uppercase">Room</span>
                                                            <span className="font-bold text-slate-700">{booking.room?.type || 'Standard'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                                            <Users size={16} className="text-emerald-500" />
                                                            <span className="font-bold text-slate-700">{booking.guestCount || 2} {(booking.guestCount || 2) === 1 ? 'guest' : 'guests'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex justify-end">
                                                    <Link href={`/properties/${booking.property?._id}`} className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                                                        View Property <ArrowRight size={14} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
