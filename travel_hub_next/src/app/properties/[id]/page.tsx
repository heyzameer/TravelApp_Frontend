"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, ShieldCheck, Users, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { consumerApi } from "@/services/consumerApi";
import { RoomList } from "@/components/properties/RoomList";
import { AvailabilityCalendar } from "@/components/properties/AvailabilityCalendar";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import Image from "next/image";

const Map = dynamic(() => import("@/components/shared/MapComponent"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function PropertyDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
    const [guestCount, setGuestCount] = useState(2);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

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

    const handleDateSelect = (start: Date, end: Date) => {
        setDateRange({ start, end });
    };

    const handleReserve = () => {
        if (!selectedRoom || !dateRange) return;

        // Validate guest count against room capacity
        if (guestCount > selectedRoom.maxOccupancy) {
            alert(`This room can accommodate a maximum of ${selectedRoom.maxOccupancy} guests`);
            return;
        }

        // Serialize booking data to query params or robust state management (Context/Zustand)
        // For simplicity using query params for now
        const query = new URLSearchParams({
            propertyId: id,
            roomId: selectedRoom._id,
            startDate: dateRange.start.toISOString(),
            endDate: dateRange.end.toISOString(),
            guests: guestCount.toString()
        }).toString();

        router.push(`/checkout?${query}`);
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
    const totalPrice = selectedRoom && dateRange
        ? selectedRoom.basePricePerNight * Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

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
                </div>

                {/* Gallery */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
                    <div className="lg:col-span-2 h-[400px] md:h-[500px] overflow-hidden rounded-3xl relative shadow-sm hover:shadow-lg transition-shadow">
                        <Image
                            src={images[selectedImage]?.url || property.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                            className="object-cover"
                            alt={property.propertyName || 'Property image'}
                            fill
                            priority
                        />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 h-[400px] md:h-[500px]">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(images.length > 0 ? images.slice(0, 2) : [1, 2]).map((img: any, idx: number) => (
                            <div
                                key={idx}
                                className={`h-full overflow-hidden rounded-3xl cursor-pointer relative group ${selectedImage === idx ? 'ring-4 ring-emerald-500' : ''}`}
                                onClick={() => setSelectedImage(idx)}
                            >
                                <Image
                                    src={img?.url || property.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                                    className="object-cover group-hover:opacity-80 transition-opacity"
                                    alt="Gallery image"
                                    fill
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
                                        disabled={!dateRange}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg mb-4 active:scale-95"
                                    >
                                        Reserve Stay
                                    </button>

                                    {dateRange && (
                                        <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
                                            <div className="flex justify-between text-slate-600 font-medium">
                                                <span>₹{selectedRoom.basePricePerNight} x {Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))} nights</span>
                                                <span>₹{totalPrice}</span>
                                            </div>
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
                        disabled={!selectedRoom || !dateRange}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                    >
                        Reserve
                    </button>
                </div>
            </div>
        </div>
    );
}
