import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchBookingDetails, approveBooking, rejectBooking } from '../../store/slices/bookingsSlice';
import { format } from 'date-fns';
import { ArrowLeft, Check, X, User, Calendar, CreditCard, Building } from 'lucide-react';

const BookingDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { currentBooking, loading, error } = useSelector((state: RootState) => state.bookings);

    useEffect(() => {
        if (id) {
            dispatch(fetchBookingDetails(id));
        }
    }, [dispatch, id]);

    const handleApprove = async () => {
        if (id && window.confirm('Are you sure you want to approve this booking?')) {
            await dispatch(approveBooking(id));
        }
    };

    const handleReject = async () => {
        if (id) {
            const reason = window.prompt('Please enter a reason for rejection:');
            if (reason) {
                await dispatch(rejectBooking({ bookingId: id, reason }));
            }
        }
    };

    if (loading) return <div className="text-center py-10">Loading booking details...</div>;
    if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;
    if (!currentBooking) return <div className="text-center py-10">Booking not found</div>;

    const booking = currentBooking;

    return (
        <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/partner/bookings')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Booking #{booking.bookingId}</h1>
                        <p className="text-sm text-gray-500">Created on {format(new Date(booking.createdAt), 'PPP p')}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${booking.partnerApprovalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.partnerApprovalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {booking.partnerApprovalStatus}
                    </span>
                    {booking.partnerApprovalStatus === 'pending' && (
                        <div className="flex space-x-2 ml-4">
                            <button
                                onClick={handleApprove}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                <Check size={16} className="mr-2" /> Approve
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                <X size={16} className="mr-2" /> Reject
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Guest Information */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <User className="mr-2 text-blue-600" size={20} /> Guest Information
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <p className="font-medium text-lg">{typeof booking.userId === 'object' ? booking.userId.fullName : 'Guest'}</p>
                        <p className="text-gray-600">{typeof booking.userId === 'object' ? booking.userId.email : ''}</p>
                        <p className="text-gray-600">{typeof booking.userId === 'object' ? booking.userId.phone : ''}</p>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500 mb-2">Guest List ({booking.totalGuests})</p>
                            <ul className="space-y-1">
                                {booking.guestDetails.map((guest, idx) => (
                                    <li key={idx} className="text-sm">
                                        {guest.name} ({guest.age}, {guest.gender})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Stay Details */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Building className="mr-2 text-blue-600" size={20} /> Stay Details
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md space-y-3">
                        <div className="flex items-center">
                            <Calendar className="mr-2 text-gray-400" size={16} />
                            <span className="font-medium">Check-in:</span>
                            <span className="ml-2">{format(new Date(booking.checkInDate), 'PPP')}</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="mr-2 text-gray-400" size={16} />
                            <span className="font-medium">Check-out:</span>
                            <span className="ml-2">{booking.checkOutDate ? format(new Date(booking.checkOutDate), 'PPP') : '-'}</span>
                        </div>
                        {/* Rooms List */}
                        <div className="border-t pt-3 mt-3">
                            <p className="text-sm font-medium text-gray-500 mb-2">Rooms</p>
                            {booking.roomBookings.map((room, idx) => (
                                <div key={idx} className="flex justify-between text-sm py-1">
                                    <span>Room ID: {room.roomId.substring(0, 8)}...</span>
                                    <span>₹{room.totalRoomPrice}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment Breakdown */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <CreditCard className="mr-2 text-blue-600" size={20} /> Payment Breakdown
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Room Total</span>
                                <span>₹{booking.roomTotalPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Meal Plan Total</span>
                                <span>₹{booking.mealTotalPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Activity Total</span>
                                <span>₹{booking.activityTotalPrice}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-lg">
                                <span>Grand Total</span>
                                <span>₹{booking.finalPrice}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Payment Status</span>
                                <span className={`px-2 py-1 rounded text-xs capitalize ${booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>{booking.paymentStatus}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
