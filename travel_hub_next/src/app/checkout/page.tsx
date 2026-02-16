'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { consumerApi } from '@/services/consumerApi';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format, differenceInDays, parseISO } from 'date-fns';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    // Booking params
    const propertyId = searchParams.get('propertyId');
    const roomId = searchParams.get('roomId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const guestCountStr = searchParams.get('guests') || '2';

    // State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bookingProcessing, setBookingProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!propertyId || !roomId || !startDateStr || !endDateStr) {
                // Invalid params
                return;
            }

            try {
                // Fetch property and search for the specific room in it
                // Ideally backend provides an endpoint to get room details directly or we filter
                // Leveraging getPropertyById and getPropertyRooms for now
                const [propData, roomsData] = await Promise.all([
                    consumerApi.getPropertyById(propertyId),
                    consumerApi.getPropertyRooms(propertyId)
                ]);

                setProperty(propData);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const selectedRoom = roomsData.find((r: any) => r._id === roomId);
                setRoom(selectedRoom);
            } catch (error) {
                console.error("Failed to load booking details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [propertyId, roomId, startDateStr, endDateStr]);

    if (!propertyId || !roomId || !startDateStr || !endDateStr) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <p className="text-gray-500 mb-4">Invalid booking details.</p>
                <Link href="/destinations" className="text-emerald-500 font-bold hover:underline">Go Home</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
        );
    }

    const startDate = parseISO(startDateStr!);
    const endDate = parseISO(endDateStr!);
    const nights = differenceInDays(endDate, startDate);
    const pricePerNight = room?.price || 0;
    const totalAmount = pricePerNight * nights;

    const handleConfirmBooking = async () => {
        setBookingProcessing(true);
        try {
            await consumerApi.createBooking({
                propertyId,
                roomId,
                checkInDate: startDateStr,
                checkOutDate: endDateStr,
                totalAmount,
                guestCount: parseInt(guestCountStr)
            });

            // Redirect to success or profile bookings
            router.push('/profile/bookings?success=true');
        } catch (error) {
            console.error("Booking failed", error);
            alert("Failed to confirm booking. Please try again.");
        } finally {
            setBookingProcessing(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <Link href={`/properties/${propertyId}`} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 mb-8 transition-colors group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Property
            </Link>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-8">Confirm and Pay</h1>

                    {/* Guest Details */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Your Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-1">Full Name</label>
                                <input type="text" value={user?.fullName || ''} readOnly className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-1">Email</label>
                                <input type="text" value={user?.email || ''} readOnly className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700" />
                            </div>
                        </div>
                    </div>

                    {/* Payment Placeholder */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6 opacity-75 grayscale-[0.5]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Payment</h2>
                            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">Simulated</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-4">Since this is a demo, no actual payment is required.</p>
                        <div className="p-4 border-2 border-emerald-500 bg-emerald-50/20 rounded-2xl flex items-center justify-between">
                            <span className="font-bold text-slate-800 flex items-center gap-2"><CreditCard size={20} /> Pay at Property / Test Card</span>
                            <div className="h-5 w-5 rounded-full border-4 border-emerald-500 bg-white" />
                        </div>
                    </div>
                </div>

                {/* Booking Summary */}
                <div className="w-full lg:w-96">
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl sticky top-28">
                        <div className="flex gap-4 mb-6">
                            <div className="relative w-20 h-20 shrink-0">
                                <Image
                                    src={property?.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                                    className="object-cover rounded-xl"
                                    alt="Property"
                                    fill
                                />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Property</p>
                                <h3 className="font-bold text-slate-900 leading-tight">{property?.propertyName}</h3>
                                <p className="text-sm text-gray-500 truncate">{property?.address?.city}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6 pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-slate-900">Your Trip</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Dates</span>
                                <span className="font-medium text-right">{format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Guests</span>
                                <span className="font-medium text-right">{guestCountStr} {parseInt(guestCountStr) === 1 ? 'guest' : 'guests'}</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8 pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-slate-900">Price Details</h4>
                            <div className="flex justify-between text-sm opacity-90">
                                <span className="text-slate-600">₹{pricePerNight} x {nights} nights</span>
                                <span className="font-bold font-mono">₹{totalAmount}</span>
                            </div>
                            <div className="flex justify-between text-sm opacity-90">
                                <span className="text-slate-600">Service Fee</span>
                                <span className="font-bold font-mono">₹0</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 mb-8">
                            <div className="flex justify-between items-center text-xl font-black">
                                <span>Total</span>
                                <span className="text-emerald-600">₹{totalAmount}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmBooking}
                            disabled={bookingProcessing}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {bookingProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <ProtectedRoute>
            <div className="pt-24 pb-12 bg-slate-50 min-h-screen font-sans">
                <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>}>
                    <CheckoutContent />
                </Suspense>
            </div>
        </ProtectedRoute>
    );
}
