import React, { useState } from "react";
import { Check, X as Close, User, Calendar, Package } from "lucide-react";
import { toast } from "react-hot-toast";

const BookingManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState("Pending");

    // Mock data for bookings
    const [bookings, setBookings] = useState([
        {
            id: "BK-78923",
            guestName: "Amit Sharma",
            propertyName: "Sunset Villa",
            checkIn: "15 Jan, 2026",
            checkOut: "18 Jan, 2026",
            amount: "₹12,400",
            status: "Pending",
            guests: 2,
        },
        {
            id: "BK-78924",
            guestName: "Priya Singh",
            propertyName: "Sunset Villa",
            checkIn: "20 Jan, 2026",
            checkOut: "22 Jan, 2026",
            amount: "₹8,000",
            status: "Accepted",
            guests: 1,
        },
        {
            id: "BK-78925",
            guestName: "Rahul Verma",
            propertyName: "Mountain View Cabin",
            checkIn: "10 Feb, 2026",
            checkOut: "15 Feb, 2026",
            amount: "₹25,000",
            status: "Pending",
            guests: 4,
        },
    ]);

    const handleAction = (id: string, action: "Accept" | "Reject") => {
        setBookings((prev) =>
            prev.map((booking) =>
                booking.id === id
                    ? { ...booking, status: action === "Accept" ? "Accepted" : "Rejected" }
                    : booking
            )
        );
        toast.success(`Booking ${action === "Accept" ? "accepted" : "rejected"} successfully!`);
    };

    const filteredBookings = bookings.filter((b) => {
        if (activeTab === "All") return true;
        return b.status === activeTab;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                    {["All", "Pending", "Accepted", "Rejected"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab
                                ? "bg-red-500 text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-red-50 p-3 rounded-lg text-red-500 font-bold">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-gray-900">{booking.id}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${booking.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                                booking.status === "Accepted" ? "bg-green-100 text-green-700" :
                                                    "bg-red-100 text-red-700"
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 font-medium">{booking.propertyName}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 md:max-w-2xl">
                                    <div>
                                        <div className="flex items-center text-gray-400 text-xs mb-1 uppercase font-semibold">
                                            <User size={12} className="mr-1" /> Guest
                                        </div>
                                        <p className="text-sm font-medium text-gray-800">{booking.guestName}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-gray-400 text-xs mb-1 uppercase font-semibold">
                                            <Calendar size={12} className="mr-1" /> Stay
                                        </div>
                                        <p className="text-sm font-medium text-gray-800">{booking.checkIn} - {booking.checkOut}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-gray-400 text-xs mb-1 uppercase font-semibold">
                                            <User size={12} className="mr-1" /> Guests
                                        </div>
                                        <p className="text-sm font-medium text-gray-800">{booking.guests} {booking.guests > 1 ? "People" : "Person"}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-gray-400 text-xs mb-1 uppercase font-semibold">
                                            Amount
                                        </div>
                                        <p className="text-sm font-bold text-red-600">{booking.amount}</p>
                                    </div>
                                </div>

                                {booking.status === "Pending" && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleAction(booking.id, "Accept")}
                                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg shadow-sm transition-colors"
                                            title="Accept Booking"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(booking.id, "Reject")}
                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm transition-colors"
                                            title="Reject Booking"
                                        >
                                            <Close size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <Package size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">No bookings found</h3>
                        <p className="text-gray-400">Try changing your filters or check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingManagement;
