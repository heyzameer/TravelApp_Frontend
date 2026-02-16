'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { consumerApi, IProperty, IRoom, IPackage, IBooking, IBookingPriceResponse } from '@/services/consumerApi';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CreditCard, ArrowLeft, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format, differenceInDays, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

// Define Razorpay types for better type safety
interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
    prefill: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme: {
        color: string;
    };
    modal: {
        ondismiss: () => void;
    };
}

interface RazorpayInstance {
    open: () => void;
    on: (event: string, callback: (response: unknown) => void) => void;
}

declare global {
    interface Window {
        Razorpay: {
            new(options: RazorpayOptions): RazorpayInstance;
        };
    }
}

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
    const packageId = searchParams.get('packageId');

    // State
    const [property, setProperty] = useState<IProperty | null>(null);
    const [room, setRoom] = useState<IRoom | null>(null);
    const [pkg, setPkg] = useState<IPackage | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingProcessing, setBookingProcessing] = useState(false);

    const [priceDetails, setPriceDetails] = useState<IBookingPriceResponse | null>(null);
    const [priceLoading, setPriceLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentBooking, setCurrentBooking] = useState<IBooking | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!propertyId || !roomId || !startDateStr || !endDateStr) {
                // If essential params are missing, set error and stop loading
                setError("Missing booking details. Please go back and select your stay again.");
                setLoading(false);
                setPriceLoading(false);
                return;
            }

            setLoading(true);
            setPriceLoading(true); // Set price loading true here as well, as price calculation is part of initial fetch
            setError(null); // Clear previous errors

            try {
                const [propData, roomsData, packageData] = await Promise.all([
                    consumerApi.getPropertyById(propertyId),
                    consumerApi.getPropertyRooms(propertyId),
                    packageId ? consumerApi.getPackageById(packageId) : Promise.resolve(null)
                ]);

                setProperty(propData);
                setPkg(packageData);
                const selectedRoom = (roomsData as IRoom[]).find((r: IRoom) => r._id === roomId);
                setRoom(selectedRoom || null);

                // Calculate price via backend
                const calcData: Record<string, unknown> = {
                    propertyId,
                    checkIn: startDateStr,
                    checkOut: endDateStr,
                    rooms: [{ roomId, guests: parseInt(guestCountStr) }]
                };
                if (packageId) {
                    calcData.packageId = packageId;
                }
                const priceData = await consumerApi.calculateBookingPrice(calcData);
                setPriceDetails(priceData);
            } catch (error: unknown) {
                console.error("Failed to load booking details", error);
                const axiosError = error as AxiosError;
                if (axiosError.response?.status === 409) {
                    setError("Sorry, the selected dates are no longer available because someone else has already booked this stay. Please go back and choose different dates.");
                } else {
                    setError("Failed to load booking details correctly. Please try again or check your connection.");
                }
            } finally {
                setLoading(false);
                setPriceLoading(false);
            }
        };

        fetchData();
    }, [propertyId, roomId, startDateStr, endDateStr, guestCountStr, packageId]); // Added all dependencies used in fetchData

    if (!propertyId || !roomId || !startDateStr || !endDateStr || error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                    <ShieldCheck size={40} className="rotate-180" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">{error?.includes("available") ? 'Dates Not Available' : 'Invalid Details'}</h2>
                <p className="text-gray-500 mb-8 max-w-md">{error || 'The booking details provided are invalid or expired.'}</p>
                <Link
                    href={packageId ? `/packages/${packageId}` : (propertyId ? `/properties/${propertyId}` : '/destinations')}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                >
                    {packageId ? 'Back to Package' : (propertyId ? 'Back to Property' : 'Browse Destinations')}
                </Link>
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

    // Use priceDetails if available, fallback to manual if not (should not happen if backend works)
    const finalAmount = priceDetails?.finalPrice || 0;
    const roomSubtotal = priceDetails?.roomTotal || 0;
    const taxes = priceDetails?.taxes || 0;


    const handleConfirmBooking = async () => {
        if (!property?.partnerId) {
            toast.error("Property partner information missing. Cannot proceed.");
            return;
        }

        setBookingProcessing(true);
        try {
            const bookingData: Record<string, unknown> = {
                propertyId,
                partnerId: property.partnerId,
                checkIn: startDateStr,
                checkOut: endDateStr,
                rooms: [{ roomId, guests: parseInt(guestCountStr) }],
                guestDetails: [
                    {
                        name: user?.fullName || "Guest",
                        age: 25, // Placeholder, ideally from user input
                        gender: "Male" // Placeholder, ideally from user input
                    }
                ]
            };
            if (packageId) {
                bookingData.packageId = packageId;
            }

            // 1. Create Initial Booking (or get existing pending one)
            const bookingResponse = await consumerApi.createBooking(bookingData);
            const booking = bookingResponse.data;
            setCurrentBooking(booking);

            console.log("Booking created/retrieved:", booking._id, "Final Amount:", finalAmount);

            if (!finalAmount || finalAmount <= 0) {
                toast.error("Total amount cannot be zero for this stay. Please check your dates and rooms.");
                setBookingProcessing(false);
                return;
            }

            // 2. Create Razorpay Order
            const orderData = await consumerApi.createPaymentOrder({
                bookingId: booking._id,
                amount: finalAmount
            });

            // 3. Open Razorpay Modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_v2NUX6JjKkQz7n", // Fallback for test
                amount: orderData.amount,
                currency: orderData.currency,
                name: "NatureStay",
                description: `Booking for ${property.propertyName}`,
                order_id: orderData.id,
                handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                    const toastId = toast.loading("Verifying payment...");
                    try {
                        setBookingProcessing(true);
                        // 4. Verify Payment
                        await consumerApi.verifyPayment({
                            bookingId: booking._id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });

                        toast.success("Booking confirmed successfully!", { id: toastId });
                        router.push('/profile/bookings?success=true');
                    } catch (error) {
                        console.error("Payment verification failed", error);
                        toast.error("Payment verification failed. Please contact support.", { id: toastId });
                        router.push('/profile/bookings?error=payment_verification');
                    } finally {
                        setBookingProcessing(false);
                    }
                },
                prefill: {
                    name: user?.fullName,
                    email: user?.email,
                    contact: user?.phone || ""
                },
                theme: {
                    color: "#10b981"
                },
                modal: {
                    ondismiss: function () {
                        setBookingProcessing(false);
                        toast.info("Payment modal closed. Your stay dates are held for 15 minutes.");
                    }
                }
            };

            const Razorpay = window.Razorpay;
            const rzp = new Razorpay(options);
            rzp.open();

        } catch (error: unknown) {
            console.error("Booking failed", error);
            const axiosError = error as AxiosError<{ message?: string }>;
            const errorMessage = axiosError.response?.data?.message || "Failed to initiate booking. Please try again.";
            toast.error(errorMessage);
            setBookingProcessing(false);
        }
    };

    const handleReleaseHold = async () => {
        if (!currentBooking) return;

        try {
            setBookingProcessing(true);
            await consumerApi.cancelBooking(currentBooking.bookingId, "User cancelled during checkout");
            toast.success("Dates released. You can now choose different dates or rooms.");
            setCurrentBooking(null);
        } catch (error) {
            console.error("Failed to release hold", error);
            toast.error("Failed to release hold. It will automatically expire in 15 minutes.");
        } finally {
            setBookingProcessing(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl" suppressHydrationWarning>
            <Link href={packageId ? `/packages/${packageId}` : `/properties/${propertyId}`} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 mb-8 transition-colors group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back
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
                                <input type="text" value={user?.fullName || ''} readOnly className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-bold" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-1">Email</label>
                                <input type="text" value={user?.email || ''} readOnly className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-bold" />
                            </div>
                        </div>
                    </div>

                    {/* Package Info if applicable */}
                    {pkg && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-6">
                            <h2 className="text-lg font-black text-emerald-900 mb-2 flex items-center gap-2">
                                <CheckCircle size={20} className="text-emerald-500" />
                                Special Package Selected
                            </h2>
                            <p className="text-emerald-700 font-medium">{pkg.packageName}</p>
                            <p className="text-emerald-600 text-sm mt-1">{pkg.description?.substring(0, 100)}...</p>
                        </div>
                    )}

                    {/* Payment Placeholder */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6 opacity-75 grayscale-[0.5]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Payment</h2>
                            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">Simulated</span>
                        </div>
                        <div className="p-4 border-2 border-emerald-500 bg-emerald-50/20 rounded-2xl flex items-center justify-between">
                            <span className="font-bold text-slate-800 flex items-center gap-2"><CreditCard size={20} /> Test Card / Payment on Arrival</span>
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
                                    src={(pkg?.images && pkg.images[0]) || property?.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                                    className="object-cover rounded-xl"
                                    alt="Property"
                                    fill
                                    sizes="80px"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mb-1">{pkg ? 'Special Package' : 'Property'}</p>
                                <h3 className="font-bold text-slate-900 leading-tight">{pkg ? pkg.packageName : property?.propertyName}</h3>
                                <p className="text-sm text-gray-500 truncate">{property?.propertyName}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6 pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-slate-900">Your Stay</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Dates</span>
                                <span className="font-bold text-right text-slate-900">{format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')} ({nights} nights)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Room</span>
                                <span className="font-bold text-right text-slate-900 truncate max-w-[150px]">{room?.roomName || room?.roomType}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Guests</span>
                                <span className="font-bold text-right text-slate-900">{guestCountStr} Adults</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8 pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-slate-900">Price Summary</h4>
                            {priceLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between text-sm opacity-90">
                                        <span className="text-slate-600 font-medium">{pkg ? 'Package Total' : 'Room Stay'}</span>
                                        <span className="font-black font-mono">₹{roomSubtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm opacity-90">
                                        <span className="text-slate-600 font-medium">Taxes & Fees (12%)</span>
                                        <span className="font-black font-mono">₹{taxes}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-100 mb-8">
                            <div className="flex justify-between items-center text-xl font-black">
                                <span>Total</span>
                                <span className="text-emerald-600">₹{finalAmount}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmBooking}
                            disabled={bookingProcessing || priceLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-xl transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {bookingProcessing ? <Loader2 className="animate-spin" /> : (currentBooking ? 'Retry Payment' : 'Confirm Booking')}
                        </button>

                        {currentBooking && !bookingProcessing && (
                            <button
                                onClick={handleReleaseHold}
                                className="w-full mt-4 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2 underline underline-offset-4"
                            >
                                Release hold and choose other dates
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <ProtectedRoute>
            <div className="pt-24 pb-12 bg-slate-50 min-h-screen font-sans" suppressHydrationWarning>
                <Suspense fallback={<div className="flex justify-center py-20" suppressHydrationWarning><Loader2 className="animate-spin" /></div>}>
                    <CheckoutContent />
                </Suspense>
            </div>
        </ProtectedRoute>
    );
}
