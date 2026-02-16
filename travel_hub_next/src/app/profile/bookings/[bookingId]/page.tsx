'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, IndianRupee, Users, AlertCircle, XCircle, CheckCircle, Loader2, X, AlertTriangle, MessageSquare } from 'lucide-react';
import bookingService, { Booking } from '@/services/bookingService';
import Image from 'next/image';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.bookingId as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [reason, setReason] = useState('');

    const fetchBooking = useCallback(async () => {
        try {
            setLoading(true);
            const data = await bookingService.getBookingById(bookingId);
            setBooking(data);
        } catch (error) {
            console.error('Error fetching booking:', error);
        } finally {
            setLoading(false);
        }
    }, [bookingId]);

    useEffect(() => {
        if (bookingId) {
            fetchBooking();
        }
    }, [bookingId, fetchBooking]);

    const handleCancelBooking = async () => {
        if (!reason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        try {
            setActionLoading(true);
            await bookingService.cancelBooking(bookingId, reason);
            setShowCancelModal(false);
            setReason('');
            fetchBooking();
            toast.success('Booking cancelled successfully');
        } catch (error: unknown) {
            console.error('Error cancelling booking:', error);
            const axiosError = error as AxiosError<{ message?: string }>;
            toast.error(axiosError?.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestRefund = async () => {
        if (!reason.trim()) {
            toast.error('Please provide a refund reason');
            return;
        }

        try {
            setActionLoading(true);
            await bookingService.requestRefund(bookingId, reason);
            setShowRefundModal(false);
            setReason('');
            fetchBooking();
            toast.success('Refund request submitted successfully');
        } catch (error: unknown) {
            console.error('Error requesting refund:', error);
            const axiosError = error as AxiosError<{ message?: string }>;
            toast.error(axiosError?.response?.data?.message || 'Failed to request refund');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (booking: Booking) => {
        const { status, partnerApprovalStatus } = booking;

        if (status === 'cancelled') {
            return (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                    <XCircle size={16} /> Cancelled
                </span>
            );
        }

        if (status === 'rejected' || partnerApprovalStatus === 'rejected') {
            return (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                    <XCircle size={16} /> Rejected
                </span>
            );
        }

        if (partnerApprovalStatus === 'pending' && status === 'payment_completed') {
            return (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
                    <AlertCircle size={16} /> Pending Partner Approval
                </span>
            );
        }

        const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
            pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle size={16} /> },
            payment_completed: { label: 'Payment Completed', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={16} /> },
            confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} /> },
            checked_in: { label: 'Checked In', color: 'bg-indigo-100 text-indigo-800', icon: <CheckCircle size={16} /> },
            checked_out: { label: 'Completed', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle size={16} /> },
            completed: { label: 'Completed', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle size={16} /> },
        };

        const config = statusConfig[status] || statusConfig.pending_payment;
        return (
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${config.color}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    const canCancel = booking && ['payment_completed', 'confirmed'].includes(booking.status);
    const canRequestRefund = booking && ['cancelled', 'rejected'].includes(booking.status) && booking.refundStatus === 'not_requested';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
                <button
                    onClick={() => router.push('/profile/bookings')}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Back to Bookings
                </button>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-12 bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
                <button
                    onClick={() => router.push('/profile/bookings')}
                    className="mb-6 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    ← Back to Bookings
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="relative h-64">
                        <Image
                            src={(typeof booking.propertyId === 'object' ? booking.propertyId.coverImage : '') || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                            alt={(typeof booking.propertyId === 'object' ? booking.propertyId.propertyName : 'Property')}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 896px"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h1 className="text-3xl font-black mb-2 drop-shadow-md">{typeof booking.propertyId === 'object' ? booking.propertyId.propertyName : 'Property'}</h1>
                            <p className="flex items-center gap-2 font-medium drop-shadow-md">
                                <MapPin size={18} className="text-emerald-400" />
                                {typeof booking.propertyId === 'object' ? (booking.propertyId.address?.city || booking.propertyId.city) : 'Location'},
                                {typeof booking.propertyId === 'object' ? (booking.propertyId.address?.state || booking.propertyId.state) : 'India'}
                            </p>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="p-6 space-y-6">
                        {/* Status and Actions */}
                        <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                            <div>
                                {getStatusBadge(booking)}
                                {booking.refundStatus !== 'not_requested' && (
                                    <span className="ml-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                                        Refund: {booking.refundStatus}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                {canCancel && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                                {canRequestRefund && (
                                    <button
                                        onClick={() => setShowRefundModal(true)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                    >
                                        Request Refund
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Booking Information */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                                <p className="font-semibold text-gray-900">{booking.bookingId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Booking Type</p>
                                <p className="font-semibold text-gray-900 capitalize">{booking.bookingType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <Calendar size={14} />
                                    Check-in
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(booking.checkInDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <Calendar size={14} />
                                    Check-out
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Number of Nights</p>
                                <p className="font-semibold text-gray-900">{booking.numberOfNights}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <Users size={14} />
                                    Total Guests
                                </p>
                                <p className="font-semibold text-gray-900">{booking.totalGuests}</p>
                            </div>
                        </div>

                        {/* Guest Details */}
                        {booking.guestDetails && booking.guestDetails.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Guest Details</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    {booking.guestDetails.map((guest, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-gray-700">{guest.name}</span>
                                            <span className="text-gray-500">{guest.age} years, {guest.gender}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Room Details */}
                        {booking.roomBookings && booking.roomBookings.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Room Details</h3>
                                <div className="space-y-3">
                                    {booking.roomBookings.map((room, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {room.roomNumber ? `Room ${room.roomNumber}` : (typeof room.roomId === 'object' ? room.roomId.roomName : 'Room')}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{room.numberOfGuests} guests</p>
                                                </div>
                                                <p className="font-semibold text-indigo-600">
                                                    ₹{room.totalRoomPrice.toLocaleString()}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                ₹{room.pricePerNight.toLocaleString()} × {booking.numberOfNights} nights
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Meal Plan Details */}
                        {booking.mealPlanId && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Meal Plan</h3>
                                <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {typeof booking.mealPlanId === 'object' ? booking.mealPlanId.name : 'Selected Meal Plan'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Included for {booking.totalGuests} guests × {booking.numberOfNights} nights
                                        </p>
                                    </div>
                                    <p className="font-semibold text-indigo-600">
                                        ₹{booking.mealPlanPrice?.toLocaleString() || '0'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Activity Details */}
                        {booking.activityBookings && booking.activityBookings.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Activities</h3>
                                <div className="space-y-3">
                                    {booking.activityBookings.map((activity, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {typeof activity.activityId === 'object' ? activity.activityId.name : 'Activity'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {activity.participants} participants
                                                </p>
                                            </div>
                                            <p className="font-semibold text-indigo-600">
                                                ₹{activity.totalActivityPrice.toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price Summary */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Room Total</span>
                                <span className="font-medium text-gray-900">₹{booking.roomTotalPrice?.toLocaleString()}</span>
                            </div>
                            {booking.mealPlanPrice && booking.mealPlanPrice > 0 && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Meal Plan Total</span>
                                    <span className="font-medium text-gray-900">₹{booking.mealPlanPrice.toLocaleString()}</span>
                                </div>
                            )}
                            {booking.activityTotalPrice && booking.activityTotalPrice > 0 && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Activities Total</span>
                                    <span className="font-medium text-gray-900">₹{booking.activityTotalPrice.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 mb-4">
                                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                                <span className="text-2xl font-bold text-indigo-600 flex items-center gap-1">
                                    <IndianRupee size={20} />
                                    {booking.finalPrice.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Payment Status</span>
                                <span className={`font-semibold ${booking.paymentStatus === 'completed' ? 'text-green-600' :
                                    booking.paymentStatus === 'refunded' ? 'text-purple-600' : 'text-yellow-600'
                                    }`}>
                                    {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                                </span>
                            </div>
                            {booking.refundAmount && (
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-gray-600">Refund Amount</span>
                                    <span className="font-semibold text-purple-600">₹{booking.refundAmount.toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        {/* Cancellation/Rejection Reason */}
                        {(booking.cancellationReason || booking.rejectionReason) && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-red-900 mb-1">
                                    {booking.cancellationReason ? 'Cancellation Reason' : 'Rejection Reason'}
                                </p>
                                <p className="text-sm text-red-700">{booking.cancellationReason || booking.rejectionReason}</p>
                            </div>
                        )}

                        {/* Refund Reason */}
                        {booking.refundReason && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-orange-900 mb-1">Refund Request Reason</p>
                                <p className="text-sm text-orange-700">{booking.refundReason}</p>
                            </div>
                        )}

                        {/* Booked At */}
                        <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                            Booked on {new Date(booking.bookedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>

                {/* Cancel Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                            <div className="relative p-8 text-center">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setReason('');
                                    }}
                                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>

                                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                                    <AlertTriangle size={40} />
                                </div>

                                <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase tracking-tight">Cancel Booking</h2>
                                <p className="text-gray-500 font-medium text-lg leading-relaxed mb-6">Are you sure you want to cancel? Please provide a reason below.</p>

                                <textarea
                                    autoFocus
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:ring-2 focus:ring-red-500 focus:bg-white outline-none font-bold transition-all text-gray-800 placeholder:text-gray-400"
                                    placeholder="e.g., Change of plans, medical emergency..."
                                />
                            </div>

                            <div className="p-8 pt-0 flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setReason('');
                                    }}
                                    className="flex-1 px-4 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all border border-transparent"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleCancelBooking}
                                    disabled={actionLoading || !reason.trim()}
                                    className="flex-1 px-4 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : null}
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Refund Modal */}
                {showRefundModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                            <div className="relative p-8 text-center">
                                <button
                                    onClick={() => {
                                        setShowRefundModal(false);
                                        setReason('');
                                    }}
                                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>

                                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                    <MessageSquare size={40} />
                                </div>

                                <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase tracking-tight">Request Refund</h2>
                                <p className="text-gray-500 font-medium text-lg leading-relaxed mb-6">Please explain why you are requesting a refund for this booking.</p>

                                <textarea
                                    autoFocus
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all text-gray-800 placeholder:text-gray-400"
                                    placeholder="e.g., Double charged, property not as described..."
                                />
                            </div>

                            <div className="p-8 pt-0 flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowRefundModal(false);
                                        setReason('');
                                    }}
                                    className="flex-1 px-4 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all border border-transparent"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestRefund}
                                    disabled={actionLoading || !reason.trim()}
                                    className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : null}
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
