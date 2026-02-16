"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { consumerApi, IPackage, IRoom } from "@/services/consumerApi";
import { Loader2, ArrowLeft, Calendar, CheckCircle, Info, Users, BedDouble } from "lucide-react";
import Image from "next/image";
import { format, addDays } from "date-fns";

export default function PackageDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [pkg, setPkg] = useState<IPackage | null>(null);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [guestCount, setGuestCount] = useState<number>(1);
    const [availabilityError, setAvailabilityError] = useState<string | null>(null);


    useEffect(() => {
        // Fix hydration mismatch by setting date on client side
        if (!startDate) {
            setStartDate(format(new Date(), 'yyyy-MM-dd'));
        }
    }, [startDate]);

    const fetchPackage = useCallback(async () => {
        if (!startDate) return; // Wait for initial date
        try {
            const data = await consumerApi.getPackageById(id, startDate);
            setPkg(data);

            // Initialize guest count only if not already set (or reset when data changes)
            setGuestCount(prev => prev === 1 ? data.minPersons : Math.max(data.minPersons, Math.min(prev, data.remainingSlots)));

            // Fetch property rooms to allow selection
            if (rooms.length === 0 && data.propertyId?._id) {
                const roomsData = await consumerApi.getPropertyRooms(data.propertyId._id);
                // Filter rooms matching package room types
                const filteredRooms = roomsData.filter((r: IRoom) =>
                    data.roomTypes.some((type: string) => r.roomType.toLowerCase().includes(type.toLowerCase()))
                );

                const finalRooms = filteredRooms.length > 0 ? filteredRooms : roomsData;
                setRooms(finalRooms);

                if (finalRooms.length > 0) {
                    setSelectedRoomId(finalRooms[0]._id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch package", error);
        } finally {
            setLoading(false);
        }
    }, [id, startDate, rooms.length]);

    useEffect(() => {
        if (id && startDate) fetchPackage();
    }, [id, startDate, fetchPackage]);

    const handleBookNow = async () => {
        if (!selectedRoomId || !startDate || !pkg) {
            setAvailabilityError("Please select a room and start date to proceed.");
            return;
        }

        setAvailabilityError(null);
        setBookingLoading(true);
        try {
            const endDate = addDays(new Date(startDate), pkg.numberOfNights);
            const availabilityData = await consumerApi.checkRoomAvailability(
                selectedRoomId,
                new Date(startDate).toISOString(),
                endDate.toISOString()
            );

            // The API returns { calendar: [{isBlocked: boolean, ...}] }
            const isAnyDayBlocked = availabilityData?.calendar?.some((day: { isBlocked: boolean }) => day.isBlocked);

            if (isAnyDayBlocked) {
                setAvailabilityError("Sorry, these dates are no longer available for the selected room because someone else has already booked them. Please try different dates.");
                return;
            }

            const query = new URLSearchParams({
                propertyId: pkg.propertyId._id,
                roomId: selectedRoomId,
                startDate: new Date(startDate).toISOString(),
                endDate: endDate.toISOString(),
                guests: guestCount.toString(),
                packageId: pkg._id
            }).toString();

            router.push(`/checkout?${query}`);
        } catch (error) {
            console.error("Availability check failed", error);
            setAvailabilityError("Unable to verify availability right now. Please try again or refresh the page.");
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!pkg) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Package Not Found</h1>
                <button
                    onClick={() => router.back()}
                    className="text-emerald-600 font-medium hover:underline"
                >
                    &larr; Go Back
                </button>
            </div>
        );
    }

    const totalPrice = pkg.packagePricePerPerson * guestCount;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-6 max-w-6xl">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold transition-all"
                >
                    <ArrowLeft className="h-5 w-5" /> Back to Stay
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
                            {/* Image Section */}
                            <div className="h-[400px] relative bg-slate-200">
                                {pkg.images && pkg.images.length > 0 ? (
                                    <Image
                                        src={pkg.images[0]}
                                        alt={pkg.packageName}
                                        fill
                                        priority
                                        loading="eager"
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                        <span className="text-3xl font-black opacity-30">Package Offer</span>
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                    <span className="bg-emerald-500 text-white px-5 py-2 rounded-full text-sm font-black shadow-lg">
                                        {pkg.numberOfNights} Nights • {pkg.numberOfNights + 1} Days
                                    </span>
                                    {pkg.remainingSlots === 0 ? (
                                        <span className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-black shadow-lg animate-pulse">
                                            Sold Out for these dates
                                        </span>
                                    ) : (
                                        <span className="bg-amber-500 text-white px-5 py-2 rounded-full text-sm font-black shadow-lg">
                                            {pkg.remainingSlots} Slots {pkg.remainingSlots < pkg.maxPersons ? 'Left' : 'Available'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 lg:p-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900">{pkg.packageName}</h1>
                                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                                        <span>Best Value Deal</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 mb-10">
                                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                                        <Users className="h-4 w-4 text-indigo-500" />
                                        <span className="text-sm font-bold">Min {pkg.minPersons} - Max {pkg.maxPersons} Guests</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                                        <Calendar className="h-4 w-4 text-emerald-500" />
                                        <span className="text-sm font-bold">Valid until {new Date(pkg.validUntil).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <section>
                                        <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                                            <Info className="h-5 w-5 text-indigo-500" />
                                            About this Package
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed text-lg font-medium">
                                            {pkg.description}
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-xl font-black text-slate-900 mb-4">What&apos;s Included</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                <BedDouble className="h-6 w-6 text-emerald-500 mt-0.5" />
                                                <div>
                                                    <p className="font-black text-slate-900">Accommodation</p>
                                                    <p className="text-sm text-slate-600 font-medium">{pkg.numberOfNights} Nights in {pkg.roomTypes.join(' or ')}</p>
                                                </div>
                                            </div>

                                            {pkg.mealPlanId && (
                                                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                                    <div className="h-6 w-6 text-amber-500 mt-0.5 text-xl font-bold">🍴</div>
                                                    <div>
                                                        <p className="font-black text-slate-900">Meal Plan</p>
                                                        <p className="text-sm text-slate-600 font-medium">{pkg.mealPlanId.name || 'All meals included'}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {pkg.includedActivities && pkg.includedActivities.length > 0 && (
                                                <div className="md:col-span-2 flex items-start gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                    <div className="h-6 w-6 text-indigo-500 mt-0.5 text-xl font-bold">🏔️</div>
                                                    <div>
                                                        <p className="font-black text-slate-900">Included Activities</p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {pkg.includedActivities.map((act, idx: number) => (
                                                                <span key={idx} className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100 shadow-sm">
                                                                    {act.activityId?.name || 'Activity'}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8">
                            <h3 className="text-2xl font-black text-slate-900 mb-6">Book Package</h3>

                            <div className="space-y-6">
                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2">Check-in Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => {
                                                setStartDate(e.target.value);
                                                setAvailabilityError(null);
                                            }}
                                            min={format(new Date(), 'yyyy-MM-dd')}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-slate-400 font-bold">
                                        Stay duration: {pkg.numberOfNights} Nights
                                    </p>
                                </div>

                                {/* Guest Count */}
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2">Number of Guests</label>
                                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border-2 border-slate-100">
                                        <button
                                            onClick={() => {
                                                setGuestCount(Math.max(pkg.minPersons, guestCount - 1));
                                                setAvailabilityError(null);
                                            }}
                                            className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-2xl font-black text-slate-600 hover:text-emerald-500 hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                                            disabled={guestCount <= pkg.minPersons}
                                        >
                                            -
                                        </button>
                                        <div className="flex-1 text-center">
                                            <span className="text-xl font-black text-slate-900">{guestCount}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setGuestCount(Math.min(pkg.remainingSlots || pkg.maxPersons, guestCount + 1));
                                                setAvailabilityError(null);
                                            }}
                                            className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-2xl font-black text-slate-600 hover:text-emerald-500 hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                                            disabled={guestCount >= (pkg.remainingSlots || pkg.maxPersons)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                                        <span>Capacity: {pkg.minPersons} - {pkg.maxPersons} Guests</span>
                                        <span className={`${pkg.remainingSlots === 0 ? 'text-red-500' : 'text-emerald-600'} font-black`}>
                                            {pkg.remainingSlots} {pkg.remainingSlots === 0 ? 'SLOTS LEFT' : (pkg.remainingSlots < pkg.maxPersons ? 'SLOTS LEFT' : 'SLOTS AVAILABLE')}
                                        </span>
                                    </p>
                                </div>

                                {/* Room Type Info (Selection no longer required per user request) */}
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2">Room Included</label>
                                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                                <BedDouble size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Accommodation</p>
                                                <p className="text-sm font-black text-slate-900 capitalize">
                                                    {pkg.roomTypes && pkg.roomTypes.length > 0 ? pkg.roomTypes.join(' or ') : 'Standard'} Room
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded-lg uppercase">
                                            Included
                                        </div>
                                    </div>
                                    {rooms.length === 0 && !loading && (
                                        <p className="mt-2 text-[10px] text-red-500 font-bold italic">
                                            * No suitable rooms currently available for this package.
                                        </p>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex justify-between items-baseline mb-4">
                                        <span className="text-slate-500 font-bold">Total Price</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-emerald-600 block">₹{totalPrice}</span>
                                            <span className="text-xs text-slate-400 font-bold uppercase">Incl. all inclusions</span>
                                        </div>
                                    </div>

                                    {availabilityError && (
                                        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-shake">
                                            <Info className="text-red-500 shrink-0 mt-0.5" size={18} />
                                            <p className="text-xs font-bold text-red-600 leading-relaxed">
                                                {availabilityError}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleBookNow}
                                        disabled={!selectedRoomId || bookingLoading || pkg.remainingSlots === 0}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        {bookingLoading ? (
                                            <Loader2 className="animate-spin h-6 w-6" />
                                        ) : pkg.remainingSlots === 0 ? (
                                            "Sold Out for these dates"
                                        ) : (
                                            "Book Package Now"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
