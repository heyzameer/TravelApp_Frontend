"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, ShieldCheck, Users, Loader2, Compass } from "lucide-react";
import { useState, useEffect } from "react";
import { consumerApi, IProperty, IRoom, IPackage, IMealPlanDetail, IActivityDetail } from "@/services/consumerApi";
import { RoomList } from "@/components/properties/RoomList";
import { AvailabilityCalendar } from "@/components/properties/AvailabilityCalendar";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import Image from "next/image";
import WishlistButton from "@/components/shared/WishlistButton";
import { useAuth } from "@/context/AuthContext";
import bookingService, { Booking } from "@/services/bookingService";
import { ReviewsList } from "@/components/reviews";
import { AxiosError } from "axios";

const Map = dynamic(() => import("@/components/shared/MapComponent"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function PropertyDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [property, setProperty] = useState<IProperty | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
    const [guestCount, setGuestCount] = useState(2);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    const { isAuthenticated } = useAuth();
    const [userBooking, setUserBooking] = useState<Booking | null>(null);

    // New additions for Meal Plans and Activities
    const [selectedMealPlan, setSelectedMealPlan] = useState<string | null>(null);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

    // Group activities by category
    const activityCategories = property?.activities?.reduce((acc: Record<string, IActivityDetail[]>, activity: IActivityDetail) => {
        const category = activity.category || 'Others';
        if (!acc[category]) acc[category] = [];
        acc[category].push(activity);
        return acc;
    }, {} as Record<string, IActivityDetail[]>);


    useEffect(() => {
        const fetchProperty = async () => {
            setLoading(true);
            try {
                const data = await consumerApi.getPropertyById(id);
                setProperty(data);
            } catch (error) {
                console.error("Failed to fetch property", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProperty();
    }, [id]);

    useEffect(() => {
        const checkBooking = async () => {
            if (isAuthenticated && id) {
                try {
                    const bookings = await bookingService.getUserBookings();
                    const booking = bookings.find((b: Booking) =>
                        (typeof b.propertyId === 'object' && b.propertyId._id === id || b.propertyId === id) &&
                        ['completed', 'checked_out'].includes(b.status)
                    );
                    setUserBooking(booking || null);
                } catch (error) {
                    console.error("Failed to check booking status", error);
                }
            }
        };
        checkBooking();
    }, [isAuthenticated, id]);

    const handleDateSelect = (start: Date, end: Date) => {
        setDateRange({ start, end });
    };

    const toggleActivity = (activityId: string) => {
        setSelectedActivities(prev =>
            prev.includes(activityId)
                ? prev.filter(id => id !== activityId)
                : [...prev, activityId]
        );
    };

    const handleReserve = async () => {
        if (!selectedRoom || !dateRange) return;
        setBookingError(null);

        // Validate guest count against room capacity
        if (guestCount > selectedRoom.maxOccupancy) {
            setBookingError(`This room can accommodate a maximum of ${selectedRoom.maxOccupancy} guests`);
            return;
        }

        try {
            setCheckingAvailability(true);
            const calcData = {
                propertyId: id,
                checkIn: dateRange.start.toISOString(),
                checkOut: dateRange.end.toISOString(),
                rooms: [{ roomId: selectedRoom._id, guests: guestCount }],
                mealPlanId: selectedMealPlan,
                activityIds: selectedActivities
            };

            await consumerApi.calculateBookingPrice(calcData);

            const query = new URLSearchParams({
                propertyId: id,
                roomId: selectedRoom._id,
                startDate: dateRange.start.toISOString(),
                endDate: dateRange.end.toISOString(),
                guests: guestCount.toString(),
                ...(selectedMealPlan && { mealPlanId: selectedMealPlan }),
                ...(selectedActivities.length > 0 && { activityIds: selectedActivities.join(',') })
            }).toString();

            router.push(`/checkout?${query}`);
        } catch (error: unknown) {
            console.error("Availability check failed", error);
            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 409) {
                setBookingError("Selected dates are not available for this room.");
            } else {
                setBookingError("Unable to verify availability. Please try again.");
            }
        } finally {
            setCheckingAvailability(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Property Not Found</h1>
                <Link href="/destinations" className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all">
                    Browse Destinations
                </Link>
            </div>
        );
    }

    const images = property.images || [];
    const nights = dateRange ? Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    let totalPrice = 0;
    if (selectedRoom && dateRange) {
        totalPrice += selectedRoom.basePricePerNight * nights;

        // Add Meal Plan
        if (selectedMealPlan && property.mealPlans) {
            const plan = property.mealPlans.find((p: IMealPlanDetail) => p._id === selectedMealPlan);
            if (plan) {
                totalPrice += plan.pricePerPersonPerDay * guestCount * nights;
            }
        }

        // Add Activities
        if (selectedActivities.length > 0 && property.activities) {
            selectedActivities.forEach(aid => {
                const act = property.activities?.find((a: IActivityDetail) => a._id === aid);
                if (act) {
                    totalPrice += act.pricePerPerson * guestCount; // Assuming per person price
                }
            });
        }
    }

    return (
        <div className="pt-24 pb-12 bg-slate-50 min-h-screen">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {property.isVerified && (
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" /> VERIFIED NATURESTAY
                                </span>
                            )}
                            <div className="flex items-center gap-1 text-slate-500 text-sm">
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                <span className="font-bold text-slate-800">{property.averageRating || 'New'}</span>
                                <span>({property.totalReviews || 0} reviews)</span>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2">{property.propertyName}</h1>
                        <p className="text-slate-500 flex items-center gap-1 font-medium">
                            <MapPin className="h-4 w-4" /> {property.address.city}, {property.address.state}
                        </p>
                    </div>
                    <WishlistButton
                        propertyId={id}
                        size={28}
                        variant="solid"
                        className="p-4 bg-white rounded-3xl border-2 border-slate-100 hover:border-red-100 hover:bg-red-50/30 shadow-sm"
                    />
                </div>

                {/* Gallery */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
                    <div className="lg:col-span-2 h-[400px] md:h-[500px] overflow-hidden rounded-3xl relative shadow-sm hover:shadow-lg transition-shadow">
                        <Image
                            src={(images[selectedImage]?.url && images[selectedImage]?.url.length > 5) ? images[selectedImage].url : (property.coverImage && property.coverImage.length > 5 ? property.coverImage : 'https://images.unsplash.com/photo-1566073771259-6a8506099945')}
                            className="object-cover"
                            alt={property.propertyName || 'Property image'}
                            fill
                            priority
                            loading="eager"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 1000px"
                            suppressHydrationWarning
                        />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 h-[400px] md:h-[500px]">
                        {(images.length > 0 ? images.slice(0, 2) : [{ url: '' }, { url: '' }]).map((img, idx: number) => (
                            <div
                                key={idx}
                                className={`h-full overflow-hidden rounded-3xl cursor-pointer relative group ${selectedImage === idx ? 'ring-4 ring-emerald-500' : ''}`}
                                onClick={() => setSelectedImage(idx)}
                            >
                                <Image
                                    src={(img?.url && img.url.length > 5) ? img.url : (property.coverImage && property.coverImage.length > 5 ? property.coverImage : 'https://images.unsplash.com/photo-1566073771259-6a8506099945')}
                                    className="object-cover group-hover:opacity-80 transition-opacity"
                                    alt="Gallery image"
                                    fill
                                    priority
                                    loading="eager"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    suppressHydrationWarning
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-black mb-4 text-slate-900">About this stay</h2>
                            <p className="text-slate-600 leading-relaxed text-lg font-medium">
                                {property.description}
                            </p>
                        </section>

                        {/* Packages Section */}
                        {property.packages && property.packages.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-black mb-6 text-slate-900">Exclusive Packages</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {property.packages.map((pkg: IPackage) => (
                                        <div key={pkg._id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all bg-white relative overflow-hidden group">
                                            {/* Package Image */}
                                            {pkg.images && pkg.images.length > 0 ? (
                                                <div className="h-48 mb-4 rounded-xl overflow-hidden relative">
                                                    <Image
                                                        src={pkg.images && pkg.images[0] && pkg.images[0].length > 5 ? pkg.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                                                        alt={pkg.packageName}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        loading="eager"
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                        suppressHydrationWarning
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-48 mb-4 rounded-xl overflow-hidden relative bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                                                    <span className="font-extrabold text-2xl opacity-50">Package</span>
                                                </div>
                                            )}

                                            <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.packageName}</h3>
                                            <p className="text-slate-600 mb-4 line-clamp-2 text-sm">{pkg.description}</p>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                                                    {pkg.numberOfNights} Nights
                                                </span>
                                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                                                    Min {pkg.minPersons} Persons
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                                                <div>
                                                    <span className="text-2xl font-black text-emerald-600">₹{pkg.packagePricePerPerson}</span>
                                                    <span className="text-xs text-slate-500 font-bold"> / person</span>
                                                </div>
                                                <Link
                                                    href={`/packages/${pkg._id}`}
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Location Section */}
                        <section>
                            <h2 className="text-2xl font-black mb-6 text-slate-900">Where you&apos;ll be</h2>
                            {property.location?.coordinates ? (
                                <Map
                                    latitude={property.location.coordinates[1]}
                                    longitude={property.location.coordinates[0]}
                                    popupText={property.propertyName}
                                />
                            ) : (
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                    <p className="text-slate-500 font-medium flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-slate-400" />
                                        Map view not available for this property
                                    </p>
                                </div>
                            )}
                            <div className="mt-4 text-slate-600 font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-emerald-500" />
                                {property.address.street}, {property.address.city}, {property.address.state}, {property.address.country} {property.address.postalCode}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black mb-6 text-slate-900">Choose your room</h2>
                            <RoomList
                                propertyId={id}
                                onRoomSelect={setSelectedRoom}
                                selectedRoomId={selectedRoom?._id}
                            />
                        </section>

                        {selectedRoom && (
                            <section>
                                <h2 className="text-2xl font-black mb-6 text-slate-900">Check availability</h2>
                                <AvailabilityCalendar
                                    roomId={selectedRoom._id}
                                    onDateSelect={handleDateSelect}
                                />
                            </section>
                        )}

                        {selectedRoom && property.mealPlans && property.mealPlans.length > 0 && (
                            <section className="pt-8 border-t border-slate-200">
                                <h2 className="text-2xl font-black mb-6 text-slate-900">Add Meal Plans</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {property.mealPlans.map((plan: IMealPlanDetail) => (
                                        <div
                                            key={plan._id}
                                            onClick={() => setSelectedMealPlan(selectedMealPlan === plan._id ? null : plan._id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedMealPlan === plan._id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-slate-900">{plan.name}</h3>
                                                <span className="font-bold text-emerald-600">₹{plan.pricePerPersonPerDay}/day</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-2">{plan.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {plan.mealsIncluded.map((meal: string) => (
                                                    <span key={meal} className="bg-white px-2 py-1 rounded text-xs font-medium border border-slate-200 text-slate-600">
                                                        {meal}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {selectedRoom && Object.keys(activityCategories || {}).length > 0 && (
                            <section className="pt-8 border-t border-slate-200">
                                <h2 className="text-2xl font-black mb-6 text-slate-900">Add Activities</h2>
                                {Object.entries(activityCategories || {}).map(([category, activities]) => (
                                    <div key={category} className="mb-8 last:mb-0">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <Compass className="h-5 w-5 text-emerald-500" />
                                            {category}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activities.map((activity: IActivityDetail) => (
                                                <div
                                                    key={activity._id}
                                                    onClick={() => toggleActivity(activity._id)}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedActivities.includes(activity._id) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-slate-900">{activity.name}</h4>
                                                        <span className="font-bold text-emerald-600">₹{activity.pricePerPerson}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{activity.description}</p>
                                                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                                        <span>{activity.duration} mins</span>
                                                        <Link href={`/activities/${activity._id}`} target="_blank" className="text-emerald-500 hover:underline" onClick={(e) => e.stopPropagation()}>View Details</Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Reviews Section */}
                        <section className="pt-8 border-t border-slate-200">
                            <ReviewsList
                                propertyId={id}
                                propertyName={property.propertyName}
                                userHasCompletedBooking={isAuthenticated}
                                bookingId={userBooking?._id}
                            />
                        </section>
                    </div>

                    {/* Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8">
                            {!selectedRoom ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-500 font-bold">Select a room to see pricing</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <span className="text-3xl font-black text-slate-900">₹{selectedRoom.basePricePerNight}</span>
                                            <span className="text-slate-400 font-medium"> / night</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50">
                                            <div className="flex justify-between text-sm font-bold text-slate-700">
                                                <span>Check-in</span>
                                                <span>{dateRange ? format(dateRange.start, 'MMM dd, yyyy') : 'Select Date'}</span>
                                            </div>
                                            <div className="w-full h-px bg-slate-200 my-2"></div>
                                            <div className="flex justify-between text-sm font-bold text-slate-700">
                                                <span>Check-out</span>
                                                <span>{dateRange ? format(dateRange.end, 'MMM dd, yyyy') : 'Select Date'}</span>
                                            </div>
                                        </div>

                                        {/* Guest Count Selector */}
                                        <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50">
                                            <label className="block text-sm font-bold text-slate-700 mb-3">Number of Guests</label>
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                                    className="w-10 h-10 rounded-xl bg-white border-2 border-slate-200 hover:border-emerald-500 font-bold text-slate-700 transition-all active:scale-95"
                                                >
                                                    -
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-5 w-5 text-slate-500" />
                                                    <span className="text-xl font-black text-slate-900">{guestCount}</span>
                                                    <span className="text-sm text-slate-500">
                                                        {guestCount === 1 ? 'guest' : 'guests'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setGuestCount(Math.min(selectedRoom?.maxOccupancy || 10, guestCount + 1))}
                                                    className="w-10 h-10 rounded-xl bg-white border-2 border-slate-200 hover:border-emerald-500 font-bold text-slate-700 transition-all active:scale-95"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            {selectedRoom && guestCount > selectedRoom.maxOccupancy && (
                                                <p className="text-xs text-red-500 mt-2 font-medium">
                                                    This room can accommodate max {selectedRoom.maxOccupancy} guests
                                                </p>
                                            )}
                                            {selectedRoom && (
                                                <p className="text-xs text-slate-500 mt-2">
                                                    Max capacity: {selectedRoom.maxOccupancy} guests
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleReserve}
                                        disabled={!dateRange || checkingAvailability}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg mb-4 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {checkingAvailability ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" /> Verifying...
                                            </>
                                        ) : (
                                            'Reserve Stay'
                                        )}
                                    </button>

                                    {bookingError && (
                                        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-pulse">
                                            {bookingError}
                                        </div>
                                    )}

                                    {dateRange && (
                                        <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
                                            <div className="flex justify-between text-slate-600 font-medium">
                                                <span>Room Stay ({nights} nights)</span>
                                                <span>₹{selectedRoom.basePricePerNight * nights}</span>
                                            </div>

                                            {selectedMealPlan && property.mealPlans && (
                                                <div className="flex justify-between text-slate-600 font-medium">
                                                    <span>Meal Plan</span>
                                                    <span>₹{(property.mealPlans.find((p: IMealPlanDetail) => p._id === selectedMealPlan)?.pricePerPersonPerDay || 0) * guestCount * nights}</span>
                                                </div>
                                            )}

                                            {selectedActivities.length > 0 && property.activities && (
                                                <div className="flex justify-between text-slate-600 font-medium">
                                                    <span>Activities ({selectedActivities.length})</span>
                                                    <span>₹{selectedActivities.reduce((acc, aid) => {
                                                        const act = property.activities?.find((a: IActivityDetail) => a._id === aid);
                                                        return acc + (act?.pricePerPerson || 0) * guestCount;
                                                    }, 0)}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between text-slate-900 font-black text-xl pt-4 border-t border-slate-100">
                                                <span>Total</span>
                                                <span>₹{totalPrice}</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Booking Bar */}
            {/* Mobile Sticky Booking Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40 pb-safe">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div>
                        {selectedRoom ? (
                            <>
                                <span className="font-bold text-slate-900 text-lg">₹{selectedRoom.basePricePerNight}</span>
                                <span className="text-slate-500 text-sm"> / night</span>
                            </>
                        ) : (
                            <span className="font-bold text-slate-900 text-lg">Select Room</span>
                        )}
                        <div className="text-xs text-slate-500 font-medium">
                            {dateRange ? `${format(dateRange.start, 'MMM dd')} - ${format(dateRange.end, 'MMM dd')}` : 'Add dates'}
                        </div>
                    </div>
                    <button
                        onClick={handleReserve}
                        disabled={!selectedRoom || !dateRange || checkingAvailability}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        {checkingAvailability ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reserve'}
                    </button>
                </div>
                {bookingError && (
                    <div className="mt-2 text-[10px] font-bold text-red-500 text-center">
                        {bookingError}
                    </div>
                )}
            </div>
        </div>
    );
}
