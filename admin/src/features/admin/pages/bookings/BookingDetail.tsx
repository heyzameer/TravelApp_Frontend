import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchBookingById, updateBookingStatus } from '../../../../store/slices/bookingsSlice';
import {
    ArrowLeft,
    Calendar,
    User,
    Building2,
    CreditCard,
    CheckCircle,
    Clock,
    AlertCircle,
    MapPin,
    Phone,
    Mail,
    Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BookingDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedBooking, isLoading, error } = useAppSelector((state) => state.bookings);

    useEffect(() => {
        if (id) {
            dispatch(fetchBookingById(id));
        }
    }, [dispatch, id]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!id) return;
        try {
            await dispatch(updateBookingStatus({ bookingId: id, status: newStatus })).unwrap();
            toast.success(`Booking status updated to ${newStatus}`);
        } catch (err: unknown) {
            toast.error(typeof err === 'string' ? err : 'Failed to update booking status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'completed': return 'text-blue-600 bg-blue-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            case 'payment_completed': return 'text-purple-600 bg-purple-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !selectedBooking) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 max-w-md w-full text-center mx-auto mt-20">
                <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Booking Not Found</h3>
                <p className="text-gray-600 mb-6">{error || "The requested booking could not be found."}</p>
                <button onClick={() => navigate('/admin/bookings')} className="text-blue-600 font-semibold hover:underline">
                    Back to Bookings
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                            Booking #{(selectedBooking.id || selectedBooking._id || '').slice(-6).toUpperCase()}
                        </h1>
                        <p className="text-gray-500">Placed on {new Date(selectedBooking.createdAt || '').toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {selectedBooking.status === 'pending' && (
                        <button
                            onClick={() => handleStatusUpdate('confirmed')}
                            className="px-6 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md"
                        >
                            Confirm Booking
                        </button>
                    )}
                    {selectedBooking.status !== 'cancelled' && (
                        <button
                            onClick={() => handleStatusUpdate('cancelled')}
                            className="px-6 py-2 bg-white border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all"
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Booking Overview */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Calendar size={20} className="text-blue-600" />
                                Stay Details
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Check-In</p>
                                <p className="text-lg font-semibold text-gray-800">{new Date(selectedBooking.checkInDate || '').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Check-Out</p>
                                <p className="text-lg font-semibold text-gray-800">{new Date(selectedBooking.checkOutDate || '').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Guests</p>
                                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                                    <Users size={16} className="text-gray-400" />
                                    <span>{selectedBooking.guestDetails?.length || 1} Guest(s)</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedBooking.status)}`}>
                                    {selectedBooking.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Property Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Building2 size={20} className="text-blue-600" />
                                Property Information
                            </h2>
                        </div>
                        <div className="p-6 flex gap-6">
                            {selectedBooking.propertyId?.coverImage && (
                                <img
                                    src={selectedBooking.propertyId.coverImage}
                                    alt={selectedBooking.propertyId.propertyName}
                                    className="w-32 h-32 rounded-xl object-cover shadow-sm"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedBooking.propertyId?.propertyName || 'Property Name N/A'}</h3>
                                <div className="flex items-center text-gray-500 text-sm mb-4">
                                    <MapPin size={14} className="mr-1" />
                                    {selectedBooking.propertyId?.location?.address || 'Location N/A'}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Booking ID</p>
                                        <p className="font-mono text-sm text-gray-700">{selectedBooking.bookingId}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Type</p>
                                        <p className="text-sm text-gray-700 capitalize">{selectedBooking.bookingType || 'standard'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - User & Payment */}
                <div className="space-y-8">
                    {/* Guest Information */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <User size={20} className="text-blue-600" />
                                Guest Profile
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                                    {selectedBooking.userId?.fullName?.[0] || 'G'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{selectedBooking.userId?.fullName || 'Guest Name'}</p>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Member</p>
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail size={16} className="text-gray-400" />
                                    <span>{selectedBooking.userId?.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone size={16} className="text-gray-400" />
                                    <span>{selectedBooking.userId?.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 text-white">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <CreditCard size={20} className="text-blue-400" />
                            Payment Details
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-gray-400 text-sm">
                                <span>Base Amount</span>
                                <span className="font-semibold text-white">₹{selectedBooking.finalPrice ? (selectedBooking.finalPrice * 0.82).toFixed(2) : 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400 text-sm">
                                <span>Taxes & Fees (18%)</span>
                                <span className="font-semibold text-white">₹{selectedBooking.finalPrice ? (selectedBooking.finalPrice * 0.18).toFixed(2) : 0}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                                <span className="text-lg font-bold">Total Paid</span>
                                <span className="text-2xl font-black text-blue-400">₹{selectedBooking.finalPrice?.toLocaleString() || 0}</span>
                            </div>
                            <div className="mt-6 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-2">Payment Status</p>
                                <div className="flex items-center gap-2">
                                    {selectedBooking.paymentStatus === 'completed' ? (
                                        <div className="flex items-center gap-2 text-green-400 font-bold">
                                            <CheckCircle size={16} />
                                            <span>SUCCESSFUL</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-yellow-400 font-bold">
                                            <Clock size={16} />
                                            <span>{selectedBooking.paymentStatus?.toUpperCase() || 'PENDING'}</span>
                                        </div>
                                    )}
                                </div>
                                {selectedBooking.paymentId && (
                                    <p className="mt-2 text-[10px] text-gray-500 font-mono truncate">ID: {selectedBooking.paymentId}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetail;
